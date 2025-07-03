# Disaster Eye Earth Engine 🌍🛰️

A comprehensive disaster monitoring and analysis platform integrating Google Earth Engine with AI-powered natural language processing for real-time geospatial disaster assessment.

![Demo](https://img.shields.io/badge/Status-Ready_for_Setup-green)
![Frontend](https://img.shields.io/badge/Frontend-React_TypeScript-blue)
![Backend](https://img.shields.io/badge/Backend-Python_FastAPI-green)
![Earth Engine](https://img.shields.io/badge/Data-Google_Earth_Engine-orange)
![AI](https://img.shields.io/badge/AI-OpenAI_GPT-purple)

## 🚀 Features

### 🛰️ Real-time Satellite Analysis
- **Sentinel-1 SAR Data**: Flood detection and water body mapping
- **Sentinel-2 Optical**: Vegetation analysis and built-up area detection  
- **SRTM Elevation**: Topographic analysis for flood risk assessment
- **Live Data Streaming**: Real-time satellite imagery processing

### 🤖 AI-Powered Analysis
- **Natural Language Queries**: Ask questions in plain English
- **GPT Integration**: AI-powered interpretation and insights
- **Automated Reporting**: Generate comprehensive analysis reports
- **Smart Recommendations**: Context-aware suggested actions

### 📊 Comprehensive Assessments
- **Flood Vulnerability Analysis**: Real-time flood risk mapping
- **Building Damage Assessment**: Infrastructure impact evaluation
- **Social Vulnerability Index**: Community risk factor analysis
- **Critical Infrastructure Mapping**: Essential services vulnerability

### 🎯 Interactive Interface
- **Click-to-Analyze**: Point-and-click disaster analysis
- **Real-time Visualization**: Live satellite layer switching
- **Responsive Design**: Works on desktop and mobile
- **Status Indicators**: Real-time API connection monitoring

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React/TS      │    │  Python FastAPI  │    │ Google Earth    │
│   Frontend      │◄──►│    Backend       │◄──►│    Engine       │
│   (Port 8080)   │    │   (Port 8000)    │    │   Satellite     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        ▼                        │
         │              ┌──────────────────┐               │
         │              │    OpenAI GPT    │               │
         └──────────────┤   AI Processing  │◄──────────────┘
                        └──────────────────┘
```

## 🛠️ Quick Setup

### Prerequisites
- Node.js 18+
- Python 3.8+
- Google Earth Engine Account
- OpenAI API Key (optional)

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd disaster-eye-earth-engine
npm install
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your Google Earth Engine and OpenAI credentials
```

### 3. Frontend Setup
```bash
# Copy and configure environment  
cp .env.example .env
# Edit .env with your backend URL (default: http://localhost:8000)
```

### 4. Google Earth Engine Authentication

**Option A: Service Account (Recommended)**
1. Create a Google Cloud Project
2. Enable Earth Engine API
3. Create service account and download JSON key
4. Place `service-account-key.json` in `backend/` directory

**Option B: Personal Account**
```bash
earthengine authenticate
```

### 5. Start Development Servers
```bash
# Start both frontend and backend
npm run dev:both

# Or start separately:
npm run dev:backend  # Backend on port 8000
npm run dev          # Frontend on port 8080
```

## 🔧 Configuration

### Backend Environment (`backend/.env`)
```env
# Google Earth Engine
EE_SERVICE_ACCOUNT=your-service-account@project.iam.gserviceaccount.com
EE_PRIVATE_KEY_PATH=service-account-key.json

# OpenAI (optional)
OPENAI_API_KEY=sk-your-openai-key

# API Settings
API_HOST=0.0.0.0
API_PORT=8000
FRONTEND_URL=http://localhost:8080
```

### Frontend Environment (`.env`)
```env
VITE_API_URL=http://localhost:8000
```

## 📖 Usage

### 1. Natural Language Queries
Type questions like:
- "What is the flood vulnerability in Tamil Nadu?"
- "Analyze building damage in the selected area"
- "Show me social vulnerability for this region"

### 2. Interactive Map Analysis
- Click anywhere on the map to analyze that location
- Toggle between different satellite layers
- Use drawing tools for area analysis

### 3. Real-time Monitoring
- Monitor API connection status (green = connected)
- View live satellite data processing
- Get instant analysis results

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | API health check |
| `/api/earth-engine/query` | POST | Process natural language queries |
| `/api/earth-engine/analyze-location` | POST | Analyze specific coordinates |
| `/api/earth-engine/map-layers` | GET | Get satellite map layers |
| `/api/earth-engine/flood-analysis` | GET | Flood vulnerability analysis |
| `/api/earth-engine/building-analysis` | GET | Building damage assessment |

## 📊 Data Sources

- **Copernicus Sentinel-1**: SAR data for flood detection
- **Copernicus Sentinel-2**: Optical imagery for land cover analysis
- **SRTM Global**: Digital elevation model for topographic analysis
- **Google Earth Engine**: Cloud-based planetary-scale geospatial analysis

## 🎨 Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- ShadCN UI components
- Tailwind CSS for styling
- React Query for state management

### Backend  
- FastAPI for high-performance APIs
- Google Earth Engine Python API
- OpenAI GPT for natural language processing
- Pydantic for data validation
- CORS middleware for cross-origin requests

## 🔄 Development Workflow

### Adding New Analysis Types
1. Implement in `backend/services/earth_engine_service.py`
2. Add API endpoint in `backend/main.py`
3. Update frontend API client in `src/services/earthEngineAPI.ts`
4. Add UI components for data visualization

### Customizing AI Responses
1. Modify intent extraction in `backend/services/ai_service.py`
2. Add new query patterns and response templates
3. Update confidence scoring and suggested actions

## 🌍 Use Cases

### Disaster Response
- **Emergency Planning**: Identify vulnerable areas before disasters
- **Real-time Assessment**: Monitor disaster impact as it happens  
- **Resource Allocation**: Optimize emergency response deployment
- **Recovery Planning**: Assess damage for reconstruction priorities

### Research & Analysis
- **Climate Studies**: Long-term vulnerability trend analysis
- **Urban Planning**: Infrastructure resilience assessment
- **Risk Modeling**: Predictive disaster impact modeling
- **Policy Making**: Evidence-based disaster management policies

## 🚀 Deployment

### Backend (Production)
```bash
# Install dependencies
pip install -r requirements.txt

# Set production environment variables
export EE_SERVICE_ACCOUNT="your-production-service-account"
export OPENAI_API_KEY="your-production-openai-key"

# Run with production server
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend (Production)
```bash
# Build for production
npm run build

# Deploy dist/ folder to your hosting service
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is for educational and research purposes. Please ensure compliance with:
- Google Earth Engine Terms of Service
- OpenAI API Terms of Use  
- Satellite data usage policies

## 🆘 Support

For detailed setup instructions, see [SETUP.md](./SETUP.md)

For issues and questions:
1. Check the troubleshooting section in SETUP.md
2. Search existing GitHub issues
3. Create a new issue with detailed description

## 🙏 Acknowledgments

- Google Earth Engine for planetary-scale geospatial analysis
- Copernicus Program for Sentinel satellite data
- OpenAI for natural language processing capabilities
- React and FastAPI communities for excellent frameworks

---

**Built with ❤️ for disaster resilience and community safety**
