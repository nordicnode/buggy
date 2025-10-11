const fs = require('fs');
const path = require('path');

class DataManager {
    constructor() {
        this.dbPath = path.join(__dirname, '../data/database.json');
        this.data = null;
        this.load();
    }

    // Load data from JSON file
    load() {
        try {
            if (fs.existsSync(this.dbPath)) {
                const rawData = fs.readFileSync(this.dbPath, 'utf8');
                this.data = JSON.parse(rawData);
                console.log('📁 Database loaded successfully');
            } else {
                // Initialize with default data if file doesn't exist
                this.initializeDefaultData();
                console.log('📁 Created new database file');
            }
        } catch (error) {
            console.error('❌ Error loading database:', error);
            this.initializeDefaultData();
        }
    }

    // Save data to JSON file
    save() {
        try {
            // Ensure data directory exists
            const dataDir = path.dirname(this.dbPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf8');
            console.log('💾 Database saved successfully');
            return true;
        } catch (error) {
            console.error('❌ Error saving database:', error);
            return false;
        }
    }

    // Initialize with default data (in case file is missing)
    initializeDefaultData() {
        this.data = {
            tournament: {
                id: 1,
                attributes: {
                    title: "Ultimate Buggy Racing Championship",
                    description: "8-week tournament featuring the best buggy racers competing across 8 unique zones for the championship title.",
                    start_date: "2025-10-18T19:00:00.000Z",
                    end_date: "2025-12-06T19:00:00.000Z",
                    status: "active",
                    total_weeks: 8,
                    prizes: "🏆 1st Place: 180,000 TBUX + Special Buggy + Swag",
                    rules: "Tournament rules will be available soon.",
                    registration_info: "Registration information coming soon.",
                    contact_info: "Contact administrators for details.",
                    stream_url: "",
                    discord_url: ""
                }
            },
            players: [],
            zones: [],
            raceResults: []
        };
        this.save();
    }

    // Get tournament data
    getTournament() {
        return { data: [this.data.tournament] };
    }

    // Update tournament data
    updateTournament(tournamentId, updateData) {
        if (this.data.tournament.id == tournamentId) {
            this.data.tournament.attributes = {
                ...this.data.tournament.attributes,
                ...updateData
            };
            const success = this.save();
            if (success) {
                return { data: this.data.tournament };
            } else {
                throw new Error('Failed to save tournament data');
            }
        } else {
            throw new Error('Tournament not found');
        }
    }

    // Get all players
    getPlayers() {
        return { data: this.data.players };
    }

    // Get player by ID
    getPlayer(playerId) {
        const player = this.data.players.find(p => p.id == playerId);
        return player ? { data: player } : null;
    }

    // Add new player
    addPlayer(playerData) {
        const newId = this.data.players.length > 0 ?
            Math.max(...this.data.players.map(p => p.id)) + 1 : 1;

        const newPlayer = {
            id: newId,
            attributes: playerData
        };

        this.data.players.push(newPlayer);
        const success = this.save();
        if (success) {
            return { data: newPlayer };
        } else {
            throw new Error('Failed to add player');
        }
    }

    // Update player
    updatePlayer(playerId, updateData) {
        const playerIndex = this.data.players.findIndex(p => p.id == playerId);
        if (playerIndex !== -1) {
            this.data.players[playerIndex].attributes = {
                ...this.data.players[playerIndex].attributes,
                ...updateData
            };
            const success = this.save();
            if (success) {
                return { data: this.data.players[playerIndex] };
            } else {
                throw new Error('Failed to update player');
            }
        } else {
            throw new Error('Player not found');
        }
    }

    // Delete player
    deletePlayer(playerId) {
        const playerIndex = this.data.players.findIndex(p => p.id == playerId);
        if (playerIndex !== -1) {
            const deletedPlayer = this.data.players.splice(playerIndex, 1)[0];
            const success = this.save();
            if (success) {
                return { data: deletedPlayer };
            } else {
                throw new Error('Failed to delete player');
            }
        } else {
            throw new Error('Player not found');
        }
    }

    // Get all zones
    getZones(filters = {}) {
        let zones = this.data.zones;

        // Apply filters
        if (filters.is_active) {
            const activeZone = zones.find(zone => zone.attributes.is_active);
            return { data: activeZone ? [activeZone] : [] };
        }

        return { data: zones };
    }

    // Get zone by ID
    getZone(zoneId) {
        const zone = this.data.zones.find(z => z.id == zoneId);
        return zone ? { data: zone } : null;
    }

    // Add new zone
    addZone(zoneData) {
        const newId = this.data.zones.length > 0 ?
            Math.max(...this.data.zones.map(z => z.id)) + 1 : 1;

        const newZone = {
            id: newId,
            attributes: zoneData
        };

        this.data.zones.push(newZone);
        const success = this.save();
        if (success) {
            return { data: newZone };
        } else {
            throw new Error('Failed to add zone');
        }
    }

    // Update zone
    updateZone(zoneId, updateData) {
        const zoneIndex = this.data.zones.findIndex(z => z.id == zoneId);
        if (zoneIndex !== -1) {
            this.data.zones[zoneIndex].attributes = {
                ...this.data.zones[zoneIndex].attributes,
                ...updateData
            };
            const success = this.save();
            if (success) {
                return { data: this.data.zones[zoneIndex] };
            } else {
                throw new Error('Failed to update zone');
            }
        } else {
            throw new Error('Zone not found');
        }
    }

    // Delete zone
    deleteZone(zoneId) {
        const zoneIndex = this.data.zones.findIndex(z => z.id == zoneId);
        if (zoneIndex !== -1) {
            const deletedZone = this.data.zones.splice(zoneIndex, 1)[0];
            const success = this.save();
            if (success) {
                return { data: deletedZone };
            } else {
                throw new Error('Failed to delete zone');
            }
        } else {
            throw new Error('Zone not found');
        }
    }

    // Get all race results
    getRaceResults(filters = {}) {
        let results = this.data.raceResults;

        // Apply filters
        if (filters.week) {
            results = results.filter(r => r.attributes.week_number == filters.week);
        }

        if (filters.zone) {
            results = results.filter(r => r.attributes.zone?.data?.id == filters.zone);
        }

        return { data: results };
    }

    // Add race result
    addRaceResult(resultData) {
        const newId = this.data.raceResults.length > 0 ?
            Math.max(...this.data.raceResults.map(r => r.id)) + 1 : 1;

        const newResult = {
            id: newId,
            attributes: resultData
        };

        this.data.raceResults.push(newResult);
        const success = this.save();
        if (success) {
            return { data: newResult };
        } else {
            throw new Error('Failed to add race result');
        }
    }

    // Update race result
    updateRaceResult(resultId, updateData) {
        const resultIndex = this.data.raceResults.findIndex(r => r.id == resultId);
        if (resultIndex !== -1) {
            this.data.raceResults[resultIndex].attributes = {
                ...this.data.raceResults[resultIndex].attributes,
                ...updateData
            };
            const success = this.save();
            if (success) {
                return { data: this.data.raceResults[resultIndex] };
            } else {
                throw new Error('Failed to update race result');
            }
        } else {
            throw new Error('Race result not found');
        }
    }

    // Delete race result
    deleteRaceResult(resultId) {
        const resultIndex = this.data.raceResults.findIndex(r => r.id == resultId);
        if (resultIndex !== -1) {
            const deletedResult = this.data.raceResults.splice(resultIndex, 1)[0];
            const success = this.save();
            if (success) {
                return { data: deletedResult };
            } else {
                throw new Error('Failed to delete race result');
            }
        } else {
            throw new Error('Race result not found');
        }
    }

    // Get database statistics
    getStats() {
        return {
            totalPlayers: this.data.players.length,
            totalZones: this.data.zones.length,
            totalRaces: this.data.raceResults.length,
            currentWeek: this.getCurrentWeek(),
            activeZone: this.data.zones.find(z => z.attributes.is_active)
        };
    }

    // Calculate current week based on tournament dates
    getCurrentWeek() {
        const now = new Date();
        const startDate = new Date(this.data.tournament.attributes.start_date);
        const endDate = new Date(this.data.tournament.attributes.end_date);

        if (now < startDate) return 0;
        if (now > endDate) return this.data.tournament.attributes.total_weeks;

        const weeksPassed = Math.floor((now - startDate) / (7 * 24 * 60 * 60 * 1000));
        return Math.min(weeksPassed + 1, this.data.tournament.attributes.total_weeks);
    }
}

module.exports = DataManager;