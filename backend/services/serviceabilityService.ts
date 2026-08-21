import { backendStore, ServiceAreaConfig } from '../store/backendStore';
import { auditRepository } from '../repositories/auditRepository';
import { SLA_PROMISE_HOURS } from '../config/constants';

export class ServiceabilityService {
  public getAllAreas() {
    return {
      city: 'Nashik',
      state: 'Maharashtra',
      country: 'India',
      areas: backendStore.serviceAreas,
      activePromiseGuarantee: true,
      maxSlaHours: SLA_PROMISE_HOURS,
    };
  }

  public checkLocality(locality?: string, pincode?: string, categoryId?: string) {
    if (!locality && !pincode) {
      throw new Error('Locality or PIN code is required.');
    }

    const normalizedLoc = (locality || '').toLowerCase().trim();
    const normalizedPin = (pincode || '').trim();

    const match = backendStore.serviceAreas.find(
      (area) =>
        (normalizedLoc && area.locality.toLowerCase().includes(normalizedLoc)) ||
        (normalizedLoc && normalizedLoc.includes(area.locality.toLowerCase())) ||
        (normalizedPin && area.pincode === normalizedPin)
    );

    auditRepository.trackAnalytics('serviceability_checked', {
      locality,
      pincode,
      categoryId,
      isServiceable: !!match,
    });

    if (!match) {
      return {
        serviceable: false,
        locality: locality || 'Unknown',
        pincode: pincode || '',
        message:
          'Currently outside our instant 1-Day Promise zone in Nashik. We are rapidly expanding to your ward!',
        nearestHub: 'Gangapur Central Hub',
      };
    }

    const now = new Date();
    const deadline = new Date(now.getTime() + SLA_PROMISE_HOURS * 60 * 60 * 1000);

    return {
      serviceable: true,
      area: match,
      promiseEligible: match.promiseEligible,
      slaHours: SLA_PROMISE_HOURS,
      promiseDeadlineTimestamp: deadline.toISOString(),
      promiseMessage:
        'Guaranteed on-site completion or full service recovery credit within 24 hours under the URBN 1-Day Promise.',
      estimatedEtaMinutes: match.avgEtaMinutes,
      availableProsCount: match.activeProsCount,
    };
  }
}

export const serviceabilityService = new ServiceabilityService();
