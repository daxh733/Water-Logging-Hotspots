import { useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, MapPin, Clock, Ruler, Navigation, X, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { hotspots, wards } from '@/data/mockData';
import type { Hotspot, RiskLevel } from '@/types';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
};

const userIcon = L.divIcon({
  className: 'user-marker',
  html: `
    <div style="
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 4px solid white;
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// MCD Ward Icon with Building Symbol
const createMCDIcon = (wardNo: number, readiness: number) => {
  const getReadinessColor = () => {
    if (readiness >= 80) return '#22c55e';
    if (readiness >= 60) return '#3b82f6';
    if (readiness >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return L.divIcon({
    className: 'mcd-ward-marker',
    html: `
      <div style="
        background: white;
        width: 48px;
        height: 56px;
        border-radius: 8px;
        border: 3px solid ${getReadinessColor()};
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        <!-- MCD Building Icon SVG -->
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${getReadinessColor()}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 21h18"/>
          <path d="M9 8h1"/>
          <path d="M9 12h1"/>
          <path d="M9 16h1"/>
          <path d="M14 8h1"/>
          <path d="M14 12h1"/>
          <path d="M14 16h1"/>
          <path d="M6 3h12l2 18H4z"/>
        </svg>
        <div style="
          font-size: 10px;
          font-weight: 800;
          color: ${getReadinessColor()};
          margin-top: 2px;
          background: white;
          padding: 1px 4px;
          border-radius: 3px;
          border: 1.5px solid ${getReadinessColor()};
        ">W-${wardNo}</div>
        <div style="
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 10px solid ${getReadinessColor()};
          filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));
        "></div>
      </div>
    `,
    iconSize: [48, 66],
    iconAnchor: [24, 66],
    popupAnchor: [0, -66],
  });
};

const riskColors: Record<RiskLevel, string> = {
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#22c55e',
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

interface HotspotMapProps {
  showGeofencing?: boolean;
  height?: string;
}

export function HotspotMap({ showGeofencing = true, height = '500px' }: HotspotMapProps) {
  const [userPosition, setUserPosition] = useState<[number, number]>([28.6400, 77.2200]);
  const [alertHotspot, setAlertHotspot] = useState<Hotspot | null>(null);
  const [alertDistance, setAlertDistance] = useState<number>(0);
  const [nearestDistance, setNearestDistance] = useState<number | null>(null);
  const [userPos, setUserPos] = useState<L.LatLng>(L.latLng(28.6400, 77.2200));

  const checkGeofence = useCallback((pos: [number, number]) => {
    let minDistance = Infinity;
    let nearestHotspot: Hotspot | null = null;

    for (const hotspot of hotspots) {
      const distance = calculateDistance(pos[0], pos[1], hotspot.coords[0], hotspot.coords[1]);
      if (distance < minDistance) {
        minDistance = distance;
        nearestHotspot = hotspot;
      }
    }

    setNearestDistance(Math.round(minDistance));

    if (minDistance <= 1000 && nearestHotspot) {
      setAlertHotspot(nearestHotspot);
      setAlertDistance(minDistance);
    }
  }, []);

  const handlePositionChange = useCallback((pos: [number, number]) => {
    setUserPosition(pos);
    checkGeofence(pos);
  }, [checkGeofence]);

  const eventHandlers = useMemo(
    () => ({
      dragend(e: L.DragEndEvent) {
        const marker = e.target;
        const newPos = marker.getLatLng();
        setUserPos(newPos);
        handlePositionChange([newPos.lat, newPos.lng]);
      },
    }),
    [handlePositionChange]
  );

  const resetUserPosition = () => {
    setUserPosition([28.6400, 77.2200]);
    setUserPos(L.latLng(28.6400, 77.2200));
    setNearestDistance(null);
  };

  return (
    <div className="relative">
      <div className="glass-card rounded-xl overflow-hidden" style={{ height }}>
        <MapContainer
          center={[28.6139, 77.2090]}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />

          {/* Hotspot circles - dotted borders */}
          {hotspots.map((hotspot) => (
            <Circle
              key={`circle-${hotspot.id}`}
              center={hotspot.coords}
              radius={1000}
              pathOptions={{
                color: riskColors[hotspot.risk],
                fillColor: riskColors[hotspot.risk],
                fillOpacity: 0.2,
                weight: 3,
                dashArray: '10, 5',
              }}
            />
          ))}

          {/* Ward MCD Markers */}
          {wards.map((ward) => (
            <Marker
              key={`ward-${ward.wardNo}`}
              position={ward.coords}
              icon={createMCDIcon(ward.wardNo, ward.readiness)}
            >
              <Popup>
                <div className="p-3 min-w-[250px]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">Ward {ward.wardNo}</h3>
                      <p className="text-sm text-gray-600">{ward.name}</p>
                    </div>
                    <Badge 
                      variant={ward.readiness >= 60 ? "default" : "destructive"}
                      className="ml-2"
                    >
                      {ward.readiness}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Flood Readiness:</span>
                      <span className={`font-semibold ${ward.readiness >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                        {ward.readiness >= 80 ? 'Excellent' : 
                         ward.readiness >= 60 ? 'Good' : 
                         ward.readiness >= 40 ? 'Moderate' : 'Low'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Water-logging Hotspots:</span>
                      <span className="font-semibold text-orange-600">{ward.hotspots}</span>
                    </div>
                  </div>

                  <div className="border-t pt-2 mb-2">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Response Resources:</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-1.5 bg-blue-50 rounded">
                        <div className="font-bold text-blue-600">{ward.resources.pumps}</div>
                        <div className="text-gray-600">Pumps</div>
                      </div>
                      <div className="text-center p-1.5 bg-green-50 rounded">
                        <div className="font-bold text-green-600">{ward.resources.personnel}</div>
                        <div className="text-gray-600">Personnel</div>
                      </div>
                      <div className="text-center p-1.5 bg-orange-50 rounded">
                        <div className="font-bold text-orange-600">{ward.resources.vehicles}</div>
                        <div className="text-gray-600">Vehicles</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 pt-1 border-t">
                    Last maintenance: {ward.lastMaintenance}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Hotspot markers */}
          {hotspots.map((hotspot) => (
            <Marker
              key={`marker-${hotspot.id}`}
              position={hotspot.coords}
              icon={createCustomIcon(riskColors[hotspot.risk])}
            >
              <Popup>
                <div className="p-3 min-w-[220px]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{hotspot.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      hotspot.risk === 'HIGH' ? 'bg-red-100 text-red-700' : 
                      hotspot.risk === 'MEDIUM' ? 'bg-orange-100 text-orange-700' : 
                      'bg-green-100 text-green-700'
                    }`}>
                      {hotspot.risk}
                    </span>
                  </div>
                  {hotspot.description && (
                    <p className="text-xs text-gray-600 mb-2">{hotspot.description}</p>
                  )}
                  <div className="space-y-1 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Water Depth:</span>
                      <span className="font-medium">{hotspot.depth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium">{hotspot.duration}</span>
                    </div>
                    <div className="text-xs text-gray-500 pt-1 border-t">
                      Last flooded: {hotspot.lastFlooded}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* User marker for geofencing */}
          {showGeofencing && (
            <Marker
              position={userPos}
              icon={userIcon}
              draggable={true}
              eventHandlers={eventHandlers}
            >
              <Popup>
                <div className="p-2 text-center">
                  <p className="font-semibold text-gray-900">Test User</p>
                  <p className="text-xs text-gray-600">Drag to test geofencing</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] glass-card p-3 rounded-lg max-w-xs">
        <h4 className="font-semibold text-xs mb-2">Map Legend</h4>
        
        {/* Ward MCD Symbol */}
        <div className="mb-3">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">MCD Ward Offices</p>
          <div className="flex items-center gap-2 text-xs mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-primary">
              <path d="M3 21h18"/>
              <path d="M9 8h1"/>
              <path d="M9 12h1"/>
              <path d="M9 16h1"/>
              <path d="M14 8h1"/>
              <path d="M14 12h1"/>
              <path d="M14 16h1"/>
              <path d="M6 3h12l2 18H4z"/>
            </svg>
            <span>Municipal Ward Office</span>
          </div>
          <div className="space-y-1 ml-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#22c55e' }}></div>
              <span>80-100% Readiness</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
              <span>60-79% Readiness</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
              <span>40-59% Readiness</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }}></div>
              <span>0-39% Readiness</span>
            </div>
          </div>
        </div>

        {/* Hotspot Risk Levels */}
        <div className="border-t pt-2">
          <p className="text-xs font-medium text-muted-foreground mb-1">Water-logging Hotspots</p>
          <div className="space-y-1">
            {(['HIGH', 'MEDIUM', 'LOW'] as RiskLevel[]).map((level) => (
              <div key={level} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: riskColors[level] }}
                />
                <span className="capitalize">{level.toLowerCase()} Risk</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Geofencing controls */}
      {showGeofencing && (
        <div className="absolute top-4 right-4 z-[1000] glass-card p-4 rounded-lg max-w-xs">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Navigation className="h-4 w-4 text-primary" />
            Geofencing Demo
          </h4>
          <p className="text-xs text-muted-foreground mb-3">
            Drag the user marker to test proximity alerts
          </p>
          {nearestDistance !== null && (
            <div className="flex items-center justify-between text-sm mb-3 p-2 rounded bg-secondary/50">
              <span className="text-muted-foreground">Nearest hotspot:</span>
              <span className={`font-bold ${nearestDistance <= 1000 ? 'text-destructive' : 'text-green-500'}`}>
                {nearestDistance > 1000 ? `${(nearestDistance / 1000).toFixed(1)} km` : `${nearestDistance} m`}
              </span>
            </div>
          )}
          <Button size="sm" variant="outline" onClick={resetUserPosition} className="w-full">
            Reset Position
          </Button>
        </div>
      )}

      {/* Alert Modal */}
      <AnimatePresence>
        {alertHotspot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setAlertHotspot(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 rounded-xl max-w-md w-full border-2 border-destructive/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-destructive/20">
                    <AlertTriangle className="h-6 w-6 text-destructive blink-animation" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Danger Zone Alert!</h3>
                    <p className="text-sm text-muted-foreground">You are near a water-logging hotspot</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setAlertHotspot(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10">
                  <Ruler className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="text-sm text-muted-foreground">Distance</p>
                    <p className="font-bold text-lg">{Math.round(alertDistance)} meters</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{alertHotspot.name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      alertHotspot.risk === 'HIGH' ? 'bg-red-100 text-red-700' : 
                      alertHotspot.risk === 'MEDIUM' ? 'bg-orange-100 text-orange-700' : 
                      'bg-green-100 text-green-700'
                    }`}>
                      {alertHotspot.risk}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Water Depth</p>
                      <p className="font-medium">{alertHotspot.depth}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">{alertHotspot.duration}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Last flooded: {alertHotspot.lastFlooded}</span>
                  </div>
                </div>

                <Button className="w-full gradient-primary text-primary-foreground">
                  <Route className="h-4 w-4 mr-2" />
                  View Alternate Route
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
