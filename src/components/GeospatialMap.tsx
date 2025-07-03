import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers, ZoomIn, ZoomOut } from 'lucide-react';

interface GeospatialMapProps {
  onLayerToggle?: (layer: string) => void;
  activeLayer?: string;
}

const GeospatialMap: React.FC<GeospatialMapProps> = ({ onLayerToggle, activeLayer }) => {
  const layers = [
    { id: 'svi', name: 'Social Vulnerability', color: 'hsl(var(--warning))' },
    { id: 'damage', name: 'Building Damage', color: 'hsl(var(--destructive))' },
    { id: 'infrastructure', name: 'Infrastructure', color: 'hsl(var(--primary))' },
    { id: 'flood', name: 'Flood Zones', color: 'hsl(var(--accent))' }
  ];

  return (
    <div className="relative w-full h-full bg-gradient-atmosphere rounded-lg overflow-hidden">
      {/* Map placeholder with Earth Engine integration point */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-green-900/20">
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-ocean flex items-center justify-center animate-pulse-glow">
              <Layers className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Google Earth Engine Map</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Interactive geospatial visualization will be integrated here with your Google Earth Engine API
            </p>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button variant="ghost" size="icon" className="bg-card/80 backdrop-blur-sm hover:bg-card">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="bg-card/80 backdrop-blur-sm hover:bg-card">
          <ZoomOut className="w-4 h-4" />
        </Button>
      </div>

      {/* Layer Controls */}
      <Card className="absolute bottom-4 left-4 p-4 bg-card/90 backdrop-blur-sm border-border/50">
        <h4 className="text-sm font-medium text-foreground mb-3">Data Layers</h4>
        <div className="grid grid-cols-2 gap-2">
          {layers.map((layer) => (
            <Button
              key={layer.id}
              variant={activeLayer === layer.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onLayerToggle?.(layer.id)}
              className="justify-start text-xs h-8"
            >
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: layer.color }}
              />
              {layer.name}
            </Button>
          ))}
        </div>
      </Card>

      {/* Loading indicator for data */}
      <div className="absolute top-4 left-4">
        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-lg px-3 py-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-data-flow"></div>
          <span className="text-xs text-muted-foreground">Loading geospatial data...</span>
        </div>
      </div>
    </div>
  );
};

export default GeospatialMap;