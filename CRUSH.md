# CRUSH.md - Ultimate Buggy Racing Tournament Management System

## Development Commands

### Backend Development
```bash
cd backend
npm start          # Start Express server on port 1337
npm run dev        # Same as npm start
```

### Frontend Development
```bash
cd frontend
python -m http.server 8000     # Python 3 server
npx http-server                 # Node.js server alternative
php -S localhost:8000           # PHP server alternative
```

### Production Deployment
```bash
npm run build      # Build complete (echo command)
npm run deploy     # Deploy to Vercel production
```

## Code Style Guidelines

### JavaScript/Node.js
- Use ES6+ features (classes, async/await, arrow functions)
- Module pattern: Separate API, UI, tournament logic, and main initialization
- Error handling with try/catch blocks and console.error logging
- Strapi-compatible API responses: `{ data: [...] }` wrapper format
- Dynamic URL detection for local vs production environments

### Naming Conventions
- Classes: PascalCase (TournamentAPI, TournamentManager)
- Functions/variables: camelCase (getPlayers, currentZone)
- Constants: UPPER_SNAKE_CASE (DEFAULT_POINTS_CONFIG)
- Files: kebab-case for assets, camelCase for JS modules

### API Structure
- REST endpoints: `/api/tournaments`, `/api/players`, `/api/zones`
- CORS enabled for frontend integration
- In-memory data with optional file-based persistence
- Points system: 1st=10pts, 2nd=9pts, 3rd=8pts, descending to 1pt

### Frontend Architecture
- Responsive mobile-first design with racing theme
- Tabbed interface: Overview, Standings, Zones, Results, Players
- Auto-refresh every 5 minutes for live updates
- Modular JS: api.js (communication), tournament.js (business logic), ui.js (components)

## Key Features

### Tournament Management
- 8-week championship structure with zone progression
- Automatic point calculation based on race position
- Player standings with statistics and lap time tracking
- Zone activation schedule and difficulty progression

### Development Workflow
- Edit sample data in `backend/server.js` for quick changes
- Frontend automatically picks up backend changes on refresh
- Use mock data in `api.js` for development without backend
- Cache disabled for debugging (cacheTimeout = 0)