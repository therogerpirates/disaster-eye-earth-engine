import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mic, Send, MapPin } from 'lucide-react';

interface QueryInterfaceProps {
  onQuery?: (query: string) => void;
  isLoading?: boolean;
  selectedLocation?: { lat: number; lng: number } | null;
}

const QueryInterface: React.FC<QueryInterfaceProps> = ({ onQuery, isLoading = false, selectedLocation }) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  const sampleQueries = [
    "What is the flood vulnerability in Coimbatore?",
    "Show building damage assessment for Tamil Nadu",
    "Analyze social vulnerability in selected area",
    "Critical infrastructure in flood zones"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onQuery?.(query);
    }
  };

  const handleSampleQuery = (sampleQuery: string) => {
    setQuery(sampleQuery);
    onQuery?.(sampleQuery);
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // Voice input functionality would be implemented here
    // For now, just toggle the visual state
  };

  const handleLocationQuery = () => {
    if (selectedLocation) {
      const locationQuery = `Analyze flood vulnerability at coordinates ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`;
      setQuery(locationQuery);
      onQuery?.(locationQuery);
    }
  };

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-elevation">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-foreground flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          Natural Disaster Analysis Query
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enhanced Query Input with Voice and Location Features */}
        <div className="space-y-3">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask about flood vulnerability, building damage, or click on map..."
                  className="pr-12 bg-input/50 border-border/50 focus:border-primary transition-colors text-base h-12"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleVoiceInput}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 ${
                    isListening ? 'bg-destructive/20 text-destructive' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  disabled={isLoading}
                >
                  <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
                </Button>
              </div>
              
              <Button 
                type="submit" 
                variant="ocean" 
                size="lg"
                className="shrink-0 h-12 px-6"
                disabled={isLoading || !query.trim()}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>

          {/* Location Query Button */}
          {selectedLocation && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLocationQuery}
              className="w-full justify-start gap-2 bg-accent/10 border-accent/30 text-accent hover:bg-accent/20"
            >
              <MapPin className="w-4 h-4" />
              Query selected location ({selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)})
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Sample queries:</p>
          <div className="flex flex-wrap gap-2">
            {sampleQueries.map((sampleQuery, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-primary/20 transition-colors text-xs py-1"
                onClick={() => handleSampleQuery(sampleQuery)}
              >
                {sampleQuery}
              </Badge>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            Processing your geospatial analysis request...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QueryInterface;