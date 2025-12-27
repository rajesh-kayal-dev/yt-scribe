import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createCourse, getMarketplaceCourses, getAllCourses, getCourseById, updateCourse } from '../controllers/courseController.js';

const router = express.Router();

router.post('/', protect, createCourse);
router.get('/', getAllCourses);
router.get('/marketplace', getMarketplaceCourses);
router.get('/:id', getCourseById);
router.put('/:id', protect, updateCourse);

export default router;
