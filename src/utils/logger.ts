import { env } from '../config/env';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function formatMessage(level: LogLevel, message: string, meta?: object): string {
  const timestamp = new Date().toISOString();
  const base = { timestamp, level, message };
  const full = meta ? { ...base, ...meta } : base;
  return JSON.stringify(full);
}

export const logger = {
  info(message: string, meta?: object) {
    console.log(formatMessage('info', message, meta));
  },
  warn(message: string, meta?: object) {
    console.warn(formatMessage('warn', message, meta));
  },
  error(message: string, meta?: object) {
    console.error(formatMessage('error', message, meta));
  },
  debug(message: string, meta?: object) {
    if (env.NODE_ENV === 'development') {
      console.log(formatMessage('debug', message, meta));
    }
  },
};