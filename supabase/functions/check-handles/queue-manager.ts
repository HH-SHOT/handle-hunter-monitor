
// A simple priority queue implementation for managing API requests
// This helps us respect rate limits and implement exponential backoff

export interface QueueTask {
  id: string;
  platform: string;
  name: string;
  priority: number;
  retries: number;
  maxRetries: number;
  lastAttempt?: number;
  delay?: number;
}

export class RequestQueue {
  private queue: QueueTask[] = [];
  private inProgress: Set<string> = new Set();
  private maxConcurrent: number;
  private platformLimits: Record<string, { current: number, max: number, resetTime?: number }> = {};

  constructor(maxConcurrent = 10) {
    this.maxConcurrent = maxConcurrent;
  }

  // Add a new task to the queue
  enqueue(task: Omit<QueueTask, 'retries' | 'maxRetries'> & { maxRetries?: number }): string {
    const fullTask: QueueTask = {
      ...task,
      retries: 0,
      maxRetries: task.maxRetries || 2, // Reduced from 3 to 2 for faster processing
    };
    
    // Check if task is already in queue
    const existing = this.queue.find(t => t.id === task.id);
    if (existing) {
      return existing.id;
    }
    
    console.log(`Adding task to queue: ${task.platform}/${task.name}`);
    this.queue.push(fullTask);
    // Sort by priority (higher first) and then by retries (fewer first)
    this.queue.sort((a, b) => b.priority - a.priority || a.retries - b.retries);
    return task.id;
  }

  // Get next tasks that can be executed
  dequeue(count: number = 1): QueueTask[] {
    if (this.queue.length === 0) return [];
    
    const now = Date.now();
    const available = Math.max(0, this.maxConcurrent - this.inProgress.size);
    const tasks: QueueTask[] = [];
    
    for (let i = 0; i < this.queue.length && tasks.length < Math.min(available, count); i++) {
      const task = this.queue[i];
      
      // Skip if task is delayed for backoff
      if (task.lastAttempt && task.delay && now < task.lastAttempt + task.delay) {
        continue;
      }
      
      // Check platform rate limits
      const platformLimit = this.platformLimits[task.platform];
      if (platformLimit && platformLimit.current >= platformLimit.max) {
        // Skip if platform is rate limited
        if (platformLimit.resetTime && now >= platformLimit.resetTime) {
          // Reset the counter if reset time has passed
          platformLimit.current = 0;
          platformLimit.resetTime = undefined;
        } else {
          continue;
        }
      }
      
      // Task can be executed
      this.inProgress.add(task.id);
      tasks.push(task);
      this.queue.splice(i, 1);
      i--; // Adjust index since we removed an item
      
      // Update platform limit counter
      if (platformLimit) {
        platformLimit.current++;
      }
    }
    
    return tasks;
  }

  // Mark a task as complete and remove from in-progress
  complete(taskId: string): void {
    this.inProgress.delete(taskId);
  }

  // Handle a failed task with exponential backoff
  retry(task: QueueTask, success: boolean): void {
    this.inProgress.delete(task.id);
    
    if (success) {
      // Task succeeded, no need to retry
      return;
    }
    
    if (task.retries >= task.maxRetries) {
      console.log(`Task ${task.platform}/${task.name} failed after ${task.retries} retries`);
      return;
    }
    
    // Implement exponential backoff - but with shorter delays
    task.retries++;
    task.lastAttempt = Date.now();
    task.delay = Math.min(500 * Math.pow(2, task.retries - 1), 30000); // Max 30 second delay (reduced from 60s)
    
    console.log(`Retrying task ${task.platform}/${task.name} (attempt ${task.retries}/${task.maxRetries}) after ${task.delay}ms`);
    this.queue.push(task);
    this.queue.sort((a, b) => b.priority - a.priority || a.retries - b.retries);
  }

  // Set rate limit for a platform
  setRateLimit(platform: string, limit: number, resetInMs?: number): void {
    this.platformLimits[platform] = this.platformLimits[platform] || { current: 0, max: limit };
    this.platformLimits[platform].max = limit;
    
    if (resetInMs) {
      this.platformLimits[platform].resetTime = Date.now() + resetInMs;
    }
  }

  // Get queue stats
  getStats(): { queued: number, inProgress: number, byPlatform: Record<string, number> } {
    const byPlatform: Record<string, number> = {};
    
    this.queue.forEach(task => {
      byPlatform[task.platform] = (byPlatform[task.platform] || 0) + 1;
    });
    
    return {
      queued: this.queue.length,
      inProgress: this.inProgress.size,
      byPlatform
    };
  }

  // Get queue position
  getQueuePosition(taskId: string): number {
    const index = this.queue.findIndex(task => task.id === taskId);
    return index === -1 ? 0 : index + 1;
  }

  // Get estimated wait time (in seconds)
  getEstimatedWaitTime(taskId: string): number {
    const position = this.getQueuePosition(taskId);
    const avgTimePerTask = 2; // Average seconds per task (optimized from 3)
    const concurrentTasks = this.maxConcurrent;
    return Math.ceil((position / concurrentTasks) * avgTimePerTask);
  }
}

// Add cache invalidation handling
interface CacheConfig {
  ttl: {
    available: number;     // Cache time for available handles
    unavailable: number;   // Cache time for unavailable handles
    monitoring: number;    // Cache time for monitored handles
  }
}

export const defaultCacheConfig: CacheConfig = {
  ttl: {
    available: 30 * 60 * 1000,    // 30 minutes
    unavailable: 2 * 60 * 60 * 1000, // 2 hours
    monitoring: 5 * 60 * 1000     // 5 minutes
  }
};

// Create a singleton instance - increased from 5 to 10 concurrent
export const requestQueue = new RequestQueue(10);

