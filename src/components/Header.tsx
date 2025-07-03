import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <div className="bg-transparent border-none shadow-none">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-ocean flex items-center justify-center">
                <div className="w-6 h-6 text-white font-bold">🌊</div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Geospatial Disaster Analysis
                </h1>
                <p className="text-sm text-muted-foreground">
                  Natural disaster impact assessment and vulnerability analysis
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              Google Earth Engine
            </Badge>
            <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30">
              Real-time Data
            </Badge>
            <Link to="/earth-engine-demo">
              <Button variant="outline" size="sm">
                EE Demo
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;