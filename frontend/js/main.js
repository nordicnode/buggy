// Main Application Entry Point
class TournamentApp {
    constructor() {
        this.isInitialized = false;
        this.refreshInterval = null;
    }

    // Initialize the application
    async initialize() {
        try {
            console.log('🏁 Initializing Ultimate Buggy Racing Tournament System...');

            // Set up UI event listeners first
            window.uiManager.setupEventListeners();

            // Initialize tournament data
            const apiConnected = await window.tournamentManager.initialize();

            // Update UI with loaded data
            this.updateUI();

            // Set up auto-refresh
            this.startAutoRefresh();

            // Hide loading screen
            window.uiManager.hideLoading();

            this.isInitialized = true;

            console.log(`✅ Tournament system initialized successfully!`);
            console.log(`📊 API Status: ${apiConnected ? 'Connected to Strapi' : 'Using mock data'}`);

            // Start countdown timer
            window.uiManager.startCountdownTimer();

        } catch (error) {
            console.error('❌ Failed to initialize tournament system:', error);
            window.uiManager.hideLoading();
            this.showError('Failed to load tournament data. Please refresh the page.');
        }
    }

    // Update all UI components
    updateUI() {
        const tournament = window.tournamentManager.tournament;
        const stats = window.tournamentManager.getStatistics();
        const currentZone = window.tournamentManager.getCurrentZone();
        const recentResults = window.tournamentManager.recentResults;

        // Update overview section
        window.uiManager.updateOverview(tournament, stats, currentZone);
        window.uiManager.updateRecentResults(recentResults);

        // Update zone filter options
        window.uiManager.updateZoneFilter();

        // Update current active tab
        window.uiManager.onTabSwitch(window.uiManager.currentTab);
    }

    // Start auto-refresh
    startAutoRefresh() {
        // Refresh data every 5 minutes
        this.refreshInterval = setInterval(async () => {
            try {
                await window.tournamentManager.refresh();
                this.updateUI();
                console.log('🔄 Tournament data refreshed');
            } catch (error) {
                console.warn('⚠️ Failed to refresh tournament data:', error);
            }
        }, 5 * 60 * 1000); // 5 minutes
    }

    // Stop auto-refresh
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    // Show error message
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-toast';
        errorDiv.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-message">${message}</span>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #DC2626;
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(220, 38, 38, 0.3);
            z-index: 9999;
            max-width: 400px;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(errorDiv);

        // Animate in
        setTimeout(() => {
            errorDiv.style.transform = 'translateX(0)';
        }, 100);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    document.body.removeChild(errorDiv);
                }, 300);
            }
        }, 10000);
    }

    // Show success message
    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-toast';
        successDiv.innerHTML = `
            <div class="success-content">
                <span class="success-icon">✅</span>
                <span class="success-message">${message}</span>
                <button class="success-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10B981;
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
            z-index: 9999;
            max-width: 400px;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(successDiv);

        // Animate in
        setTimeout(() => {
            successDiv.style.transform = 'translateX(0)';
        }, 100);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (successDiv.parentElement) {
                successDiv.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    document.body.removeChild(successDiv);
                }, 300);
            }
        }, 5000);
    }

    // Handle connection status
    handleConnectionChange() {
        if (navigator.onLine) {
            this.showSuccess('Connection restored');
            // Refresh data when coming back online
            this.initialize();
        } else {
            this.showError('Connection lost. Some features may be unavailable.');
        }
    }

    // Cleanup
    destroy() {
        this.stopAutoRefresh();
        this.isInitialized = false;
    }
}

// Create global app instance
window.tournamentApp = new TournamentApp();

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.tournamentApp.initialize();
});

// Handle connection changes
window.addEventListener('online', () => {
    window.tournamentApp.handleConnectionChange();
});

window.addEventListener('offline', () => {
    window.tournamentApp.handleConnectionChange();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.tournamentApp.isInitialized) {
        // Refresh data when page becomes visible again
        window.tournamentManager.refresh().then(() => {
            window.tournamentApp.updateUI();
        });
    }
});

// Add custom CSS for dynamic elements
const style = document.createElement('style');
style.textContent = `
    .error-toast, .success-toast {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 14px;
        font-weight: 500;
    }

    .error-content, .success-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .error-icon, .success-icon {
        font-size: 18px;
        flex-shrink: 0;
    }

    .error-message, .success-message {
        flex: 1;
        line-height: 1.4;
    }

    .error-close, .success-close {
        background: none;
        border: none;
        color: inherit;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        opacity: 0.8;
        transition: opacity 0.2s;
    }

    .error-close:hover, .success-close:hover {
        opacity: 1;
    }

    .player-status {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
    }

    .player-status.active {
        background: #D1FAE5;
        color: #065F46;
    }

    .player-status.inactive {
        background: #F3F4F6;
        color: #6B7280;
    }

    .player-status.banned {
        background: #FEE2E2;
        color: #991B1B;
    }

    .active-zone {
        border-color: var(--primary-red) !important;
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
    }

    .active-badge {
        background: var(--primary-red);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .leader-row {
        background: linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(220, 38, 38, 0.02) 100%);
        border-left: 4px solid var(--primary-red);
    }

    .race-result-card {
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: var(--space-lg);
        display: flex;
        align-items: center;
        gap: var(--space-lg);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .race-result-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }

    .race-position {
        font-size: 2rem;
        font-weight: 900;
        width: 60px;
        text-align: center;
        flex-shrink: 0;
    }

    .race-details h4 {
        margin: 0 0 var(--space-xs) 0;
        color: var(--text-primary);
        font-size: 1.125rem;
    }

    .race-details p {
        margin: 0 0 var(--space-xs) 0;
        color: var(--text-secondary);
        font-size: 0.875rem;
    }

    .race-time {
        font-family: var(--font-mono);
        font-weight: 600;
        color: var(--primary-red) !important;
    }

    .race-points {
        font-family: var(--font-mono);
        font-weight: 700;
        font-size: 1.125rem;
        color: var(--primary-red);
        margin-left: auto;
        flex-shrink: 0;
    }

    .week-results {
        margin-bottom: var(--space-xl);
    }

    .week-results h3 {
        color: var(--primary-red);
        margin-bottom: var(--space-lg);
        font-size: 1.5rem;
    }

    .week-results-grid {
        display: grid;
        gap: var(--space-lg);
    }

    .activity-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--space-sm);
    }

    .activity-position {
        font-size: 1.25rem;
        font-weight: 700;
        font-family: var(--font-mono);
    }

    .activity-player {
        font-weight: 600;
        color: var(--text-primary);
    }

    .activity-details {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--space-sm);
        font-size: 0.875rem;
    }

    .activity-zone {
        color: var(--text-secondary);
    }

    .activity-time {
        font-family: var(--font-mono);
        font-weight: 600;
        color: var(--primary-red);
    }

    .activity-meta {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        color: var(--text-light);
    }

    .activity-points {
        font-weight: 600;
        color: var(--primary-red);
    }

    .player-name {
        font-weight: 600;
    }

    .player-zone {
        color: var(--text-secondary);
        font-size: 0.875rem;
    }

    .races-count {
        font-family: var(--font-mono);
        color: var(--text-secondary);
    }

    .best-position {
        font-family: var(--font-mono);
        color: var(--text-secondary);
    }
`;

document.head.appendChild(style);

// Export for debugging
window.DEBUG = {
    tournamentAPI: window.tournamentAPI,
    tournamentManager: window.tournamentManager,
    uiManager: window.uiManager,
    tournamentApp: window.tournamentApp
};