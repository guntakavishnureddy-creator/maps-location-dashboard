import { Request, Response, NextFunction } from 'express';
import { MapsService } from '../services/maps.service.js';

export const calculateRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { origin, destination, mode } = req.body;

    if (!origin || !destination || origin.lat === undefined || destination.lat === undefined) {
      return res.status(400).json({ error: 'Origin and destination coordinates are required.' });
    }

    const route = await MapsService.calculateRoute(origin, destination, mode);
    res.json(route);
  } catch (error: any) {
    if (error.message.includes('Unable to find a route')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};
