export interface CacheOptions {
  ttl?: number;
  maxSize?: number;
}

export declare class Cache<K = any, V = any> {
  constructor(options?: CacheOptions);

  /**
   * Get a value from cache
   */
  get(key: K): V | undefined;

  /**
   * Set a value in cache
   */
  set(key: K, value: V, ttl?: number): void;

  /**
   * Check if key exists in cache
   */
  has(key: K): boolean;

  /**
   * Delete a key from cache
   */
  delete(key: K): boolean;

  /**
   * Clear all cache
   */
  clear(): void;

  /**
   * Get cache size
   */
  size(): number;

  /**
   * Get all keys
   */
  keys(): K[];

  /**
   * Get all values
   */
  values(): V[];
}

export default Cache;
