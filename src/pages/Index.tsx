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

  return (
    <div className="min-h-screen bg-gradient-atmosphere">
      <div className="container mx-auto p-4 space-y-4">
        {/* Header */}
        <Header />
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-120px)]">
          {/* Left Sidebar - Controls and Query */}
          <div className="lg:col-span-1 space-y-4">
            <QueryInterface 
              onQuery={handleQuery}
              isLoading={isAnalyzing}
            />
            
            <DataPanel 
              title={currentQuery || "Analysis Results"}
              data={analysisData}
            />
          </div>
          
          {/* Main Map Area */}
          <div className="lg:col-span-3">
            <GeospatialMap 
              onLayerToggle={handleLayerToggle}
              activeLayer={activeLayer}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
