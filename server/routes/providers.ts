import { Router } from 'express';
import { backendStore } from '../store';
import { notificationService } from '../services/notificationService';

const router = Router();

// GET /api/providers - List all registered providers
router.get('/', (req, res) => {
  const { category, locality, onlineOnly } = req.query;
  let list = Array.from(backendStore.providers.values());

  if (category) {
    list = list.filter((p) => p.categories.includes(category as any));
  }
  if (locality) {
    list = list.filter((p) =>
      p.serviceAreas.some((sa) => sa.toLowerCase().includes(String(locality).toLowerCase()))
    );
  }
  if (onlineOnly === 'true') {
    list = list.filter((p) => p.isOnline && p.verificationStatus === 'Approved');
  }

  res.json({ count: list.length, providers: list });
});

// GET /api/providers/:id - Get specific provider details, active jobs, and earnings summary
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const provider = backendStore.providers.get(id);

  if (!provider) {
    return res.status(404).json({ error: `Provider with id ${id} not found.` });
  }

  const allBookings = Array.from(backendStore.bookings.values());
  const assignedJobs = allBookings.filter((b) => b.provider?.id === id);
  const activeJobs = assignedJobs.filter(
    (b) => b.status === 'Assigned' || b.status === 'On the Way' || b.status === 'Arrived' || b.status === 'Started'
  );
  const completedJobs = assignedJobs.filter((b) => b.status === 'Completed');

  res.json({
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
  });
});

// PATCH /api/providers/:id/duty - Toggle Duty Online/Offline
router.patch('/:id/duty', (req, res) => {
  const { id } = req.params;
  const { isOnline } = req.body;

  const provider = backendStore.providers.get(id);
  if (!provider) {
    return res.status(404).json({ error: `Provider ${id} not found.` });
  }

  provider.isOnline = Boolean(isOnline);
  backendStore.providers.set(id, provider);

  backendStore.recordAudit({
    actorId: id,
    actorRole: 'provider',
    action: 'PROVIDER_DUTY_TOGGLE',
    resource: 'provider',
    resourceId: id,
    newState: { isOnline: provider.isOnline },
    reason: `Provider set duty status to ${provider.isOnline ? 'ONLINE' : 'OFFLINE'}`,
  });

  res.json({
    success: true,
    message: `Duty status updated to ${provider.isOnline ? 'Online' : 'Offline'}`,
    provider,
  });
});

// POST /api/providers/:id/payout - Initiate payout settlement
router.post('/:id/payout', (req, res) => {
  const { id } = req.params;
  const provider = backendStore.providers.get(id);

  if (!provider) {
    return res.status(404).json({ error: `Provider ${id} not found.` });
  }

  if (provider.netEarnings <= 0) {
    return res.status(400).json({ error: 'No unpaid earnings available for payout.' });
  }

  const payoutAmount = provider.netEarnings;
  provider.payoutStatus = 'Processed';
  backendStore.providers.set(id, provider);

  backendStore.recordAudit({
    actorId: id,
    actorRole: 'provider',
    action: 'PROVIDER_PAYOUT_INITIATED',
    resource: 'payout',
    resourceId: `payout-${id}-${Date.now()}`,
    newState: { payoutAmount, status: 'Processed' },
    reason: `Instant UPI transfer of ₹${payoutAmount} initiated for ${provider.name}`,
  });

  res.json({
    success: true,
    message: `Payout of ₹${payoutAmount} successfully initiated to provider bank account via UPI.`,
    payoutAmount,
    payoutStatus: 'Processed',
  });
});

// POST /api/providers/apply - Apply to become a service provider
router.post('/apply', (req, res) => {
  const {
    userId,
    applicantName,
    email,
    phone,
    experienceYears,
    primaryCategory,
    offeredCategories,
    serviceAreas,
    vehicleType,
    vehicleNumber,
    governmentIdType,
    governmentIdNumber,
  } = req.body;

  if (!applicantName || !phone || !primaryCategory) {
    return res.status(400).json({ error: 'Name, contact phone number, and primary service trade are required.' });
  }

  const applicationId = `app-${Date.now()}`;
  const application = {
    id: applicationId,
    userId: userId || `user-${Date.now()}`,
    applicantName: applicantName.trim(),
    email: email || '',
    phone: phone.trim(),
    experienceYears: Number(experienceYears) || 1,
    primaryCategory: primaryCategory || 'plumbing',
    offeredCategories: Array.isArray(offeredCategories) && offeredCategories.length > 0
      ? offeredCategories
      : [primaryCategory],
    serviceAreas: Array.isArray(serviceAreas) && serviceAreas.length > 0
      ? serviceAreas
      : ['Gangapur Road', 'College Road'],
    vehicleType: vehicleType || 'Two Wheeler',
    vehicleNumber: vehicleNumber || 'MH 15 XX 0000',
    governmentIdType: governmentIdType || 'Aadhaar Card',
    governmentIdNumber: governmentIdNumber || 'Verified in Review',
    status: 'Under Review' as const,
    appliedAt: new Date().toISOString(),
  };

  backendStore.providerApplications.set(applicationId, application);

  // Dispatch Admin Notification
  backendStore.dispatchNotification(
    'New Provider Application',
    `New Provider Application: ${application.applicantName}`,
    `${application.applicantName} applied for ${application.primaryCategory} with ${application.experienceYears}y experience. Awaiting admin review.`,
    'high',
    { relatedApplicationId: applicationId, relatedCustomerId: application.userId }
  );

  // Dispatch applicant push confirmation
  notificationService.dispatchNotification({
    title: 'Partner Application Received',
    message: `Hi ${application.applicantName}, your partner application for ${application.primaryCategory} is under operational review by URBN Nashik team.`,
    category: 'System Alert',
    priority: 'normal',
    deepLink: '/profile',
    userId: application.userId,
    targetAudience: 'individual',
  }).catch(() => {});

  backendStore.recordAudit({
    actorId: application.userId,
    actorRole: 'customer',
    action: 'PROVIDER_APPLICATION_SUBMITTED',
    resource: 'provider_application',
    resourceId: applicationId,
    newState: { status: 'Under Review', category: application.primaryCategory },
    reason: `User applied to become ${application.primaryCategory} service provider in Nashik`,
  });

  res.status(201).json({
    success: true,
    message: 'Your service partner application has been submitted and is under operational review.',
    application,
  });
});

// GET /api/providers/application-status/:userId - Check applicant status
router.get('/application-status/:userId', (req, res) => {
  const { userId } = req.params;
  const applications = Array.from(backendStore.providerApplications.values()).filter(
    (app) => app.userId === userId || (req.query.email && app.email === req.query.email)
  );

  if (applications.length === 0) {
    return res.json({ status: 'Not Applied', application: null });
  }

  // Return the latest application
  applications.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  const latestApp = applications[0];

  // Also check if this user is an already approved provider in providers map
  const matchingProvider = Array.from(backendStore.providers.values()).find(
    (p) => p.userId === userId || (req.query.email && p.email === req.query.email)
  );

  res.json({
    status: latestApp.status,
    application: latestApp,
    providerProfile: matchingProvider || null,
  });
});

export default router;
