# NaviPulse — Maps API & Location-Based Dashboard

A high-performance, production-ready web dashboard demonstrating modern Maps API integration, browser geolocation, place search, and dynamic road routing. Inspired by industry-standard location platforms like Uber, Rapido, and Google Maps.

---

## 1. Project Overview

NaviPulse fulfills all functional, architectural, security, and UI/UX requirements specified for the **Maps API & Location-Based Dashboard** internship assignment.

### Core Experience Flow:
$$\text{Open Dashboard} \longrightarrow \text{Detect User Location} \longrightarrow \text{Search Destination} \longrightarrow \text{Select Location} \longrightarrow \text{Show Route} \longrightarrow \text{Display Distance \& Time} \longrightarrow \text{Clear Route or Re-route}$$

### Key Highlights:
- **Dual Maps Engine**: Official Google Maps Platform integration (JavaScript API, Places, DirectionsService) with a seamless zero-config fallback to OpenStreetMap & OSRM road routing engine.
- **Browser Geolocation**: Robust permission handling (`granted`, `denied`, `unavailable`, `unsupported`) with a dedicated "My Location" recenter button.
- **Live Place Search**: Debounced search with category icons for cities, airports, universities, landmarks, and street addresses.
- **Real Road Routing**: Non-linear real road polyline with auto-fitting viewport (`fitBounds`), distance, duration, and turn-by-turn directions.
- **Persistent Backend & Database**: Full Node.js/Express + Prisma ORM backend managing Search History, Route History, and Saved Places (SQLite for zero-config dev, PostgreSQL ready for production).
- **Uber-Inspired Design**: Floating search bar, travel mode selector (Driving, Walking, Cycling, Transit), quick search chips (Bangalore, SRM University AP, Airport, MG Road, Electronic City, Hyderabad), dark mode, and satellite layers.

---

## 2. Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React |
| **Maps & Routing** | Google Maps JavaScript API (`@googlemaps/js-api-loader`), Leaflet, OSRM Road Routing API, OpenStreetMap Nominatim |
| **Backend API** | Node.js, Express, TypeScript, Axios, CORS, Dotenv |
| **Database & ORM**| Prisma ORM, SQLite (local development) / PostgreSQL (production) |
| **Architecture** | Modular Clean Architecture (Routes, Controllers, Services, Hooks, Components) |

---

## 3. Project Structure

```
maps-dashboard/
├── .gitignore                      # Git ignore rules for node_modules, .env, and db
├── .env.example                    # Template for all environment variables
├── package.json                    # Root workspace orchestrator with dev/build scripts
├── IMPLEMENTATION_CHECKLIST.md     # Verification matrix against all PDF specifications
├── README.md                       # Comprehensive project documentation
│
├── client/                         # Frontend React + TypeScript application
│   ├── index.html                  # HTML entry point with meta tags & Leaflet stylesheet
│   ├── package.json                # Client dependencies & scripts
│   ├── tailwind.config.js          # Tailwind styling & dark mode config
│   ├── tsconfig.json               # TypeScript configuration
│   └── src/
│       ├── main.tsx                # React application entry point
│       ├── App.tsx                 # Core application controller & state coordinator
│       ├── index.css               # Global styles, Tailwind directives & marker animations
│       ├── types/
│       │   └── index.ts            # Central TypeScript interfaces & types
│       ├── services/
│       │   ├── api.ts              # REST client with offline localStorage fallback
│       │   ├── geolocation.ts      # Browser Geolocation API wrapper & permission detector
│       │   ├── googleMaps.ts       # Google Maps loader, Places, Directions, and Geocoder
│       │   └── osmService.ts       # OpenStreetMap Nominatim & OSRM road routing engine
│       ├── hooks/
│       │   ├── useGeolocation.ts   # Geolocation lifecycle hook
│       │   ├── useMapRouting.ts    # Route calculation, clearing & travel modes hook
│       │   └── useHistory.ts       # Search history & saved places synchronization hook
│       └── components/
│           ├── Navbar.tsx          # Top bar with engine switch, dark mode & drawer triggers
│           ├── MapView.tsx         # Unified map wrapper with Google / Leaflet fallback
│           ├── GoogleMapView.tsx   # Google Maps Platform implementation
│           ├── LeafletMapView.tsx  # Leaflet / OSM implementation
│           ├── SearchBar.tsx       # Floating search bar with debounced autocomplete
│           ├── QuickSearchChips.tsx# 1-tap chips for PDF example destinations
│           ├── RouteInfoCard.tsx   # Floating trip summary (distance, duration, maneuvers)
│           ├── MapControls.tsx     # Floating controls (My Location, zoom, layer switcher)
│           ├── LocationPermissionBanner.tsx # Non-blocking permission alert banner
│           ├── HistoryDrawer.tsx   # Slide-over recent searches & route replay drawer
│           ├── SavedPlacesDrawer.tsx # Slide-over favorite places manager
│           └── SettingsModal.tsx   # API key configuration & GCP setup guide
│
└── server/                         # Backend Express + Prisma service
    ├── package.json                # Server dependencies & scripts
    ├── tsconfig.json               # Server TypeScript configuration
    ├── prisma/
    │   ├── schema.prisma           # Database schema (SearchHistory, RouteHistory, SavedPlace)
    │   └── seed.ts                 # Database seeder with PDF example locations
    └── src/
        ├── index.ts                # Express application bootstrap & middleware
        ├── middleware/
        │   └── errorHandler.ts     # Global error handling middleware
        ├── services/
        │   ├── prisma.service.ts   # Prisma client singleton
        │   ├── geocoding.service.ts# Geocoding & place search service
        │   └── maps.service.ts     # Server-side routing service
        ├── controllers/
        │   ├── history.controller.ts     # Search & route history CRUD
        │   ├── savedPlaces.controller.ts # Saved places CRUD
        │   ├── places.controller.ts      # Place search & reverse geocoding
        │   └── routes.controller.ts      # Routing proxy endpoint
        └── routes/
            ├── history.routes.ts   # /api/history routes
            ├── savedPlaces.routes.ts # /api/saved-places routes
            ├── places.routes.ts    # /api/places routes
            └── routes.routes.ts    # /api/routes routes
```

