import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { notificationService } from '../../services/notificationService';

describe('NotificationService Unit Tests', () => {
  it('registers new push device tokens and maintains active device registry', () => {
    const device = notificationService.registerDevice({
      userId: 'test-user-notif',
      userRole: 'customer',
      userEmail: 'notif@test.com',
      pushToken: 'token-abc-123',
      platform: 'web',
      browser: 'Chrome 120',
      permissionStatus: 'granted',
    });

    assert.ok(device.id);
    assert.equal(device.userId, 'test-user-notif');
    assert.equal(device.pushToken, 'token-abc-123');
    assert.equal(device.isActive, true);
  });

  it('manages user inbox notifications and unread counters', () => {
    const userId = 'inbox-user-1';

    notificationService.addUserInboxNotification(userId, {
      id: 'inbox-item-1',
      userId,
      title: 'Booking Confirmed',
      message: 'Technician on the way',
      category: 'Booking',
      timestamp: new Date().toISOString(),
      read: false,
    });

    let inbox = notificationService.getUserInbox(userId);
    assert.equal(inbox.length, 1);
    assert.equal(inbox[0].read, false);

    // Mark read
    const marked = notificationService.markInboxItemRead(userId, 'inbox-item-1');
    assert.equal(marked, true);

    inbox = notificationService.getUserInbox(userId);
    assert.equal(inbox[0].read, true);
  });

  it('resolves audience criteria by role and service areas', () => {
    const allUsers = notificationService.resolveAudienceUserIds({ type: 'all_users' });
    assert.ok(Array.isArray(allUsers));
    assert.ok(allUsers.length > 0);

    const customers = notificationService.resolveAudienceUserIds({ type: 'customers' });
    assert.ok(Array.isArray(customers));

    const selected = notificationService.resolveAudienceUserIds({
      type: 'selected_users',
      selectedUserIds: ['user-custom-1', 'user-custom-2'],
    });
    assert.deepEqual(selected, ['user-custom-1', 'user-custom-2']);
  });
});
