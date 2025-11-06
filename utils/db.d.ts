export interface DatabaseOptions {
  path?: string;
}

export declare class Database {
  db: any;
  
  constructor(options?: DatabaseOptions);

  /**
   * Get a value from the database
   */
  get(key: string, defaultValue?: any): Promise<any>;

  /**
   * Set a value in the database
   */
  set(key: string, value: any): Promise<void>;

  /**
   * Check if a key exists
   */
  has(key: string): Promise<boolean>;

  /**
   * Delete a key from the database
   */
  delete(key: string): Promise<void>;

  /**
   * Get all keys
   */
  keys(): Promise<string[]>;

  /**
   * Get all values
   */
  values(): Promise<any[]>;

  /**
   * Get all entries
   */
  entries(): Promise<Array<[string, any]>>;

  /**
   * Clear all data
   */
  clear(): Promise<void>;

  /**
   * Get the size of the database
   */
  size(): Promise<number>;
}

export default Database;
