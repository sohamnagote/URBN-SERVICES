import { Router } from 'express';
import { bookingController } from '../controllers/bookingController';
import { validate } from '../middlewares/validateMiddleware';
import { validateCreateBooking, validateVerifyOtp } from '../validators/bookingValidators';

const router = Router();

// GET /api/bookings - List bookings (supports filtering by userId, providerId, status)
router.get('/', (req, res, next) => bookingController.getAll(req, res, next));

// GET /api/bookings/:id - Retrieve single booking by ID
router.get('/:id', (req, res, next) => bookingController.getById(req, res, next));

// POST /api/bookings - Authoritative Booking Creation Engine
router.post('/', validate(validateCreateBooking), (req, res, next) => bookingController.create(req, res, next));

// PATCH /api/bookings/:id/status - Authoritative Status State Machine Transition
router.patch('/:id/status', (req, res, next) => bookingController.updateStatus(req, res, next));

// POST /api/bookings/:id/verify-otp - On-site OTP verification to start service
router.post('/:id/verify-otp', validate(validateVerifyOtp), (req, res, next) => bookingController.verifyOtp(req, res, next));

// POST /api/bookings/:id/cancel - Cancellation with refund handling
router.post('/:id/cancel', (req, res, next) => bookingController.cancel(req, res, next));

export default router;
