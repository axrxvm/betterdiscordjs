export interface TimeUtilities {
  /**
   * Parse a duration string (e.g., "1h", "30m", "2d") to milliseconds
   */
  parse(duration: string): number;

  /**
   * Format milliseconds to a human-readable string
   */
  format(ms: number): string;

  /**
   * Get current timestamp
   */
  now(): number;

  /**
   * Add time to a date
   */
  add(date: Date, duration: string): Date;

  /**
   * Subtract time from a date
   */
  subtract(date: Date, duration: string): Date;

  /**
   * Check if a date is in the past
   */
  isPast(date: Date): boolean;

  /**
   * Check if a date is in the future
   */
  isFuture(date: Date): boolean;

  /**
   * Get time ago string
   */
  ago(date: Date): string;

  /**
   * Sleep for a duration
   */
  sleep(duration: number | string): Promise<void>;
}

export declare const time: TimeUtilities;
export default time;
