// User Interface Management
class UIManager {
    constructor() {
        this.currentTab = 'overview';
        this.isLoading = false;
        this.initializeElements();
    }

    // Cache DOM elements
    initializeElements() {
        this.elements = {
            loadingScreen: document.getElementById('loading-screen'),
            tabs: document.querySelectorAll('.tab-content'),
            navButtons: document.querySelectorAll('.nav-btn'),
            footerLinks: document.querySelectorAll('[data-tab]'),

            // Overview elements
            tournamentTitle: document.getElementById('tournament-description'),
            startDate: document.getElementById('start-date'),
            endDate: document.getElementById('end-date'),
            currentWeek: document.getElementById('current-week'),
            totalPlayers: document.getElementById('total-players'),
            totalZones: document.getElementById('total-zones'),
            totalRaces: document.getElementById('total-races'),
            currentZoneName: document.getElementById('current-zone-name'),
            currentZoneMap: document.getElementById('current-zone-map'),
            currentZoneDescription: document.getElementById('current-zone-description'),
            currentZoneImage: document.getElementById('current-zone-image'),
            recentResults: document.getElementById('recent-results'),

            // Enhanced tournament info elements
            tournamentPrizes: document.getElementById('tournament-prizes'),
            tournamentRules: document.getElementById('tournament-rules'),
            tournamentRegistration: document.getElementById('tournament-registration'),
            registrationSection: document.getElementById('registration-section'),
            communityLinks: document.getElementById('community-links'),
            streamLink: document.getElementById('stream-link'),
            discordLink: document.getElementById('discord-link'),

            // Status elements
            tournamentStatus: document.getElementById('tournament-status'),
            tournamentInfo: document.getElementById('tournament-info'),
            tournamentCountdown: document.getElementById('tournament-countdown'),

            // Standings elements
            standingsBody: document.getElementById('standings-body'),
            standingsFilter: document.getElementById('standings-filter'),

            // Zones elements
            zonesGrid: document.getElementById('zones-grid'),

            // Results elements
            resultsContainer: document.getElementById('results-container'),
            resultsWeekFilter: document.getElementById('results-week-filter'),
            resultsZoneFilter: document.getElementById('results-zone-filter'),

            // Players elements
            playersGrid: document.getElementById('players-grid'),
            playerSearch: document.getElementById('player-search'),

            // Footer elements
            adminLink: document.getElementById('admin-link'),
            apiDocs: document.getElementById('api-docs')
        };
    }

    // Hide loading screen
    hideLoading() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.classList.add('hidden');
            setTimeout(() => {
                this.elements.loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    // Show loading screen
    showLoading() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.style.display = 'flex';
            this.elements.loadingScreen.classList.remove('hidden');
        }
    }

    // Tab navigation
    switchTab(tabName) {
        // Hide all tabs
        this.elements.tabs.forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active class from all nav buttons
        this.elements.navButtons.forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }

        // Add active class to clicked button
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        this.currentTab = tabName;

