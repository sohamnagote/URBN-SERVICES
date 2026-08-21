import { ENV } from './env';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function formatLog(level: LogLevel, message: string, meta?: any) {
  const timestamp = new Date().toISOString();
  const logObj = {
    timestamp,
    level: level.toUpperCase(),
    message,
    ...(meta ? { meta } : {}),
  };
  return JSON.stringify(logObj);
}

export const logger = {
  info: (msg: string, meta?: any) => {
    if (!ENV.isTest) {
      console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, meta ? meta : '');
    }
  },
  warn: (msg: string, meta?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, meta ? meta : '');
  },
  error: (msg: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, error ? error : '');
  },
  debug: (msg: string, meta?: any) => {
    if (ENV.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${msg}`, meta ? meta : '');
    }
  },
};
