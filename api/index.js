const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
const { spawn } = require('child_process');

const app = express();

// Simple password protection for admin panel
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'racing2025';

// Middleware to check admin password
const checkAdminAuth = (req, res, next) => {
  console.log('🔐 Authentication middleware called for:', req.method, req.path);
  const authHeader = req.headers.authorization;
  console.log('🔑 Auth header:', authHeader ? 'Present' : 'Missing');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No Bearer token found');
    res.setHeader('WWW-Authenticate', 'Bearer realm="Admin Panel"');
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.substring(7);
  console.log('🎫 Token received:', token);
  console.log('🔒 Expected token:', ADMIN_PASSWORD);

  if (token !== ADMIN_PASSWORD) {
    console.log('❌ Invalid token');
    return res.status(401).json({ error: 'Invalid authentication credentials' });
  }

  console.log('✅ Authentication successful');
  next();
};

// Sample tournament data
const tournamentData = {
  data: [{
    id: 1,
    attributes: {
      title: "Ultimate Buggy Racing Championship",
      description: "8-week tournament featuring the best buggy racers competing across 8 unique zones for the championship title. Test your skills, strategy, and consistency in this demanding racing series.",
      start_date: "2025-10-18T19:00:00.000Z",
      end_date: "2025-12-06T19:00:00.000Z",
      status: "active",
      total_weeks: 8,
      prizes: "🏆 1st Place: 180,000 TBUX + Special Buggy + Swag | 🥈 2nd Place: 90,000 TBUX + Swag | 🥉 3rd Place: 45,000 TBUX + Swag | 🏅 Finalists: 20,000 TBUX + Swag",
      rules: "**Tournament Rules:**\n\n1. **Race Format**: Weekly races with point-based scoring system\n2. **Points Distribution**: 1st (10pts), 2nd (9pts), 3rd (8pts), 4th (7pts), 5th (6pts), 6th (5pts), 7th (4pts), 8th (3pts), 9th+ (1pt)\n3. **Zone Rotation**: Each week features a different zone with unique challenges\n4. **Sportsmanship**: Respectful conduct required at all times\n5. **Technical Issues**: Race results may be reviewed for fairness\n6. **Participation**: Minimum 4 races required to qualify for final standings\n7. **Tiebreakers**: Head-to-head results, then best finishing positions",
      registration_info: "**How to Join:**\n\n• Registration opens: October 1st, 2025\n• Requirements: Valid racing license, approved buggy\n• Entry fee: 5,000 TBUX\n• Contact tournament admins to register\n• All participants must attend mandatory briefing on October 15th",
      contact_info: "**Tournament Administration:**\n\n• Head Organizer: RaceMaster\n• Technical Support: SpeedDemon\n• Rules Questions: TurboJudge\n• Emergency Contact: discord.gg/ultimateracing",
      stream_url: "https://twitch.tv/ultimateracing",
      discord_url: "https://discord.gg/ultimateracing"
    }
  }]
};

const playersData = {
  data: [
    {
      id: 1,
      attributes: {
        name: "SpeedyGonzalez",
        zone_assignment: "Zone 1 - Starting Circuit",
        status: "active",
        total_points: 45,
        races_participated: 6,
        best_lap_time: "1:23.456",
        race_results: {
          data: [
            { id: 1, attributes: { position: 1, points_earned: 10, week_number: 1 } },
            { id: 2, attributes: { position: 2, points_earned: 9, week_number: 2 } },
            { id: 3, attributes: { position: 1, points_earned: 10, week_number: 3 } }
          ]
        }
      }
    },
    {
      id: 2,
      attributes: {
        name: "TurboTurtle",
        zone_assignment: "Zone 2 - Technical Twists",
        status: "active",
        total_points: 38,
        races_participated: 6,
        best_lap_time: "1:25.123",
        race_results: {
          data: [
            { id: 4, attributes: { position: 3, points_earned: 8, week_number: 1 } },
            { id: 5, attributes: { position: 1, points_earned: 10, week_number: 4 } }
          ]
        }
      }
    },
    {
      id: 3,
      attributes: {
        name: "LightningLapper",
        zone_assignment: "Zone 3 - Speed Straight",
        status: "active",
        total_points: 42,
        races_participated: 6,
        best_lap_time: "1:21.789",
        race_results: {
          data: [
            { id: 6, attributes: { position: 2, points_earned: 9, week_number: 1 } },
            { id: 7, attributes: { position: 1, points_earned: 10, week_number: 2 } }
          ]
        }
      }
    }
  ]
};

