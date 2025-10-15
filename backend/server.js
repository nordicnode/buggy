const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawn } = require('child_process');

const fsPromises = fs.promises;
const DATA_FILE_PATH = path.join(__dirname, '../data/database.json');

function loadDatabaseFromFile() {
  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      return null;
    }

    const raw = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.warn('⚠️ Failed to load database.json, falling back to defaults:', error.message);
    return null;
  }
}

const initialDatabase = loadDatabaseFromFile();

const DEFAULT_POINTS_CONFIG = {
  '1': 10,
  '2': 9,
  '3': 8,
  '4': 7,
  '5': 6,
  '6': 5,
  '7': 4,
  '8': 3,
  '9': 2,
  '10': 1,
  default: 1
};

function normalizePointsConfig(config) {
  const source = (config && typeof config === 'object') ? config : {};
  const normalized = {};
  for (let i = 1; i <= 10; i += 1) {
    const key = String(i);
    const value = Number(source[key]);
    normalized[key] = Number.isFinite(value) && value >= 0 ? value : DEFAULT_POINTS_CONFIG[key];
  }
  const fallbackRaw = source.default ?? source.fallback ?? DEFAULT_POINTS_CONFIG.default;
  const fallback = Number(fallbackRaw);
  normalized.default = Number.isFinite(fallback) && fallback >= 0 ? fallback : DEFAULT_POINTS_CONFIG.default;
  return normalized;
}

let pointsConfig = normalizePointsConfig(
  initialDatabase?.pointsConfig
    || initialDatabase?.tournament?.attributes?.points_config
    || DEFAULT_POINTS_CONFIG
);

function getPointsForPosition(position) {
  const key = String(position);
  const specific = pointsConfig[key];
  if (typeof specific === 'number') {
    return specific;
  }
  return pointsConfig.default ?? DEFAULT_POINTS_CONFIG.default;
}

