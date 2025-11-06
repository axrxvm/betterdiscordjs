export interface SessionData {
  [key: string]: any;
}

export declare class Session {
  constructor();

  get(key: string, defaultValue?: any): any;
  set(key: string, value: any): void;
  has(key: string): boolean;
  delete(key: string): void;
  clear(): void;
  size(): number;
}

export default Session;
