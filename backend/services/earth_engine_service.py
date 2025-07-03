import ee
import json
from typing import Dict, List, Optional, Tuple
from config import config

class EarthEngineService:
    def __init__(self):
        self.initialized = False
        self._initialize_ee()
    
    def _initialize_ee(self):
        """Initialize Google Earth Engine with proper authentication"""
        try:
            if config.EE_SERVICE_ACCOUNT and config.EE_PRIVATE_KEY_PATH:
                # Check if private key path exists and is a valid JSON file
                import os
                if os.path.exists(config.EE_PRIVATE_KEY_PATH):
                    # Use service account authentication
                    credentials = ee.ServiceAccountCredentials(
                        config.EE_SERVICE_ACCOUNT, 
                        config.EE_PRIVATE_KEY_PATH
                    )
                    ee.Initialize(credentials)
                    print("✅ Google Earth Engine initialized with service account")
                    self.initialized = True
                else:
                    print(f"❌ Service account key file not found: {config.EE_PRIVATE_KEY_PATH}")
                    print("📋 Falling back to user authentication...")
                    # Try user authentication as fallback
                    ee.Initialize()
                    print("✅ Google Earth Engine initialized with user authentication")
            else:
                # Use user authentication (requires prior ee.Authenticate())
                print("📋 Using user authentication for Earth Engine...")
                ee.Initialize(project=config.EE_PROJECT_ID)
                print("✅ Google Earth Engine initialized with user authentication")
                self.initialized = True
            
            # Don't set initialized to True here, let individual cases set it
            
        except Exception as e:
            print(f"❌ Error initializing Google Earth Engine: {e}")
            print("📋 Please ensure you have:")
            print("   1. Run 'earthengine authenticate' in your terminal")
            print("   2. Set up your service account JSON key file (optional)")
            print("   3. Configured your .env file properly")
            self.initialized = False
    
    def get_map_id(self, image: ee.Image, vis_params: Dict) -> Dict:
        """Get map ID for Earth Engine image"""
        if not self.initialized:
            raise Exception("Earth Engine not initialized")
        
        try:
            map_id = image.getMapId(vis_params)
            return {
                'mapid': map_id['mapid'],
                'token': map_id['token'],
                'tile_url': f"https://earthengine.googleapis.com/v1alpha/projects/earthengine-legacy/maps/{map_id['mapid']}/tiles/{{z}}/{{x}}/{{y}}?token={map_id['token']}"
            }
        except Exception as e:
            raise Exception(f"Error getting map ID: {e}")
    
    def get_flood_analysis(self, lat: float, lng: float, radius: float = 5000) -> Dict:
        """Analyze flood vulnerability for a specific location"""
        if not self.initialized:
            raise Exception("Earth Engine not initialized")
        
        try:
            # Create point of interest
            point = ee.Geometry.Point([lng, lat])
            region = point.buffer(radius)
            
            # Get Sentinel-1 SAR data for flood detection
            sentinel1 = ee.ImageCollection('COPERNICUS/S1_GRD') \
                .filterBounds(region) \
                .filterDate('2023-01-01', '2024-12-31') \
                .filter(ee.Filter.eq('instrumentMode', 'IW')) \
                .select(['VV', 'VH'])
            
            # Calculate flood probability using SAR backscatter
            if sentinel1.size().getInfo() > 0:
                recent_image = sentinel1.sort('system:time_start', False).first()
                vv = recent_image.select('VV')
                
                # Simple flood detection using backscatter threshold
                flood_threshold = -15  # dB threshold for water detection
                flood_mask = vv.lt(flood_threshold)
                
                # Calculate flood area percentage
                flood_stats = flood_mask.reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=region,
                    scale=10,
                    maxPixels=1e9
                )
                
                flood_percentage = flood_stats.getInfo().get('VV', 0) * 100
            else:
                flood_percentage = 0
            
            # Get elevation data for flood risk
            elevation = ee.Image('USGS/SRTMGL1_003')
            elev_stats = elevation.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=region,
                scale=30,
                maxPixels=1e9
            )
            
            avg_elevation = elev_stats.getInfo().get('elevation', 0)
            
            # Calculate risk level
            if flood_percentage > 30 or avg_elevation < 10:
                risk_level = "High"
            elif flood_percentage > 10 or avg_elevation < 50:
                risk_level = "Medium"
            else:
                risk_level = "Low"
            
            return {
                'flood_percentage': round(flood_percentage, 2),
                'average_elevation': round(avg_elevation, 2),
                'risk_level': risk_level,
                'coordinates': {'lat': lat, 'lng': lng},
                'analysis_radius': radius
            }
            
        except Exception as e:
            raise Exception(f"Error in flood analysis: {e}")
    
    def get_building_analysis(self, lat: float, lng: float, radius: float = 2000) -> Dict:
        """Analyze building density and potential damage"""
        if not self.initialized:
            raise Exception("Earth Engine not initialized")
        
        try:
            point = ee.Geometry.Point([lng, lat])
            region = point.buffer(radius)
            
            # Use Sentinel-2 for building detection (simplified)
            sentinel2 = ee.ImageCollection('COPERNICUS/S2_SR') \
                .filterBounds(region) \
                .filterDate('2023-01-01', '2024-12-31') \
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
            
            if sentinel2.size().getInfo() > 0:
                # Get median composite
                composite = sentinel2.median()
                
                # Calculate NDBI (Normalized Difference Built-up Index)
                nir = composite.select('B8')
                swir = composite.select('B11')
                ndbi = swir.subtract(nir).divide(swir.add(nir))
                
                # Built-up area threshold
                built_up = ndbi.gt(0.1)
                
                # Calculate built-up percentage
                built_up_stats = built_up.reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=region,
                    scale=10,
                    maxPixels=1e9
                )
                
                built_up_percentage = built_up_stats.getInfo().get('B11', 0) * 100
                
                # Estimate building count (rough approximation)
                estimated_buildings = int(built_up_percentage * radius / 100)
                
                # Simulate damage assessment based on flood risk
                flood_data = self.get_flood_analysis(lat, lng, radius)
                damage_factor = {
                    "High": 0.35,
                    "Medium": 0.15,
                    "Low": 0.05
                }.get(flood_data['risk_level'], 0.05)
                
                damaged_buildings = int(estimated_buildings * damage_factor)
                
            else:
                built_up_percentage = 0
                estimated_buildings = 0
                damaged_buildings = 0
            
            return {
                'total_buildings': estimated_buildings,
                'damaged_buildings': damaged_buildings,
                'built_up_percentage': round(built_up_percentage, 2),
                'damage_percentage': round((damaged_buildings / max(estimated_buildings, 1)) * 100, 2),
                'coordinates': {'lat': lat, 'lng': lng}
            }
            
        except Exception as e:
            raise Exception(f"Error in building analysis: {e}")
    
    def get_satellite_layers(self, lat: float, lng: float, zoom: int = 10) -> Dict:
        """Get different satellite layers for visualization"""
        if not self.initialized:
            raise Exception("Earth Engine not initialized")
        
        try:
            point = ee.Geometry.Point([lng, lat])
            region = point.buffer(10000)  # 10km buffer
            
            layers = {}
            
            # Sentinel-2 True Color
            sentinel2 = ee.ImageCollection('COPERNICUS/S2_SR') \
                .filterBounds(region) \
                .filterDate('2023-01-01', '2024-12-31') \
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)) \
                .median()
            
            vis_params_rgb = {
                'bands': ['B4', 'B3', 'B2'],
                'min': 0,
                'max': 3000,
                'gamma': 1.4
            }
            
            layers['satellite'] = self.get_map_id(sentinel2, vis_params_rgb)
            
            # NDVI for vegetation
            ndvi = sentinel2.normalizedDifference(['B8', 'B4'])
            vis_params_ndvi = {
                'min': -1,
                'max': 1,
                'palette': ['blue', 'white', 'green']
            }
            
            layers['vegetation'] = self.get_map_id(ndvi, vis_params_ndvi)
            
            # Elevation
            elevation = ee.Image('USGS/SRTMGL1_003')
            vis_params_elevation = {
                'min': 0,
                'max': 1000,
                'palette': ['blue', 'green', 'yellow', 'red']
            }
            
            layers['elevation'] = self.get_map_id(elevation, vis_params_elevation)
            
            return layers
            
        except Exception as e:
            raise Exception(f"Error getting satellite layers: {e}")

# Global instance
earth_engine_service = EarthEngineService()
