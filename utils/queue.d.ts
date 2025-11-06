export interface QueueTask<T = any> {
  fn: () => Promise<T> | T;
  resolve: (value: T) => void;
  reject: (error: any) => void;
}

export declare class Queue<T = any> {
  constructor();

  /**
   * Add a task to the queue
   */
  add<R = T>(fn: () => Promise<R> | R): Promise<R>;

  /**
   * Get queue size
   */
  size(): number;

  /**
   * Clear the queue
   */
  clear(): void;

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean;
}

export default Queue;
