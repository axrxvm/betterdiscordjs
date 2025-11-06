export interface RateLimitOptions {
  max: number;
  window: number;
}

export declare class RateLimit {
  constructor(options: RateLimitOptions);

  /**
   * Check if a key is rate limited
   */
  check(key: string): boolean;

  /**
   * Get remaining attempts
   */
  remaining(key: string): number;

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void;

  /**
   * Clear all rate limits
   */
  clear(): void;
}

export default RateLimit;
