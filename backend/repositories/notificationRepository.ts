import {
  AdminNotification,
  AdminNotificationPreferences,
  DeviceRecord,
  NotificationTemplate,
  PushNotificationJob,
  UserInboxNotification,
  UserNotificationPreferences,
} from '../types';
import { backendStore } from '../store/backendStore';

export class NotificationRepository {
  public jobs: Map<string, PushNotificationJob> = new Map();
  public templates: Map<string, NotificationTemplate> = new Map();
  public devices: Map<string, DeviceRecord> = new Map();
  public userInboxes: Map<string, UserInboxNotification[]> = new Map();
  public userPreferences: Map<string, UserNotificationPreferences> = new Map();

  public getAdminNotifications(): AdminNotification[] {
    return backendStore.notifications;
  }

  public getAdminPreferences(): AdminNotificationPreferences {
    return backendStore.notificationPreferences;
  }

  public setAdminPreferences(prefs: Partial<AdminNotificationPreferences>): AdminNotificationPreferences {
    backendStore.notificationPreferences = {
      ...backendStore.notificationPreferences,
      ...prefs,
    };
    return backendStore.notificationPreferences;
  }

  public findJobById(id: string): PushNotificationJob | undefined {
    return this.jobs.get(id);
  }

  public saveJob(job: PushNotificationJob): PushNotificationJob {
    this.jobs.set(job.id, job);
    return job;
  }

  public deleteJob(id: string): boolean {
    return this.jobs.delete(id);
  }

  public getAllJobs(): PushNotificationJob[] {
    return Array.from(this.jobs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export const notificationRepository = new NotificationRepository();
