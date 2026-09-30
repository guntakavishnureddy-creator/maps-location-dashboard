import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/prisma.service.js';

export const getSavedPlaces = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const places = await prisma.savedPlace.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(places);
  } catch (error) {
    next(error);
  }
};

export const createSavedPlace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, label, address, latitude, longitude, icon } = req.body;

    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Name, latitude, and longitude are required.' });
    }

    const place = await prisma.savedPlace.create({
      data: {
        name,
        label: label || 'Favorite',
        address: address || name,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        icon: icon || 'map-pin',
      },
    });

    res.status(201).json(place);
  } catch (error) {
    next(error);
  }
};

export const deleteSavedPlace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.savedPlace.delete({
      where: { id },
    });
    res.json({ message: 'Saved place deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
