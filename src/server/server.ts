import http from 'http';
import StateRepository from '../repository/state.repository';

export default class Server {
  private httpServer: http.Server | null = null;
  private port: number;
  private stateRepository: StateRepository;

  constructor(port: number, stateRepository: StateRepository) {
    this.port = port;
    this.stateRepository = stateRepository;
    this.httpServer = http.createServer((req, res) => {
      if (req.url === '/state' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(this.stateRepository.getState()));
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    });
  }

  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.httpServer!.listen(this.port, () => {
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpServer!.close((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}