---

## 4. Local Setup & How to Run

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **Git**

### Step 1: Clone or Navigate to Project
```bash
git clone <repository_url>
cd maps-dashboard
```

### Step 2: Install All Dependencies
You can install dependencies for root, client, and server in one command:
```bash
npm run install:all
```
*(Or manually run `npm install` inside both `client/` and `server/` directories).*

### Step 3: Configure Environment Variables
Copy the `.env.example` templates to `.env`:

In `client/.env`:
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_API_BASE_URL=http://localhost:5000/api
VITE_DEFAULT_MAP_ENGINE=google
```

In `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL="file:./dev.db"
GOOGLE_MAPS_API_KEY=
```

> **Note**: Even if you do not have a Google Maps API Key yet, the application will automatically run seamlessly using the built-in OpenStreetMap / Leaflet + OSRM engine without breaking!

### Step 4: Initialize and Seed the Database
```bash
cd server
npx prisma db push
npm run seed
cd ..
```

### Step 5: Start Development Servers
From the root directory, launch both backend and frontend concurrently:
```bash
npm run dev
```

- **Frontend**: Accessible at [http://localhost:5173](http://localhost:5173)
- **Backend API**: Accessible at [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 5. Google Cloud Platform Configuration

To run using Google Maps Platform as your map engine:

### 1. Create a Google Cloud Project
1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `Maps-Dashboard` or select an existing one.

### 2. Enable Required APIs
In **APIs & Services > Library**, enable the following 4 APIs:
- **Maps JavaScript API**: Renders interactive map canvas, custom markers, and viewport fitting.
- **Places API** (or Places API New): Powers place search autocomplete for cities, landmarks, airports, and universities.
- **Directions API**: Calculates road routes, travel duration, distances, and turn-by-turn maneuvers.
- **Geocoding API**: Reverse geocodes coordinates to street addresses.

### 3. Create Credentials & Restrict API Key
1. Go to **APIs & Services > Credentials** and click **Create Credentials > API Key**.
2. Under **Application restrictions**, select **Websites (HTTP referrers)**:
   - For local development: `http://localhost:5173/*`, `http://127.0.0.1:5173/*`
   - For production: `https://your-deployed-frontend.vercel.app/*`
3. Under **API restrictions**, select **Restrict key** and choose the 4 APIs enabled above.
4. Copy the API key and place it into `client/.env` as `VITE_GOOGLE_MAPS_API_KEY`, or enter it directly into the in-app **Settings** modal.

---

## 6. Database Setup

The backend utilizes **Prisma ORM** with standard Prisma migrations and seeding.

### Database Schema Models:
1. `SearchHistory`: Records queries, matched place names, addresses, coordinates, categories, and timestamps.
2. `RouteHistory`: Stores calculated routes (origin name/coords, destination name/coords, distance in km, duration in minutes, travel mode, timestamps).
3. `SavedPlace`: Stores user bookmarks (Home, Work, Campus, Airport, Favorites) with names, labels, and coordinates.

### Local Development (SQLite):
No database server installation required. SQLite runs automatically via `file:./dev.db`.

