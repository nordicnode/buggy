# Ultimate Buggy Racing Tournament Manager

A web-based tournament management system for buggy lapping competitions. This application provides a complete solution for managing 8-week tournaments with zone-based racing, player standings, and points tracking.

## Features

- **Tournament Information**: Complete overview of the 8-week racing championship
- **Rules & Guidelines**: Clear tournament rules and code of conduct
- **Live Standings**: Real-time player rankings with total points
- **Points System**: Transparent points allocation for race positions
- **Zone Management**: Admin interface for managing race zones and maps
- **Player Management**: System for registering and managing tournament participants
- **Lap Time Recording**: Interface for recording and tracking lap times

## Tournament Structure

- **Duration**: 8 consecutive weeks
- **Format**: Point-based lapping championship
- **Schedule**: Weekly 4-hour events
- **Attempts**: Up to 3 attempts per event to set fastest lap time
- **Scoring**: Points awarded based on finishing position in each zone

## Points System

| Position | Points |
|----------|--------|
| 1st      | 10     |
| 2nd      | 9      |
| 3rd      | 8      |
| 4th      | 7      |
| 5th      | 6      |
| 6th      | 5      |
| 7th      | 4      |
| 8th      | 3      |
| 9th+     | 1      |

## File Structure

```
ultimate-buggy-racing/
├── index.html          # Main application file
├── data/
│   ├── players.json    # Player registration data
│   └── zones.json      # Zone configuration and results
└── README.md           # This documentation file
```

## Data Files

### players.json
Contains player registration information with the following structure:
```json
[
  {
    "name": "PlayerName",
    "zone": "Zone Assignment"
  }
]
```

### zones.json
Contains zone configuration and race results with the following structure:
```json
[
  {
    "name": "Zone Name",
    "results": ["Player1", "Player2", "Player3", ...]
  }
]
```

## Admin Features

Admin functionality is only available when running on localhost (for security reasons):

- **Zone Management**: Add/remove zones and maps
- **Player Management**: Register new participants
- **Lap Time Recording**: Record lap times for participants
- **Results Management**: Update race results and standings

## Installation & Usage

1. Clone or download this repository
2. Serve the files using a web server (required for JSON file loading)
3. Open `index.html` in your web browser
4. Admin features will be available when running on localhost

### Local Development

For local development with admin features enabled:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then access `http://localhost:8000` in your browser.

## Browser Compatibility

This application is compatible with modern web browsers that support:
- ES6 JavaScript features
- CSS Grid and Flexbox
- Fetch API for JSON data loading

## Technical Details

- **Frontend**: Pure HTML, CSS, and JavaScript (no frameworks required)
- **Data Storage**: JSON files for player and zone data
- **Styling**: Responsive CSS with mobile support
- **Admin Security**: Admin features restricted to localhost access

## Contributing

1. Make your changes to the appropriate files
2. Test thoroughly on localhost
3. Update this README if adding new features
4. Ensure all existing functionality remains intact

## Support

For questions about the tournament system, please contact Jen_007.

For technical issues with this application, please check:
1. Browser console for error messages
2. Ensure data files are properly formatted
3. Verify web server is running correctly
