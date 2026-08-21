import { Router } from 'express';
import { backendStore } from '../store';

const router = Router();

// GET /api/serviceability/areas - List all Nashik service areas & operational status
router.get('/areas', (req, res) => {
  res.json({
    city: 'Nashik',
    state: 'Maharashtra',
    country: 'India',
    areas: backendStore.serviceAreas,
    activePromiseGuarantee: true,
    maxSlaHours: 24,
  });
});

// POST /api/serviceability/check - Authoritative serviceability and 1-Day Promise verification
router.post('/check', (req, res) => {
  const { locality, pincode, categoryId } = req.body;

  if (!locality && !pincode) {
    return res.status(400).json({ error: 'Locality or PIN code is required.' });
  }

  const normalizedLoc = (locality || '').toLowerCase().trim();
  const normalizedPin = (pincode || '').trim();

  const match = backendStore.serviceAreas.find(
    (area) =>
      (normalizedLoc && area.locality.toLowerCase().includes(normalizedLoc)) ||
      (normalizedLoc && normalizedLoc.includes(area.locality.toLowerCase())) ||
      (normalizedPin && area.pincode === normalizedPin)
  );

  backendStore.trackAnalytics('serviceability_checked', {
    locality,
    pincode,
    categoryId,
    isServiceable: !!match,
  });

  if (!match) {
    return res.json({
      serviceable: false,
      locality: locality || 'Unknown',
      pincode: pincode || '',
      message:
        'Currently outside our instant 1-Day Promise zone in Nashik. We are rapidly expanding to your ward!',
      nearestHub: 'Gangapur Central Hub',
    });
  }

  // Calculate dynamic SLA deadline for 1-Day Promise
  const now = new Date();
  const deadline = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  res.json({
    serviceable: true,
    area: match,
    promiseEligible: match.promiseEligible,
    slaHours: 24,
    promiseDeadlineTimestamp: deadline.toISOString(),
    promiseMessage:
      'Guaranteed on-site completion or full service recovery credit within 24 hours under the URBN 1-Day Promise.',
    estimatedEtaMinutes: match.avgEtaMinutes,
    availableProsCount: match.activeProsCount,
  });
});

export default router;
