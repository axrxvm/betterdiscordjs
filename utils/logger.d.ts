export interface LoggerColors {
  reset: string;
  bright: string;
  dim: string;
  underscore: string;
  blink: string;
  reverse: string;
  hidden: string;
  fg: {
    black: string;
    red: string;
    green: string;
    yellow: string;
    blue: string;
    magenta: string;
    cyan: string;
    white: string;
    crimson: string;
  };
  bg: {
    black: string;
    red: string;
    green: string;
    yellow: string;
    blue: string;
    magenta: string;
    cyan: string;
    white: string;
    crimson: string;
  };
}

export declare const logger: {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
  success(message: string, ...args: any[]): void;
  log(message: string, ...args: any[]): void;
};

export default logger;
