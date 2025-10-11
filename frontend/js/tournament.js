// Tournament Logic and Data Processing
class TournamentManager {
    constructor() {
        this.tournament = null;
        this.players = [];
        this.zones = [];
        this.raceResults = [];
        this.currentZone = null;
        this.currentWeek = 1;
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
            const bestPosition = raceResults.length > 0
                ? Math.min(...raceResults.map(r => r.attributes.position))
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
            lapTime: result.attributes.lap_time,
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
            player.zone.toLowerCase().includes(term)
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
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Format time for display
    formatTime(timeString) {
        return timeString || 'N/A';
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

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    // Get points for position
    getPointsForPosition(position) {
        const pointsMap = {
            1: 10, 2: 9, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3
        };
        return pointsMap[position] || 1;
    }

    // Refresh data
    async refresh() {
        window.tournamentAPI.clearCache();
        await this.initialize();
    }
}

// Create global tournament manager
window.tournamentManager = new TournamentManager();