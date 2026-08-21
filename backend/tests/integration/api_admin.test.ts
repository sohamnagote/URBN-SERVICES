import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../../app';

describe('Integration Test: Admin RBAC & Command Center APIs', () => {
  let server: http.Server;
  let baseUrl: string;
  const adminEmail = 'someshnagote14@gmail.com';
  const unauthorizedEmail = 'attacker@random.com';

  before(async () => {
    await new Promise<void>((resolve) => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        const address = server.address() as any;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('GET /api/admin/auth-check returns authorized: true for super admin', async () => {
    const res = await fetch(`${baseUrl}/api/admin/auth-check`, {
      headers: { 'x-admin-email': adminEmail },
    });
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.authorized, true);
    assert.equal(data.role, 'admin');
    assert.equal(data.user.email, adminEmail);
  });

  it('GET /api/admin/auth-check returns 403 for unauthorized user', async () => {
    const res = await fetch(`${baseUrl}/api/admin/auth-check`, {
      headers: { 'x-admin-email': unauthorizedEmail },
    });
    assert.equal(res.status, 403);

    const data = await res.json();
    assert.equal(data.authorized, false);
  });

  it('GET /api/admin/overview returns 200 with full command center metrics for authorized admin', async () => {
    const res = await fetch(`${baseUrl}/api/admin/overview`, {
      headers: { 'x-admin-email': adminEmail },
    });
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.ok(data.metrics);
    assert.ok(data.metrics.grossBookingValue);
    assert.ok(data.metrics.platformRevenue);
    assert.ok(data.metrics.slaAdherenceRate);
    assert.ok(Array.isArray(data.liveDispatchQueue));
    assert.ok(Array.isArray(data.recentAuditLogs));
  });

  it('GET /api/admin/overview returns 403 Forbidden without admin headers', async () => {
    const res = await fetch(`${baseUrl}/api/admin/overview`);
    assert.equal(res.status, 403);
  });

  it('GET /api/admin/audit-logs returns system audit trail', async () => {
    const res = await fetch(`${baseUrl}/api/admin/audit-logs?limit=10`, {
      headers: { 'x-admin-email': adminEmail },
    });
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.ok(data.total >= 1);
    assert.ok(Array.isArray(data.logs));
  });
});
