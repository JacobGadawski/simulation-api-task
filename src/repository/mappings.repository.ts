export default class MappingsRepository {
    private mappings: Map<string, string>;
  
    constructor() {
      this.mappings = new Map();
    }
  
    updateMappings(newMappings: string): void {
      this.mappings.clear();
      newMappings.split(';').forEach((mapping) => {
        const [key, value] = mapping.split(':');
        if (key && value) {
          this.mappings.set(key, value);
        }
      });
    }
  
    getValue(key: string): string | undefined {
      return this.mappings.get(key);
    }
  
    getAllMappings(): Record<string, string> {
      const result: Record<string, string> = {};
      for (const [key, value] of this.mappings.entries()) {
        result[key] = value;
      }
      return result;
    }

    hasKey(key: string): boolean {
      return this.mappings.has(key);
    }
  
    clearMappings(): void {
      this.mappings.clear();
    }
  }
  