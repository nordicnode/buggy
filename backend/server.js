const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
const { spawn } = require('child_process');

const app = express();
const PORT = 1337;

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

// Middleware
app.use(cors({
  origin: ['http://localhost:8000', 'http://127.0.0.1:8000'],
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Function to fetch map data using Python scraper
const fetchMapData = (url) => {
  return new Promise((resolve, reject) => {
    if (!url || !url.startsWith('https://')) {
      resolve(null);
      return;
    }

    console.log('🐍 Using Python scraper for:', url);
    console.log('🐍 Working directory:', __dirname);

    // Spawn Python process
    const pythonProcess = spawn('python3', ['map_scraper.py', url], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      console.log(`🐍 Python scraper exited with code: ${code}`);

      if (stderr) {
        console.log('🐍 Python stderr:', stderr);
      }

      if (code !== 0) {
        console.error('❌ Python scraper failed');
        resolve('Map information available - View in There for full details');
        return;
      }

      try {
        // Parse JSON output from Python script
        const result = JSON.parse(stdout);
        console.log('✅ Successfully parsed Python scraper result');
        resolve(result);
      } catch (error) {
        console.error('❌ Failed to parse Python scraper output:', error);
        console.log('📄 Raw Python output:', stdout);

        // Fallback: try to extract basic info from raw output
        if (stdout && stdout.trim()) {
          resolve({
            formatted: stdout.trim(),
            structured: {}
          });
        } else {
          resolve('Map information available - View in There for full details');
        }
      }
    });

    pythonProcess.on('error', (error) => {
      console.error('❌ Failed to start Python scraper:', error);
      resolve('Map information available - View in There for full details');
    });

    // Timeout after 15 seconds
    const timeout = setTimeout(() => {
      console.log('⏰ Python scraper timeout');
      pythonProcess.kill();
      resolve('Map information available - View in There for full details');
    }, 15000);

    pythonProcess.on('close', () => {
      clearTimeout(timeout);
    });
  });
};

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
app.post('/api/players', checkAdminAuth, (req, res) => {
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
    res.status(201).json({ data: playerData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/players/:id', checkAdminAuth, (req, res) => {
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

    res.json({ data: playersData.data[playerIndex] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/players/:id', checkAdminAuth, (req, res) => {
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

    res.json({ data: zonesData.data[zoneIndex] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/zones/:id', checkAdminAuth, (req, res) => {
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
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// CRUD Operations for Race Results
app.post('/api/race-results', checkAdminAuth, (req, res) => {
  try {
    const newResult = req.body;
    const newId = Math.max(...raceResultsData.data.map(r => r.id), 0) + 1;

    // Find player and zone for relationships
    const player = playersData.data.find(p => p.id === parseInt(newResult.player_id));
    const zone = zonesData.data.find(z => z.id === parseInt(newResult.zone_id));

    // Calculate points based on position
    const pointsForPosition = (position) => {
      if (position === 1) return 10;
      if (position === 2) return 9;
      if (position === 3) return 8;
      if (position === 4) return 7;
      if (position === 5) return 6;
      if (position === 6) return 5;
      if (position === 7) return 4;
      if (position === 8) return 3;
      return 1;
    };

    const pointsEarned = pointsForPosition(parseInt(newResult.position));

    const resultData = {
      id: newId,
      attributes: {
        position: parseInt(newResult.position),
        points_earned: pointsEarned,
        lap_time: newResult.lap_time || "",
        race_date: newResult.race_date || new Date().toISOString(),
        week_number: parseInt(newResult.week_number) || 1,
        notes: newResult.notes || "",
        player: player ? { data: { id: player.id, attributes: { name: player.attributes.name } } } : null,
        zone: zone ? { data: { id: zone.id, attributes: { name: zone.attributes.name } } } : null
      }
    };

    raceResultsData.data.push(resultData);

    // Update player's total points and race count
    if (player) {
      player.attributes.total_points = (player.attributes.total_points || 0) + pointsEarned;
      player.attributes.races_participated = (player.attributes.races_participated || 0) + 1;

      // Update best lap time if applicable
      if (newResult.lap_time && (!player.attributes.best_lap_time || newResult.lap_time < player.attributes.best_lap_time)) {
        player.attributes.best_lap_time = newResult.lap_time;
      }
    }

    res.status(201).json({ data: resultData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/race-results/:id', checkAdminAuth, (req, res) => {
  try {
    const resultId = parseInt(req.params.id);
    const updatedData = req.body;

    const resultIndex = raceResultsData.data.findIndex(r => r.id === resultId);
    if (resultIndex === -1) {
      return res.status(404).json({ error: 'Race result not found' });
    }

    const player = playersData.data.find(p => p.id === parseInt(updatedData.player_id));
    const zone = zonesData.data.find(z => z.id === parseInt(updatedData.zone_id));

    // Calculate points
    const pointsForPosition = (position) => {
      if (position === 1) return 10;
      if (position === 2) return 9;
      if (position === 3) return 8;
      if (position === 4) return 7;
      if (position === 5) return 6;
      if (position === 6) return 5;
      if (position === 7) return 4;
      if (position === 8) return 3;
      return 1;
    };

    const pointsEarned = pointsForPosition(parseInt(updatedData.position));

    // Update old player's points (subtract old points)
    const oldResult = raceResultsData.data[resultIndex];
    if (oldResult.attributes.player?.data?.id) {
      const oldPlayer = playersData.data.find(p => p.id === oldResult.attributes.player.data.id);
      if (oldPlayer) {
        oldPlayer.attributes.total_points = Math.max(0, (oldPlayer.attributes.total_points || 0) - oldResult.attributes.points_earned);
        oldPlayer.attributes.races_participated = Math.max(0, (oldPlayer.attributes.races_participated || 0) - 1);
      }
    }

    raceResultsData.data[resultIndex].attributes = {
      ...raceResultsData.data[resultIndex].attributes,
      position: parseInt(updatedData.position),
      points_earned: pointsEarned,
      lap_time: updatedData.lap_time || "",
      race_date: updatedData.race_date || new Date().toISOString(),
      week_number: parseInt(updatedData.week_number) || 1,
      notes: updatedData.notes || "",
      player: player ? { data: { id: player.id, attributes: { name: player.attributes.name } } } : null,
      zone: zone ? { data: { id: zone.id, attributes: { name: zone.attributes.name } } } : null
    };

    // Update new player's points
    if (player) {
      player.attributes.total_points = (player.attributes.total_points || 0) + pointsEarned;
      player.attributes.races_participated = (player.attributes.races_participated || 0) + 1;

      if (updatedData.lap_time && (!player.attributes.best_lap_time || updatedData.lap_time < player.attributes.best_lap_time)) {
        player.attributes.best_lap_time = updatedData.lap_time;
      }
    }

    res.json({ data: raceResultsData.data[resultIndex] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/race-results/:id', checkAdminAuth, (req, res) => {
  try {
    const resultId = parseInt(req.params.id);
    const resultIndex = raceResultsData.data.findIndex(r => r.id === resultId);

    if (resultIndex === -1) {
      return res.status(404).json({ error: 'Race result not found' });
    }

    // Update player's points (subtract points)
    const result = raceResultsData.data[resultIndex];
    if (result.attributes.player?.data?.id) {
      const player = playersData.data.find(p => p.id === result.attributes.player.data.id);
      if (player) {
        player.attributes.total_points = Math.max(0, (player.attributes.total_points || 0) - result.attributes.points_earned);
        player.attributes.races_participated = Math.max(0, (player.attributes.races_participated || 0) - 1);
      }
    }

    raceResultsData.data.splice(resultIndex, 1);
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
    message: '🏁 Ultimate Buggy Racing Tournament API',
    version: '1.0.0',
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
  console.log(`📊 API Endpoints available:`);
  console.log(`   - GET /api/tournaments`);
  console.log(`   - GET /api/players`);
  console.log(`   - GET /api/zones`);
  console.log(`   - GET /api/race-results`);
  console.log(`   - GET /api/lap-times`);
  console.log(`   - GET /api/health`);
  console.log(`\n🎯 Frontend should connect to: http://localhost:${PORT}/api`);
});