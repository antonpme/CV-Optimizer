import { headers } from 'next/headers';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogMetadata = Record<string, unknown> | undefined;

function getConsoleMethod(level: LogLevel) {
  if (level === 'debug') return console.debug;
  if (level === 'info') return console.info;
  if (level === 'warn') return console.warn;
  return console.error;
}

export function getRequestId(): string | undefined {
  try {
    const headerList = headers() as unknown as Headers | undefined;
    return headerList?.get('x-request-id') ?? undefined;
  } catch {
    // headers() throws if we're not in a request context
    return undefined;
  }
}

export function log(level: LogLevel, message: string, metadata: LogMetadata = undefined) {
  const requestId = getRequestId();
  const payload = {
    level,
    message,
    requestId,
    metadata: metadata ?? undefined,
    timestamp: new Date().toISOString(),
  };

  const consoleMethod = getConsoleMethod(level).bind(console);
  consoleMethod(JSON.stringify(payload));
}

export const logger = {
  debug: (message: string, metadata?: LogMetadata) => log('debug', message, metadata),
  info: (message: string, metadata?: LogMetadata) => log('info', message, metadata),
  warn: (message: string, metadata?: LogMetadata) => log('warn', message, metadata),
  error: (message: string, metadata?: LogMetadata) => log('error', message, metadata),
};
