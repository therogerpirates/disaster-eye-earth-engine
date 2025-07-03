from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
import uvicorn
from datetime import datetime, timedelta
import json
import os

from config import config
from models.data_models import (
    QueryRequest, LocationAnalysisRequest, AnalysisResponse, 
    MapLayersResponse, RegionalAnalysisRequest, Coordinates
)
from services.geospatial_service import geospatial_service

# Initialize FastAPI app
app = FastAPI(
    title="Disaster Eye Earth Engine API",
    description="Geospatial disaster analysis using Google Earth Engine and AI",
    version="1.0.0"
)

# Initialize app state for storing maps
class AppState:
    def __init__(self):
        self.current_maps = {}

app.state = AppState()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        config.FRONTEND_URL, 
        "http://localhost:3000", 
        "http://localhost:8080",
        "http://localhost:8081",  # Add the actual frontend port
        "file://",  # Allow file:// URLs for local debugging
        "*"  # Allow all origins temporarily for debugging
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """API health check"""
    return {
        "message": "Disaster Eye Earth Engine API",
        "status": "active",
        "timestamp": datetime.now().isoformat(),
        "earth_engine_status": geospatial_service.ee_service.initialized
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "api_status": "healthy",
        "earth_engine_initialized": geospatial_service.ee_service.initialized,
        "ai_service_available": geospatial_service.ai_service.available,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/earth-engine/query", response_model=AnalysisResponse)
async def process_natural_query(request: QueryRequest):
    """Process natural language query with optional location"""
    
    try:
        if request.coordinates:
            # Process location-based query
            result = geospatial_service.process_location_query(
                lat=request.coordinates.lat,
                lng=request.coordinates.lng,
                query=request.query
            )
        else:
            # Process general query without specific location
            ai_analysis = geospatial_service.ai_service.process_natural_query(request.query)
            result = {
                'timestamp': datetime.now().isoformat(),
                'status': 'completed',
                'ai_analysis': ai_analysis,
                'coordinates': {'lat': config.DEFAULT_LAT, 'lng': config.DEFAULT_LNG}
            }
        
        return AnalysisResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query processing failed: {str(e)}")

@app.post("/api/earth-engine/analyze-location")
async def analyze_location(request: LocationAnalysisRequest):
    """Analyze specific location for disaster vulnerability"""
    
    try:
        result = geospatial_service.process_location_query(
            lat=request.coordinates.lat,
            lng=request.coordinates.lng,
            query="Comprehensive disaster vulnerability analysis" if request.include_ai else None
        )
        
        return AnalysisResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Location analysis failed: {str(e)}")

@app.get("/api/earth-engine/map-layers")
async def get_map_layers(lat: float = config.DEFAULT_LAT, lng: float = config.DEFAULT_LNG, zoom: int = 10):
    """Get Earth Engine map layers for visualization"""
    
    try:
        result = geospatial_service.get_map_layers(lat, lng, zoom)
        return MapLayersResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get map layers: {str(e)}")

@app.post("/api/earth-engine/regional-analysis")
async def analyze_region(request: RegionalAnalysisRequest):
    """Analyze a rectangular region for disaster risk"""
    
    try:
        result = geospatial_service.get_regional_analysis(
            bounds=request.bounds.dict(),
            analysis_type=request.analysis_type
        )
        
        return AnalysisResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Regional analysis failed: {str(e)}")

@app.get("/api/earth-engine/flood-analysis")
async def get_flood_analysis(lat: float, lng: float, radius: float = 5000):
    """Get flood analysis for specific coordinates"""
    
    try:
        if not geospatial_service.ee_service.initialized:
            raise HTTPException(status_code=503, detail="Earth Engine not initialized")
        
        result = geospatial_service.ee_service.get_flood_analysis(lat, lng, radius)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Flood analysis failed: {str(e)}")

@app.get("/api/earth-engine/building-analysis")
async def get_building_analysis(lat: float, lng: float, radius: float = 2000):
    """Get building analysis for specific coordinates"""
    
    try:
        if not geospatial_service.ee_service.initialized:
            raise HTTPException(status_code=503, detail="Earth Engine not initialized")
        
        result = geospatial_service.ee_service.get_building_analysis(lat, lng, radius)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Building analysis failed: {str(e)}")

@app.get("/api/earth-engine/test-map")
async def get_test_map():
    """Get Earth Engine test map data for frontend visualization"""
    
    try:
        # Check if test results file exists
        test_file = "earth_engine_test_results.json"
        if os.path.exists(test_file):
            with open(test_file, 'r') as f:
                test_data = json.load(f)
            return test_data
        
        # If no test file, generate simple map data
        from services.earth_engine_service import EarthEngineService
        ee_service = EarthEngineService()
        
        if not ee_service.initialized:
            return {
                "status": "error",
                "message": "Earth Engine not initialized",
                "mock_data": True
            }
        
        # Generate basic map visualization
        import ee
        
        # Coimbatore region
        lat, lng = 11.0168, 76.9558
        point = ee.Geometry.Point([lng, lat])
        region = point.buffer(10000)
        
        # Get elevation data
        elevation = ee.Image('USGS/SRTMGL1_003').clip(region)
        
        # Generate map tile URL
        map_id = elevation.getMapId({
            'min': 0, 
            'max': 1000, 
            'palette': ['blue', 'green', 'yellow', 'red']
        })
        
        return {
            "status": "success",
            "earth_engine_connected": True,
            "center": {"lat": lat, "lng": lng},
            "zoom": 12,
            "layers": {
                "elevation": {
                    "name": "Elevation",
                    "url": map_id['tile_fetcher'].url_format,
                    "description": "Digital Elevation Model"
                }
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "error", 
            "message": str(e),
            "earth_engine_connected": False
        }

@app.get("/api/earth-engine/live-layers")
async def get_live_layers(lat: float = 11.0168, lng: float = 76.9558):
    """Get live Earth Engine layers for a specific location"""
    
    try:
        import ee
        
        point = ee.Geometry.Point([lng, lat])
        region = point.buffer(5000)  # 5km buffer
        
        # Layer 1: Elevation
        elevation = ee.Image('USGS/SRTMGL1_003').clip(region)
        elevation_map = elevation.getMapId({
            'min': 0, 'max': 500, 
            'palette': ['blue', 'cyan', 'yellow', 'red']
        })
        print(f"🔍 Elevation map structure: {elevation_map}")
        
        # Layer 2: Land Cover
        landcover = ee.Image('MODIS/006/MCD12Q1/2020_01_01').select('LC_Type1').clip(region)
        landcover_map = landcover.getMapId({
            'min': 1, 'max': 17,
            'palette': ['green', 'darkgreen', 'brown', 'yellow', 'red', 'blue']
        })
        print(f"🔍 Landcover map structure: {landcover_map}")
        
        # Layer 3: Recent precipitation (last 30 days to avoid empty data)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        
        precipitation = (ee.ImageCollection('NASA/GPM_L3/IMERG_V06')
                        .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))
                        .filterBounds(region)
                        .select('precipitationCal')
                        .sum()
                        .clip(region))
        
        precip_map = precipitation.getMapId({
            'min': 0, 'max': 50,
            'palette': ['white', 'lightblue', 'blue', 'darkblue']
        })
        
        # Store map IDs and tokens for tile serving
        global_maps = {
            'elevation': elevation_map,
            'landcover': landcover_map,
            'precipitation': precip_map
        }
        
        # Store in a global variable or cache for tile serving
        app.state.current_maps = global_maps
        
        # Create tile URLs that point to our backend proxy
        base_tile_url = f"http://localhost:{config.API_PORT}/api/earth-engine/tiles"
        
        return {
            "status": "success",
            "location": {"lat": lat, "lng": lng},
            "layers": {
                "elevation": {
                    "name": "Elevation (SRTM)",
                    "tile_url": f"{base_tile_url}/elevation/{{z}}/{{x}}/{{y}}",
                    "map_id": elevation_map['mapid'],
                    "token": elevation_map['token'],
                    "description": "Digital elevation model showing terrain height"
                },
                "landcover": {
                    "name": "Land Cover",
                    "tile_url": f"{base_tile_url}/landcover/{{z}}/{{x}}/{{y}}",
                    "map_id": landcover_map['mapid'],
                    "token": landcover_map['token'],
                    "description": "MODIS land cover classification"
                },
                "precipitation": {
                    "name": "Recent Precipitation",
                    "tile_url": f"{base_tile_url}/precipitation/{{z}}/{{x}}/{{y}}",
                    "map_id": precip_map['mapid'],
                    "token": precip_map['token'],
                    "description": "Total precipitation in last 30 days"
                }
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate live layers: {str(e)}")

@app.get("/api/earth-engine/tiles/{layer_name}/{z}/{x}/{y}")
async def get_tile_proxy(layer_name: str, z: int, x: int, y: int):
    """Proxy endpoint to serve Earth Engine tiles with proper parameters"""
    
    try:
        # Check if we have stored map data
        if not hasattr(app.state, 'current_maps') or layer_name not in app.state.current_maps:
            # If no maps are stored, generate them first
            print(f"🔄 No maps found, generating maps for tile request: {layer_name}")
            await get_live_layers()  # This will populate app.state.current_maps
            
            # Check again
            if layer_name not in app.state.current_maps:
                raise HTTPException(status_code=404, detail=f"Layer '{layer_name}' not found even after generation")
        
        map_data = app.state.current_maps[layer_name]
        
        # Construct the actual Google Earth Engine tile URL
        # Check if we have a token
        if map_data.get('token'):
            tile_url = f"https://earthengine.googleapis.com/v1alpha/projects/earthengine-legacy/maps/{map_data['mapid']}/tiles/{z}/{x}/{y}?token={map_data['token']}"
        else:
            # Use the tile_fetcher URL format directly (for newer EE API)
            tile_fetcher = map_data.get('tile_fetcher')
            if tile_fetcher and hasattr(tile_fetcher, 'url_format'):
                # Replace placeholders in the tile_fetcher URL
                tile_url = tile_fetcher.url_format.replace('{z}', str(z)).replace('{x}', str(x)).replace('{y}', str(y))
                # Ensure it's a complete URL
                if not tile_url.startswith('http'):
                    tile_url = f"https://earthengine.googleapis.com{tile_url}"
            else:
                # Fallback to the standard URL without token (might not work)
                tile_url = f"https://earthengine.googleapis.com/v1alpha/projects/earthengine-legacy/maps/{map_data['mapid']}/tiles/{z}/{x}/{y}"
        
        print(f"🌍 Proxying tile request: {tile_url}")
        
        # Fetch the tile from Google Earth Engine
        import httpx
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(tile_url)
            
            if response.status_code == 200:
                return Response(
                    content=response.content,
                    media_type="image/png",
                    headers={
                        "Cache-Control": "public, max-age=86400",  # Cache for 24 hours
                        "Access-Control-Allow-Origin": "*"
                    }
                )
            else:
                print(f"❌ Earth Engine responded with status {response.status_code}")
                raise HTTPException(status_code=response.status_code, detail="Failed to fetch tile from Earth Engine")
                
    except Exception as e:
        print(f"❌ Tile proxy error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Tile proxy error: {str(e)}")

@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Custom 404 handler"""
    return JSONResponse(
        status_code=404,
        content={
            "error": "Endpoint not found",
            "message": "The requested API endpoint does not exist",
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Custom 500 handler"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred",
            "timestamp": datetime.now().isoformat()
        }
    )

if __name__ == "__main__":
    print(f"🚀 Starting Disaster Eye Earth Engine API...")
    print(f"📍 Default location: {config.DEFAULT_LAT}, {config.DEFAULT_LNG}")
    print(f"🌐 Frontend URL: {config.FRONTEND_URL}")
    
    uvicorn.run(
        "main:app",
        host=config.API_HOST,
        port=config.API_PORT,
        reload=True,
        log_level="info"
    )
