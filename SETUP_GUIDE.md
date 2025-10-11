# 🏁 Ultimate Buggy Racing Tournament - Complete Setup Guide

## 📋 Overview

A professional tournament management system built with **Strapi CMS** backend and a modern responsive frontend. Perfect for managing 8-week racing championships with real-time scoring and comprehensive content management.

## 🏗️ Architecture

```
ultimate-buggy-racing/
├── backend/           # Strapi CMS (Content Management)
├── frontend/          # Tournament Website (Public Display)
├── docs/              # Documentation
└── SETUP_GUIDE.md     # This file
```

## 🚀 Quick Setup

### 1. Backend Setup (Strapi CMS)

```bash
# Navigate to backend directory
cd backend

# Create new Strapi project
npx create-strapi-app@latest . --quickstart --no-run

# Start development server
npm run develop
```

**Access Strapi Admin:** http://localhost:1337/admin

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Start development server
python -m http.server 8000
# OR
npx http-server
# OR
php -S localhost:8000
```

**Access Tournament Site:** http://localhost:8000

### 3. Configure Content Types

Follow these steps in Strapi Admin:

#### A. Tournament Content Type
1. Go to **Content-Type Builder**
2. Click **+ Create new collection type**
3. **Name**: `tournament` (singular)
4. **Display Name**: `Tournaments` (plural)
5. **Add Fields**:
   - `title` (Text, Short, Required)
   - `description` (Rich Text)
   - `start_date` (Date, Required)
   - `end_date` (Date, Required)
   - `status` (Enumeration: upcoming, active, completed)
   - `total_weeks` (Number, Integer, Default: 8)
   - `prizes` (Rich Text)

#### B. Player Content Type
1. **Name**: `player`
2. **Display Name**: `Players`
3. **Add Fields**:
   - `name` (Text, Short, Required)
   - `zone_assignment` (Text, Short)
   - `status` (Enumeration: active, inactive, banned)
   - `total_points` (Number, Integer, Default: 0)
   - `races_participated` (Number, Integer, Default: 0)
   - `best_lap_time` (Text, Short)
   - `avatar` (Media, Single)

#### C. Zone Content Type
1. **Name**: `zone`
2. **Display Name**: `Zones`
3. **Add Fields**:
   - `name` (Text, Short, Required)
   - `map_name` (Text, Short)
   - `description` (Rich Text)
   - `difficulty` (Enumeration: beginner, intermediate, advanced, expert)
   - `week_number` (Number, Integer)
   - `is_active` (Boolean, Default: false)
   - `map_image` (Media, Single)

#### D. Race Result Content Type
1. **Name**: `race-result`
2. **Display Name**: `Race Results`
3. **Add Fields**:
   - `zone` (Relation, with Zone)
   - `player` (Relation, with Player)
   - `position` (Number, Integer, Required)
   - `points_earned` (Number, Integer)
   - `lap_time` (Text, Short)
   - `race_date` (Date)
   - `week_number` (Number, Integer)
   - `notes` (Rich Text)

#### E. Lap Time Content Type
1. **Name**: `lap-time`
2. **Display Name**: `Lap Times`
3. **Add Fields**:
   - `player` (Relation, with Player)
   - `zone` (Relation, with Zone)
   - `lap_time` (Text, Short, Required)
   - `attempt_number` (Number, Integer)
   - `recorded_at` (Date)
   - `is_valid` (Boolean, Default: true)
   - `notes` (Rich Text)

### 4. Configure Permissions

1. Go to **Settings → Users & Permissions → Roles**
2. Click on **Public**
3. Set permissions:
   - **Tournament**: Find, findOne
   - **Players**: Find, findOne
   - **Zones**: Find, findOne
   - **Race Results**: Find, findOne
   - **Lap Times**: Find, findOne
4. Save

## 📝 Adding Initial Data

### 1. Create Tournament
1. Go to **Content Manager → Tournaments**
2. Click **+ Create new entry**
3. Fill in tournament details:
   - Title: "Ultimate Buggy Racing Championship"
   - Description: "8-week tournament featuring the best buggy racers..."
   - Start Date: 2025-10-18
   - End Date: 2025-12-06
   - Status: "active"
   - Total Weeks: 8
4. Click **Save** → **Publish**

### 2. Add Zones
Create 8 zones (one for each week):
1. Go to **Content Manager → Zones**
2. Create zones with these settings:
   - **Week 1**: "Zone 1 - Starting Circuit" (beginner)
   - **Week 2**: "Zone 2 - Technical Twists" (intermediate)
   - **Week 3**: "Zone 3 - Speed Straight" (beginner)
   - **Week 4**: "Zone 4 - Precision Path" (advanced)
   - **Week 5**: "Zone 5 - Rapid Rapids" (intermediate)
   - **Week 6**: "Zone 6 - Endurance Loop" (advanced)
   - **Week 7**: "Zone 7 - Final Sprint" (intermediate)
   - **Week 8**: "Zone 8 - Championship Chase" (expert)
3. Set current week's zone to **is_active: true**

### 3. Add Players
1. Go to **Content Manager → Players**
2. Add tournament participants
3. Assign initial zones

### 4. Add Race Results
1. Go to **Content Manager → Race Results**
2. Add results for completed races
3. System will automatically calculate points

## 🎯 Points System

The system automatically awards points based on finishing position:
- 1st Place: 10 points
- 2nd Place: 9 points
- 3rd Place: 8 points
- 4th Place: 7 points
- 5th Place: 6 points
- 6th Place: 5 points
- 7th Place: 4 points
- 8th Place: 3 points
- 9th+: 1 point

## 🔄 Workflow

### Weekly Tournament Management
1. **Before Race**: Set current zone as active
2. **During Race**: Record lap times in real-time
3. **After Race**: Enter race results (finishing order)
4. **Automatic**: System calculates standings and points
5. **Next Week**: Set next zone as active

### Content Management
1. **Strapi Admin**: http://localhost:1337/admin
2. **Tournament Site**: http://localhost:8000
3. **API Documentation**: http://localhost:1337/documentation

## 🛠️ Features

### Backend (Strapi)
- ✅ **Content Management**: Full CRUD for all tournament data
- ✅ **Media Library**: Upload zone maps and player avatars
- ✅ **Role-Based Access**: Public read access, admin full control
- ✅ **API Generation**: Automatic REST API endpoints
- ✅ **Real-time Updates**: Changes appear instantly on frontend

### Frontend (Tournament Site)
- ✅ **Responsive Design**: Works on all devices
- ✅ **Live Standings**: Real-time tournament leaderboard
- ✅ **Zone Information**: Track details and schedules
- ✅ **Race Results**: Historical data and statistics
- ✅ **Player Profiles**: Individual statistics and performance
- ✅ **Auto-refresh**: Data updates every 5 minutes

## 🎨 Design Features

- **Racing Theme**: Professional motorsport aesthetic
- **Real-time Updates**: Live scoring and countdown timers
- **Mobile Responsive**: Optimized for all screen sizes
- **Smooth Animations**: Polished user experience
- **Accessibility**: WCAG compliant design

## 🔧 Customization

### Modify Points System
Edit `frontend/js/tournament.js` → `getPointsForPosition()` method

### Add New Fields
1. Add fields in Strapi Content-Type Builder
2. Update frontend JavaScript to handle new data
3. Update CSS for new display elements

### Customize Design
Edit `frontend/css/styles.css` to modify colors, fonts, and layout

## 🚀 Deployment

### Frontend (Netlify)
1. Push frontend code to GitHub
2. Connect repository to Netlify
3. Deploy from `frontend/` directory

### Backend (Strapi)
1. Deploy Strapi to Heroku, DigitalOcean, or AWS
2. Update frontend API URL in `frontend/js/api.js`
3. Configure production database

## 📞 Support

- **Strapi Documentation**: https://docs.strapi.io
- **Frontend Issues**: Check browser console for errors
- **API Issues**: Check Strapi logs and network requests
- **Setup Problems**: Verify Strapi permissions and content types

## 🎉 You're Ready!

Once setup is complete:
1. **Admins** manage content via Strapi Admin Panel
2. **Players** view standings and results on tournament website
3. **Everyone** enjoys real-time updates and professional presentation

Happy racing! 🏁