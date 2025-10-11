# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Ultimate Buggy Racing Tournament Management System** - a comprehensive tournament platform for managing 8-week racing championships. The system uses a headless CMS architecture with Express.js backend and static frontend.

## Architecture

- **Backend**: Express.js server (`backend/server.js`) with Strapi-compatible API endpoints
- **Frontend**: Static HTML/CSS/JavaScript tournament website (`frontend/`)
- **Data Flow**: Backend provides REST APIs → Frontend consumes and displays data
- **Admin Interface**: Basic admin panel at `/admin.html` for tournament management

## Development Commands

### Backend Development
```bash
cd backend
npm start          # Start server on port 1337
npm run dev        # Same as npm start
```

### Frontend Development
```bash
cd frontend
python -m http.server 8000     # Python 3 server
# OR
npx http-server                 # Node.js server
# OR
php -S localhost:8000           # PHP server
```

### Access Points
- **Frontend**: http://localhost:8000
- **Backend API**: http://localhost:1337
- **Admin Panel**: http://localhost:1337/admin.html
- **API Health**: http://localhost:1337/api/health

## Code Structure

### Backend (`backend/`)
- `server.js` - Main Express server with sample data and API endpoints
- `package.json` - Node.js dependencies (Express, CORS)
- `public/` - Static assets (admin.html, etc.)

### Frontend (`frontend/`)
- `index.html` - Main tournament page with tabbed interface
- `css/styles.css` - Complete responsive styling with racing theme
- `js/` - JavaScript modules:
  - `api.js` - API communication layer
  - `tournament.js` - Tournament data processing and business logic
  - `ui.js` - UI components and interactions
  - `main.js` - Application initialization and event handling

### API Endpoints
All endpoints return Strapi-compatible JSON format:
- `GET /api/tournaments` - Tournament information
- `GET /api/players` - Player standings and statistics
- `GET /api/zones` - Zone/track information
- `GET /api/race-results` - Race results and history
- `GET /api/lap-times` - Lap time records
- `GET /api/health` - API health check

## Data Models

The system uses these main data types (stored as in-memory objects in `server.js`):

### Tournament
- 8-week championship structure
- Active status tracking
- Prize distribution information

### Player
- Name, zone assignment, status
- Total points, races participated
- Best lap time tracking
- Related race results

### Zone
- 8 unique zones with difficulty progression
- Weekly activation schedule
- Map information and descriptions

### Race Result
- Player position and points earned
- Lap time and race date
- Zone and player relationships

## Key Features

### Frontend Features
- **Responsive Design**: Mobile-first tournament display
- **Real-time Updates**: Auto-refresh every 5 minutes
- **Tabbed Interface**: Overview, Standings, Zones, Results, Players
- **Interactive Elements**: Search, filtering, smooth animations
- **Live Countdown**: Race timing and tournament status

### Backend Features
- **Strapi-compatible API**: Standard REST endpoints
- **CORS Enabled**: Frontend integration ready
- **Sample Data**: Complete tournament dataset for development
- **Error Handling**: Comprehensive error responses

## Points System
Automatic point calculation based on race position:
- 1st: 10 points, 2nd: 9 points, 3rd: 8 points, 4th: 7 points
- 5th: 6 points, 6th: 5 points, 7th: 4 points, 8th: 3 points
- 9th+: 1 point

## Development Workflow

### Making Changes to Tournament Data
1. Edit sample data in `backend/server.js`
2. Restart backend server (`npm start` in `backend/`)
3. Frontend automatically picks up changes on next refresh

### Adding New Features
1. **Backend**: Add new endpoints to `server.js`
2. **Frontend**: Update `api.js` for new endpoints, add UI components as needed
3. **Styling**: Modify `css/styles.css` following existing racing theme

### Customizing Tournament Logic
- **Points System**: Edit `getPointsForPosition()` in `frontend/js/tournament.js`
- **Tournament Structure**: Modify data models in `backend/server.js`
- **UI Layout**: Update HTML structure in `frontend/index.html`

## Common Development Tasks

### Adding a New Player
1. Add player object to `playersData` array in `backend/server.js`
2. Restart backend server
3. Player appears in standings and player lists

### Adding a New Zone
1. Add zone object to `zonesData` array in `backend/server.js`
2. Set `is_active: true` for current week's zone
3. Restart backend server

### Modifying Race Results
1. Update `raceResultsData` array in `backend/server.js`
2. Ensure proper player and zone relationships
3. Points are automatically calculated by frontend

## Deployment Notes

### Backend Deployment
- Deploy Express.js server to any Node.js hosting platform
- Update CORS origins for production frontend domain
- Consider replacing in-memory data with persistent database

### Frontend Deployment
- Deploy static files to any web hosting service
- Update API base URL in `frontend/js/api.js` if backend domain changes
- Ensure proper routing for single-page application behavior

## File Locations

- **Main Server**: `backend/server.js:1` (Express server setup)
- **API Routes**: `backend/server.js:332` (API endpoint definitions)
- **Frontend Init**: `frontend/js/main.js:1` (Application bootstrap)
- **API Communication**: `frontend/js/api.js:1` (Backend communication)
- **Tournament Logic**: `frontend/js/tournament.js:1` (Business logic)
- **UI Components**: `frontend/js/ui.js:1` (Interface interactions)