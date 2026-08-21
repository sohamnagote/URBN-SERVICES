import { ProviderApplication } from '../types';
import { backendStore, ProviderRecord } from '../store/backendStore';
import { providerRepository } from '../repositories/providerRepository';
import { bookingRepository } from '../repositories/bookingRepository';
import { auditRepository } from '../repositories/auditRepository';
import { notificationService } from './notificationService';

export class ProviderService {
  public getProviderDetails(id: string) {
    const provider = providerRepository.findById(id);
    if (!provider) {
      throw new Error(`Provider with id ${id} not found.`);
    }

    const allBookings = bookingRepository.findAll();
    const assignedJobs = allBookings.filter((b) => b.provider?.id === id);
    const activeJobs = assignedJobs.filter(
      (b) => b.status === 'Assigned' || b.status === 'On the Way' || b.status === 'Arrived' || b.status === 'Started'
    );
    const completedJobs = assignedJobs.filter((b) => b.status === 'Completed');

    return {
      provider,
      metrics: {
        totalAssigned: assignedJobs.length,
        activeJobsCount: activeJobs.length,
        completedJobsCount: completedJobs.length,
        grossEarnings: provider.grossEarnings,
        platformCommission: provider.platformCommission,
        netEarnings: provider.netEarnings,
        payoutStatus: provider.payoutStatus,
      },
      activeJobs,
      recentCompletedJobs: completedJobs.slice(0, 10),
    };
  }

  public toggleDuty(id: string, isOnline: boolean): ProviderRecord {
    const provider = providerRepository.findById(id);
    if (!provider) {
      throw new Error(`Provider ${id} not found.`);
    }

    provider.isOnline = Boolean(isOnline);
    providerRepository.save(provider);

    auditRepository.record({
      actorId: id,
      actorRole: 'provider',
      action: 'PROVIDER_DUTY_TOGGLE',
      resource: 'provider',
      resourceId: id,
      newState: { isOnline: provider.isOnline },
      reason: `Provider set duty status to ${provider.isOnline ? 'ONLINE' : 'OFFLINE'}`,
    });

    return provider;
  }

  public initiatePayout(id: string) {
    const provider = providerRepository.findById(id);
    if (!provider) {
      throw new Error(`Provider ${id} not found.`);
    }

    if (provider.netEarnings <= 0) {
      throw new Error('No unpaid earnings available for payout.');
    }

    const payoutAmount = provider.netEarnings;
    provider.payoutStatus = 'Processed';
    providerRepository.save(provider);

    auditRepository.record({
      actorId: id,
      actorRole: 'provider',
      action: 'PROVIDER_PAYOUT_INITIATED',
      resource: 'payout',
      resourceId: `payout-${id}-${Date.now()}`,
      newState: { payoutAmount, status: 'Processed' },
      reason: `Instant UPI transfer of ₹${payoutAmount} initiated for ${provider.name}`,
    });

    return {
      payoutAmount,
      payoutStatus: 'Processed' as const,
    };
  }

  public apply(payload: any): ProviderApplication {
    const applicationId = `app-${Date.now()}`;
    const application: ProviderApplication = {
      id: applicationId,
      userId: payload.userId || `user-${Date.now()}`,
      applicantName: payload.applicantName.trim(),
      email: payload.email || '',
      phone: payload.phone.trim(),
      experienceYears: Number(payload.experienceYears) || 1,
      primaryCategory: payload.primaryCategory || 'plumbing',
      offeredCategories: Array.isArray(payload.offeredCategories) && payload.offeredCategories.length > 0
        ? payload.offeredCategories
        : [payload.primaryCategory],
      serviceAreas: Array.isArray(payload.serviceAreas) && payload.serviceAreas.length > 0
        ? payload.serviceAreas
        : ['Gangapur Road', 'College Road'],
      vehicleType: payload.vehicleType || 'Two Wheeler',
      vehicleNumber: payload.vehicleNumber || 'MH 15 XX 0000',
      governmentIdType: payload.governmentIdType || 'Aadhaar Card',
      governmentIdNumber: payload.governmentIdNumber || 'Verified in Review',
      status: 'Under Review',
      appliedAt: new Date().toISOString(),
    };

    providerRepository.saveApplication(application);

    backendStore.dispatchNotification(
      'New Provider Application',
      `New Provider Application: ${application.applicantName}`,
      `${application.applicantName} applied for ${application.primaryCategory} with ${application.experienceYears}y experience. Awaiting admin review.`,
      'high',
      { relatedApplicationId: applicationId, relatedCustomerId: application.userId }
    );

    notificationService.dispatchNotification({
      title: 'Partner Application Received',
      message: `Hi ${application.applicantName}, your partner application for ${application.primaryCategory} is under operational review by URBN Nashik team.`,
      category: 'System Alert',
      priority: 'normal',
      deepLink: '/profile',
      userId: application.userId,
      targetAudience: 'individual',
    }).catch(() => {});

    auditRepository.record({
      actorId: application.userId,
      actorRole: 'customer',
      action: 'PROVIDER_APPLICATION_SUBMITTED',
      resource: 'provider_application',
      resourceId: applicationId,
      newState: { status: 'Under Review', category: application.primaryCategory },
      reason: `User applied to become ${application.primaryCategory} service provider in Nashik`,
    });

    return application;
  }

