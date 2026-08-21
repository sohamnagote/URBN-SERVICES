import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateStatusTransition } from '../../validators/bookingValidators';

describe('Booking State Machine Transition Tests', () => {
  it('allows valid state transitions', () => {
    assert.equal(validateStatusTransition('Requested', 'Confirmed').valid, true);
    assert.equal(validateStatusTransition('Requested', 'Assigned').valid, true);
    assert.equal(validateStatusTransition('Requested', 'Cancelled').valid, true);

    assert.equal(validateStatusTransition('Assigned', 'On the Way').valid, true);
    assert.equal(validateStatusTransition('On the Way', 'Arrived').valid, true);
    assert.equal(validateStatusTransition('Arrived', 'Started').valid, true);
    assert.equal(validateStatusTransition('Started', 'Completed').valid, true);
    assert.equal(validateStatusTransition('Completed', 'Disputed').valid, true);
    assert.equal(validateStatusTransition('Disputed', 'Completed').valid, true);
  });

  it('rejects illegal status transitions', () => {
    // Cannot jump backwards from Completed to Requested
    assert.equal(validateStatusTransition('Completed', 'Requested').valid, false);

    // Cannot jump backwards from Cancelled to Started
    assert.equal(validateStatusTransition('Cancelled', 'Started').valid, false);

    // Cannot transition from Started to Requested
    assert.equal(validateStatusTransition('Started', 'Requested').valid, false);
  });

  it('allows same-status transitions as idempotent no-ops', () => {
    assert.equal(validateStatusTransition('On the Way', 'On the Way').valid, true);
    assert.equal(validateStatusTransition('Completed', 'Completed').valid, true);
  });
});
