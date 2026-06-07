import { Router } from 'express';
import { AadhaarController } from '../controllers/AadhaarController';
import { upload } from '../../infrastructure/middleware/upload';

export const createAadhaarRouter = (controller: AadhaarController): Router => {
  const router = Router();

  router.post(
    '/ocr',
    upload.fields([
      { name: 'frontImage', maxCount: 1 },
      { name: 'backImage', maxCount: 1 },
    ]),
    controller.uploadAndProcess
  );

  router.get('/history', controller.getHistory);

  return router;
};
export default createAadhaarRouter;
