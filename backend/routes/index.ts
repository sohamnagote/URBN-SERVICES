import { Router } from 'express';
import serviceabilityRouter from './serviceability';
import bookingsRouter from './bookings';
import providersRouter from './providers';
import operationsRouter from './operations';
import paymentsRouter from './payments';
import reviewsRouter from './reviews';
import supportRouter from './support';
import adminRouter from './admin';
import notificationRouter from './notifications';
import authRouter from './authRoutes';
import aiRouter from './aiRoutes';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/serviceability', serviceabilityRouter);
apiRouter.use('/bookings', bookingsRouter);
apiRouter.use('/providers', providersRouter);
apiRouter.use('/operations', operationsRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/payments', paymentsRouter);
apiRouter.use('/reviews', reviewsRouter);
apiRouter.use('/support', supportRouter);
apiRouter.use('/maps', aiRouter);

export default apiRouter;
