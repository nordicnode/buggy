// API Configuration and Communication
class TournamentAPI {
    constructor() {
        // Use dynamic URL detection for production
        this.baseURL = this.getBaseURL();
        this.cache = new Map();
        this.cacheTimeout = 0; // Disabled for debugging
    }

    // Dynamic URL detection for local vs production
    getBaseURL() {
        // If we're in development and running on localhost, use local backend
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:1337/api';
        }
        // Otherwise use the same origin as the frontend
        return `${window.location.origin}/api`;
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        // Add timestamp to prevent caching for debugging
        const timestamp = Date.now();
        const endpointWithTimestamp = `${endpoint}${endpoint.includes('?') ? '&' : '?'}_t=${timestamp}`;

        const cacheKey = `${endpointWithTimestamp}-${JSON.stringify(options)}`;

        // Check cache first for GET requests (disabled for debugging)
        if (false && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const url = `${this.baseURL}${endpointWithTimestamp}`;
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Cache successful GET requests
            if (options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
                this.cache.set(cacheKey, {
                    data: data,
                    timestamp: Date.now()
                });
            }

            return data;
        } catch (error) {
            console.error(`API Request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    // Tournament API methods
    async getTournament() {
        try {
            const response = await this.request('/tournaments');
            return response.data?.[0] || null;
        } catch (error) {
            console.error('Failed to fetch tournament:', error);
            return null;
        }
    }

    async getPlayers() {
        try {
            const response = await this.request('/players');
            return response.data || [];
        } catch (error) {
            console.error('Failed to fetch players:', error);
            return [];
        }
    }

    async getZones() {
        try {
            const response = await this.request('/zones');
            return response.data || [];
        } catch (error) {
            console.error('Failed to fetch zones:', error);
            return [];
        }
    }

    async getRaceResults(filters = {}) {
        try {
            const response = await this.request('/race-results');
            return response.data || [];
        } catch (error) {
            console.error('Failed to fetch race results:', error);
            return [];
        }
    }

    async getLapTimes(filters = {}) {
        try {
            const params = new URLSearchParams();

            if (filters.player) params.append('filters[player][id][$eq]', filters.player);
            if (filters.zone) params.append('filters[zone][id][$eq]', filters.zone);

            params.append('populate[0]', 'player');
            params.append('populate[1]', 'zone');
            params.append('sort', 'recorded_at:desc');

            const response = await this.request(`/lap-times?${params.toString()}`);
            return response.data || [];
        } catch (error) {
            console.error('Failed to fetch lap times:', error);
            return [];
        }
    }

    async getCurrentZone() {
        try {
            const response = await this.request('/zones');
            // Find the active zone client-side since backend doesn't support filters
            return response.data?.find(zone => zone.attributes.is_active) || null;
        } catch (error) {
            console.error('Failed to fetch current zone:', error);
            return null;
        }
    }

    async getRecentResults(limit = 5) {
        try {
            const response = await this.request('/race-results');
            return response.data || [];
        } catch (error) {
            console.error('Failed to fetch recent results:', error);
            return [];
        }
    }

    // Utility methods
    clearCache() {
        this.cache.clear();
    }

    isConnected() {
        return navigator.onLine;
    }

    // Mock data for development when Strapi is not available
    getMockData() {
        return {
            tournament: {
                id: 1,
                attributes: {
                    title: "Ultimate Buggy Racing Championship",
                    description: "8-week tournament featuring the best buggy racers competing across 8 unique zones for the championship title.",
                    start_date: "2025-10-18T19:00:00.000Z",
                    end_date: "2025-12-06T19:00:00.000Z",
                    status: "active",
                    total_weeks: 8,
                    prizes: "1st: 180,000 TBUX + Special Buggy + Swag | 2nd: 90,000 TBUX + Swag | 3rd: 45,000 TBUX + Swag | Finalists: 20,000 TBUX + Swag"
                }
            },
            players: [
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
                                { id: 2, attributes: { position: 2, points_earned: 9, week_number: 2 } }
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
                                { id: 3, attributes: { position: 3, points_earned: 8, week_number: 1 } },
                                { id: 4, attributes: { position: 1, points_earned: 10, week_number: 3 } }
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
                                { id: 5, attributes: { position: 2, points_earned: 9, week_number: 1 } },
                                { id: 6, attributes: { position: 1, points_earned: 10, week_number: 2 } }
                            ]
                        }
                    }
                }
            ],
            zones: [
                {
                    id: 1,
                    attributes: {
                        name: "Zone 1 - Starting Circuit",
                        map_name: "Alpine Circuit",
                        description: "A challenging introductory course with sweeping turns and technical sections.",
                        difficulty: "beginner",
                        week_number: 1,
                        is_active: false
                    }
                },
                {
                    id: 2,
                    attributes: {
                        name: "Zone 2 - Technical Twists",
                        map_name: "Mountain Switchbacks",
                        description: "Tight hairpin turns and elevation changes test precision and control.",
                        difficulty: "intermediate",
                        week_number: 2,
                        is_active: true
                    }
                }
            ],
            raceResults: [
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
                }
            ]
        };
    }
}

// Create global API instance
window.tournamentAPI = new TournamentAPI();