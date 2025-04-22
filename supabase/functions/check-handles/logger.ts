
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  platform?: string;
  handleName?: string;
  handleId?: string;
  details?: Record<string, any>;
  timestamp: string;
}

export class Logger {
  private supabaseClient: ReturnType<typeof createClient>;
  private context: Record<string, any> = {};
  private bufferSize = 10;
  private logBuffer: LogEntry[] = [];
  private minLevel: LogLevel = LogLevel.INFO;
  
  constructor(supabaseClient: ReturnType<typeof createClient>) {
    this.supabaseClient = supabaseClient;
  }
  
  // Set minimum log level
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }
  
  // Set context data to be included with all logs
  setContext(context: Record<string, any>): void {
    this.context = { ...this.context, ...context };
  }
  
  // Clear context data
  clearContext(): void {
    this.context = {};
  }
  
  // Log a message with debug level
  debug(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, data);
  }
  
  // Log a message with info level
  info(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, data);
  }
  
  // Log a message with warning level
  warn(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, data);
  }
  
  // Log a message with error level
  error(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, data);
  }
  
  // Log API request details
  logApiRequest(
    platform: string,
    handleName: string,
    handleId: string | undefined,
    url: string,
    status: number,
    success: boolean,
    responseData?: any
  ): void {
    const level = success ? LogLevel.INFO : LogLevel.WARN;
    const message = `${platform} API request for handle ${handleName}: ${status} ${success ? 'success' : 'failed'}`;
    
    this.log(level, message, {
      platform,
      handleName,
      handleId,
      url,
      status,
      success,
      responseData
    });
  }
  
  // Log platform response pattern changes
  logResponsePattern(
    platform: string,
    handleName: string,
    patternType: 'available' | 'unavailable' | 'unknown',
    pattern: string,
    found: boolean
  ): void {
    if (!found && patternType !== 'unknown') {
      // Only log when expected patterns were not found
      this.log(LogLevel.WARN, `${platform} response pattern change detected for ${patternType} handles`, {
        platform,
        handleName,
        patternType,
        pattern
      });
    }
  }
  
  // Internal log method
  private log(level: LogLevel, message: string, data?: Record<string, any>): void {
    // Check log level
    if (this.shouldLog(level)) {
      console.log(`[${level.toUpperCase()}] ${message}`);
      if (data) {
        console.log(data);
      }
      
      // Create log entry
      const logEntry: LogEntry = {
        level,
        message,
        ...this.extractPlatformData(data),
        details: data,
        timestamp: new Date().toISOString()
      };
      
      // Add context
      if (Object.keys(this.context).length > 0) {
        logEntry.details = { ...logEntry.details, context: this.context };
      }
      
      // Add to buffer
      this.logBuffer.push(logEntry);
      
      // Flush if buffer is full
      if (this.logBuffer.length >= this.bufferSize) {
        this.flush();
      }
    }
  }
  
  // Extract platform and handle data from log details
  private extractPlatformData(data?: Record<string, any>): {
    platform?: string;
    handleName?: string;
    handleId?: string;
  } {
    if (!data) return {};
    
    return {
      platform: data.platform,
      handleName: data.handleName,
      handleId: data.handleId
    };
  }
  
  // Check if log level should be logged
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const minLevelIndex = levels.indexOf(this.minLevel);
    const levelIndex = levels.indexOf(level);
    
    return levelIndex >= minLevelIndex;
  }
  
  // Flush log buffer to database
  async flush(): Promise<void> {
    if (this.logBuffer.length === 0) return;
    
    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];
    
    try {
      const { error } = await this.supabaseClient
        .from('handle_check_logs')
        .insert(logsToFlush.map(log => ({
          level: log.level,
          message: log.message,
          platform: log.platform,
          handle_name: log.handleName,
          handle_id: log.handleId,
          details: log.details,
          created_at: log.timestamp
        })));
        
      if (error) {
        console.error(`Error flushing logs: ${error.message}`);
        // Put logs back in buffer
        this.logBuffer = [...logsToFlush, ...this.logBuffer];
      }
    } catch (error) {
      console.error(`Failed to flush logs: ${error.message}`);
      // Put logs back in buffer
      this.logBuffer = [...logsToFlush, ...this.logBuffer];
    }
  }
}

// Function to initialize the logger
export function initLogger(supabaseClient: ReturnType<typeof createClient>): Logger {
  return new Logger(supabaseClient);
}
