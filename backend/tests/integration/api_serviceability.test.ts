import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../../app';

describe('Integration Test: Serviceability Endpoints', () => {
  let server: http.Server;
  let baseUrl: string;

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

  it('GET /api/serviceability/areas returns list of Nashik hubs', async () => {
    const res = await fetch(`${baseUrl}/api/serviceability/areas`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.city, 'Nashik');
    assert.equal(data.activePromiseGuarantee, true);
    assert.ok(Array.isArray(data.areas));
    assert.ok(data.areas.length >= 5);
  });

  it('POST /api/serviceability/check returns serviceable for Gangapur Road with 24-hr SLA', async () => {
    const res = await fetch(`${baseUrl}/api/serviceability/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locality: 'Gangapur Road', pincode: '422013' }),
    });
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.serviceable, true);
    assert.equal(data.promiseEligible, true);
    assert.equal(data.slaHours, 24);
    assert.ok(data.promiseDeadlineTimestamp);
  });

  it('POST /api/serviceability/check returns serviceable=false for unknown area', async () => {
    const res = await fetch(`${baseUrl}/api/serviceability/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locality: 'Unknown Mountain Ward', pincode: '999999' }),
    });
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.serviceable, false);
    assert.ok(data.message.includes('outside our instant 1-Day Promise zone'));
  });
});