### Production (PostgreSQL):
To switch to PostgreSQL (e.g. Neon, Supabase, Render, Railway):
1. In `server/prisma/schema.prisma`, update the provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `DATABASE_URL` in `server/.env` with your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
   ```
3. Run `npx prisma db push` to generate all tables and indexes.

---

## 7. Geolocation Implementation Details

The geolocation service is implemented in [client/src/services/geolocation.ts](file:///C:/Users/reddy/.gemini/antigravity/scratch/maps-dashboard/client/src/services/geolocation.ts) and wrapped in the [useGeolocation hook](file:///C:/Users/reddy/.gemini/antigravity/scratch/maps-dashboard/client/src/hooks/useGeolocation.ts):

1. **Detection**: Upon mounting, the app calls `GeolocationService.checkPermission()` using the Permissions API to inspect current permissions without prompting prematurely.
2. **Retrieval**: `navigator.geolocation.getCurrentPosition()` is invoked with `enableHighAccuracy: true`, `timeout: 10000`, and `maximumAge: 30000`.
3. **Marker & Pan**: On permission grant, user coordinates are stored, the map smoothly flies to the location, and a custom pulsing radar marker is rendered.
4. **Permission Denied / Unavailable**: If denied or unavailable, the application catches `error.PERMISSION_DENIED` / `POSITION_UNAVAILABLE` and triggers a user-friendly banner explaining why location access is requested and allowing manual destination/origin search without interrupting normal map usage.
5. **"My Location" Control**: A floating crosshair button triggers re-request and re-centering at any point.

---

## 8. Maps API & Routing Implementation Details

The routing system supports both Google Maps Platform and OpenStreetMap:

1. **Origin & Destination**: Defaults to using the user's actual latitude and longitude as origin, with the ability to toggle and select an arbitrary origin.
2. **Road Routing Engine**:
   - **Google Mode**: Calls `google.maps.DirectionsService.route()` with origin, destination, and travel mode (`DRIVING`, `WALKING`, `BICYCLING`, `TRANSIT`). Renders real road geometry through `google.maps.DirectionsRenderer`.
   - **OSRM Mode**: Calls Open Source Routing Machine (`https://router.project-osrm.org/route/v1/...`) with full GeoJSON road geometry and turn-by-turn maneuvers.
3. **Viewport Fitting**: Both engines automatically execute `fitBounds()` with 80px padding so that the origin, destination pin, and complete road trajectory are clearly visible.
4. **Information Card**: Displays formatted distance (`km` / `m`) and travel time (`hours` and `minutes`), with an expandable step-by-step turn directions drawer.
5. **State Reset**: The "Clear" button resets state and polyline instantly without page reload.

---

## 9. Production Deployment Guide

### A. Deploy Frontend (Vercel / Netlify)
1. Push repository to GitHub.
2. Connect repository to [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
3. Set **Root Directory** to `client`.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Add Environment Variables in dashboard:
   - `VITE_GOOGLE_MAPS_API_KEY`: Your restricted Google Maps API key
   - `VITE_API_BASE_URL`: Your deployed backend URL (e.g. `https://your-api.onrender.com/api`)
   - `VITE_DEFAULT_MAP_ENGINE`: `google`

### B. Deploy Backend (Render / Railway)
1. In [Render](https://render.com) or [Railway](https://railway.app), create a new **Web Service**.
2. Set **Root Directory** to `server`.
3. Build command: `npm install && npx prisma db push && npm run build`.
4. Start command: `npm start`.
5. Add Environment Variables:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: Your deployed frontend domain (e.g. `https://your-app.vercel.app`)
   - `DATABASE_URL`: Your managed PostgreSQL connection string
   - `GOOGLE_MAPS_API_KEY`: Server-side Google Maps key (optional)

### C. Deploy Database (Neon / Supabase)
1. Create a free PostgreSQL instance on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Copy the pooled connection string into `DATABASE_URL` in your backend deployment settings.
3. Run `npx prisma db push` during build to automatically sync tables.

---

## 10. Verification Pass

| Area | Status | Evidence |
| :--- | :---: | :--- |
| **Backend Health** | Pass | `GET /api/health` returns `healthy` status and database connection |
| **Database Seed** | Pass | Pre-seeded with PDF locations (Bangalore, SRM AP, Airport, MG Road, E-City, Hyderabad) |
| **Place Search** | Pass | Real search query via backend and client returns geocoded coordinates |
| **Road Route Engine** | Pass | Real road routing returns distance, duration, steps, and polyline coordinates |
| **Frontend Compilation** | Pass | TypeScript + Vite production build compiles with zero errors |
| **Security** | Pass | `.env` and `dev.db` excluded by `.gitignore` |

---

## 11. Author & Submission Details
- **Project**: Maps API & Location-Based Dashboard
- **Submission Type**: Internship Implementation Assignment
- **License**: MIT
