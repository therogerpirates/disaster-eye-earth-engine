import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface QueryInterfaceProps {
  onQuery?: (query: string) => void;
  isLoading?: boolean;
}

const QueryInterface: React.FC<QueryInterfaceProps> = ({ onQuery, isLoading = false }) => {
  const [query, setQuery] = useState('');

  const sampleQueries = [
    "What is the flood vulnerability in Miami-Dade County?",
    "Show building damage from Hurricane Ian in Lee County",
    "Analyze social vulnerability in New Orleans census tracts",
    "Power infrastructure impact in Puerto Rico after Maria"
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

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-elevation">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-foreground flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          Natural Disaster Analysis Query
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about flood vulnerability, building damage, or social impact..."
            className="flex-1 bg-input/50 border-border/50 focus:border-primary transition-colors"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            variant="ocean" 
            className="shrink-0"
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </Button>
        </form>

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