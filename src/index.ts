import dotenv from 'dotenv';
import { Worker } from 'worker_threads';
import path from 'path';
import Server from './server/server';
import Aggregator from './aggregator/aggregator';
import SimulationApiClient from './api/simulation.api.client';
import MappingsRepository from './repository/mappings.repository';
import StateRepository from './repository/state.repository';

dotenv.config();

(async () => {
  let server: Server | null = null;
  let consumerWorker: Worker | null = null;

  const stateRepository = new StateRepository();
  const mappingsRepository = new MappingsRepository();
  const aggregator = new Aggregator();
  const simulationApiClient = new SimulationApiClient();

  try {
    consumerWorker = new Worker(path.resolve(__dirname, './consumer/consumer.js'));

    consumerWorker.postMessage({ type: 'start' }); // Start the worker thread

    consumerWorker.on('message', async (message) => {
      if (message.type === 'state') {
        try {
          // Handle simulation break
          if (message.data.odds.length === 0) {
            console.log('Simulation break detected. Clearing mappings and state...'); // Clear memory state and mappings to follow current simulation cycle
            mappingsRepository.clearMappings();
            stateRepository.clear();
            return;
          }

          // Fetch mappings if empty
          if (Object.keys(mappingsRepository.getAllMappings()).length === 0) {
            console.log('Fetching mappings...');
            const mappings = await simulationApiClient.getMappings();
            mappingsRepository.updateMappings(mappings.mappings);
          }

          // Parse incoming state data IDs
          const incomingStateIds: Set<string> = new Set(
            message.data.odds.split('\n').map((row) => row.split(',')[0]) // Extract event IDs
          );

          // Check if any incoming ID is missing from the current state
          const mappingsNeedUpdate = [...incomingStateIds].some((id) => !stateRepository.hasEvent(id));

          if (mappingsNeedUpdate) {
            console.log('Detected mappings change');
            stateRepository.cleanUpRemovedEvents(incomingStateIds);
            console.log('Fetching mappings...');
            const mappings = await simulationApiClient.getMappings();
            mappingsRepository.updateMappings(mappings.mappings);
          }

          // Transform and store new state
          console.log('Transforming and updating state...');
          const transformedState = aggregator.transform(message.data, {
            mappings: mappingsRepository.getAllMappings(),
          });
          stateRepository.updateState(transformedState);

          console.log('State updated successfully.');
        } catch (error) {
          console.error('Error during state transformation or update:', error);
        }
      }
    });

    consumerWorker.on('error', (error) => {
      console.error('Consumer Worker Error:', error);
    });

    consumerWorker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Consumer Worker stopped with exit code ${code}`);
      } else {
        console.log('Consumer Worker exited cleanly.');
      }
    });

    console.log('Starting HTTP Server...');
    server = new Server(Number(process.env.HTTP_PORT), stateRepository);
    await server.start();
    console.log(`Server running on port ${process.env.HTTP_PORT}`);

    process.on('SIGINT', async () => {
      console.log('\nGracefully shutting down...');

      if (server) {
        console.log('Stopping HTTP Server...');
        await server.stop();
        console.log('HTTP Server stopped.');
      }

      if (consumerWorker) {
        console.log('Terminating Consumer Worker...');
        consumerWorker.postMessage({ type: 'stop' });
        consumerWorker.terminate();
        console.log('Consumer Worker terminated.');
      }

      process.exit(0);
    });
  } catch (error) {
    console.error('Error:', error);

    if (server) {
      console.log('Stopping HTTP Server due to error...');
      await server.stop().catch(() => console.error('Failed to stop HTTP Server.'));
    }

    if (consumerWorker) {
      console.log('Terminating Consumer Worker due to error...');
      consumerWorker.terminate();
    }

    process.exit(1);
  }
})();