const zonesData = {
  data: [
    {
      id: 1,
      attributes: {
        name: "Zone 1 - Starting Circuit",
        map_name: "Alpine Circuit",
        map_url: "",
        map_info: null,
        description: "A challenging introductory course with sweeping turns and technical sections. Perfect for setting the tone of the championship.",
          week_number: 1,
        is_active: false
      }
    },
    {
      id: 2,
      attributes: {
        name: "Zone 2 - Technical Twists",
        map_name: "Mountain Switchbacks",
        map_url: "",
        map_info: "",
        description: "Tight hairpin turns and elevation changes test precision and control. Only the most skilled racers can master this course.",
          week_number: 2,
        is_active: false
      }
    },
    {
      id: 8,
      attributes: {
        name: "Zone 8 - Championship Chase",
        map_name: "Victory Lane",
        map_url: "",
        map_info: "",
        description: "The ultimate test of skill, nerve, and strategy. Every mistake could be championship-ending.",
              week_number: 8,
        is_active: true
      }
    }
  ]
};

const raceResultsData = {
  data: [
    {
      id: 1,
      attributes: {
        position: 1,
        points_earned: 10,
        lap_time: "1:23.456",
        race_date: "2025-10-18T20:00:00.000Z",
        week_number: 1,
        player: { data: { id: 1, attributes: { name: "SpeedyGonzalez" } } },
        zone: { data: { id: 1, attributes: { name: "Zone 1 - Starting Circuit" } } }
      }
    },
    {
      id: 2,
      attributes: {
        position: 2,
        points_earned: 9,
        lap_time: "1:24.123",
        race_date: "2025-10-18T20:00:00.000Z",
        week_number: 1,
        player: { data: { id: 3, attributes: { name: "LightningLapper" } } },
        zone: { data: { id: 1, attributes: { name: "Zone 1 - Starting Circuit" } } }
      }
    }
  ]
};

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ?
    ['https://your-vercel-app.vercel.app'] :
    ['http://localhost:8000', 'http://127.0.0.1:8000'],
  credentials: true
}));
app.use(express.json());

// API Routes (Strapi-compatible format)
app.get('/api/tournaments', (req, res) => {
  res.json(tournamentData);
});

app.put('/api/tournaments/:id', checkAdminAuth, (req, res) => {
  try {
    const tournamentId = parseInt(req.params.id);
    const updatedData = req.body;

    const tournamentIndex = tournamentData.data.findIndex(t => t.id === tournamentId);
    if (tournamentIndex === -1) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Update tournament attributes
    tournamentData.data[tournamentIndex].attributes = {
      ...tournamentData.data[tournamentIndex].attributes,
      title: updatedData.title,
      description: updatedData.description,
      start_date: updatedData.start_date,
      end_date: updatedData.end_date,
      status: updatedData.status || "active",
      total_weeks: parseInt(updatedData.total_weeks) || 8,
      prizes: updatedData.prizes || "",
      rules: updatedData.rules || "",
      registration_info: updatedData.registration_info || "",
      contact_info: updatedData.contact_info || "",
      stream_url: updatedData.stream_url || "",
      discord_url: updatedData.discord_url || ""
    };

    res.json({ data: tournamentData.data[tournamentIndex] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/players', (req, res) => {
  res.json(playersData);
});

app.get('/api/zones', (req, res) => {
  const { filters } = req.query;

  if (filters && filters['is_active']?.['$eq'] === 'true') {
    const activeZone = zonesData.data.find(zone => zone.attributes.is_active);
    res.json({ data: activeZone ? [activeZone] : [] });
  } else {
    res.json(zonesData);
  }
});

app.get('/api/race-results', (req, res) => {
  res.json(raceResultsData);
});

app.get('/api/lap-times', (req, res) => {
  res.json({ data: [] });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Tournament API is running' });
});

// Default route
app.get('/', (req, res) => {
  res.json({
    message: '🏁 Ultimate Buggy Racing Tournament API',
    version: '1.0.0',
    endpoints: [
      'GET /api/tournaments',
      'PUT /api/tournaments/:id',
      'GET /api/players',
      'GET /api/zones',
      'GET /api/race-results',
      'GET /api/lap-times',
      'GET /api/health'
    ]
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Export for Vercel
module.exports = (req, res) => {
  app(req, res);
};