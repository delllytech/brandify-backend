// workRoutes.ts
import express from 'express';
import { 
  createWork, 
  getAllWorks, 
  getWorkById, 
  updateWork, 
  deleteWork 
} from './workController';

const router = express.Router();

router.post('/works', createWork);
router.get('/works', getAllWorks);
router.get('/works/:id', getWorkById);
router.put('/works/:id', updateWork);
router.delete('/works/:id', deleteWork);

export default router;