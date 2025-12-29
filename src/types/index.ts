export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Hotspot {
  id: string;
  name: string;
  coords: [number, number];
  risk: RiskLevel;
  lastFlooded: string;
  depth: string;
  duration: string;
  description?: string;
}

export interface Ward {
  wardNo: number;
  name: string;
  readiness: number;
  resources: {
    pumps: number;
    personnel: number;
    vehicles: number;
  };
  hotspots: number;
  lastMaintenance: string;
  coords: [number, number];
}

export interface Alert {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  location: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export interface RainfallData {
  year: number;
  months: {
    june: number;
    july: number;
    august: number;
    september: number;
  };
  total: number;
  isPrediction?: boolean;
}
