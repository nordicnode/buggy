// User Interface Management
class UIManager {
    constructor() {
        this.currentTab = 'overview';
        this.isLoading = false;
        this.countdownInterval = null;
        this.initializeElements();
    }

    // Cache DOM elements
    initializeElements() {
        this.elements = {
            loadingScreen: document.getElementById('loading-screen'),
            tabs: document.querySelectorAll('.tab-content'),
            navButtons: document.querySelectorAll('.nav-btn'),
            footerLinks: document.querySelectorAll('[data-tab]'),
            tabTriggers: document.querySelectorAll('[data-tab-target]'),
            
            // Header elements
            headerTitle: document.getElementById('header-title'),
            headerSubtitle: document.getElementById('header-subtitle'),

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

        // Update header title
        if (this.elements.headerTitle) {
            this.elements.headerTitle.textContent = tournament.attributes.title || 'ULTIMATE BUGGY LAPPING';
        }
        
        // Update header subtitle if it exists in tournament data
        if (this.elements.headerSubtitle && tournament.attributes.subtitle) {
            this.elements.headerSubtitle.textContent = tournament.attributes.subtitle;
        }

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
        const trimmed = text.trim();
        if (trimmed.startsWith('<')) {
            return trimmed;
        }

        return text
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/• (.+)/g, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            .replace(/^<p>/, '<p>')
            .replace(/<\/p>$/, '</p>');
    }

    normalizeText(text) {
        if (!text) return '';
        return text.replace(/\s+/g, ' ').trim().toLowerCase();
    }

    getSanitizedMapData(zoneData) {
        if (!zoneData || !zoneData.map_data || typeof zoneData.map_data !== 'object') {
            return null;
        }

        const raw = zoneData.map_data;
        const sanitized = {};
        const keysToCopy = ['title', 'location', 'region', 'environment', 'weather', 'owner', 'description', 'map_image_url', 'image_url'];

        keysToCopy.forEach((key) => {
            const value = raw[key];
            if (!value || typeof value !== 'string') {
                if ((key === 'map_image_url' || key === 'image_url') && value) {
                    sanitized[key] = value;
                }
                return;
            }

            const trimmed = value.trim();
            if (!trimmed) return;

            const lower = trimmed.toLowerCase();
            if (lower === 'none' || lower === 'n/a') return;

            sanitized[key] = trimmed;
        });

        if (sanitized.description && zoneData.description) {
            if (this.normalizeText(sanitized.description) === this.normalizeText(zoneData.description)) {
                delete sanitized.description;
            }
        }

        return Object.keys(sanitized).length ? sanitized : null;
    }

    getZoneSummary(zoneData, mapData) {
        if (!zoneData || !zoneData.description) return '';
        const summary = zoneData.description.trim();

        if (!summary) return '';

        if (mapData?.description && this.normalizeText(mapData.description) === this.normalizeText(summary)) {
            return '';
        }

        return summary;
    }

    buildZoneMeta(zoneData) {
        if (!zoneData) return '';

        const metaItems = [
            { label: 'Map', value: zoneData.map_name || zoneData.name },
            { label: 'Week', value: zoneData.week_number }
        ];

        const metaHtml = metaItems
            .filter(item => item.value !== undefined && item.value !== null && item.value !== '')
            .map(item => `
                <div style="display:flex; flex-direction:column; gap:0.25rem; padding:0.75rem; background: var(--bg-tertiary); border-radius: var(--radius-lg);">
                    <span style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color: var(--text-secondary);">${item.label}</span>
                    <span style="font-weight:600; color: var(--text-primary);">${item.value}</span>
                </div>
            `)
            .join('');

        return `
            <div style="display:flex; flex-direction:column; gap:0.75rem; margin-bottom:0.75rem;">
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:0.75rem;">
                    ${metaHtml}
                </div>
            </div>
        `;
    }

    buildMapDetailsSection(zoneData, mapData, options = {}) {
        if (!mapData) return '';

        const { dense = false } = options;
        const padding = dense ? '0.75rem' : '1rem';
        const marginTop = dense ? '0.75rem' : '1rem';

        const detailRows = [];
        const locationParts = [mapData.location, mapData.region].filter(Boolean).join(', ');
        if (locationParts) {
            detailRows.push({ icon: '📍', label: 'Location', value: locationParts });
        }
        if (mapData.environment) {
            detailRows.push({ icon: '🌍', label: 'Environment', value: mapData.environment });
        }
        if (mapData.weather) {
            detailRows.push({ icon: '🌤️', label: 'Weather', value: mapData.weather });
        }
        if (mapData.owner) {
            detailRows.push({ icon: '👤', label: 'Owner', value: mapData.owner });
        }

        const rowsHtml = detailRows.length
            ? `<div style="display:flex; flex-direction:column; gap:0.5rem;">${detailRows
                .map(row => `
                    <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.875rem; color: var(--text-secondary);">
                        <span>${row.icon}</span>
                        <span style="font-weight:600; color: var(--text-primary);">${row.label}:</span>
                        <span>${row.value}</span>
                    </div>
                `).join('')}</div>`
            : '';

        const descriptionHtml = mapData.description
            ? `<div style="margin-top:${detailRows.length ? '0.75rem' : '0'}; font-size:0.9rem; color: var(--text-secondary); line-height:1.6;">${mapData.description}</div>`
            : '';

        return `
            <div class="map-details-section" style="margin-top:${marginTop}; padding:${padding}; background: var(--bg-tertiary); border-radius: var(--radius-lg); border: 1px solid rgba(15, 23, 42, 0.08);">
                <div style="display:flex; justify-content:flex-start; align-items:center; gap:1rem; margin-bottom:${(detailRows.length || mapData.description) ? '0.75rem' : '0'};">
                    <h4 style="margin:0; font-size:1rem; font-weight:600; color: var(--primary-red);">🗺️ ${mapData.title || zoneData.map_name || zoneData.name}</h4>
                </div>
                ${rowsHtml}
                ${descriptionHtml}
            </div>
        `;
    }

    buildMapInfoFallback(mapInfo, zoneData) {
        if (!mapInfo) return '';

        const segments = mapInfo.includes('|')
            ? mapInfo.split('|')
            : mapInfo.split(/\r?\n/);

        const zoneSummary = zoneData?.description ? this.normalizeText(zoneData.description) : '';

        const entries = segments
            .map(entry => entry.trim())
            .filter(Boolean)
            .filter(entry => {
                const lower = entry.toLowerCase();
                if (lower.startsWith('map:')) return false;
                if (lower.startsWith('week:')) return false;
                if (lower.startsWith('races:')) return false;

                const stripped = entry.replace(/^[^:]+:\s*/i, '').trim();
                if (stripped && zoneSummary && this.normalizeText(stripped) === zoneSummary) {
                    return false;
                }
                return true;
            });

        if (!entries.length) return '';

        return `
            <div class="map-details-section" style="margin-top:0.75rem; padding:0.75rem; background: var(--bg-tertiary); border-radius: var(--radius-lg); border: 1px solid rgba(15, 23, 42, 0.08);">
                <h4 style="margin:0 0 0.75rem 0; font-size:0.95rem; font-weight:600; color: var(--primary-red);">🗺️ Map Information</h4>
                <ul style="margin:0; padding-left:1.1rem; display:flex; flex-direction:column; gap:0.35rem; font-size:0.85rem; color: var(--text-secondary);">
                    ${entries.map(entry => `<li>${entry}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    renderZoneVisual(container, zoneData, mapData) {
        if (!container) return;

        container.innerHTML = '';

        const imageUrl = mapData?.map_image_url || mapData?.image_url;

        if (!imageUrl) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'flex';

        const preview = new Image();
        preview.alt = zoneData.name;
        preview.loading = 'lazy';
        preview.style.width = '100%';
        preview.style.height = '100%';
        preview.style.objectFit = 'cover';
        preview.style.borderRadius = 'var(--radius-lg)';

        preview.onload = () => {
            container.innerHTML = '';
            container.appendChild(preview);
        };

        preview.onerror = () => {
            container.textContent = '';
            container.style.display = 'none';
        };

        preview.src = imageUrl;
    }

    // Update current zone display
    updateCurrentZone(zone) {
        if (!zone) return;

        const zoneData = zone.attributes;
        const isUpcoming = zone.isUpcoming || false;

        const mapData = this.getSanitizedMapData(zoneData);

        // Update zone title to show "Upcoming" if it's not active
        const zoneTitle = document.querySelector('.zone-title');
        if (zoneTitle) {
            zoneTitle.innerHTML = isUpcoming 
                ? `Upcoming Zone: <span id="current-zone-name">${zoneData.name}</span>`
                : `Current Zone: <span id="current-zone-name">${zoneData.name}</span>`;
        } else if (this.elements.currentZoneName) {
            this.elements.currentZoneName.textContent = zoneData.name;
        }

        // Update or hide the LIVE badge
        const statusBadge = document.querySelector('.zone-status-badge');
        if (statusBadge) {
            if (isUpcoming) {
                statusBadge.innerHTML = '<span>UPCOMING</span>';
                statusBadge.classList.add('upcoming');
            } else {
                statusBadge.innerHTML = '<span class="zone-pulse"></span><span>LIVE</span>';
                statusBadge.classList.remove('upcoming');
            }
        }

        if (this.elements.currentZoneMap) {
            this.elements.currentZoneMap.textContent = zoneData.map_name || 'Zone Map';
        }

        if (this.elements.currentZoneDescription) {
            const sections = [];

            if (mapData) {
                sections.push(this.buildMapDetailsSection(zoneData, mapData));
            } else if (zoneData.map_info) {
                sections.push(this.buildMapInfoFallback(zoneData.map_info, zoneData));
            }

            const zoneSummary = this.getZoneSummary(zoneData, mapData);
            if (zoneSummary) {
                sections.push(`<div style="margin-top:${sections.length ? '1rem' : '0'};">${this.formatTournamentText(zoneSummary)}</div>`);
            }

            if (!sections.length) {
                sections.push('<p>No map information available.</p>');
            }

            this.elements.currentZoneDescription.innerHTML = sections.join('');
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
                        <span class="activity-time">${window.tournamentManager.formatTime(resultData.finish_time || resultData.lap_time)}</span>
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
                    <td colspan="6" class="loading-cell">No standings data available</td>
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
            const mapData = this.getSanitizedMapData(zoneData);
            const zoneSummary = this.getZoneSummary(zoneData, mapData);
            const metaHtml = this.buildZoneMeta(zoneData);

            let mapDetailsHtml = '';
            if (mapData) {
                mapDetailsHtml = this.buildMapDetailsSection(zoneData, mapData, { dense: true });
            } else if (zoneData.map_info) {
                mapDetailsHtml = this.buildMapInfoFallback(zoneData.map_info, zoneData);
            }

            if (!mapDetailsHtml) {
                mapDetailsHtml = '<div style="margin-top:0.75rem; font-size:0.85rem; color: var(--text-secondary);">Map details coming soon.</div>';
            }

            return `
                <div class="zone-card fade-in ${isActive ? 'active-zone' : ''}">
                    <div class="zone-header">
                        <h3>${zoneData.name}</h3>
                        ${isActive ? '<span class="active-badge">ACTIVE</span>' : ''}
                    </div>
                    <div class="zone-details">
                        ${metaHtml}
                        ${mapDetailsHtml}
                    </div>
                    ${zoneSummary ? `<div class="zone-description">${this.formatTournamentText(zoneSummary)}</div>` : ''}
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
                <div class="week-results-header">
                    <h3>Week ${week}</h3>
                    <span class="week-results-count">${weekResults.length} result${weekResults.length !== 1 ? 's' : ''}</span>
                </div>
                <div class="results-table-wrapper">
                    <table class="results-table">
                        <thead>
                            <tr>
                                <th>Pos</th>
                                <th>Player</th>
                                <th>Zone</th>
                                <th>Time</th>
                                <th>Points</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${weekResults.map(result => this.renderRaceResult(result)).join('')}
                        </tbody>
                    </table>
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
        const position = result.position || 1;
        const positionClass = position <= 3 ? `podium-${position}` : '';
        const positionBadge = position <= 3 ? 
            `<span class="position-badge ${positionClass}">${position}</span>` : 
            `<span class="position-number">${position}</span>`;
        
        const dateStr = result.raceDate ? new Date(result.raceDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        }) : '-';

        return `
            <tr class="${positionClass}">
                <td class="results-position">${positionBadge}</td>
                <td class="results-player">${result.player}</td>
                <td class="results-zone">${result.zone}</td>
                <td class="results-time">${window.tournamentManager.formatTime(result.finishTime || result.lapTime)}</td>
                <td class="results-points">+${result.pointsEarned}</td>
                <td class="results-date">${dateStr}</td>
            </tr>
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
        if (num === null || num === undefined || isNaN(num)) {
            return 'th';
        }
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

    getApiBaseUrl() {
        const { protocol, hostname, origin } = window.location;

        if (hostname === 'buggy-racing-tournament.loca.lt') {
            return 'https://buggy-racing-api.loca.lt';
        }

        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return `${protocol}//${hostname}:1337`;
        }

        return origin;
    }

    async showAPIDocumentation() {
        const apiBase = this.getApiBaseUrl();
        const docsUrl = `${apiBase}/api/docs`;

        // Try to open API docs directly
        try {
            const response = await fetch(docsUrl, { method: 'HEAD', mode: 'cors' });
            if (response.ok) {
                window.open(docsUrl, '_blank', 'noopener');
                return;
            }
        } catch (error) {
            // If HEAD fails, try GET
            try {
                const fallbackResponse = await fetch(docsUrl, { method: 'GET', mode: 'cors' });
                if (fallbackResponse.ok) {
                    window.open(docsUrl, '_blank', 'noopener');
                    return;
                }
            } catch (secondaryError) {
                // Fallback to direct navigation
                window.open(docsUrl, '_blank', 'noopener');
            }
        }
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
        // External tab triggers (buttons/links)
        if (this.elements.tabTriggers) {
            this.elements.tabTriggers.forEach(trigger => {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    const tabName = trigger.dataset.tabTarget;
                    if (tabName) {
                        this.switchTab(tabName);
                        const section = document.getElementById(tabName);
                        if (section) {
                            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }
                });
            });
        }

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
                // Use appropriate admin panel URL based on environment
                let adminUrl;
                if (window.location.hostname === 'buggy-racing-tournament.loca.lt' ||
                    window.location.hostname === 'nordicnode.github.io') {
                    adminUrl = 'https://buggy-racing-api.loca.lt/admin';
                } else {
                    adminUrl = window.location.origin + '/admin';
                }
                window.open(adminUrl, '_blank');
            });
        }

        // API docs link
        if (this.elements.apiDocs) {
            this.elements.apiDocs.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAPIDocumentation().catch((error) => {
                    console.warn('Failed to open API documentation.', error);
                    const fallback = `${this.getApiBaseUrl()}/api`;
                    window.open(fallback, '_blank', 'noopener');
                });
            });
        }
    }

    // Start countdown timer
    startCountdownTimer() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }

        // Immediate update so users see the latest value without delay
        this.updateCountdown();

        // Update countdown every second for a live experience
        this.countdownInterval = setInterval(() => {
            this.updateCountdown();
        }, 1000);
    }

    stopCountdownTimer() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }
}

// Create global UI manager
window.uiManager = new UIManager();