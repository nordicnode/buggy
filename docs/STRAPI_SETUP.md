# Strapi Backend Setup Guide

## 🎯 Data Models for Tournament Management

### 1. Tournament Content Type
```javascript
{
  name: "tournament",
  attributes: {
    title: { type: "string", required: true },
    description: { type: "text" },
    start_date: { type: "datetime" },
    end_date: { type: "datetime" },
    status: {
      type: "enumeration",
      enum: ["upcoming", "active", "completed"]
    },
    total_weeks: { type: "integer", default: 8 },
    prizes: { type: "text" }
  }
}
```

### 2. Player Content Type
```javascript
{
  name: "player",
  attributes: {
    name: { type: "string", required: true },
    zone_assignment: { type: "string" },
    status: {
      type: "enumeration",
      enum: ["active", "inactive", "banned"]
    },
    total_points: { type: "integer", default: 0 },
    races_participated: { type: "integer", default: 0 },
    best_lap_time: { type: "string" },
    avatar: { type: "media" }
  }
}
```

### 3. Zone Content Type
```javascript
{
  name: "zone",
  attributes: {
    name: { type: "string", required: true },
    map_name: { type: "string" },
    description: { type: "text" },
    difficulty: {
      type: "enumeration",
      enum: ["beginner", "intermediate", "advanced", "expert"]
    },
    week_number: { type: "integer" },
    is_active: { type: "boolean", default: false },
    map_image: { type: "media" }
  }
}
```

### 4. Race Result Content Type
```javascript
{
  name: "race-result",
  attributes: {
    zone: { type: "relation", target: "zone" },
    player: { type: "relation", target: "player" },
    position: { type: "integer", required: true },
    points_earned: { type: "integer" },
    lap_time: { type: "string" },
    race_date: { type: "datetime" },
    week_number: { type: "integer" },
    notes: { type: "text" }
  }
}
```

### 5. Lap Time Content Type
```javascript
{
  name: "lap-time",
  attributes: {
    player: { type: "relation", target: "player" },
    zone: { type: "relation", target: "zone" },
    lap_time: { type: "string", required: true },
    attempt_number: { type: "integer" },
    recorded_at: { type: "datetime" },
    is_valid: { type: "boolean", default: true },
    notes: { type: "text" }
  }
}
```

## 🛠️ API Endpoints

### Public APIs
```
GET /api/tournaments               # Get tournament info
GET /api/players                   # Get all players
GET /api/zones                     # Get all zones
GET /api/race-results              # Get race results
GET /api/lap-times                 # Get lap times
```

### Relations & Population
```javascript
// Get zones with race results
GET /api/zones?populate=race-results&populate=race-results.player

// Get players with their race results
GET /api/players?populate=race-results&populate=race-results.zone

// Get tournament standings (calculated)
GET /api/players?populate=race-results&sort=total_points:desc
```

## 🎮 Content Management Features

### Admin Interface Features
- **Tournament Dashboard**: Overview of current status
- **Player Management**: Add/edit/remove players
- **Zone Configuration**: Setup weekly zones
- **Race Results Entry**: Input finishing orders
- **Lap Time Recording**: Track detailed timing
- **Standings Calculation**: Automatic point totals
- **Media Management**: Upload zone images and player avatars

### Workflow
1. **Setup Tournament**: Configure season details
2. **Register Players**: Add participants and assign zones
3. **Configure Zones**: Setup weekly tracks
4. **Enter Race Results**: Input finishing positions
5. **Record Lap Times**: Detailed timing data
6. **Publish Changes**: Make data live on website

## 🔧 Configuration Settings

### API Permissions
- **Public**: Read access to tournaments, players, zones, results
- **Admin**: Full CRUD access to all content types
- **Authenticated**: Limited access for specific operations

### Media Settings
- **Avatar Upload**: Player profile pictures
- **Map Images**: Zone track layouts
- **Documentation**: Additional tournament assets

### Customization
- **Points System**: Configurable position points
- **Tournament Structure**: Flexible week/zone counts
- **Validation Rules**: Data integrity checks
- **Workflows**: Approval processes for content