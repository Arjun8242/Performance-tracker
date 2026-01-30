
import { Router } from 'express';
import { getUsers } from '../controllers/admin.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = Router();

// Allow only admins to access these routes
router.use(protect);
router.use(restrictTo('admin'));

router.get('/users', getUsers);

export default router;