  public getApplicationStatus(userId: string, email?: string) {
    const applications = providerRepository.findAllApplications().filter(
      (app) => app.userId === userId || (email && app.email === email)
    );

    if (applications.length === 0) {
      return { status: 'Not Applied', application: null, providerProfile: null };
    }

    const latestApp = applications[0];
    const matchingProvider = Array.from(backendStore.providers.values()).find(
      (p) => p.userId === userId || (email && p.email === email)
    );

    return {
      status: latestApp.status,
      application: latestApp,
      providerProfile: matchingProvider || null,
    };
  }

  public reviewApplication(
    id: string,
    action: 'approve' | 'reject',
    internalNotes?: string,
    rejectionReason?: string,
    adminEmail: string = 'someshnagote14@gmail.com'
  ) {
    const application = providerRepository.findApplicationById(id);
    if (!application) {
      throw new Error(`Application ${id} not found.`);
    }

    if (action === 'approve') {
      application.status = 'Approved';
      application.reviewedAt = new Date().toISOString();
      application.reviewedBy = adminEmail;
      application.internalNotes = internalNotes || 'Approved by Admin';

      const providerId = `prov-${Date.now()}`;
      const newProvider: ProviderRecord = {
        id: providerId,
        userId: application.userId,
        email: application.email,
        name: application.applicantName,
        profession: `Master ${application.primaryCategory.toUpperCase()} Specialist`,
        rating: 5.0,
        reviewsCount: 0,
        phone: application.phone,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        verified: true,
        etaMinutes: 15,
        vehicleType: application.vehicleType,
        vehicleNumber: application.vehicleNumber,
        currentLocationName: `${application.serviceAreas[0] || 'Gangapur Road'}, Nashik`,
        coords: { lat: 20.005, lng: 73.765 },
        verificationStatus: 'Approved',
        isOnline: true,
        categories: application.offeredCategories,
        serviceAreas: application.serviceAreas,
        totalJobsCompleted: 0,
        grossEarnings: 0,
        platformCommission: 0,
        netEarnings: 0,
        payoutStatus: 'Processed',
      };

      providerRepository.save(newProvider);
      providerRepository.saveApplication(application);

      backendStore.dispatchNotification(
        'New Provider Application',
        `Provider Approved: ${application.applicantName}`,
        `${application.applicantName} has been approved as an active ${application.primaryCategory} partner in Nashik.`,
        'low',
        { relatedApplicationId: id, relatedProviderId: providerId }
      );

      notificationService.dispatchNotification({
        title: '🎉 Partner Application Approved!',
        message: `Welcome aboard ${application.applicantName}! Your ${application.primaryCategory} profile is now active and receiving customer service leads in Nashik.`,
        category: 'System Alert',
        priority: 'high',
        deepLink: '/profile',
        userId: application.userId,
        targetAudience: 'individual',
      }).catch(() => {});

      auditRepository.record({
        actorId: adminEmail,
        actorRole: 'admin',
        action: 'ADMIN_PROVIDER_APPLICATION_APPROVED',
        resource: 'provider_application',
        resourceId: id,
        newState: { status: 'Approved', createdProviderId: providerId },
        reason: internalNotes || 'Application meets all Nashik onboarding criteria',
      });

      return { application, provider: newProvider };
    } else {
      application.status = 'Rejected';
      application.reviewedAt = new Date().toISOString();
      application.reviewedBy = adminEmail;
      application.rejectionReason = rejectionReason || 'Documentation could not be verified.';
      application.internalNotes = internalNotes || '';

      providerRepository.saveApplication(application);

      auditRepository.record({
        actorId: adminEmail,
        actorRole: 'admin',
        action: 'ADMIN_PROVIDER_APPLICATION_REJECTED',
        resource: 'provider_application',
        resourceId: id,
        newState: { status: 'Rejected', rejectionReason: application.rejectionReason },
        reason: application.rejectionReason,
      });

      return { application, provider: null };
    }
  }
}

export const providerService = new ProviderService();