        // Trigger tab-specific updates
        this.onTabSwitch(tabName);
    }

    // Handle tab-specific actions
    onTabSwitch(tabName) {
        switch (tabName) {
            case 'standings':
                this.updateStandings();
                break;
            case 'zones':
                this.updateZones();
                break;
            case 'results':
                this.updateResults();
                break;
            case 'players':
                this.updatePlayers();
                break;
        }
    }

    // Update overview section
    updateOverview(tournament, stats, currentZone) {
        if (!tournament) return;

        // Update tournament info
        if (this.elements.tournamentTitle) {
            this.elements.tournamentTitle.textContent = tournament.attributes.description;
        }

        if (this.elements.startDate) {
            this.elements.startDate.textContent = window.tournamentManager.formatDate(tournament.attributes.start_date);
        }

        if (this.elements.endDate) {
            this.elements.endDate.textContent = window.tournamentManager.formatDate(tournament.attributes.end_date);
        }

        if (this.elements.currentWeek) {
            this.elements.currentWeek.textContent = `${stats.currentWeek}/${tournament.attributes.total_weeks}`;
        }

        // Update statistics
        if (this.elements.totalPlayers) {
            this.elements.totalPlayers.textContent = stats.totalPlayers;
        }

        if (this.elements.totalZones) {
            this.elements.totalZones.textContent = stats.totalZones;
        }

        if (this.elements.totalRaces) {
            this.elements.totalRaces.textContent = stats.totalRaces;
        }

        // Update current zone
        this.updateCurrentZone(currentZone);

        // Update status banner
        this.updateStatusBanner(tournament);

        // Update enhanced tournament information
        this.updateTournamentInfo(tournament);
    }

    // Update enhanced tournament information
    updateTournamentInfo(tournament) {
        if (!tournament) return;

        const tournamentData = tournament.attributes;

        // Update prizes section
        if (this.elements.tournamentPrizes) {
            this.elements.tournamentPrizes.innerHTML = this.formatTournamentText(tournamentData.prizes);
        }

        // Update rules section
        if (this.elements.tournamentRules) {
            if (tournamentData.rules) {
                this.elements.tournamentRules.innerHTML = this.formatTournamentText(tournamentData.rules);
            } else {
                this.elements.tournamentRules.parentElement.style.display = 'none';
            }
        }

        // Update registration section
        if (this.elements.registrationSection && this.elements.tournamentRegistration) {
            if (tournamentData.registration_info || tournamentData.stream_url || tournamentData.discord_url) {
                this.elements.registrationSection.style.display = 'block';

                if (tournamentData.registration_info) {
                    this.elements.tournamentRegistration.innerHTML = this.formatTournamentText(tournamentData.registration_info);
                }

                // Update community links
                this.updateCommunityLinks(tournamentData);
            } else {
                this.elements.registrationSection.style.display = 'none';
            }
        }
    }

    // Update community links
    updateCommunityLinks(tournamentData) {
        if (!this.elements.streamLink || !this.elements.discordLink) return;

        // Update stream link
        if (tournamentData.stream_url) {
            this.elements.streamLink.href = tournamentData.stream_url;
            this.elements.streamLink.style.display = 'inline-flex';
        } else {
            this.elements.streamLink.style.display = 'none';
        }

        // Update Discord link
        if (tournamentData.discord_url) {
            this.elements.discordLink.href = tournamentData.discord_url;
            this.elements.discordLink.style.display = 'inline-flex';
        } else {
            this.elements.discordLink.style.display = 'none';
        }
    }

    // Format tournament text with markdown-like syntax
    formatTournamentText(text) {
        if (!text) return '<p>No information available</p>';

        return text
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/• (.+)/g, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            .replace(/^<p>/, '<p>')
            .replace(/<\/p>$/, '</p>');
    }

    // Update current zone display
    updateCurrentZone(zone) {
        if (!zone) return;

        const zoneData = zone.attributes;

        if (this.elements.currentZoneName) {
            this.elements.currentZoneName.textContent = zoneData.name;
        }

        if (this.elements.currentZoneMap) {
            this.elements.currentZoneMap.textContent = zoneData.map_name || 'Zone Map';
        }

        if (this.elements.currentZoneDescription) {
            let description = zoneData.description;

            // Parse map data if available
            let mapData = null;
            if (zoneData.map_data && typeof zoneData.map_data === 'object') {
                mapData = zoneData.map_data;
            }

            // Add rich map information if available
            if (mapData) {
                description += `\n\n---\n\n**🗺️ Zone Details**\n\n`;

                // Group related information together
                if (mapData.title) {
                    description += `**${mapData.title}**\n\n`;
                }

                // Location and Environment section
                if (mapData.location || mapData.region || mapData.environment || mapData.weather) {
                    description += `**Location & Environment**\n`;
                    if (mapData.location || mapData.region) {
                        description += `📍 ${mapData.location || ''}${mapData.region ? ', ' + mapData.region : ''}\n`;
                    }
                    if (mapData.environment) {
                        description += `🌍 ${mapData.environment}\n`;
                    }
                    if (mapData.weather) {
                        description += `🌤️ ${mapData.weather}\n`;
                    }
                    description += `\n`;
                }

                // Zone details section
                if (mapData.owner || mapData.description) {
                    description += `**Zone Information**\n`;
                    if (mapData.owner) {
                        description += `👤 Owner: ${mapData.owner}\n`;
                    }
                    if (mapData.description) {
                        description += `📝 ${mapData.description}\n`;
                    }
                }
            } else if (zoneData.map_info) {
                // Fallback to simple map info
                description += `\n\n---\n\n**🗺️ Map Information**\n${zoneData.map_info}`;
            }

            this.elements.currentZoneDescription.innerHTML = this.formatTournamentText(description);
        }

        if (this.elements.currentZoneImage) {
            // If zone has image, display it; otherwise show placeholder
            if (zoneData.map_image?.data?.attributes?.url) {
                this.elements.currentZoneImage.innerHTML = `
                    <img src="${zoneData.map_image.data.attributes.url}"
                         alt="${zoneData.name}"
                         style="width: 100%; height: 100%; object-fit: cover;">
                `;
            } else {
                // Add map link if available
                if (zoneData.map_url) {
                    this.elements.currentZoneImage.innerHTML = `
                        <a href="${zoneData.map_url}" target="_blank" style="display: block; width: 100%; height: 100%; text-decoration: none;">
                            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--bg-tertiary); border-radius: var(--radius-lg); transition: all 0.2s ease;" onmouseover="this.style.background='var(--primary-red)'; this.style.color='white';" onmouseout="this.style.background='var(--bg-tertiary)'; this.style.color='inherit';">
                                <div style="text-align: center;">
                                    <div style="font-size: 3rem; margin-bottom: 0.5rem;">🗺️</div>
                                    <div style="font-size: 0.875rem; font-weight: 600;">View Map</div>
                                </div>
                            </div>
                        </a>
                    `;
                } else {
                    this.elements.currentZoneImage.innerHTML = '<div class="placeholder-image">🗺️</div>';
                }
            }
        }
    }

    // Update status banner
    updateStatusBanner(tournament) {
        if (!tournament) return;

        const status = tournament.attributes.status;
        const statusText = status.charAt(0).toUpperCase() + status.slice(1);

        if (this.elements.tournamentStatus) {
            this.elements.tournamentStatus.textContent = statusText;
        }

        if (this.elements.tournamentInfo) {
            this.elements.tournamentInfo.textContent = tournament.attributes.title;
        }

        // Update countdown
        this.updateCountdown();
    }

    // Update countdown timer
    updateCountdown() {
        if (this.elements.tournamentCountdown) {
            const countdown = window.tournamentManager.getCountdown();
            if (countdown) {
                this.elements.tournamentCountdown.textContent = `Next race in: ${countdown}`;
            } else {
                this.elements.tournamentCountdown.textContent = '';
            }
        }
    }

    // Update recent results
    updateRecentResults(results) {
        if (!this.elements.recentResults) return;

        if (!results || results.length === 0) {
            this.elements.recentResults.innerHTML = '<div class="activity-placeholder">No recent results available</div>';
            return;
        }

        const html = results.map(result => {
            const resultData = result.attributes;
            const player = resultData.player?.data?.attributes;
            const zone = resultData.zone?.data?.attributes;

            return `
                <div class="activity-card fade-in">
                    <div class="activity-header">
                        <span class="activity-position position-${resultData.position}">${resultData.position}</span>
                        <span class="activity-player">${player?.name || 'Unknown'}</span>
                    </div>
                    <div class="activity-details">
                        <span class="activity-zone">${zone?.name || 'Unknown'}</span>
                        <span class="activity-time">${window.tournamentManager.formatTime(resultData.lap_time)}</span>
                    </div>
                    <div class="activity-meta">
                        <span class="activity-date">Week ${resultData.week_number}</span>
                        <span class="activity-points">+${resultData.points_earned} pts</span>
                    </div>
                </div>
            `;
        }).join('');

        this.elements.recentResults.innerHTML = html;
    }

    // Update standings table
    updateStandings(filter = 'all') {
        if (!this.elements.standingsBody) return;

        const standings = window.tournamentManager.getStandings(filter);

        if (!standings || standings.length === 0) {
            this.elements.standingsBody.innerHTML = `
                <tr>
                    <td colspan="7" class="loading-cell">No standings data available</td>
                </tr>
            `;
            return;
        }

        const html = standings.map((player, index) => {
            const positionClass = index < 3 ? `position-${index + 1}` : '';
            const leaderClass = index === 0 ? 'leader-row' : '';
            const bestPositionText = player.bestPosition ? `${player.bestPosition}${this.getOrdinalSuffix(player.bestPosition)}` : 'N/A';

            return `
                <tr class="${leaderClass} slide-up">
                    <td class="${positionClass}">${index + 1}</td>
                    <td class="player-name">${player.name}</td>
                    <td class="player-zone">${player.zone}</td>
                    <td class="total-points">${player.totalPoints}</td>
                    <td class="races-count">${player.racesParticipated}</td>
                    <td class="best-position">${bestPositionText}</td>
                    <td class="form-indicator">
                        ${this.renderFormIndicator(player.recentForm)}
                    </td>
                </tr>
            `;
        }).join('');

        this.elements.standingsBody.innerHTML = html;
    }

    // Render form indicator dots
    renderFormIndicator(form) {
        if (!form || form.length === 0) {
            return '<span class="form-indicator"></span>';
        }

        return `
            <div class="form-indicator">
                ${form.map(result => `<div class="form-dot ${result}"></div>`).join('')}
            </div>
        `;
    }

    // Update zones grid
    updateZones() {
        if (!this.elements.zonesGrid) return;

        const zones = window.tournamentManager.zones;

        if (!zones || zones.length === 0) {
            this.elements.zonesGrid.innerHTML = '<div class="zone-placeholder">No zones available</div>';
            return;
        }

        const html = zones.map(zone => {
            const zoneData = zone.attributes;
            const isActive = zoneData.is_active;
            const raceCount = window.tournamentManager.raceResults.filter(r => r.attributes.zone?.data?.id === zone.id).length;

            // Parse map data if available
            let mapData = null;
            if (zoneData.map_data && typeof zoneData.map_data === 'object') {
                mapData = zoneData.map_data;
            }

            return `
                <div class="zone-card fade-in ${isActive ? 'active-zone' : ''}">
                    <div class="zone-header">
                        <h3>${zoneData.name}</h3>
                        ${isActive ? '<span class="active-badge">ACTIVE</span>' : ''}
                    </div>
                    <div class="zone-details">
                        <p><strong>Map:</strong> ${zoneData.map_name}</p>
                        <p><strong>Week:</strong> ${zoneData.week_number}</p>
                        <p><strong>Races:</strong> ${raceCount}</p>
                        ${zoneData.map_url ? `<p><strong>Map URL:</strong> <a href="${zoneData.map_url}" target="_blank" style="color: var(--primary-red); text-decoration: none; font-weight: 500;">View Map Details</a></p>` : ''}

                        ${mapData ? `
                            <div class="map-details-section" style="margin-top: 1rem; padding: 1rem; background: var(--bg-tertiary); border-radius: var(--radius-lg);">
                                ${mapData.title ? `<h4 style="color: var(--primary-red); margin-bottom: 1rem;">🗺️ ${mapData.title}</h4>` : '<h4 style="color: var(--primary-red); margin-bottom: 1rem;">🗺️ Zone Details</h4>'}

                                ${mapData.location || mapData.region || mapData.environment || mapData.weather ? `
                                    <div style="margin-bottom: 1rem;">
                                        <p style="font-weight: 600; margin-bottom: 0.5rem;">📍 Location & Environment</p>
                                        ${mapData.location || mapData.region ? `<p style="font-size: 0.875rem; margin: 0.25rem 0;">📍 ${mapData.location || ''}${mapData.region ? ', ' + mapData.region : ''}</p>` : ''}
                                        ${mapData.environment ? `<p style="font-size: 0.875rem; margin: 0.25rem 0;">🌍 ${mapData.environment}</p>` : ''}
                                        ${mapData.weather ? `<p style="font-size: 0.875rem; margin: 0.25rem 0;">🌤️ ${mapData.weather}</p>` : ''}
                                    </div>
                                ` : ''}

                                ${mapData.owner || mapData.description ? `
                                    <div>
                                        <p style="font-weight: 600; margin-bottom: 0.5rem;">🏁 Zone Information</p>
                                        ${mapData.owner ? `<p style="font-size: 0.875rem; margin: 0.25rem 0;">👤 Owner: ${mapData.owner}</p>` : ''}
                                        ${mapData.description ? `<p style="font-size: 0.875rem; margin: 0.25rem 0; color: var(--text-secondary);">📝 ${mapData.description}</p>` : ''}
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}

                        ${zoneData.map_info && !mapData ? `<p><strong>Map Info:</strong> <span style="color: var(--text-secondary); font-size: 0.875rem;">${zoneData.map_info}</span></p>` : ''}
                    </div>
                    <div class="zone-description">
                        <p>${zoneData.description}</p>
                    </div>
                </div>
            `;
        }).join('');

        this.elements.zonesGrid.innerHTML = html;
    }

    // Update results section
    updateResults() {
        if (!this.elements.resultsContainer) return;

        const weekFilter = this.elements.resultsWeekFilter?.value || 'all';
        const zoneFilter = this.elements.resultsZoneFilter?.value || 'all';

        const results = window.tournamentManager.getRaceResults({ week: weekFilter, zone: zoneFilter });

        if (!results || results.length === 0) {
            this.elements.resultsContainer.innerHTML = '<div class="results-placeholder">No race results available</div>';
            return;
        }

        // Group results by week
        const groupedResults = this.groupResultsByWeek(results);

        const html = Object.entries(groupedResults).map(([week, weekResults]) => `
            <div class="week-results fade-in">
                <h3>Week ${week}</h3>
                <div class="week-results-grid">
                    ${weekResults.map(result => this.renderRaceResult(result)).join('')}
                </div>
            </div>
        `).join('');

        this.elements.resultsContainer.innerHTML = html;
    }

    // Group results by week
    groupResultsByWeek(results) {
        return results.reduce((groups, result) => {
            const week = result.weekNumber;
            if (!groups[week]) groups[week] = [];
            groups[week].push(result);
            return groups;
        }, {});
    }

    // Render individual race result
    renderRaceResult(result) {
        const positionClass = result.position <= 3 ? `position-${result.position}` : '';

        return `
            <div class="race-result-card">
                <div class="race-position ${positionClass}">${result.position}</div>
                <div class="race-details">
                    <h4>${result.player}</h4>
                    <p>${result.zone}</p>
                    <p class="race-time">Time: ${window.tournamentManager.formatTime(result.lapTime)}</p>
                </div>
                <div class="race-points">+${result.pointsEarned} pts</div>
            </div>
        `;
    }

    // Update players grid
    updatePlayers() {
        if (!this.elements.playersGrid) return;

        const searchTerm = this.elements.playerSearch?.value || '';
        const players = window.tournamentManager.searchPlayers(searchTerm);

        if (!players || players.length === 0) {
            this.elements.playersGrid.innerHTML = '<div class="player-placeholder">No players found</div>';
            return;
        }

        const html = players.map(player => `
            <div class="player-card fade-in">
                <div class="player-header">
                    <h3>${player.name}</h3>
                    <span class="player-status ${player.status}">${player.status}</span>
                </div>
                <div class="player-details">
                    <p><strong>Zone:</strong> ${player.zone}</p>
                    <p><strong>Total Points:</strong> <span class="total-points">${player.totalPoints}</span></p>
                    <p><strong>Races:</strong> ${player.racesParticipated}</p>
                    <p><strong>Best Position:</strong> ${player.bestPosition ? `${player.bestPosition}${this.getOrdinalSuffix(player.bestPosition)}` : 'N/A'}</p>
                    <p><strong>Best Lap:</strong> ${window.tournamentManager.formatTime(player.bestLapTime)}</p>
                </div>
                <div class="player-form">
                    <p><strong>Recent Form:</strong></p>
                    ${this.renderFormIndicator(player.recentForm)}
                </div>
            </div>
        `).join('');

        this.elements.playersGrid.innerHTML = html;
    }

    // Get ordinal suffix (1st, 2nd, 3rd, etc.)
    getOrdinalSuffix(num) {
        const j = num % 10;
        const k = num % 100;
        if (j === 1 && k !== 11) return 'st';
        if (j === 2 && k !== 12) return 'nd';
        if (j === 3 && k !== 13) return 'rd';
        return 'th';
    }

    // Show error message
    showError(message) {
        console.error(message);
        // Could implement a toast notification here
    }

    // Show success message
    showSuccess(message) {
        console.log(message);
        // Could implement a toast notification here
    }

    // Update zone filter options
    updateZoneFilter() {
        if (!this.elements.resultsZoneFilter) return;

        const zones = window.tournamentManager.zones;
        const currentValue = this.elements.resultsZoneFilter.value;

        const options = ['<option value="all">All Zones</option>'];
        zones.forEach(zone => {
            options.push(`<option value="${zone.id}">${zone.attributes.name}</option>`);
        });

        this.elements.resultsZoneFilter.innerHTML = options.join('');

        // Restore previous selection if still valid
        if (currentValue && currentValue !== 'all' && zones.find(z => z.id == currentValue)) {
            this.elements.resultsZoneFilter.value = currentValue;
        }
    }

    // Set up event listeners
    setupEventListeners() {
        // Tab navigation
        this.elements.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                if (tabName) {
                    this.switchTab(tabName);
                }
            });
        });

        // Footer links
        this.elements.footerLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = e.target.dataset.tab;
                if (tabName) {
                    this.switchTab(tabName);
                }
            });
        });

        // Standings filter
        if (this.elements.standingsFilter) {
            this.elements.standingsFilter.addEventListener('change', (e) => {
                this.updateStandings(e.target.value);
            });
        }

        // Results filters
        if (this.elements.resultsWeekFilter) {
            this.elements.resultsWeekFilter.addEventListener('change', () => {
                this.updateResults();
            });
        }

        if (this.elements.resultsZoneFilter) {
            this.elements.resultsZoneFilter.addEventListener('change', () => {
                this.updateResults();
            });
        }

        // Player search
        if (this.elements.playerSearch) {
            let searchTimeout;
            this.elements.playerSearch.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.updatePlayers();
                }, 300);
            });
        }

        // Admin link
        if (this.elements.adminLink) {
            this.elements.adminLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.open('http://localhost:1337/admin', '_blank');
            });
        }

        // API docs link
        if (this.elements.apiDocs) {
            this.elements.apiDocs.addEventListener('click', (e) => {
                e.preventDefault();
                window.open('http://localhost:1337/documentation', '_blank');
            });
        }
    }

    // Start countdown timer
    startCountdownTimer() {
        // Update countdown every minute
        setInterval(() => {
            this.updateCountdown();
        }, 60000);
    }
}

// Create global UI manager
window.uiManager = new UIManager();