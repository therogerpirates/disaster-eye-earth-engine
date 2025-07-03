import React, { useState } from 'react';
import Header from '@/components/Header';
import GeospatialMap from '@/components/GeospatialMap';
import QueryInterface from '@/components/QueryInterface';
import DataPanel from '@/components/DataPanel';

const Index = () => {
  const [activeLayer, setActiveLayer] = useState<string>('');
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleQuery = async (query: string) => {
    setCurrentQuery(query);
    setIsAnalyzing(true);
    
    // Simulate analysis processing
    setTimeout(() => {
      // Mock analysis results based on query type
      if (query.toLowerCase().includes('miami') || query.toLowerCase().includes('flood')) {
        setAnalysisData({
          totalBuildings: 45230,
          damagedBuildings: 8920,
          sviScore: 0.68,
          floodRisk: 'High' as const,
          analysisComplete: true
        });
      } else if (query.toLowerCase().includes('hurricane') || query.toLowerCase().includes('damage')) {
        setAnalysisData({
          totalBuildings: 32180,
          damagedBuildings: 12450,
          sviScore: 0.74,
          floodRisk: 'High' as const,
          analysisComplete: true
        });
      } else {
        setAnalysisData({
          totalBuildings: 28900,
          damagedBuildings: 3420,
          sviScore: 0.52,
          floodRisk: 'Medium' as const,
          analysisComplete: true
        });
      }
      setIsAnalyzing(false);
    }, 2500);
  };

  const handleLayerToggle = (layer: string) => {
    setActiveLayer(activeLayer === layer ? '' : layer);
  };

  const handleMapClick = (coordinates: { lat: number; lng: number }) => {
    setSelectedLocation(coordinates);
  };

  return (
    <div className="min-h-screen bg-gradient-atmosphere relative overflow-hidden">
      {/* Fullscreen Map Background */}
      <div className="absolute inset-0">
        <GeospatialMap 
          onLayerToggle={handleLayerToggle}
          activeLayer={activeLayer}
          onMapClick={handleMapClick}
        />
      </div>

      {/* Floating Header Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-card/80 backdrop-blur-md border border-border/30 rounded-xl shadow-elevation">
          <Header />
        </div>
      </div>

      {/* Floating Query Interface - Top Left */}
      <div className="absolute top-24 left-4 z-10 w-96 max-w-[calc(100vw-2rem)]">
        <div className="bg-card/85 backdrop-blur-md border border-border/30 rounded-xl shadow-elevation">
          <QueryInterface 
            onQuery={handleQuery}
            isLoading={isAnalyzing}
            selectedLocation={selectedLocation}
          />
        </div>
      </div>

      {/* Floating Data Panel - Bottom Left */}
      <div className="absolute bottom-4 left-4 z-10 w-80 max-w-[calc(100vw-2rem)]">
        <div className="bg-card/85 backdrop-blur-md border border-border/30 rounded-xl shadow-elevation">
          <DataPanel 
            title={currentQuery || "Analysis Results"}
            data={analysisData}
          />
        </div>
      </div>

      {/* Mobile Responsive Adjustments */}
      <div className="lg:hidden absolute top-20 right-4 z-10">
        <div className="bg-card/90 backdrop-blur-md border border-border/30 rounded-lg p-2">
          <div className="text-xs text-muted-foreground text-center">
            Tap map to query
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
