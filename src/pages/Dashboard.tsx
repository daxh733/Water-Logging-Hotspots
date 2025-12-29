import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { RainfallChart } from '@/components/analytics/RainfallChart';
import { AlertsPanel } from '@/components/alerts/AlertsPanel';
import { Map as MapIcon, MapPin, Clock, Droplets, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { hotspots } from '@/data/mockData';

const Dashboard = () => {
  const topHotspots = hotspots.slice(0, 4);

  const getRiskStyles = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return {
          border: 'border-l-destructive',
          bg: 'bg-destructive/5',
          badge: 'bg-destructive/10 text-destructive border-destructive/20',
          icon: 'text-destructive',
          glow: 'shadow-[inset_0_0_20px_-12px_hsl(0_84%_60%/0.3)]'
        };
      case 'MEDIUM':
        return {
          border: 'border-l-warning',
          bg: 'bg-warning/5',
          badge: 'bg-warning/10 text-warning border-warning/20',
          icon: 'text-warning',
          glow: ''
        };
      default:
        return {
          border: 'border-l-success',
          bg: 'bg-success/5',
          badge: 'bg-success/10 text-success border-success/20',
          icon: 'text-success',
          glow: ''
        };
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full space-y-3 md:space-y-5"
      >
        {/* Header - Compact */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Dashboard
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Real-time water-logging monitoring for Delhi NCR
            </p>
          </div>
          
          {/* Live Indicator */}
          <div className="flex w-fit items-center gap-2 rounded-full bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
            </span>
            <span className="hidden sm:inline">Live monitoring</span>
            <span className="sm:hidden">Live</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="w-full">
          <StatsGrid />
        </div>

        {/* Main Content */}
        <div className="grid w-full gap-3 md:gap-5 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-3 md:space-y-4 lg:col-span-2">
            
            {/* Delhi Hotspots Card */}
            <Card className="glass-card-elevated w-full overflow-hidden rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/50 p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-1.5">
                    <MapIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-sm font-semibold sm:text-base">
                      Delhi Hotspots
                    </CardTitle>
                    <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
                      Active flood-prone locations
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild 
                  className="h-7 rounded-full px-3 text-xs"
                >
                  <Link to="/map">View Map</Link>
                </Button>
              </CardHeader>

              <CardContent className="p-3">
                {/* Mobile: 1 column (full width cards), Desktop: 2 columns */}
                <div className="grid w-full gap-2 sm:grid-cols-2 sm:gap-2.5">
                  {topHotspots.map((hotspot, index) => {
                    const styles = getRiskStyles(hotspot.risk);
                    return (
                      <motion.div
                        key={hotspot.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01 }}
                        className={`w-full cursor-pointer rounded-lg border-l-4 bg-card/50 p-2.5 transition-all duration-200 hover:bg-card ${styles.border} ${styles.bg} ${styles.glow}`}
                      >
                        {/* Header */}
                        <div className="mb-1.5 flex items-start justify-between gap-1.5">
                          <div className="flex min-w-0 flex-1 items-center gap-1.5">
                            <div className={`flex-shrink-0 rounded-md p-1 ${
                              hotspot.risk === 'HIGH' ? 'bg-destructive/10' : 
                              hotspot.risk === 'MEDIUM' ? 'bg-warning/10' : 
                              'bg-success/10'
                            }`}>
                              <MapPin className={`h-3 w-3 ${styles.icon}`} />
                            </div>
                            <span className="truncate text-xs font-semibold">
                              {hotspot.name}
                            </span>
                          </div>
                          <Badge 
                            variant="outline"
                            className={`ml-1.5 flex-shrink-0 px-1.5 py-0 text-[9px] font-semibold ${styles.badge}`}
                          >
                            {hotspot.risk}
                          </Badge>
                        </div>
                        
                        {/* Depth Bar */}
                        <div className="mb-1.5 space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Droplets className="h-2.5 w-2.5" />
                              <span>Depth</span>
                            </span>
                            <span className="font-semibold">{hotspot.depth}</span>
                          </div>
                          <div className="h-1 overflow-hidden rounded-full bg-secondary">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                hotspot.risk === 'HIGH' ? 'bg-destructive' : 
                                hotspot.risk === 'MEDIUM' ? 'bg-warning' : 
                                'bg-success'
                              }`}
                              style={{ 
                                width: `${Math.min(parseFloat(hotspot.depth) * 20, 100)}%` 
                              }}
                            />
                          </div>
                        </div>

                        {/* Footer Info */}
                        <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                          <div className="flex items-center gap-0.5">
                            <AlertTriangle className="h-2.5 w-2.5 flex-shrink-0" />
                            <span className="truncate">{hotspot.duration}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5 flex-shrink-0" />
                            <span className="truncate">{hotspot.lastFlooded}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Rainfall Chart */}
            <div className="w-full">
              <RainfallChart />
            </div>
          </div>

          {/* Right Column - Alerts (Desktop only) */}
          <div className="hidden w-full lg:col-span-1 lg:block">
            <div className="lg:sticky lg:top-4">
              <AlertsPanel />
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Dashboard;
