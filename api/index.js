const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
const { spawn } = require('child_process');
const DataManager = require('./dataManager');

const app = express();
const dataManager = new DataManager();

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
  try {
    const tournamentData = dataManager.getTournament();
    res.json(tournamentData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get tournament data' });
  }
});

app.put('/api/tournaments/:id', checkAdminAuth, (req, res) => {
  try {
    const tournamentId = parseInt(req.params.id);
    const updatedData = req.body;

    const result = dataManager.updateTournament(tournamentId, updatedData);
    res.json(result);
  } catch (error) {
    if (error.message === 'Tournament not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

app.get('/api/players', (req, res) => {
  try {
    const playersData = dataManager.getPlayers();
    res.json(playersData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get players data' });
  }
});

app.post('/api/players', checkAdminAuth, (req, res) => {
  try {
    const playerData = req.body;
    const result = dataManager.addPlayer(playerData);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/players/:id', checkAdminAuth, (req, res) => {
  try {
    const playerId = parseInt(req.params.id);
    const updateData = req.body;
    const result = dataManager.updatePlayer(playerId, updateData);
    res.json(result);
  } catch (error) {
    if (error.message === 'Player not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

app.delete('/api/players/:id', checkAdminAuth, (req, res) => {
  try {
    const playerId = parseInt(req.params.id);
    const result = dataManager.deletePlayer(playerId);
    res.json(result);
  } catch (error) {
    if (error.message === 'Player not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

app.get('/api/zones', (req, res) => {
  try {
    const { filters } = req.query;
    let zoneFilters = {};

    // Parse Strapi-style filters
    if (filters) {
      try {
        const parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
        if (parsedFilters.is_active && parsedFilters.is_active.$eq === 'true') {
          zoneFilters.is_active = true;
        }
      } catch (e) {
        console.warn('Invalid filters format:', filters);
      }
    }

    const zonesData = dataManager.getZones(zoneFilters);
    res.json(zonesData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get zones data' });
  }
});

app.post('/api/zones', checkAdminAuth, (req, res) => {
  try {
    const zoneData = req.body;
    const result = dataManager.addZone(zoneData);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/zones/:id', checkAdminAuth, (req, res) => {
  try {
    const zoneId = parseInt(req.params.id);
    const updateData = req.body;
    const result = dataManager.updateZone(zoneId, updateData);
    res.json(result);
  } catch (error) {
    if (error.message === 'Zone not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

app.delete('/api/zones/:id', checkAdminAuth, (req, res) => {
  try {
    const zoneId = parseInt(req.params.id);
    const result = dataManager.deleteZone(zoneId);
    res.json(result);
  } catch (error) {
    if (error.message === 'Zone not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

app.get('/api/race-results', (req, res) => {
  try {
    const { week, zone } = req.query;
    let filters = {};

    if (week) filters.week = week;
    if (zone) filters.zone = zone;

    const resultsData = dataManager.getRaceResults(filters);
    res.json(resultsData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get race results data' });
  }
});

app.post('/api/race-results', checkAdminAuth, (req, res) => {
  try {
    const resultData = req.body;
    const result = dataManager.addRaceResult(resultData);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/race-results/:id', checkAdminAuth, (req, res) => {
  try {
    const resultId = parseInt(req.params.id);
    const updateData = req.body;
    const result = dataManager.updateRaceResult(resultId, updateData);
    res.json(result);
  } catch (error) {
    if (error.message === 'Race result not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

app.delete('/api/race-results/:id', checkAdminAuth, (req, res) => {
  try {
    const resultId = parseInt(req.params.id);
    const result = dataManager.deleteRaceResult(resultId);
    res.json(result);
  } catch (error) {
    if (error.message === 'Race result not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

app.get('/api/lap-times', (req, res) => {
  res.json({ data: [] });
});

// Admin stats endpoint
app.get('/api/admin/stats', checkAdminAuth, (req, res) => {
  try {
    const stats = dataManager.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get admin stats' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Tournament API is running' });
});

// Admin panel route
app.get('/admin', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - Ultimate Buggy Racing</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #1a1a1a; color: #ffffff; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .header h1 { color: #e74c3c; font-size: 2.5rem; margin-bottom: 10px; }
        .login-section { max-width: 400px; margin: 0 auto; }
        .login-form { background: #2d2d2d; padding: 30px; border-radius: 10px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 5px; color: #cccccc; }
        .form-group input { width: 100%; padding: 12px; border: none; border-radius: 5px; background: #1a1a1a; color: #ffffff; border: 1px solid #444; }
        .form-group input:focus { outline: none; border-color: #e74c3c; }
        .btn { width: 100%; padding: 12px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold; }
        .btn:hover { background: #c0392b; }
        .admin-content { display: none; }
        .tabs { display: flex; margin-bottom: 20px; background: #2d2d2d; border-radius: 5px; }
        .tab { flex: 1; padding: 15px; background: #444; color: white; border: none; cursor: pointer; }
        .tab:first-child { border-radius: 5px 0 0 5px; }
        .tab:last-child { border-radius: 0 5px 5px 0; }
        .tab.active { background: #e74c3c; }
        .tab-content { display: none; background: #2d2d2d; padding: 20px; border-radius: 5px; }
        .tab-content.active { display: block; }
        .form-grid { display: grid; gap: 15px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        textarea { width: 100%; padding: 10px; border: none; border-radius: 5px; background: #1a1a1a; color: #ffffff; border: 1px solid #444; min-height: 100px; resize: vertical; }
        .status { padding: 10px; border-radius: 5px; margin: 10px 0; }
        .status.success { background: #27ae60; }
        .status.error { background: #e74c3c; }
        .data-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .data-table th, .data-table td { padding: 10px; text-align: left; border-bottom: 1px solid #444; }
        .data-table th { background: #444; }
        .btn-small { padding: 5px 10px; font-size: 12px; background: #3498db; }
        .btn-danger { background: #e74c3c; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏁 Admin Panel</h1>
            <p>Ultimate Buggy Racing Tournament Management</p>
        </div>

        <div id="loginSection" class="login-section">
            <div class="login-form">
                <h2>Admin Login</h2>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="password">Admin Password:</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit" class="btn">Login</button>
                </form>
                <div id="loginStatus"></div>
            </div>
        </div>

        <div id="adminContent" class="admin-content">
            <div class="tabs">
                <button class="tab active" onclick="showTab('tournament')">Tournament</button>
                <button class="tab" onclick="showTab('players')">Players</button>
                <button class="tab" onclick="showTab('zones')">Zones</button>
                <button class="tab" onclick="showTab('results')">Results</button>
            </div>

            <div id="tournament" class="tab-content active">
                <h2>Tournament Settings</h2>
                <form id="tournamentForm">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Tournament Title:</label>
                            <input type="text" id="title" name="title" value="Ultimate Buggy Racing Championship">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Start Date:</label>
                                <input type="datetime-local" id="start_date" name="start_date">
                            </div>
                            <div class="form-group">
                                <label>End Date:</label>
                                <input type="datetime-local" id="end_date" name="end_date">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Description:</label>
                            <textarea id="description" name="description">8-week tournament featuring the best buggy racers competing across 8 unique zones for the championship title.</textarea>
                        </div>
                        <div class="form-group">
                            <label>Prizes:</label>
                            <textarea id="prizes" name="prizes">🏆 1st Place: 180,000 TBUX + Special Buggy + Swag | 🥈 2nd Place: 90,000 TBUX + Swag | 🥉 3rd Place: 45,000 TBUX + Swag</textarea>
                        </div>
                        <div class="form-group">
                            <label>Rules:</label>
                            <textarea id="rules" name="rules">**Tournament Rules:**

1. **Race Format**: Weekly races with point-based scoring system
2. **Points Distribution**: 1st (10pts), 2nd (9pts), 3rd (8pts), 4th (7pts), 5th (6pts), 6th (5pts), 7th (4pts), 8th (3pts), 9th+ (1pt)
3. **Zone Rotation**: Each week features a different zone with unique challenges</textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Stream URL:</label>
                                <input type="url" id="stream_url" name="stream_url" placeholder="https://twitch.tv/channel">
                            </div>
                            <div class="form-group">
                                <label>Discord URL:</label>
                                <input type="url" id="discord_url" name="discord_url" placeholder="https://discord.gg/invite">
                            </div>
                        </div>
                        <button type="submit" class="btn">Update Tournament</button>
                    </div>
                </form>
                <div id="tournamentStatus"></div>
            </div>

            <div id="players" class="tab-content">
                <h2>Players Management</h2>
                <div id="playersList">
                    <p>Loading players data...</p>
                </div>
            </div>

            <div id="zones" class="tab-content">
                <h2>Zones Management</h2>
                <div id="zonesList">
                    <p>Loading zones data...</p>
                </div>
            </div>

            <div id="results" class="tab-content">
                <h2>Race Results</h2>
                <div id="resultsList">
                    <p>Loading results data...</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        let authToken = localStorage.getItem('adminToken');

        // Check if already logged in
        if (authToken) {
            showAdminPanel();
        }

        // Login form handler
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('password').value;
            const statusDiv = document.getElementById('loginStatus');

            try {
                const response = await fetch('/api/tournaments', {
                    headers: {
                        'Authorization': 'Bearer ' + password,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    authToken = password;
                    localStorage.setItem('adminToken', authToken);
                    statusDiv.innerHTML = '<div class="status success">Login successful!</div>';
                    setTimeout(() => showAdminPanel(), 1000);
                } else {
                    statusDiv.innerHTML = '<div class="status error">Invalid password</div>';
                }
            } catch (error) {
                statusDiv.innerHTML = '<div class="status error">Login failed: ' + error.message + '</div>';
            }
        });

        function showAdminPanel() {
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('adminContent').style.display = 'block';
            loadData();
        }

        function showTab(tabName) {
            // Hide all tabs
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });

            // Show selected tab
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');
        }

        async function loadData() {
            try {
                // Load tournament data
                const tournamentResponse = await fetch('/api/tournaments');
                const tournamentData = await tournamentResponse.json();
                if (tournamentData.data && tournamentData.data[0]) {
                    const tournament = tournamentData.data[0].attributes;
                    document.getElementById('title').value = tournament.title || '';
                    document.getElementById('description').value = tournament.description || '';
                    document.getElementById('start_date').value = tournament.start_date ? tournament.start_date.slice(0, 16) : '';
                    document.getElementById('end_date').value = tournament.end_date ? tournament.end_date.slice(0, 16) : '';
                    document.getElementById('prizes').value = tournament.prizes || '';
                    document.getElementById('rules').value = tournament.rules || '';
                    document.getElementById('stream_url').value = tournament.stream_url || '';
                    document.getElementById('discord_url').value = tournament.discord_url || '';
                }

                // Load other data
                loadPlayers();
                loadZones();
                loadResults();
            } catch (error) {
                console.error('Failed to load data:', error);
            }
        }

        async function loadPlayers() {
            try {
                const response = await fetch('/api/players');
                const data = await response.json();
                const playersDiv = document.getElementById('playersList');

                if (data.data && data.data.length > 0) {
                    playersDiv.innerHTML = \`
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Zone</th>
                                    <th>Status</th>
                                    <th>Points</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                \${data.data.map(player => \`
                                    <tr>
                                        <td>\${player.attributes.name}</td>
                                        <td>\${player.attributes.zone_assignment}</td>
                                        <td>\${player.attributes.status}</td>
                                        <td>\${player.attributes.total_points}</td>
                                        <td><button class="btn btn-small">Edit</button></td>
                                    </tr>
                                \`).join('')}
                            </tbody>
                        </table>
                    \`;
                } else {
                    playersDiv.innerHTML = '<p>No players found</p>';
                }
            } catch (error) {
                document.getElementById('playersList').innerHTML = '<p>Error loading players</p>';
            }
        }

        async function loadZones() {
            try {
                const response = await fetch('/api/zones');
                const data = await response.json();
                const zonesDiv = document.getElementById('zonesList');

                if (data.data && data.data.length > 0) {
                    zonesDiv.innerHTML = \`
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Map</th>
                                    <th>Week</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                \${data.data.map(zone => \`
                                    <tr>
                                        <td>\${zone.attributes.name}</td>
                                        <td>\${zone.attributes.map_name}</td>
                                        <td>\${zone.attributes.week_number}</td>
                                        <td>\${zone.attributes.is_active ? 'Active' : 'Inactive'}</td>
                                        <td><button class="btn btn-small">Edit</button></td>
                                    </tr>
                                \`).join('')}
                            </tbody>
                        </table>
                    \`;
                } else {
                    zonesDiv.innerHTML = '<p>No zones found</p>';
                }
            } catch (error) {
                document.getElementById('zonesList').innerHTML = '<p>Error loading zones</p>';
            }
        }

        async function loadResults() {
            try {
                const response = await fetch('/api/race-results');
                const data = await response.json();
                const resultsDiv = document.getElementById('resultsList');

                if (data.data && data.data.length > 0) {
                    resultsDiv.innerHTML = \`
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Player</th>
                                    <th>Zone</th>
                                    <th>Position</th>
                                    <th>Points</th>
                                    <th>Time</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                \${data.data.map(result => \`
                                    <tr>
                                        <td>\${result.attributes.player?.data?.attributes?.name || 'Unknown'}</td>
                                        <td>\${result.attributes.zone?.data?.attributes?.name || 'Unknown'}</td>
                                        <td>\${result.attributes.position}</td>
                                        <td>\${result.attributes.points_earned}</td>
                                        <td>\${result.attributes.lap_time}</td>
                                        <td><button class="btn btn-small btn-danger">Delete</button></td>
                                    </tr>
                                \`).join('')}
                            </tbody>
                        </table>
                    \`;
                } else {
                    resultsDiv.innerHTML = '<p>No race results found</p>';
                }
            } catch (error) {
                document.getElementById('resultsList').innerHTML = '<p>Error loading results</p>';
            }
        }

        // Tournament form handler
        document.getElementById('tournamentForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const statusDiv = document.getElementById('tournamentStatus');

            const formData = new FormData(e.target);
            const updateData = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/tournaments/1', {
                    method: 'PUT',
                    headers: {
                        'Authorization': 'Bearer ' + authToken,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });

                if (response.ok) {
                    statusDiv.innerHTML = '<div class="status success">Tournament updated successfully!</div>';
                } else {
                    const error = await response.json();
                    statusDiv.innerHTML = '<div class="status error">Update failed: ' + error.error + '</div>';
                }
            } catch (error) {
                statusDiv.innerHTML = '<div class="status error">Update failed: ' + error.message + '</div>';
            }
        });
    </script>
</body>
</html>
  `);
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
      'GET /api/health',
      'GET /admin - Admin Panel'
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