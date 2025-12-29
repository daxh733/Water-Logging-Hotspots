import { Hotspot, Ward, Alert, RainfallData } from '@/types';

export const hotspots: Hotspot[] = [
  { id: '1', name: 'Minto Bridge', coords: [28.6289, 77.2065], risk: 'HIGH', lastFlooded: '2024-07-15', depth: '4 feet', duration: '6 hours', description: 'Historic flooding point under railway bridge' },
  { id: '2', name: 'ITO Junction', coords: [28.6289, 77.2490], risk: 'HIGH', lastFlooded: '2024-08-02', depth: '3.5 feet', duration: '4 hours', description: 'Major traffic intersection prone to waterlogging' },
  { id: '3', name: 'Pragati Maidan Tunnel', coords: [28.6180, 77.2510], risk: 'HIGH', lastFlooded: '2024-07-28', depth: '5 feet', duration: '8 hours', description: 'Underpass tunnel with drainage issues' },
  { id: '4', name: 'Pul Prahladpur', coords: [28.5089, 77.2590], risk: 'HIGH', lastFlooded: '2024-08-10', depth: '4.5 feet', duration: '5 hours', description: 'Railway underpass with recurring floods' },
  { id: '5', name: 'Ring Road Ashram', coords: [28.5719, 77.2510], risk: 'MEDIUM', lastFlooded: '2024-07-20', depth: '2 feet', duration: '3 hours', description: 'Flyover junction waterlogging' },
  { id: '6', name: 'Sarai Kale Khan', coords: [28.5889, 77.2700], risk: 'MEDIUM', lastFlooded: '2024-08-05', depth: '2.5 feet', duration: '4 hours', description: 'Bus terminal area flooding' },
  { id: '7', name: 'Lajpat Nagar Underpass', coords: [28.5689, 77.2390], risk: 'MEDIUM', lastFlooded: '2024-07-22', depth: '2 feet', duration: '2 hours', description: 'Commercial area underpass' },
  { id: '8', name: 'Connaught Place', coords: [28.6315, 77.2167], risk: 'LOW', lastFlooded: '2024-06-30', depth: '1 feet', duration: '1 hour', description: 'Central business district drainage' },
  { id: '9', name: 'Rajiv Chowk', coords: [28.6328, 77.2197], risk: 'LOW', lastFlooded: '2024-07-10', depth: '1.5 feet', duration: '1.5 hours', description: 'Metro station area' },
  { id: '10', name: 'Karol Bagh Market', coords: [28.6508, 77.1908], risk: 'MEDIUM', lastFlooded: '2024-07-25', depth: '2 feet', duration: '2.5 hours', description: 'Commercial market drainage issues' },
  { id: '11', name: 'Rohini Sector 3', coords: [28.7041, 77.1025], risk: 'LOW', lastFlooded: '2024-08-01', depth: '1 feet', duration: '1 hour', description: 'Residential colony waterlogging' },
  { id: '12', name: 'Dwarka Sector 21', coords: [28.5515, 77.0587], risk: 'LOW', lastFlooded: '2024-07-18', depth: '1.5 feet', duration: '2 hours', description: 'Metro station surroundings' },
  { id: '13', name: 'Janakpuri West', coords: [28.6285, 77.0855], risk: 'MEDIUM', lastFlooded: '2024-08-08', depth: '2 feet', duration: '3 hours', description: 'District centre flooding' },
  { id: '14', name: 'Nehru Place Flyover', coords: [28.5489, 77.2510], risk: 'HIGH', lastFlooded: '2024-08-12', depth: '3 feet', duration: '4 hours', description: 'IT hub flyover underpass' },
  { id: '15', name: 'Okhla Industrial Area', coords: [28.5289, 77.2710], risk: 'MEDIUM', lastFlooded: '2024-07-30', depth: '2.5 feet', duration: '3.5 hours', description: 'Industrial zone drainage' },
  { id: '16', name: 'Mayur Vihar Phase 1', coords: [28.5989, 77.2990], risk: 'LOW', lastFlooded: '2024-08-03', depth: '1 feet', duration: '1 hour', description: 'Residential area near Yamuna' },
  { id: '17', name: 'Geeta Colony', coords: [28.6489, 77.2790], risk: 'HIGH', lastFlooded: '2024-08-14', depth: '4 feet', duration: '6 hours', description: 'Low-lying area near river' },
  { id: '18', name: 'Shahdara Flyover', coords: [28.6789, 77.2890], risk: 'MEDIUM', lastFlooded: '2024-07-26', depth: '2 feet', duration: '2.5 hours', description: 'Trans-Yamuna underpass' },
];

