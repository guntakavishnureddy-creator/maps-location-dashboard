import { Router } from 'express';
import {
  getSavedPlaces,
  createSavedPlace,
  deleteSavedPlace,
} from '../controllers/savedPlaces.controller.js';

const router = Router();

router.get('/', getSavedPlaces);
router.post('/', createSavedPlace);
router.delete('/:id', deleteSavedPlace);

export default router;
