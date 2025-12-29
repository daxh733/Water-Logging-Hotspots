// Replace the Link component with useNavigate for better control
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
  Wrench,
  Navigation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
          <span className="text-muted-foreground">Readiness</span>
          <span className={`font-bold ${ward.readiness >= 60 ? 'text-success' : 'text-destructive'}`}>
            {ward.readiness}%
          </span>
        </div>
        <Progress value={ward.readiness} className="h-2" />
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {ward.hotspots} hotspots
        </span>
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-xl">Ward {ward.wardNo}</h3>
          <p className="text-muted-foreground">{ward.name}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">×</Button>
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
            <span className="text-xs text-muted-foreground">Readiness</span>
          </div>
        </div>
      </div>

      {/* Resources */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 rounded-xl bg-primary/10 border border-primary/20">
          <Droplets className="h-5 w-5 mx-auto mb-1 text-primary" />
          <p className="text-lg font-bold">{ward.resources.pumps}</p>
          <p className="text-xs text-muted-foreground">Pumps</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-success/10 border border-success/20">
          <Users className="h-5 w-5 mx-auto mb-1 text-success" />
          <p className="text-lg font-bold">{ward.resources.personnel}</p>
          <p className="text-xs text-muted-foreground">Personnel</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-warning/10 border border-warning/20">
          <Truck className="h-5 w-5 mx-auto mb-1 text-warning" />
          <p className="text-lg font-bold">{ward.resources.vehicles}</p>
          <p className="text-xs text-muted-foreground">Vehicles</p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Hotspots
          </span>
          <Badge variant="outline">{ward.hotspots}</Badge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Last Maintenance
          </span>
          <span className="font-medium">{ward.lastMaintenance}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Button 
          className="w-full gradient-primary text-primary-foreground shadow-md" 
          onClick={handleViewMap}
        >
          <Navigation className="h-4 w-4 mr-2" />
          View on Map
        </Button>
        <Button variant="outline" className="w-full">
          <Wrench className="h-4 w-4 mr-2" />
          Deploy Resources
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
              <p className="text-sm text-muted-foreground">
                Click on any ward card to view detailed information and manage resources
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