function formatFinishTimeMs(milliseconds) {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) {
    return '';
  }
  const totalMs = Math.floor(milliseconds);
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const ms = totalMs % 1000;
  const pad = (num, size) => String(num).padStart(size, '0');
  if (hours > 0) {
    return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(ms, 3)}`;
  }
  return `${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(ms, 3)}`;
}

function parseFinishTimeInput(input) {
  if (!input || typeof input !== 'string') {
    return { formatted: '', milliseconds: null };
  }
  const cleaned = input.trim();
  if (!cleaned) {
    return { formatted: '', milliseconds: null };
  }
  const parts = cleaned.split(':');
  if (parts.length < 2 || parts.length > 3) {
    return { formatted: cleaned, milliseconds: null };
  }
  let hours = 0;
  let minutes = 0;
  let secondsPart = parts[parts.length - 1];
  if (parts.length === 3) {
    hours = Number(parts[0]);
    minutes = Number(parts[1]);
  } else {
    minutes = Number(parts[0]);
  }
  const [secondsStr, msStr = '0'] = secondsPart.split('.');
  const seconds = Number(secondsStr);
  const milliseconds = Number((msStr + '000').slice(0, 3));
  if ([hours, minutes, seconds, milliseconds].some(num => !Number.isFinite(num) || num < 0)) {
    return { formatted: cleaned, milliseconds: null };
  }
  const totalMs = (hours * 3600000) + (minutes * 60000) + (seconds * 1000) + milliseconds;
  const formatted = hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
  return { formatted, milliseconds: totalMs };
}

const app = express();
const PORT = 1337;

// Admin password protection - Simple password
const ADMIN_PASSWORD = 'racing2025';

console.log('🔐 Admin authentication enabled (Password: racing2025)');

// Middleware to check admin password
const checkAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.setHeader('WWW-Authenticate', 'Bearer realm="Admin Panel"');
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.substring(7);

  if (token !== ADMIN_PASSWORD) {
    console.warn('❌ Admin auth failed: invalid credentials provided');
    return res.status(401).json({ error: 'Invalid authentication credentials' });
  }

  next();
};

// Sample tournament data
const tournamentData = {
  data: [{
    id: 1,
    attributes: {
      title: "Ultimate Buggy Lapping Championship",
      description: "8-week tournament featuring the best buggy racers competing across 8 unique zones for the championship title. Test your skills, strategy, and consistency in this demanding racing series.",
      start_date: "2025-10-18T19:00:00.000Z",
      end_date: "2025-12-06T19:00:00.000Z",
      status: "active",
      total_weeks: 8,
      prizes: "🏆 1st Place: 180,000 TBUX + Special Buggy + Swag | 🥈 2nd Place: 90,000 TBUX + Swag | 🥉 3rd Place: 45,000 TBUX + Swag | 🏅 Finalists: 20,000 TBUX + Swag",
      rules: "**Tournament Rules:**\n\n1. **Race Format**: Weekly races with point-based scoring system\n2. **Points Distribution**: 1st (10pts), 2nd (9pts), 3rd (8pts), 4th (7pts), 5th (6pts), 6th (5pts), 7th (4pts), 8th (3pts), 9th+ (1pt)\n3. **Zone Rotation**: Each week features a different zone with unique challenges\n4. **Sportsmanship**: Respectful conduct required at all times\n5. **Technical Issues**: Race results may be reviewed for fairness\n6. **Participation**: Minimum 4 races required to qualify for final standings\n7. **Tiebreakers**: Head-to-head results, then best finishing positions",
      registration_info: "How to Join:\n\nTo join the Buggy Lapping Tournament, please find the latest event details by checking my profile under the \"Buggy Lapping Tournament\" group or by visiting the billboard in the Dust Devil zone. Once you have the information, you can sign up at the designated location and time.",
      contact_info: "**Tournament Administration:**\n\n• Head Organizer: RaceMaster\n• Technical Support: SpeedDemon\n• Rules Questions: TurboJudge\n• Emergency Contact: discord.gg/ultimateracing",
      stream_url: "https://twitch.tv/ultimateracing",
      discord_url: "https://discord.gg/ultimateracing",
      points_config: { ...pointsConfig }
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
    },
    {
      id: 4,
      attributes: {
        name: "CircuitCrawler",
        zone_assignment: "Zone 4 - Precision Path",
        status: "active",
        total_points: 36,
        races_participated: 6,
        best_lap_time: "1:24.567",
        race_results: {
          data: [
            { id: 8, attributes: { position: 4, points_earned: 7, week_number: 1 } },
            { id: 9, attributes: { position: 3, points_earned: 8, week_number: 4 } }
          ]
        }
      }
    },
    {
      id: 5,
      attributes: {
        name: "VelocityViper",
        zone_assignment: "Zone 5 - Rapid Rapids",
        status: "active",
        total_points: 41,
        races_participated: 6,
        best_lap_time: "1:22.234",
        race_results: {
          data: [
            { id: 10, attributes: { position: 3, points_earned: 8, week_number: 2 } },
            { id: 11, attributes: { position: 2, points_earned: 9, week_number: 3 } }
          ]
        }
      }
    },
    {
      id: 6,
      attributes: {
        name: "MomentumMaster",
        zone_assignment: "Zone 6 - Endurance Loop",
        status: "active",
        total_points: 33,
        races_participated: 6,
        best_lap_time: "1:26.890",
        race_results: {
          data: [
            { id: 12, attributes: { position: 5, points_earned: 6, week_number: 1 } },
            { id: 13, attributes: { position: 4, points_earned: 7, week_number: 6 } }
          ]
        }
      }
    },
    {
      id: 7,
      attributes: {
        name: "RapidRacer",
        zone_assignment: "Zone 7 - Final Sprint",
        status: "active",
        total_points: 39,
        races_participated: 6,
        best_lap_time: "1:24.123",
        race_results: {
          data: [
            { id: 14, attributes: { position: 4, points_earned: 7, week_number: 2 } },
            { id: 15, attributes: { position: 1, points_earned: 10, week_number: 5 } }
          ]
        }
      }
    },
    {
      id: 8,
      attributes: {
        name: "DashDestroyer",
        zone_assignment: "Zone 8 - Championship Chase",
        status: "active",
        total_points: 44,
        races_participated: 6,
        best_lap_time: "1:22.456",
        race_results: {
          data: [
            { id: 16, attributes: { position: 6, points_earned: 5, week_number: 1 } },
            { id: 17, attributes: { position: 2, points_earned: 9, week_number: 8 } }
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
      id: 3,
      attributes: {
        name: "Zone 3 - Speed Straight",
        map_name: "Desert Highway",
        map_url: "",
        map_info: "",
        description: "Long straights and high-speed sections where raw speed and bravery are rewarded. Minimal braking required.",
          week_number: 3,
        is_active: false
      }
    },
    {
      id: 4,
      attributes: {
        name: "Zone 4 - Precision Path",
        map_name: "Crystal Maze",
        map_url: "",
        map_info: "",
        description: "Narrow passages and complex corner sequences demand perfect line selection and unwavering focus.",
            week_number: 4,
        is_active: false
      }
    },
    {
      id: 5,
      attributes: {
        name: "Zone 5 - Rapid Rapids",
        map_name: "River Run",
        map_url: "",
        map_info: "",
        description: "Water hazards and flowing terrain create dynamic racing conditions. Adaptability is key to success.",
          week_number: 5,
        is_active: false
      }
    },
    {
      id: 6,
      attributes: {
        name: "Zone 6 - Endurance Loop",
        map_name: "Marathon Circuit",
        map_url: "",
        map_info: "",
        description: "Extended track length tests both vehicle reliability and driver stamina. Consistency over speed.",
            week_number: 6,
        is_active: false
      }
    },
    {
      id: 7,
      attributes: {
        name: "Zone 7 - Final Sprint",
        map_name: "Velocity Valley",
        map_url: "",
        map_info: "",
        description: "High-speed combinations and late-braking zones create thrilling wheel-to-wheel racing action.",
          week_number: 7,
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
    },
    {
      id: 3,
      attributes: {
        position: 3,
        points_earned: 8,
        lap_time: "1:25.234",
        race_date: "2025-10-18T20:00:00.000Z",
        week_number: 1,
        player: { data: { id: 2, attributes: { name: "TurboTurtle" } } },
        zone: { data: { id: 1, attributes: { name: "Zone 1 - Starting Circuit" } } }
      }
    },
    {
      id: 4,
      attributes: {
        position: 1,
        points_earned: 10,
        lap_time: "1:21.890",
        race_date: "2025-10-25T20:00:00.000Z",
        week_number: 2,
        player: { data: { id: 3, attributes: { name: "LightningLapper" } } },
        zone: { data: { id: 2, attributes: { name: "Zone 2 - Technical Twists" } } }
      }
    },
    {
      id: 5,
      attributes: {
        position: 2,
        points_earned: 9,
        lap_time: "1:22.567",
        race_date: "2025-10-25T20:00:00.000Z",
        week_number: 2,
        player: { data: { id: 1, attributes: { name: "SpeedyGonzalez" } } },
        zone: { data: { id: 2, attributes: { name: "Zone 2 - Technical Twists" } } }
      }
    }
  ]
};

if (initialDatabase) {
  console.log('💾 Loaded data from database.json');

  if (initialDatabase.tournament) {
    tournamentData.data = Array.isArray(initialDatabase.tournament)
      ? initialDatabase.tournament
      : [initialDatabase.tournament];
    console.log('✅ Tournament data loaded:', tournamentData.data[0]?.attributes?.title || 'No title');
  } else {
    console.warn('⚠️ No tournament data found in database.json, using defaults');
  }

  if (Array.isArray(initialDatabase.players)) {
    playersData.data = initialDatabase.players;
    console.log(`✅ Loaded ${initialDatabase.players.length} players`);
  }

  if (Array.isArray(initialDatabase.zones)) {
    zonesData.data = initialDatabase.zones;
    console.log(`✅ Loaded ${initialDatabase.zones.length} zones`);
  }

  if (Array.isArray(initialDatabase.raceResults)) {
    raceResultsData.data = initialDatabase.raceResults;
    console.log(`✅ Loaded ${initialDatabase.raceResults.length} race results`);
  }

  if (initialDatabase.pointsConfig) {
    pointsConfig = normalizePointsConfig(initialDatabase.pointsConfig);
  } else if (tournamentData.data?.[0]?.attributes?.points_config) {
    pointsConfig = normalizePointsConfig(tournamentData.data[0].attributes.points_config);
  }
} else {
  console.warn('⚠️ No database.json found, using default data');
}

if (tournamentData.data?.[0]) {
  tournamentData.data[0].attributes.points_config = { ...pointsConfig };
}

async function persistDatabase() {
  const snapshot = {
    tournament: tournamentData.data?.[0] || null,
    players: playersData.data || [],
    zones: zonesData.data || [],
    raceResults: raceResultsData.data || [],
    pointsConfig
  };

  try {
    await fsPromises.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
    await fsPromises.writeFile(DATA_FILE_PATH, JSON.stringify(snapshot, null, 2));
    console.log('💾 Database persisted - Tournament:', snapshot.tournament?.attributes?.title || 'No tournament');
  } catch (error) {
    console.error('❌ Failed to persist database.json:', error);
    throw error;
  }
}

function recalculatePlayerStats() {
  const playerMap = new Map();

  playersData.data.forEach(player => {
    playerMap.set(player.id, player);
    player.attributes.total_points = 0;
    player.attributes.races_participated = 0;
    player.attributes.best_finish_time_ms = null;
    player.attributes.best_lap_time = player.attributes.best_lap_time || '';
    player.attributes.race_results = { data: [] };
  });

  raceResultsData.data.forEach(result => {
    if (!result.attributes) {
      result.attributes = {};
    }

    const playerId = result.attributes.player?.data?.id;
    const points = getPointsForPosition(result.attributes.position);
    result.attributes.points_earned = points;

    const finishTimeInput = result.attributes.finish_time
      || result.attributes.lap_time
      || '';
    const parsedFinish = parseFinishTimeInput(finishTimeInput);
    result.attributes.finish_time = parsedFinish.formatted || finishTimeInput || '';
    result.attributes.finish_time_ms = parsedFinish.milliseconds;
    if (!result.attributes.lap_time && result.attributes.finish_time) {
      result.attributes.lap_time = result.attributes.finish_time;
    }

    if (!playerId) {
      return;
    }

    const player = playerMap.get(playerId);
    if (!player) {
      return;
    }

    player.attributes.total_points += points;
    player.attributes.races_participated += 1;
    player.attributes.race_results.data.push({
      id: result.id,
      attributes: {
        position: result.attributes.position || 1,
        points_earned: points,
        week_number: result.attributes.week_number
      }
    });

    if (Number.isFinite(result.attributes.finish_time_ms)) {
      if (
        player.attributes.best_finish_time_ms == null
        || result.attributes.finish_time_ms < player.attributes.best_finish_time_ms
      ) {
        player.attributes.best_finish_time_ms = result.attributes.finish_time_ms;
        player.attributes.best_lap_time = formatFinishTimeMs(result.attributes.finish_time_ms);
      }
    }
  });

  playersData.data.forEach(player => {
    if (!player.attributes.race_results) {
      player.attributes.race_results = { data: [] };
    }
    if (
      player.attributes.best_finish_time_ms == null
      && player.attributes.best_lap_time
    ) {
      const parsed = parseFinishTimeInput(player.attributes.best_lap_time);
      if (parsed.milliseconds != null) {
        player.attributes.best_finish_time_ms = parsed.milliseconds;
        player.attributes.best_lap_time = parsed.formatted;
      }
    }
  });

  if (tournamentData.data?.[0]) {
    tournamentData.data[0].attributes.points_config = { ...pointsConfig };
  }
}

recalculatePlayerStats();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    try {
      const parsed = new URL(origin);
      const { protocol, hostname } = parsed;

      if (!protocol.startsWith('http')) {
        return callback(null, false);
      }

      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return callback(null, true);
      }

      if (hostname.endsWith('.loca.lt')) {
        return callback(null, true);
      }

      if (hostname.endsWith('.github.io')) {
        return callback(null, true);
      }
    } catch (error) {
      console.warn('⚠️ Invalid origin encountered in CORS check', {
        origin,
        error: error.message
      });
      return callback(null, false);
    }

    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Function to fetch map data using Python scraper (with stability improvements)
const fetchMapData = (url) => {
  return new Promise((resolve, reject) => {
    if (!url || !url.startsWith('https://')) {
      resolve(null);
      return;
    }

    // Rate limiting to prevent too many concurrent scraper processes
    if (!global.activeScrapers) {
      global.activeScrapers = 0;
    }
    
    // Limit to 2 concurrent scraper processes for stability
    if (global.activeScrapers >= 2) {
      console.log('⚠️  Map scraper rate limit - using fallback');
      resolve('Map information available - View in There for full details');
      return;
    }
    
    global.activeScrapers++;
    console.log('🐍 Using Python scraper for:', url, `(active: ${global.activeScrapers})`);

    // Check if map_scraper.py exists before spawning
    const scriptPath = path.join(__dirname, 'map_scraper.py');
    if (!fs.existsSync(scriptPath)) {
      console.log('⚠️  map_scraper.py not found - using fallback');
      global.activeScrapers--;
      resolve('Map information available - View in There for full details');
      return;
    }

    let pythonProcess;
    let stdout = '';
    let stderr = '';
    let processKilled = false;
    
    try {
      // Spawn Python process with resource limits
      pythonProcess = spawn('python3', [scriptPath, url], {
        cwd: __dirname,
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 8000 // Kill after 8 seconds
      });

      pythonProcess.stdout.on('data', (data) => {
        // Limit stdout buffer to prevent memory issues
        if (stdout.length < 100000) {
          stdout += data.toString();
        }
      });

      pythonProcess.stderr.on('data', (data) => {
        // Limit stderr buffer
        if (stderr.length < 10000) {
          stderr += data.toString();
        }
      });

      pythonProcess.on('close', (code) => {
        global.activeScrapers--;
        
        if (processKilled) {
          console.log('⚠️  Map scraper was terminated');
          resolve('Map information available - View in There for full details');
          return;
        }

        console.log(`🐍 Python scraper exited with code: ${code}`);

        if (stderr && stderr.length > 0) {
          console.log('🐍 Python stderr:', stderr.substring(0, 200)); // Limit log output
        }

        if (code !== 0) {
          console.log('⚠️  Python scraper failed - using fallback');
          resolve('Map information available - View in There for full details');
          return;
        }

        try {
          // Parse JSON output from Python script
          const result = JSON.parse(stdout);
          console.log('✅ Successfully parsed Python scraper result');
          resolve(result);
        } catch (error) {
          console.log('⚠️  Failed to parse Python output - using fallback');

          // Fallback: try to extract basic info from raw output
          if (stdout && stdout.trim()) {
            resolve({
              formatted: stdout.trim().substring(0, 1000), // Limit length
              structured: {}
            });
          } else {
            resolve('Map information available - View in There for full details');
          }
        }
      });

      pythonProcess.on('error', (error) => {
        global.activeScrapers--;
        console.error('⚠️  Python scraper error:', error.message);
        resolve('Map information available - View in There for full details');
      });

      // Shorter timeout - 8 seconds instead of 15
      const timeout = setTimeout(() => {
        if (!processKilled) {
          processKilled = true;
          console.log('⏰ Map scraper timeout - terminating');
          try {
            pythonProcess.kill('SIGTERM');
            // Force kill after 2 more seconds if still running
            setTimeout(() => {
              try {
                pythonProcess.kill('SIGKILL');
              } catch (e) {
                // Process might already be dead
              }
            }, 2000);
          } catch (e) {
            console.log('⚠️  Error killing Python process:', e.message);
          }
        }
      }, 8000);

      pythonProcess.on('close', () => {
        clearTimeout(timeout);
      });
      
    } catch (error) {
      global.activeScrapers--;
      console.error('⚠️  Exception in map scraper:', error.message);
      resolve('Map information available - View in There for full details');
    }
  });
};

// API Routes (Strapi-compatible format)
app.get('/api/tournaments', (req, res) => {
  console.log('📡 GET /api/tournaments - Returning:', tournamentData.data[0]?.attributes?.title || 'No tournament');
  res.json(tournamentData);
});

app.put('/api/tournaments/:id', checkAdminAuth, async (req, res) => {
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
      discord_url: updatedData.discord_url || "",
      points_config: { ...pointsConfig }
    };

    await persistDatabase();
    res.json({ data: tournamentData.data[tournamentIndex] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/points-config', (req, res) => {
  res.json({ data: pointsConfig });
});

app.put('/api/points-config', checkAdminAuth, async (req, res) => {
  try {
    const incomingConfig = req.body?.pointsConfig || req.body;
    pointsConfig = normalizePointsConfig(incomingConfig);
    recalculatePlayerStats();
    await persistDatabase();
    res.json({ data: pointsConfig });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to update points configuration' });
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

// Admin endpoint for scraping map URLs
app.post('/api/zones/scrape-map', checkAdminAuth, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !url.startsWith('https://')) {
      return res.status(400).json({
        success: false,
        error: 'Valid HTTPS URL required'
      });
    }

    console.log('🔍 Admin requested map scraping for:', url);

    const scrapedData = await fetchMapData(url);

    if (scrapedData) {
      console.log('✅ Map scraping successful for admin panel');
      res.json({
        success: true,
        data: scrapedData.structured || scrapedData,
        formatted: scrapedData.formatted
      });
    } else {
      console.log('❌ Map scraping failed for admin panel');
      res.status(400).json({
        success: false,
        error: 'Failed to scrape map information'
      });
    }
  } catch (error) {
    console.error('❌ Error in admin map scraping endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while scraping map'
    });
  }
});

app.get('/api/race-results', (req, res) => {
  res.json(raceResultsData);
});

app.get('/api/lap-times', (req, res) => {
  res.json({ data: [] });
});

// CRUD Operations for Players
app.post('/api/players', checkAdminAuth, async (req, res) => {
  try {
    const newPlayer = req.body;
    const newId = Math.max(...playersData.data.map(p => p.id), 0) + 1;

    const playerData = {
      id: newId,
      attributes: {
        name: newPlayer.name,
        zone_assignment: newPlayer.zone_assignment || "",
        status: newPlayer.status || "active",
        total_points: parseInt(newPlayer.total_points) || 0,
        races_participated: parseInt(newPlayer.races_participated) || 0,
        best_lap_time: newPlayer.best_lap_time || "",
        race_results: { data: [] }
      }
    };

    playersData.data.push(playerData);
    recalculatePlayerStats();
    await persistDatabase();
    res.status(201).json({ data: playerData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/players/:id', checkAdminAuth, async (req, res) => {
  try {
    const playerId = parseInt(req.params.id);
    const updatedData = req.body;

    const playerIndex = playersData.data.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Update player attributes
    playersData.data[playerIndex].attributes = {
      ...playersData.data[playerIndex].attributes,
      name: updatedData.name,
      zone_assignment: updatedData.zone_assignment || "",
      status: updatedData.status || "active",
      total_points: parseInt(updatedData.total_points) || 0,
      races_participated: parseInt(updatedData.races_participated) || 0,
      best_lap_time: updatedData.best_lap_time || ""
    };

    recalculatePlayerStats();
    await persistDatabase();
    res.json({ data: playersData.data[playerIndex] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/players/:id', checkAdminAuth, async (req, res) => {
  try {
    const playerId = parseInt(req.params.id);
    const playerIndex = playersData.data.findIndex(p => p.id === playerId);

    if (playerIndex === -1) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Also remove related race results
    raceResultsData.data = raceResultsData.data.filter(r =>
      r.attributes.player?.data?.id !== playerId
    );

    playersData.data.splice(playerIndex, 1);
    recalculatePlayerStats();
    await persistDatabase();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// CRUD Operations for Zones
app.post('/api/zones', checkAdminAuth, async (req, res) => {
  try {
    const newZone = req.body;
    const newId = Math.max(...zonesData.data.map(z => z.id), 0) + 1;

    // If this zone is active, deactivate all others
    if (newZone.is_active) {
      zonesData.data.forEach(zone => {
        zone.attributes.is_active = false;
      });
    }

    // Fetch map data if URL provided
    let mapInfo = newZone.map_info || "";
    let mapData = null;
    if (newZone.map_url) {
      try {
        const fetchedMapData = await fetchMapData(newZone.map_url);
        if (fetchedMapData) {
          // Handle both string and object formats for backward compatibility
          if (typeof fetchedMapData === 'object') {
            mapInfo = fetchedMapData.formatted;
            mapData = fetchedMapData.structured;
          } else {
            mapInfo = fetchedMapData;
          }
        }
      } catch (error) {
        console.error('Failed to fetch map data:', error);
      }
    }

    const zoneData = {
      id: newId,
      attributes: {
        name: newZone.name,
        map_name: newZone.map_name || "",
        map_url: newZone.map_url || "",
        map_info: mapInfo,
        map_data: mapData,
        description: newZone.description || "",
        week_number: parseInt(newZone.week_number) || 1,
        is_active: newZone.is_active || false
      }
    };

    zonesData.data.push(zoneData);
    await persistDatabase();
    res.status(201).json({ data: zoneData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/zones/:id', checkAdminAuth, async (req, res) => {
  try {
    const zoneId = parseInt(req.params.id);
    const updatedData = req.body;

    const zoneIndex = zonesData.data.findIndex(z => z.id === zoneId);
    if (zoneIndex === -1) {
      return res.status(404).json({ error: 'Zone not found' });
    }

    // If this zone is being set to active, deactivate all others
    if (updatedData.is_active) {
      zonesData.data.forEach(zone => {
        if (zone.id !== zoneId) {
          zone.attributes.is_active = false;
        }
      });
    }

    // Fetch map data if URL provided and different from current
    let mapInfo = updatedData.map_info || "";
    if (updatedData.map_url && updatedData.map_url !== zonesData.data[zoneIndex].attributes.map_url) {
      try {
        const fetchedMapData = await fetchMapData(updatedData.map_url);
        if (fetchedMapData) {
          // Handle both string and object formats for backward compatibility
          if (typeof fetchedMapData === 'object') {
            mapInfo = fetchedMapData.formatted;
            // Store structured data as JSON string for frontend use
            zonesData.data[zoneIndex].attributes.map_data = fetchedMapData.structured;
          } else {
            mapInfo = fetchedMapData;
          }
        }
      } catch (error) {
        console.error('Failed to fetch map data:', error);
      }
    }

    zonesData.data[zoneIndex].attributes = {
      ...zonesData.data[zoneIndex].attributes,
      name: updatedData.name,
      map_name: updatedData.map_name || "",
      map_url: updatedData.map_url || "",
      map_info: mapInfo,
      description: updatedData.description || "",
      week_number: parseInt(updatedData.week_number) || 1,
      is_active: updatedData.is_active || false
    };

    await persistDatabase();
    res.json({ data: zonesData.data[zoneIndex] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/zones/:id', checkAdminAuth, async (req, res) => {
  try {
    const zoneId = parseInt(req.params.id);
    const zoneIndex = zonesData.data.findIndex(z => z.id === zoneId);

    if (zoneIndex === -1) {
      return res.status(404).json({ error: 'Zone not found' });
    }

    // Also remove related race results
    raceResultsData.data = raceResultsData.data.filter(r =>
      r.attributes.zone?.data?.id !== zoneId
    );

    zonesData.data.splice(zoneIndex, 1);
    await persistDatabase();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Bulk add race results with automatic position calculation
app.post('/api/race-results/bulk', checkAdminAuth, async (req, res) => {
  try {
    const { zone_id, race_date, week_number, results } = req.body;
    
    if (!zone_id || !results || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ error: 'zone_id and results array are required' });
    }
    
    const zone = zonesData.data.find(z => z.id === parseInt(zone_id, 10));
    if (!zone) {
      return res.status(400).json({ error: 'Invalid zone_id' });
    }
    
    const raceDate = race_date || new Date().toISOString();
    const weekNum = parseInt(week_number, 10) || 1;
    
    // Parse all finish times and prepare result objects
    const parsedResults = results.map((r, index) => {
      const player = playersData.data.find(p => p.id === parseInt(r.player_id, 10));
      if (!player) {
        throw new Error(`Invalid player_id: ${r.player_id}`);
      }
      
      const parsedFinish = parseFinishTimeInput(r.finish_time);
      if (parsedFinish.milliseconds === null) {
        throw new Error(`Invalid finish time for player ${player.attributes.name}: ${r.finish_time}`);
      }
      
      return {
        player,
        parsedFinish,
        notes: r.notes || '',
        tempId: `bulk_${index}`
      };
    });
    
    // Sort by finish time to determine positions
    parsedResults.sort((a, b) => a.parsedFinish.milliseconds - b.parsedFinish.milliseconds);
    
    // Assign positions based on sorted order
    parsedResults.forEach((result, index) => {
      result.position = index + 1;
    });
    
    // Create result data objects
    const createdResults = [];
    let nextId = Math.max(...raceResultsData.data.map(r => r.id), 0) + 1;
    
    for (const result of parsedResults) {
      const resultData = {
        id: nextId++,
        attributes: {
          position: result.position,
          points_earned: 0,
          finish_time: result.parsedFinish.formatted,
          finish_time_ms: result.parsedFinish.milliseconds,
          lap_time: result.parsedFinish.formatted,
          race_date: raceDate,
          week_number: weekNum,
          notes: result.notes,
          player: {
            data: {
              id: result.player.id,
              attributes: { name: result.player.attributes.name }
            }
          },
          zone: {
            data: {
              id: zone.id,
              attributes: { name: zone.attributes.name }
            }
          }
        }
      };
      
      raceResultsData.data.push(resultData);
      createdResults.push(resultData);
    }
    
    // Recalculate stats and persist
    recalculatePlayerStats();
    await persistDatabase();
    
    res.status(201).json({ 
      data: createdResults,
      message: `Successfully added ${createdResults.length} race results`
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// CRUD Operations for Race Results
app.post('/api/race-results', checkAdminAuth, async (req, res) => {
  try {
    const newResult = req.body;
    const newId = Math.max(...raceResultsData.data.map(r => r.id), 0) + 1;

    const player = playersData.data.find(p => p.id === parseInt(newResult.player_id, 10));
    const zone = zonesData.data.find(z => z.id === parseInt(newResult.zone_id, 10));
    const parsedFinish = parseFinishTimeInput(newResult.finish_time || newResult.lap_time);
    
    // If position is not provided and we have a finish time, auto-calculate position
    let position = newResult.position ? parseInt(newResult.position, 10) : null;
    
    if (!position && parsedFinish.milliseconds !== null) {
      // Get all existing results for this zone and week
      const zoneId = parseInt(newResult.zone_id, 10);
      const weekNumber = parseInt(newResult.week_number, 10) || 1;
      const raceDate = newResult.race_date || new Date().toISOString();
      
      // Find results from the same race (zone, week, and date)
      const sameRaceResults = raceResultsData.data.filter(r => 
        r.attributes.zone?.data?.id === zoneId &&
        r.attributes.week_number === weekNumber &&
        r.attributes.race_date?.split('T')[0] === raceDate.split('T')[0] // Same day
      );
      
      // Sort by finish time to determine position
      const allTimes = sameRaceResults
        .map(r => ({ id: r.id, ms: r.attributes.finish_time_ms }))
        .filter(t => t.ms !== null && t.ms !== undefined);
      
      // Add current result time
      allTimes.push({ id: 'new', ms: parsedFinish.milliseconds });
      
      // Sort by time (ascending - fastest first)
      allTimes.sort((a, b) => a.ms - b.ms);
      
      // Find position
      position = allTimes.findIndex(t => t.id === 'new') + 1;
      
      // Update positions for all existing results if needed
      const needsReordering = sameRaceResults.some(r => {
        const currentPos = r.attributes.position;
        const timeMs = r.attributes.finish_time_ms;
        if (timeMs === null || timeMs === undefined) return false;
        
        const newPos = allTimes.findIndex(t => t.ms === timeMs) + 1;
        return currentPos !== newPos;
      });
      
      if (needsReordering) {
        sameRaceResults.forEach(r => {
          const timeMs = r.attributes.finish_time_ms;
          if (timeMs !== null && timeMs !== undefined) {
            const newPos = allTimes.findIndex(t => t.ms === timeMs) + 1;
            r.attributes.position = newPos;
          }
        });
      }
    }
    
    // Default to position 1 if still no position
    if (!position) {
      position = 1;
    }

    const resultData = {
      id: newId,
      attributes: {
        position: position,
        points_earned: 0,
        finish_time: parsedFinish.formatted,
        finish_time_ms: parsedFinish.milliseconds,
        lap_time: parsedFinish.formatted || newResult.lap_time || '',
        race_date: newResult.race_date || new Date().toISOString(),
        week_number: parseInt(newResult.week_number, 10) || 1,
        notes: newResult.notes || '',
        player: player ? { data: { id: player.id, attributes: { name: player.attributes.name } } } : null,
        zone: zone ? { data: { id: zone.id, attributes: { name: zone.attributes.name } } } : null
      }
    };

    raceResultsData.data.push(resultData);
    recalculatePlayerStats();
    await persistDatabase();

    res.status(201).json({ data: resultData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/race-results/:id', checkAdminAuth, async (req, res) => {
  try {
    const resultId = parseInt(req.params.id, 10);
    const updatedData = req.body;

    const resultIndex = raceResultsData.data.findIndex(r => r.id === resultId);
    if (resultIndex === -1) {
      return res.status(404).json({ error: 'Race result not found' });
    }

    const player = playersData.data.find(p => p.id === parseInt(updatedData.player_id, 10));
    const zone = zonesData.data.find(z => z.id === parseInt(updatedData.zone_id, 10));
    const parsedFinish = parseFinishTimeInput(updatedData.finish_time || updatedData.lap_time);

    raceResultsData.data[resultIndex].attributes = {
      ...raceResultsData.data[resultIndex].attributes,
      position: parseInt(updatedData.position, 10),
      points_earned: 0,
      finish_time: parsedFinish.formatted,
      finish_time_ms: parsedFinish.milliseconds,
      lap_time: parsedFinish.formatted || updatedData.lap_time || '',
      race_date: updatedData.race_date || new Date().toISOString(),
      week_number: parseInt(updatedData.week_number, 10) || 1,
      notes: updatedData.notes || '',
      player: player ? { data: { id: player.id, attributes: { name: player.attributes.name } } } : null,
      zone: zone ? { data: { id: zone.id, attributes: { name: zone.attributes.name } } } : null
    };

    recalculatePlayerStats();
    await persistDatabase();

    res.json({ data: raceResultsData.data[resultIndex] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/race-results/:id', checkAdminAuth, async (req, res) => {
  try {
    const resultId = parseInt(req.params.id, 10);
    const resultIndex = raceResultsData.data.findIndex(r => r.id === resultId);

    if (resultIndex === -1) {
      return res.status(404).json({ error: 'Race result not found' });
    }

    raceResultsData.data.splice(resultIndex, 1);
    recalculatePlayerStats();
    await persistDatabase();

    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Tournament API is running' });
});

// Admin panel redirect
app.get('/admin', (req, res) => {
  res.redirect('/admin.html');
});

// API documentation
app.get('/api/docs', (req, res) => {
  res.redirect('/api-docs.html');
});

app.get('/docs', (req, res) => {
  res.redirect('/api-docs.html');
});

// Favicon route to fix CSP issues
app.get('/favicon.ico', (req, res) => {
  // Return a simple 1x1 transparent PNG
  const favicon = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
  res.writeHead(200, {
    'Content-Type': 'image/x-icon',
    'Content-Length': favicon.length
  });
  res.end(favicon);
});

// Default route
app.get('/', (req, res) => {
  res.json({
    message: '🏁 Ultimate Buggy Lapping Tournament API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: [
      'GET /api/tournaments',
      'PUT /api/tournaments/:id',
      'GET /api/players',
      'POST /api/players',
      'PUT /api/players/:id',
      'DELETE /api/players/:id',
      'GET /api/zones',
      'POST /api/zones',
      'PUT /api/zones/:id',
      'DELETE /api/zones/:id',
      'GET /api/race-results',
      'POST /api/race-results',
      'POST /api/race-results/bulk',
      'PUT /api/race-results/:id',
      'DELETE /api/race-results/:id',
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

// Start server
app.listen(PORT, () => {
  console.log(`🏁 Tournament API Server running at http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`📊 API Endpoints available:`);
  console.log(`   - GET /api/tournaments`);
  console.log(`   - GET /api/players`);
  console.log(`   - GET /api/zones`);
  console.log(`   - GET /api/race-results`);
  console.log(`   - GET /api/lap-times`);
  console.log(`   - GET /api/health`);
  console.log(`\n🎯 Frontend should connect to: http://localhost:${PORT}/api`);
});