/**
 * Ward-Level Monsoon Preparedness Component
 * 
 * Displays ward-wise readiness for handling water-logging incidents.
 * 
 * Ward Readiness Score Definition:
 * - Composite metric (0-100%) measuring flood response capacity
 * - Factors considered:
 *   • Number and severity of identified water-logging hotspots
 *   • Active flood alerts in the ward
 *   • Available response resources (pumps, personnel, vehicles)
 *   • Recent maintenance and preparedness activities
 * 
 * Score Interpretation:
 * - 80-100%: Excellent preparedness for monsoon flooding
 * - 60-79%: Good readiness with adequate resources
 * - 40-59%: Moderate preparedness, resource attention needed
 * - 0-39%: Low readiness, immediate resource deployment required
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Truck, 
  Droplets, 
  Calendar, 
  MapPin,
  ChevronRight,
  Navigation,
  Info,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { wards } from '@/data/mockData';
import { Ward } from '@/types';

const getReadinessColor = (score: number) => {
  if (score >= 80) return 'text-success bg-success/20';
  if (score >= 60) return 'text-green-600 bg-green-100';
  if (score >= 40) return 'text-warning bg-warning/20';
  return 'text-destructive bg-destructive/20';
};

interface WardCardProps {
  ward: Ward;
  isSelected: boolean;
  onClick: () => void;
  delay: number;
}

function WardCard({ ward, isSelected, onClick, delay }: WardCardProps) {
  const navigate = useNavigate();

  const handleViewMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/map?ward=${ward.wardNo}&lat=${ward.coords[0]}&lng=${ward.coords[1]}&readiness=${ward.readiness}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`glass-card p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${getReadinessColor(ward.readiness)}`}>
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-sm">Ward {ward.wardNo}</p>
            <p className="text-xs text-muted-foreground">{ward.name}</p>
          </div>
        </div>
        <ChevronRight className={`h-4 w-4 transition-transform text-muted-foreground ${isSelected ? 'rotate-90 text-primary' : ''}`} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-muted-foreground flex items-center gap-1 cursor-help">
                  Flood Response Readiness
                  <Info className="h-3 w-3" />
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">Capacity to handle water-logging based on hotspots, alerts, and available resources</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className={`font-bold ${ward.readiness >= 60 ? 'text-success' : 'text-destructive'}`}>
            {ward.readiness}%
          </span>
        </div>
        <Progress value={ward.readiness} className="h-2" />
      </div>

      <div className="flex items-center justify-between mt-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                <AlertTriangle className="h-3 w-3" />
                {ward.hotspots} water-logging hotspot{ward.hotspots !== 1 ? 's' : ''}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">GIS-identified areas prone to flooding</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10"
          onClick={handleViewMap}
        >
          <Navigation className="h-3 w-3 mr-1" />
          View Map
        </Button>
      </div>
    </motion.div>
  );
}

interface WardDetailsProps {
  ward: Ward;
  onClose: () => void;
}

function WardDetails({ ward, onClose }: WardDetailsProps) {
  const navigate = useNavigate();

  const handleViewMap = () => {
    navigate(`/map?ward=${ward.wardNo}&lat=${ward.coords[0]}&lng=${ward.coords[1]}&readiness=${ward.readiness}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="glass-card p-6 rounded-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-xl">Ward {ward.wardNo}</h3>
          <p className="text-muted-foreground">{ward.name}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">×</Button>
      </div>

      {/* Readiness Explanation */}
      <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <Info className="h-3 w-3 inline mr-1" />
          Readiness score reflects this ward's capacity to respond to monsoon flooding based on identified water-logging hotspots and available response resources.
        </p>
      </div>

      {/* Readiness Score */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              className="stroke-secondary"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              className={`stroke-current ${ward.readiness >= 60 ? 'text-success' : 'text-destructive'}`}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(ward.readiness / 100) * 352} 352`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{ward.readiness}%</span>
            <span className="text-xs text-muted-foreground">Flood Readiness</span>
          </div>
        </div>
      </div>

      {/* Readiness Interpretation */}
      <div className="text-center mb-6">
        <p className="text-sm font-medium mb-1">
          {ward.readiness >= 80 && "Excellent Monsoon Preparedness"}
          {ward.readiness >= 60 && ward.readiness < 80 && "Good Flood Response Capacity"}
          {ward.readiness >= 40 && ward.readiness < 60 && "Moderate - Resource Attention Needed"}
          {ward.readiness < 40 && "Low Readiness - Immediate Action Required"}
        </p>
        <p className="text-xs text-muted-foreground">
          {ward.readiness >= 60 
            ? "Ward has adequate resources to handle water-logging incidents" 
            : "Additional pumps and personnel may be required during heavy rainfall"
          }
        </p>
      </div>

      {/* Allocated Flood Response Resources */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-1">
          Allocated Flood Response Resources
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">Resources deployed for monsoon season to handle water-logging emergencies in this ward</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-3 rounded-xl bg-primary/10 border border-primary/20 cursor-help">
                  <Droplets className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-lg font-bold">{ward.resources.pumps}</p>
                  <p className="text-xs text-muted-foreground">Water Pumps</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">High-capacity pumps for rapid water drainage</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-3 rounded-xl bg-success/10 border border-success/20 cursor-help">
                  <Users className="h-5 w-5 mx-auto mb-1 text-success" />
                  <p className="text-lg font-bold">{ward.resources.personnel}</p>
                  <p className="text-xs text-muted-foreground">Response Team</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Trained personnel for flood emergency response</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-3 rounded-xl bg-warning/10 border border-warning/20 cursor-help">
                  <Truck className="h-5 w-5 mx-auto mb-1 text-warning" />
                  <p className="text-lg font-bold">{ward.resources.vehicles}</p>
                  <p className="text-xs text-muted-foreground">Response Vehicles</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Vehicles equipped for flood rescue operations</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Ward Statistics */}
      <div className="space-y-3 mb-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-between text-sm cursor-help p-2 rounded-lg hover:bg-accent/50 transition-colors">
                <span className="text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Water-Logging Hotspots
                </span>
                <Badge variant={ward.hotspots > 3 ? "destructive" : "outline"}>
                  {ward.hotspots} {ward.hotspots > 3 ? "High Risk" : "Identified"}
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">GIS-mapped areas in this ward prone to flooding during monsoon. Based on historical data and terrain analysis.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-between text-sm cursor-help p-2 rounded-lg hover:bg-accent/50 transition-colors">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Drainage Maintenance
                </span>
                <span className="font-medium">{ward.lastMaintenance}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">Last drainage system inspection and cleaning. Regular maintenance reduces water-logging risk.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div>
        <Button 
          className="w-full gradient-primary text-primary-foreground shadow-md" 
          onClick={handleViewMap}
        >
          <Navigation className="h-4 w-4 mr-2" />
          View Hotspots on GIS Map
        </Button>
      </div>
    </motion.div>
  );
}

export function WardGrid() {
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {wards.map((ward, index) => (
            <WardCard
              key={ward.wardNo}
              ward={ward}
              isSelected={selectedWard?.wardNo === ward.wardNo}
              onClick={() => setSelectedWard(ward)}
              delay={index * 0.05}
            />
          ))}
        </div>
      </div>

      <div className="lg:col-span-1">
        <AnimatePresence mode="wait">
          {selectedWard ? (
            <WardDetails
              key={selectedWard.wardNo}
              ward={selectedWard}
              onClose={() => setSelectedWard(null)}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-6 rounded-xl text-center"
            >
              <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                <Building2 className="h-12 w-12 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Select a Ward</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Click on any ward card to view monsoon preparedness details, flood response resources, and water-logging hotspots
              </p>
              <div className="text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg">
                <strong>About Readiness Score:</strong> Measures ward capacity to handle flooding based on identified hotspots, active alerts, and available response resources.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
