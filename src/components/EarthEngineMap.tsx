import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Layers, Satellite, Map } from 'lucide-react';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface EarthEngineMapProps {
  onLocationClick?: (coordinates: { lat: number; lng: number }) => void;
}

const EarthEngineMap: React.FC<EarthEngineMapProps> = ({ onLocationClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [earthEngineStatus, setEarthEngineStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [availableLayers, setAvailableLayers] = useState<any>(null);
  const [activeLayers, setActiveLayers] = useState<string[]>([]);
  const layerGroupsRef = useRef<{ [key: string]: L.TileLayer }>({});

  useEffect(() => {
    initializeMap();
    loadEarthEngineLayers();
  }, []);

  useEffect(() => {
    if (availableLayers && Object.keys(availableLayers).length > 0 && activeLayers.length === 0) {
      const firstLayerId = Object.keys(availableLayers)[0];
      toggleLayer(firstLayerId);
    }
  }, [availableLayers]);

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on Coimbatore
    const map = L.map(mapRef.current).setView([11.0168, 76.9558], 11);

    // Add satellite base layer as default
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 18,
    }).addTo(map);

    // Add OpenStreetMap layer as alternative
    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    });

    // Layer control
    const baseMaps = {
      "Satellite": satelliteLayer,
      "Street Map": streetLayer
    };

    L.control.layers(baseMaps, {}, { position: 'topright' }).addTo(map);

    // Add click handler
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      onLocationClick?.({ lat, lng });
      
      // Add a marker at clicked location
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<b>Analyzing Location</b><br/>Lat: ${lat.toFixed(4)}<br/>Lng: ${lng.toFixed(4)}`)
        .openPopup();
    });

    mapInstanceRef.current = map;
    setIsLoading(false);
  };

  const loadEarthEngineLayers = async () => {
    try {
      setEarthEngineStatus('loading');
      
      // Try to get live Earth Engine layers
      const response = await fetch('http://localhost:8000/api/earth-engine/live-layers?lat=11.0168&lng=76.9558');
      const data = await response.json();

      if (data.status === 'success') {
        setAvailableLayers(data.layers);
        setEarthEngineStatus('connected');
        console.log('✅ Earth Engine layers loaded:', Object.keys(data.layers));
      } else {
        throw new Error(data.message || 'Failed to load layers');
      }
    } catch (error) {
      console.error('❌ Failed to load Earth Engine layers:', error);
      setEarthEngineStatus('error');
      
      // Fallback to test endpoint
      try {
        const testResponse = await fetch('http://localhost:8000/api/earth-engine/test-map');
        const testData = await testResponse.json();
        
        if (testData.layers) {
          setAvailableLayers(testData.layers);
          setEarthEngineStatus('connected');
        }
      } catch (testError) {
        console.error('❌ Test endpoint also failed:', testError);
      }
    }
  };

  const toggleLayer = (layerId: string) => {
    if (!mapInstanceRef.current || !availableLayers) return;

    const layer = availableLayers[layerId];
    if (!layer) return;

    if (activeLayers.includes(layerId)) {
      // Remove layer
      if (layerGroupsRef.current[layerId]) {
        mapInstanceRef.current.removeLayer(layerGroupsRef.current[layerId]);
        delete layerGroupsRef.current[layerId];
      }
      setActiveLayers(prev => prev.filter(id => id !== layerId));
    } else {
      // Add layer
      const tileUrl = layer.tile_url || layer.url;
      
      // Create tile layer with proper Earth Engine URL handling
      const tileLayer = L.tileLayer(tileUrl, {
        opacity: 0.7,
        attribution: 'Google Earth Engine',
        maxZoom: 18,
        // Add error handling for Earth Engine tiles
        errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      });
      
      // Add error handler
      tileLayer.on('tileerror', (e) => {
        console.warn(`Tile loading error for layer ${layerId}:`, e);
      });
      
      tileLayer.addTo(mapInstanceRef.current);
      layerGroupsRef.current[layerId] = tileLayer;
      setActiveLayers(prev => [...prev, layerId]);
    }
  };

  const getStatusColor = () => {
    switch (earthEngineStatus) {
      case 'connected': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusText = () => {
    switch (earthEngineStatus) {
      case 'connected': return 'Earth Engine Connected';
      case 'error': return 'Connection Failed';
      default: return 'Connecting...';
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
        style={{ minHeight: '500px' }}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
          <div className="bg-white p-4 rounded-lg flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading Map...</span>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="absolute top-4 left-4 z-[1000]">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <Satellite className="w-4 h-4" />
            <span className="font-medium">{getStatusText()}</span>
          </div>
        </div>
      </div>

      {/* Layer Controls */}
      {availableLayers && earthEngineStatus === 'connected' && (
        <Card className="absolute bottom-4 left-4 p-4 bg-white/95 backdrop-blur-sm shadow-lg max-w-sm z-[1000]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Earth Engine Layers
            </h4>
            <Badge variant="outline" className="text-xs">
              {activeLayers.length} Active
            </Badge>
          </div>
          
          <div className="space-y-2">
            {Object.entries(availableLayers).map(([layerId, layer]: [string, any]) => (
              <div key={layerId}>
                <Button
                  variant={activeLayers.includes(layerId) ? "default" : "ghost"}
                  size="sm"
                  onClick={() => toggleLayer(layerId)}
                  className="w-full justify-start text-xs h-8"
                >
                  <Map className="w-3 h-3 mr-2" />
                  {layer.name}
                </Button>
                {activeLayers.includes(layerId) && (
                  <p className="text-xs text-muted-foreground ml-5 mt-1">
                    {layer.description}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Click anywhere on the map to analyze that location with Earth Engine data.
            </p>
          </div>
        </Card>
      )}

      {/* Error State */}
      {earthEngineStatus === 'error' && (
        <div className="absolute bottom-4 left-4 z-[1000]">
          <Card className="p-4 bg-red-50 border-red-200 max-w-sm">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="font-medium">Earth Engine Offline</span>
            </div>
            <p className="text-xs text-red-600 mt-2">
              Using base map only. Check backend connection.
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={loadEarthEngineLayers}
              className="mt-2 text-xs h-7"
            >
              Retry Connection
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EarthEngineMap;
