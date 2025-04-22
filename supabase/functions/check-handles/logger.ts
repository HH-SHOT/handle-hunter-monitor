
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export class Logger {
  private supabaseClient: ReturnType<typeof createClient>;
  private logBuffer: Array<{
    level: LogLevel;
    message: string;
    details?: any;
    platform?: string;
    handleName?: string;
    handleId?: string;
  }> = [];
  private minLevel: LogLevel = LogLevel.INFO;
  
  constructor(supabaseClient: ReturnType<typeof createClient>) {
    this.supabaseClient = supabaseClient;
  }
  
  setMinLevel(level: LogLevel) {
    this.minLevel = level;
  }
  
  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }
  
  private async logToDb(
    level: LogLevel,
    message: string,
    details?: any,
    platform?: string,
    handleName?: string,
    handleId?: string
  ) {
    try {
      const { error } = await this.supabaseClient
        .from('handle_check_logs')
        .insert({
          level,
          message,
          details,
          platform,
          handle_name: handleName,
          handle_id: handleId
        });
        
      if (error) {
        console.error(`Error writing to log: ${error.message}`);
      }
    } catch (error) {
      console.error(`Failed to write to log: ${error.message}`);
    }
  }
  
  debug(message: string, context?: {
    platform?: string;
    handleName?: string;
    handleId?: string;
    details?: any;
  }) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(message);
      this.logBuffer.push({
        level: LogLevel.DEBUG,
        message,
        ...context
      });
    }
  }
  
  info(message: string, context?: {
    platform?: string;
    handleName?: string;
    handleId?: string;
    details?: any;
  }) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(message);
      this.logBuffer.push({
        level: LogLevel.INFO,
        message,
        ...context
      });
    }
  }
  
  warn(message: string, context?: {
    platform?: string;
    handleName?: string;
    handleId?: string;
    details?: any;
  }) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(message);
      this.logBuffer.push({
        level: LogLevel.WARN,
        message,
        ...context
      });
    }
  }
  
  error(message: string, context?: {
    platform?: string;
    handleName?: string;
    handleId?: string;
    details?: any;
  }) {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(message);
      this.logBuffer.push({
        level: LogLevel.ERROR,
        message,
        ...context
      });
    }
  }
  
  // Flush logs to database
  async flush() {
    if (this.logBuffer.length === 0) return;
    
    const logs = [...this.logBuffer];
    this.logBuffer = [];
    
    try {
      const { error } = await this.supabaseClient
        .from('handle_check_logs')
        .insert(logs);
        
      if (error) {
        console.error(`Error flushing logs: ${error.message}`);
        // Put logs back in buffer if flush failed
        this.logBuffer = [...logs, ...this.logBuffer];
      }
    } catch (error) {
      console.error(`Failed to flush logs: ${error.message}`);
      // Put logs back in buffer if flush failed
      this.logBuffer = [...logs, ...this.logBuffer];
    }
  }
}

// Initialize logger
export function initLogger(supabaseClient: ReturnType<typeof createClient>): Logger {
  return new Logger(supabaseClient);
}