export const wards: Ward[] = [
  { wardNo: 1, name: 'Civil Lines', readiness: 85, resources: { pumps: 12, personnel: 45, vehicles: 8 }, hotspots: 2, lastMaintenance: '2024-06-15', coords: [28.6800, 77.2300] },
  { wardNo: 2, name: 'Karol Bagh', readiness: 72, resources: { pumps: 8, personnel: 32, vehicles: 5 }, hotspots: 3, lastMaintenance: '2024-05-20', coords: [28.6508, 77.1908] },
  { wardNo: 3, name: 'Sadar Bazar', readiness: 45, resources: { pumps: 4, personnel: 18, vehicles: 2 }, hotspots: 5, lastMaintenance: '2024-03-10', coords: [28.6600, 77.2100] },
  { wardNo: 4, name: 'Chandni Chowk', readiness: 38, resources: { pumps: 3, personnel: 15, vehicles: 2 }, hotspots: 4, lastMaintenance: '2024-02-28', coords: [28.6506, 77.2295] },
  { wardNo: 5, name: 'Connaught Place', readiness: 92, resources: { pumps: 15, personnel: 60, vehicles: 12 }, hotspots: 1, lastMaintenance: '2024-07-01', coords: [28.6315, 77.2167] },
  { wardNo: 6, name: 'Vasant Vihar', readiness: 88, resources: { pumps: 10, personnel: 40, vehicles: 7 }, hotspots: 1, lastMaintenance: '2024-06-25', coords: [28.5570, 77.1560] },
  { wardNo: 7, name: 'Dwarka', readiness: 78, resources: { pumps: 9, personnel: 35, vehicles: 6 }, hotspots: 2, lastMaintenance: '2024-05-30', coords: [28.5921, 77.0460] },
  { wardNo: 8, name: 'Rohini', readiness: 65, resources: { pumps: 6, personnel: 25, vehicles: 4 }, hotspots: 3, lastMaintenance: '2024-04-15', coords: [28.7495, 77.0565] },
  { wardNo: 9, name: 'Shahdara', readiness: 35, resources: { pumps: 3, personnel: 12, vehicles: 2 }, hotspots: 6, lastMaintenance: '2024-01-20', coords: [28.6789, 77.2890] },
  { wardNo: 10, name: 'Mayur Vihar', readiness: 55, resources: { pumps: 5, personnel: 22, vehicles: 3 }, hotspots: 4, lastMaintenance: '2024-04-01', coords: [28.5989, 77.2990] },
];

export const alerts: Alert[] = [
  { id: '1', severity: 'Critical', location: 'Minto Bridge', message: 'Water level rising rapidly - 4 feet and increasing', timestamp: new Date('2024-08-15T14:30:00'), isRead: false },
  { id: '2', severity: 'High', location: 'ITO Junction', message: 'Traffic diversion in effect due to waterlogging', timestamp: new Date('2024-08-15T13:45:00'), isRead: false },
  { id: '3', severity: 'Medium', location: 'Ring Road Ashram', message: 'Pumps deployed, water level stabilizing', timestamp: new Date('2024-08-15T12:00:00'), isRead: true },
  { id: '4', severity: 'Low', location: 'Connaught Place', message: 'Minor waterlogging reported, drains clearing', timestamp: new Date('2024-08-15T11:30:00'), isRead: true },
  { id: '5', severity: 'High', location: 'Pragati Maidan Tunnel', message: 'Tunnel closed for traffic, emergency pumping underway', timestamp: new Date('2024-08-15T10:15:00'), isRead: false },
];

export const rainfallData: RainfallData[] = [
  { year: 2019, months: { june: 45, july: 210, august: 180, september: 95 }, total: 530 },
  { year: 2020, months: { june: 52, july: 245, august: 198, september: 88 }, total: 583 },
  { year: 2021, months: { june: 38, july: 280, august: 220, september: 102 }, total: 640 },
  { year: 2022, months: { june: 65, july: 195, august: 165, september: 78 }, total: 503 },
  { year: 2023, months: { june: 58, july: 320, august: 245, september: 115 }, total: 738 },
  { year: 2024, months: { june: 72, july: 285, august: 210, september: 98 }, total: 665 },
  { year: 2025, months: { june: 55, july: 290, august: 225, september: 105 }, total: 675, isPrediction: true },
];

export const stats = {
  totalHotspots: 23,
  highRiskZones: 6,
  wardsReady: 156,
  activeAlerts: 5,
  totalWards: 272,
};
