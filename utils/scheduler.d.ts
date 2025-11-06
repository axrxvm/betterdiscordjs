export interface SchedulerTask {
  stop(): void;
  start(): void;
}

export declare const scheduler: {
  /**
   * Schedule a task to run at intervals
   */
  every(interval: string, fn: () => void): SchedulerTask;

  /**
   * Schedule a task using cron expression
   */
  cron(expression: string, fn: () => void): SchedulerTask;

  /**
   * Schedule a one-time task
   */
  once(delay: string | number, fn: () => void): NodeJS.Timeout;

  /**
   * Clear all scheduled tasks
   */
  clear(): void;
};

export default scheduler;
