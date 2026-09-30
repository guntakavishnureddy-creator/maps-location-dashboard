import { Request, Response, NextFunction } from 'express';
import { GeocodingService } from '../services/geocoding.service.js';

export const searchPlaces = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query.q as string;
    if (!q || !q.trim()) {
      return res.json([]);
    }

    const results = await GeocodingService.searchPlaces(q);
    res.json(results);
  } catch (error) {
    next(error);
  }
};

export const reverseGeocode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Valid lat and lng query params are required.' });
    }

    const address = await GeocodingService.reverseGeocode(lat, lng);
    res.json({ address });
  } catch (error) {
    next(error);
  }
};
