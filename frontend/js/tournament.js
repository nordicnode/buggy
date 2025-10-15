// Tournament Logic and Data Processing
class TournamentManager {
    constructor() {
        this.tournament = null;
        this.players = [];
        this.zones = [];
        this.raceResults = [];
        this.currentZone = null;
        this.currentWeek = 1;
        this.pointsConfig = null;
    }

    // Initialize tournament data
    async initialize() {
        try {
            await this.loadData();
            this.processTournamentData();
            return true;
        } catch (error) {
            console.error('Failed to initialize tournament:', error);
            // Don't fall back to mock data - show real state
            this.tournament = null;
            this.players = [];
            this.zones = [];
            this.raceResults = [];
            this.currentZone = null;
            this.processTournamentData();
            return false;
        }
    }

    // Load data from API
    async loadData() {
        const [tournament, players, zones, currentZone, recentResults] = await Promise.all([
            window.tournamentAPI.getTournament(),
            window.tournamentAPI.getPlayers(),
            window.tournamentAPI.getZones(),
            window.tournamentAPI.getCurrentZone(),
            window.tournamentAPI.getRecentResults()
        ]);

        this.tournament = tournament;
        this.players = players;
        this.zones = zones;
        this.currentZone = currentZone;
        this.raceResults = recentResults; // Load race results properly
        this.recentResults = recentResults;
        this.pointsConfig = tournament?.attributes?.points_config || null;

        // Calculate current week based on current zone
        if (currentZone) {
            this.currentWeek = currentZone.attributes.week_number || 1;
        }
    }

    // Load mock data for development
    async loadMockData() {
        const mockData = window.tournamentAPI.getMockData();

        this.tournament = mockData.tournament;
        this.players = mockData.players;
        this.zones = mockData.zones;
        this.raceResults = mockData.raceResults;
        this.currentZone = mockData.zones.find(z => z.attributes.is_active) || mockData.zones[0];
        this.recentResults = mockData.raceResults;

        console.warn('Using mock data - Strapi backend not available');
    }

    // Process tournament data and calculate standings
    processTournamentData() {
        this.calculateStandings();
        this.processRaceResults();
    }

    // Calculate tournament standings
    calculateStandings() {
        const standings = this.players.map(player => {
            const playerData = player.attributes;
            const raceResults = playerData.race_results?.data || [];

            // Calculate best position
            const validPositions = raceResults
                .map(r => r.attributes.position)
                .filter(pos => pos !== null && pos !== undefined && !isNaN(pos));
            
            const bestPosition = validPositions.length > 0
                ? Math.min(...validPositions)
                : null;

            // Calculate recent form (last 3 races)
            const recentForm = raceResults.slice(-3).map(r => {
                const pos = r.attributes.position;
                if (pos === 1) return 'win';
                if (pos <= 3) return 'podium';
                if (pos <= 8) return 'points';
                return 'no-points';
            });

            return {
                id: player.id,
                name: playerData.name,
                zone: playerData.zone_assignment,
                totalPoints: playerData.total_points || 0,
                racesParticipated: playerData.races_participated || 0,
                bestPosition: bestPosition,
                bestLapTime: playerData.best_lap_time,
                recentForm: recentForm,
                status: playerData.status
            };
        });

        // Sort by total points, then by best position
        this.standings = standings.sort((a, b) => {
            if (b.totalPoints !== a.totalPoints) {
                return b.totalPoints - a.totalPoints;
            }
            if (a.bestPosition && b.bestPosition) {
                return a.bestPosition - b.bestPosition;
            }
            return 0;
        });

        return this.standings;
    }

    // Process race results for display
    processRaceResults() {
        this.processedResults = this.raceResults.map(result => ({
            id: result.id,
            position: result.attributes.position,
            pointsEarned: result.attributes.points_earned,
            lapTime: result.attributes.finish_time || result.attributes.lap_time,
            finishTime: result.attributes.finish_time || result.attributes.lap_time,
            finishTimeMs: result.attributes.finish_time_ms ?? null,
            raceDate: result.attributes.race_date,
            weekNumber: result.attributes.week_number,
            player: result.attributes.player?.data?.attributes?.name || 'Unknown',
            zone: result.attributes.zone?.data?.attributes?.name || 'Unknown',
            playerId: result.attributes.player?.data?.id,
            zoneId: result.attributes.zone?.data?.id
        }));

        return this.processedResults;
    }

