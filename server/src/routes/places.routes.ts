import { Router } from 'express';
import { searchPlaces, reverseGeocode } from '../controllers/places.controller.js';

const router = Router();

router.get('/search', searchPlaces);
router.get('/reverse', reverseGeocode);

export default router;
