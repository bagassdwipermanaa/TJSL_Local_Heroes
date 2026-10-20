import express from 'express';
import { RegistrationController } from '../controllers/registrationController.js';

const router = express.Router();

router.get('/registrations', RegistrationController.getRegistrations);
router.get('/registrations/stats', RegistrationController.getStats);
router.get('/registrations/:id', RegistrationController.getRegistrationById);
router.post('/registrations', RegistrationController.saveRegistration);
router.patch('/registrations/:id/review', RegistrationController.updateReview);
router.delete('/registrations/:id', RegistrationController.deleteRegistration);

export default router;
