import { Router } from 'express';
import { AssessmentController } from '../controllers/assessmentController.js';

const router = Router();

router.get('/assessments', AssessmentController.getAssessments);
router.get('/assessments/stats', AssessmentController.getStats);
router.get('/assessments/:id', AssessmentController.getAssessmentById);
router.post('/assessments', AssessmentController.saveAssessment);
router.delete('/assessments/:id', AssessmentController.deleteAssessment);

export default router;
