import { notificationService } from '../services/notificationService';
import { logger } from '../config/logger';

class NotificationSchedulerJob {
  private timer: NodeJS.Timeout | null = null;
  private intervalMs: number = 5000;
  private isRunning: boolean = false;

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    logger.info('Starting Background Notification Scheduler Worker (5s interval)');

    this.timer = setInterval(async () => {
      try {
        await notificationService.processScheduledJobs();
      } catch (err) {
        logger.error('Error during scheduled notification processing interval:', err);
      }
    }, this.intervalMs);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    logger.info('Stopped Background Notification Scheduler Worker');
  }
}

export const notificationSchedulerJob = new NotificationSchedulerJob();
