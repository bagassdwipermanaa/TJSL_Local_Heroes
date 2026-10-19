import { Router } from 'express';
import { upload } from '../middlewares/uploadMiddleware.js';
import { UploadController } from '../controllers/uploadController.js';

const router = Router();

// Single file upload route
router.post('/upload', upload.single('file'), UploadController.uploadSingle);

// Multiple files upload route
router.post('/upload/multiple', upload.array('files', 10), UploadController.uploadMultiple);

// Delete file route
router.delete('/upload/:filename', UploadController.deleteFile);

export default router;