    // Get current standings
    getStandings(filter = 'all') {
        if (!this.standings) return [];

        switch (filter) {
            case 'top10':
                return this.standings.slice(0, 10);
            case 'active':
                return this.standings.filter(p => p.status === 'active');
            default:
                return this.standings;
        }
    }

    // Get zone information
    getZone(zoneId) {
        return this.zones.find(z => z.id === zoneId);
    }

    // Get current zone information
    getCurrentZone() {
        return this.currentZone;
    }

    // Get filtered race results
    getRaceResults(filters = {}) {
        let results = this.processedResults || [];

        if (filters.week && filters.week !== 'all') {
            results = results.filter(r => r.weekNumber === parseInt(filters.week));
        }

        if (filters.zone && filters.zone !== 'all') {
            results = results.filter(r => r.zoneId === parseInt(filters.zone));
        }

        return results;
    }

    // Get players by search term
    searchPlayers(searchTerm) {
        if (!searchTerm) return this.standings || [];

        const term = searchTerm.toLowerCase();
        return (this.standings || []).filter(player =>
            player.name.toLowerCase().includes(term) ||
            (player.zone && player.zone.toLowerCase().includes(term))
        );
    }

    // Get tournament statistics
    getStatistics() {
        return {
            totalPlayers: this.players.length,
            activePlayers: this.players.filter(p => p.attributes.status === 'active').length,
            totalZones: this.zones.length,
            completedWeeks: this.zones.filter(z => !z.attributes.is_active).length,
            totalRaces: this.raceResults.length,
            currentWeek: this.currentWeek
        };
    }

    // Format date for display
    formatDate(dateString) {
        if (!dateString) {
            return 'TBD';
        }

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return 'TBD';
        }

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Format time for display
    formatTime(timeValue) {
        if (timeValue === null || timeValue === undefined || timeValue === '') {
            return 'N/A';
        }
        if (typeof timeValue === 'number') {
            return this.formatMilliseconds(timeValue);
        }
        return timeValue;
    }

    formatMilliseconds(milliseconds) {
        if (!Number.isFinite(milliseconds) || milliseconds < 0) {
            return 'N/A';
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

    // Calculate countdown to next race
    getCountdown() {
        if (!this.currentZone) return null;

        // Assuming next race is next Saturday at 7 PM
        const now = new Date();
        const nextSaturday = new Date(now);
        const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7;
        nextSaturday.setDate(now.getDate() + daysUntilSaturday);
        nextSaturday.setHours(19, 0, 0, 0);

        const diff = nextSaturday - now;

        if (diff <= 0) return null;

        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const parts = [];

        if (days > 0) {
            parts.push(`${days}d`);
        }

        if (days > 0 || hours > 0) {
            parts.push(`${hours}h`);
        }

        parts.push(`${minutes}m`);
        parts.push(`${seconds}s`);

        return parts.join(' ');
    }

    // Get points for position
    getPointsForPosition(position) {
        const config = this.pointsConfig || this.tournament?.attributes?.points_config;
        if (config) {
            const key = String(position);
            if (typeof config[key] === 'number') {
                return config[key];
            }
            if (typeof config.default === 'number') {
                return config.default;
            }
        }
        const fallbackMap = {
            1: 10,
            2: 9,
            3: 8,
            4: 7,
            5: 6,
            6: 5,
            7: 4,
            8: 3,
            default: 1
        };
        return fallbackMap[position] || fallbackMap.default;
    }

    // Refresh data
    async refresh() {
        window.tournamentAPI.clearCache();
        await this.initialize();
    }
}

// Create global tournament manager
window.tournamentManager = new TournamentManager();