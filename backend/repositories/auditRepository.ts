import { AuditLogRecord, AnalyticsEvent, backendStore } from '../store/backendStore';

export class AuditRepository {
  public getAuditLogs(limit: number = 100): AuditLogRecord[] {
    return backendStore.auditLogs.slice(0, limit);
  }

  public getTotalAuditCount(): number {
    return backendStore.auditLogs.length;
  }

  public record(log: Omit<AuditLogRecord, 'id' | 'timestamp'>): AuditLogRecord {
    return backendStore.recordAudit(log);
  }

  public getAnalyticsEvents(limit: number = 100): AnalyticsEvent[] {
    return backendStore.analyticsEvents.slice(0, limit);
  }

  public trackAnalytics(eventName: string, metadata: Record<string, any> = {}, userId?: string): AnalyticsEvent {
    return backendStore.trackAnalytics(eventName, metadata, userId);
  }
}

export const auditRepository = new AuditRepository();
