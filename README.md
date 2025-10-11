# 🏁 Ultimate Buggy Racing Tournament Management System

A professional tournament management system built with modern web technologies and Vercel-ready deployment.

## 🏗️ Architecture

- **Backend**: Express.js API with serverless functions
- **Frontend**: Responsive HTML/CSS/JavaScript
- **Deployment**: Optimized for Vercel hosting
- **API**: REST APIs connecting backend to frontend

## 📁 Project Structure

```
ultimate-buggy-racing/
├── api/              # Serverless API functions for Vercel
│   └── index.js     # Main API server
├── frontend/         # Tournament website frontend
│   ├── css/          # Stylesheets (multiple versions)
│   ├── js/           # JavaScript functionality
│   └── index.html    # Main tournament page
├── backend/          # Local development server
│   └── server.js     # Express development server
├── docs/             # Documentation
├── vercel.json       # Vercel deployment configuration
├── package.json      # Dependencies and scripts
└── README.md         # This file
```

## 🎯 Tournament Features

### API Backend (Express/Serverless)
- **Tournament Management**: Complete tournament data
- **Player Registration**: Racer profiles and statistics
- **Zone Management**: Track configurations and results
- **Race Results**: Finishing orders and point calculations
- **Admin Authentication**: Secure admin access
- **Real-time Updates**: Live scoring and standings

### Public Display (Frontend)
- **Tournament Information**: Event details and rules
- **Current Standings**: Leaderboard with points
- **Zone Information**: Track details and schedules
- **Race Results**: Historical results and statistics
- **Professional Design**: Clean, organized layout
- **Responsive Design**: Mobile-friendly interface

## 🚀 Quick Start

### Local Development

1. **Backend Setup**:
   ```bash
   cd backend
   npm start
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   python -m http.server 8000
   ```

3. **Access Points**:
   - Local API: http://localhost:1337/api
   - Tournament Site: http://localhost:8000

### Vercel Deployment

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Your Site**: https://ultimate-buggy-racing.vercel.app

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

- **Express.js**: Backend API server
- **HTML5/CSS3**: Modern web standards
- **JavaScript**: Dynamic frontend functionality
- **Vercel**: Serverless deployment platform
- **Node.js**: JavaScript runtime
- **REST API**: Standard web API protocols

## 📋 Tournament Structure

- **8-Week Championship**: Season-based tournament
- **8 Unique Zones**: Different track configurations
- **Point-Based Ranking**: Consistent performance rewards
- **Race Results**: Weekly event tracking
- **Player Statistics**: Individual performance metrics

## 🎨 Design Features

- **Professional Layout**: Clean, organized sections
- **Racing Theme**: Motorsport-inspired design
- **Clear Typography**: Easy-to-read standings and results
- **Interactive Elements**: Engaging user interface
- **Mobile Optimized**: Works on all devices
- **Modern CSS**: Professional color palette and spacing

## 🔧 Configuration

### Environment Variables
- `ADMIN_PASSWORD`: Admin authentication password
- `NODE_ENV`: Environment (development/production)

### Vercel Configuration
The `vercel.json` file handles:
- API routing to serverless functions
- Static file serving
- Build configuration
- Function timeouts

## 📊 API Endpoints

- `GET /api/tournaments` - Tournament information
- `PUT /api/tournaments/:id` - Update tournament
- `GET /api/players` - Player data
- `GET /api/zones` - Zone information
- `GET /api/race-results` - Race results
- `POST/PUT/DELETE` - Admin endpoints (authenticated)

## 🌐 Deployment Features

- **Free SSL Certificate**: HTTPS by default
- **Global CDN**: Fast worldwide performance
- **Automatic Deployments**: Git integration
- **Serverless Functions**: Scalable backend
- **Custom Domain**: Support for personal domains

## 🔐 Security

- **Admin Authentication**: Bearer token protection
- **CORS Configuration**: Secure cross-origin requests
- **Environment Variables**: Secure credential storage
- **HTTPS Only**: Encrypted connections in production

## 📈 Monitoring

- **Vercel Analytics**: Performance metrics
- **Function Logs**: API monitoring
- **Usage Statistics**: Bandwidth and requests
- **Error Tracking**: Automatic error reporting

---

**🏁 Built for Ultimate Buggy Racing Tournament Management**