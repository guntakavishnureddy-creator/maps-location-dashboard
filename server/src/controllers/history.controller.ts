import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/prisma.service.js';

export const getSearchHistory = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const history = await prisma.searchHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(history);
  } catch (error) {
    next(error);
  }
};

export const addSearchHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, placeName, address, latitude, longitude, category } = req.body;

    if (!query || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'query, latitude, and longitude are required.' });
    }

    const item = await prisma.searchHistory.create({
      data: {
        query,
        placeName: placeName || query,
        address: address || null,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        category: category || 'place',
      },
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

export const clearSearchHistory = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.searchHistory.deleteMany();
    res.json({ message: 'Search history cleared successfully.' });
  } catch (error) {
    next(error);
  }
};

export const getRouteHistory = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const routes = await prisma.routeHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(routes);
  } catch (error) {
    next(error);
  }
};

export const addRouteHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      originName,
      originLat,
      originLng,
      destName,
      destLat,
      destLng,
      distanceKm,
      durationMin,
      travelMode,
      waypointsJson,
    } = req.body;

    if (originLat === undefined || destLat === undefined) {
      return res.status(400).json({ error: 'Origin and destination coordinates are required.' });
    }

    const route = await prisma.routeHistory.create({
      data: {
        originName: originName || 'Origin',
        originLat: parseFloat(originLat),
        originLng: parseFloat(originLng),
        destName: destName || 'Destination',
        destLat: parseFloat(destLat),
        destLng: parseFloat(destLng),
        distanceKm: parseFloat(distanceKm) || 0,
        durationMin: parseFloat(durationMin) || 0,
        travelMode: travelMode || 'DRIVING',
        waypointsJson: waypointsJson ? JSON.stringify(waypointsJson) : null,
      },
    });

    res.status(201).json(route);
  } catch (error) {
    next(error);
  }
};

export const clearRouteHistory = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.routeHistory.deleteMany();
    res.json({ message: 'Route history cleared successfully.' });
  } catch (error) {
    next(error);
  }
};
