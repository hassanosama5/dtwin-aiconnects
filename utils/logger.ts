/**
 * Logger Utility
 *
 * Development logger for tracking agent execution flow.
 * Displays execution path with timestamps.
 */

import { env } from '../config/env';

type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'agent';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

class Logger {
  private enabled: boolean;
  private logs: LogEntry[] = [];

  constructor() {
    this.enabled = env.app.enableLogging;
  }

  private formatTimestamp(): string {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  }

  private log(level: LogLevel, message: string, data?: any) {
    if (!this.enabled) return;

    const timestamp = this.formatTimestamp();
    const entry: LogEntry = { level, message, timestamp, data };
    this.logs.push(entry);

    const prefix = this.getPrefix(level);
    const logMessage = `[${timestamp}] ${prefix} ${message}`;

    switch (level) {
      case 'error':
        console.error(logMessage, data || '');
        break;
      case 'warning':
        console.warn(logMessage, data || '');
        break;
      case 'agent':
      case 'success':
      case 'info':
      default:
        console.log(logMessage, data || '');
        break;
    }
  }

  private getPrefix(level: LogLevel): string {
    switch (level) {
      case 'agent':
        return '🤖';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
      default:
        return 'ℹ️';
    }
  }

  // Agent execution logging
  agent(name: string, action: string, data?: any) {
    this.log('agent', `${name} → ${action}`, data);
  }

  // Agent flow visualization
  flow(agents: string[]) {
    if (!this.enabled) return;

    console.log('\n🔄 Agent Execution Flow:');
    agents.forEach((agent, index) => {
      const isLast = index === agents.length - 1;
      console.log(`   ${isLast ? '└─' : '├─'} ${agent}`);
    });
    console.log('');
  }

  // Standard logging methods
  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  success(message: string, data?: any) {
    this.log('success', message, data);
  }

  warning(message: string, data?: any) {
    this.log('warning', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  // Get all logs (useful for debugging)
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Clear logs
  clear() {
    this.logs = [];
  }

  // Measure execution time
  time(label: string): () => void {
    if (!this.enabled) return () => {};

    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.info(`⏱️  ${label} completed in ${duration.toFixed(2)}ms`);
    };
  }
}

// Export singleton instance
export const logger = new Logger();

// Helper for agent execution visualization
export function logAgentExecution(
  coordinator: boolean = false,
  decision: boolean = false,
  review: boolean = false
) {
  const agents: string[] = [];

  if (coordinator) agents.push('Coordinator');
  if (decision) agents.push('Decision');
  if (review) agents.push('Review');

  logger.flow(agents);
}
