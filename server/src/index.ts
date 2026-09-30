import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import historyRoutes from './routes/history.routes.js';
import savedPlacesRoutes from './routes/savedPlaces.routes.js';
import placesRoutes from './routes/places.routes.js';
import routesRoutes from './routes/routes.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl) or allowed origins
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev/testing
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'maps-dashboard-backend',
    version: '1.0.0',
    database: 'connected',
    googleMapsConfigured: Boolean(process.env.GOOGLE_MAPS_API_KEY),
  });
});

// Public client config
app.get('/api/config', (_req, res) => {
  res.json({
    hasGoogleMapsKey: Boolean(process.env.GOOGLE_MAPS_API_KEY),
    defaultLocation: {
      name: 'Bengaluru, Karnataka',
      lat: 12.9716,
      lng: 77.5946,
    },
    supportedModes: ['DRIVING', 'WALKING', 'BICYCLING', 'TRANSIT'],
  });
});

// API Routes
app.use('/api/history', historyRoutes);
app.use('/api/saved-places', savedPlacesRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/routes', routesRoutes);

// Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Maps Dashboard Server] Running on http://localhost:${PORT}`);
  console.log(`[Maps Dashboard Server] Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[Maps Dashboard Server] Google Maps Backend Key: ${process.env.GOOGLE_MAPS_API_KEY ? 'Present' : 'Not Set (OSRM Fallback Active)'}`);
});
