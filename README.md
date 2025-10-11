# 🏁 Ultimate Buggy Racing Tournament Management System

A professional tournament management system built with Strapi CMS and a responsive frontend.

## 🏗️ Architecture

- **Backend**: Strapi CMS (Content Management)
- **Frontend**: Static HTML/CSS/JavaScript (Tournament Display)
- **Database**: SQLite (development) / PostgreSQL (production)
- **API**: REST APIs connecting backend to frontend

## 📁 Project Structure

```
ultimate-buggy-racing/
├── backend/           # Strapi CMS backend
│   ├── api/          # API endpoints & content types
│   ├── config/       # Strapi configuration
│   └── ...
├── frontend/         # Tournament website frontend
│   ├── css/          # Stylesheets
│   ├── js/           # JavaScript functionality
│   ├── images/       # Static assets
│   └── index.html    # Main tournament page
├── docs/             # Documentation
└── README.md         # This file
```

## 🎯 Tournament Features

### Content Management (Strapi)
- **Tournament Management**: Seasons, events, dates
- **Player Registration**: Racer profiles and assignments
- **Zone Management**: Track configurations and results
- **Race Results**: Finishing orders and point calculations
- **Lap Times**: Detailed timing records
- **Live Scoring**: Real-time updates

### Public Display (Frontend)
- **Tournament Information**: Event details and rules
- **Current Standings**: Leaderboard with points
- **Zone Information**: Track details and schedules
- **Race Results**: Historical results and statistics
- **Responsive Design**: Mobile-friendly interface

## 🚀 Quick Start

### Development Setup

1. **Backend Setup**:
   ```bash
   cd backend
   npx create-strapi-app@latest . --quickstart --no-run
   npm run develop
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   python -m http.server 8000
   ```

3. **Access Points**:
   - Strapi Admin: http://localhost:1337/admin
   - Tournament Site: http://localhost:8000
   - API Documentation: http://localhost:1337/documentation

### Tournament Data Flow

1. **Content Creation**: Admins manage data via Strapi admin panel
2. **API Publishing**: Strapi exposes REST APIs for all content
3. **Frontend Consumption**: Tournament site fetches data via API
4. **Real-time Updates**: Changes appear instantly on the website

## 🏆 Points System

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

## 🛠️ Technology Stack

- **Strapi**: Headless CMS for content management
- **HTML5/CSS3**: Modern web standards
- **JavaScript**: Dynamic frontend functionality
- **Responsive Design**: Mobile-first approach
- **REST API**: Standard web API protocols

## 📋 Tournament Structure

- **8-Week Championship**: Season-based tournament
- **8 Unique Zones**: Different track configurations
- **Point-Based Ranking**: Consistent performance rewards
- **Race Results**: Weekly event tracking
- **Player Statistics**: Individual performance metrics

## 🎨 Design Features

- **Racing Theme**: Motorsport-inspired design
- **Flag Colors**: Checkered patterns and racing aesthetics
- **Clear Typography**: Easy-to-read standings and results
- **Interactive Elements**: Engaging user interface
- **Mobile Optimized**: Works on all devices