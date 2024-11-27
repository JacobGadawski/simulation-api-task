import { describe, it, expect, beforeEach } from 'vitest';
import MappingsRepository from '../../src/repository/mappings.repository';

describe('MappingsRepository', () => {
  let repository: MappingsRepository;

  beforeEach(() => {
    repository = new MappingsRepository();
  });

  it('should update mappings correctly', () => {
    const newMappings = 'key1:value1;key2:value2';
    repository.updateMappings(newMappings);

    expect(repository.getValue('key1')).toBe('value1');
    expect(repository.getValue('key2')).toBe('value2');
  });

  it('should retrieve all mappings as an object', () => {
    const newMappings = 'key1:value1;key2:value2';
    repository.updateMappings(newMappings);

    expect(repository.getAllMappings()).toEqual({
      key1: 'value1',
      key2: 'value2',
    });
  });

  it('should check if a key exists', () => {
    repository.updateMappings('key1:value1;key2:value2');

    expect(repository.hasKey('key1')).toBe(true);
    expect(repository.hasKey('key3')).toBe(false);
  });

  it('should clear all mappings', () => {
    repository.updateMappings('key1:value1;key2:value2');
    repository.clearMappings();

    expect(repository.getAllMappings()).toEqual({});
  });

  it('should return undefined for non-existent keys', () => {
    expect(repository.getValue('nonExistentKey')).toBeUndefined();
  });
});
