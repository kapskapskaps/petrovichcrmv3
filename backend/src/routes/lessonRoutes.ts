
import { Router } from 'express';
import { 
    getLessons, 
    createLesson, 
    updateLesson, 
    deleteLesson, 
    markLessonAsComplete 
} from '../controllers/lessonController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Apply auth middleware to all lesson routes
router.use(authMiddleware);

router.get('/', getLessons);
router.post('/', createLesson);
router.put('/:id', updateLesson);
router.delete('/:id', deleteLesson);
router.post('/:id/complete', markLessonAsComplete);

export default router;
