export interface Stats {
  commandsExecuted: number;
  eventsProcessed: number;
  messagesProcessed: number;
  errors: number;
  uptime: number;
  startTime: number;
}

export declare const stats: {
  get(): Stats;
  increment(key: keyof Stats, amount?: number): void;
  reset(): void;
  getUptime(): number;
};

export default stats;
