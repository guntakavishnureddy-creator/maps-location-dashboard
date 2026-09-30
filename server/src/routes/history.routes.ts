import { Router } from 'express';
import {
  getSearchHistory,
  addSearchHistory,
  clearSearchHistory,
  getRouteHistory,
  addRouteHistory,
  clearRouteHistory,
} from '../controllers/history.controller.js';

const router = Router();

router.get('/searches', getSearchHistory);
router.post('/searches', addSearchHistory);
router.delete('/searches', clearSearchHistory);

router.get('/routes', getRouteHistory);
router.post('/routes', addRouteHistory);
router.delete('/routes', clearRouteHistory);

export default router;
