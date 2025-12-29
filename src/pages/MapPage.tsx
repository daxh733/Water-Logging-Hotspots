import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Fix icon URLs
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

interface Hotspot {
  id: number;
  lat: number;
  lng: number;
  title: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  wardNo?: string;
  createdAt?: string;
}

interface Report {
  id: number;
  userId: string;
  user: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  date: string;
  image?: string | null;
}

export default function MapPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth(); // Get current user
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [newPosition, setNewPosition] = useState<{ lat: number; lng: number } | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const circlesRef = useRef<L.Circle[]>([]);
  const reportMarkersRef = useRef<L.Marker[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const tempMarkerRef = useRef<L.Marker | null>(null);
  const wardMarkerRef = useRef<L.Marker | null>(null);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Get parameters from URL
  const wardNo = searchParams.get('ward');
  const wardLat = searchParams.get('lat');
  const wardLng = searchParams.get('lng');
  const wardReadiness = searchParams.get('readiness');
  const reportLat = searchParams.get('lat');
  const reportLng = searchParams.get('lng');
  const reportId = searchParams.get('reportId');

  // Load hotspots and reports from localStorage
  useEffect(() => {
    const savedHotspots = localStorage.getItem('markedHotspots');
    if (savedHotspots) {
      try {
        setHotspots(JSON.parse(savedHotspots));
      } catch (error) {
        console.error('Error loading hotspots:', error);
      }
    }

    const savedReports = localStorage.getItem('userReports');
    if (savedReports) {
      try {
        setReports(JSON.parse(savedReports));
      } catch (error) {
        console.error('Error loading reports:', error);
      }
    }
  }, []);

  // Find nearest ward for a location
  const findNearestWard = (lat: number, lng: number): string => {
    try {
      const wardsData = JSON.parse(localStorage.getItem('wardsData') || '[]');
      
      if (wardsData.length === 0) {
        return 'Unknown';
      }

      let nearestWard = null;
      let minDistance = Infinity;
      
      wardsData.forEach((ward: any) => {
        if (ward.coords && ward.coords.length === 2) {
          const distance = Math.sqrt(
            Math.pow(ward.coords[0] - lat, 2) + 
            Math.pow(ward.coords[1] - lng, 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            nearestWard = ward.wardNo;
          }
        }
      });
      
      return nearestWard || 'Unknown';
    } catch (error) {
      console.error('Error finding nearest ward:', error);
      return 'Unknown';
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Determine initial view
    let initialLat = 28.6139;
    let initialLng = 77.2090;
    let initialZoom = 11;

    if (reportId && reportLat && reportLng) {
      initialLat = parseFloat(reportLat);
      initialLng = parseFloat(reportLng);
      initialZoom = 16;
    } else if (wardNo && wardLat && wardLng) {
      initialLat = parseFloat(wardLat);
      initialLng = parseFloat(wardLng);
      initialZoom = 15;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: false
    }).setView([initialLat, initialLng], initialZoom);
    
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map);

    // ONLY ADMIN CAN CLICK TO MARK - Others can only view
    if (isAdmin) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        setNewPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
        
        if (tempMarkerRef.current) {
          tempMarkerRef.current.remove();
        }
        
        tempMarkerRef.current = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
      });
    }

    mapRef.current = map;

    // Add ward marker if ward data exists
    if (wardNo && wardLat && wardLng && wardReadiness && !reportId) {
      const readiness = parseInt(wardReadiness);
      const markerColor = readiness >= 80 ? '#22c55e' : readiness >= 60 ? '#84cc16' : readiness >= 40 ? '#f97316' : '#ef4444';
      
      const wardIcon = L.divIcon({
        className: 'custom-ward-icon',
        html: `<div style="
          background-color: ${markerColor};
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          color: white;
        ">${wardNo}</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      wardMarkerRef.current = L.marker([parseFloat(wardLat), parseFloat(wardLng)], { icon: wardIcon })
        .addTo(map)
        .bindPopup(`
          <div style="padding: 14px; min-width: 200px; background: #1f2937; color: white; border-radius: 10px;">
            <h3 style="font-weight: bold; font-size: 18px; margin-bottom: 8px; color: #60a5fa;">Ward ${wardNo}</h3>
            <div style="margin-bottom: 12px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-size: 12px; color: #d1d5db;">Readiness Score</span>
                <span style="font-size: 16px; font-weight: bold; color: ${markerColor};">${readiness}%</span>
              </div>
              <div style="
                height: 6px; 
                background: #374151; 
                border-radius: 3px; 
                overflow: hidden;
              ">
                <div style="
                  height: 100%; 
                  width: ${readiness}%; 
                  background: ${markerColor}; 
                  border-radius: 3px;
                  transition: width 0.3s;
                "></div>
              </div>
            </div>
            <p style="font-size: 11px; color: #9ca3af; margin-top: 8px;">
              ${readiness >= 80 ? '✅ Excellent readiness' : readiness >= 60 ? '✓ Good readiness' : readiness >= 40 ? '⚠️ Moderate readiness' : '❌ Low readiness'}
            </p>
          </div>
        `, {
          className: 'custom-popup'
        })
        .openPopup();
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [wardNo, wardLat, wardLng, wardReadiness, reportId, reportLat, reportLng, isAdmin]);

  // Load report markers on map (VISIBLE TO ALL)
  useEffect(() => {
    if (!mapRef.current) return;

    reportMarkersRef.current.forEach(marker => marker.remove());
    reportMarkersRef.current = [];

    reports.forEach((report) => {
      if (!report.latitude || !report.longitude) return;

      let markerColor = '#3b82f6';
      let statusIcon = '⏳';
      
      if (report.status === 'In Progress') {
        markerColor = '#f59e0b';
        statusIcon = '⚠️';
      } else if (report.status === 'Resolved') {
        markerColor = '#10b981';
        statusIcon = '✅';
      } else if (report.status === 'Rejected') {
        markerColor = '#6b7280';
        statusIcon = '❌';
      }

      const isFocused = reportId && parseInt(reportId) === report.id;
      const pulseAnimation = isFocused ? `
        @keyframes reportPulse {
          0%, 100% { transform: scale(1) rotate(-45deg); }
          50% { transform: scale(1.15) rotate(-45deg); }
        }
      ` : '';

      const reportIcon = L.divIcon({
        className: 'custom-report-marker',
        html: `
          <style>${pulseAnimation}</style>
          <div style="
            background-color: ${markerColor};
            width: ${isFocused ? '42px' : '36px'};
            height: ${isFocused ? '42px' : '36px'};
            border-radius: 50% 50% 50% 0;
            border: ${isFocused ? '4px' : '3px'} solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,${isFocused ? '0.5' : '0.3'});
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            ${isFocused ? 'animation: reportPulse 2s infinite;' : ''}
          ">
            <span style="
              transform: rotate(45deg);
              font-size: ${isFocused ? '18px' : '16px'};
            ">${statusIcon}</span>
          </div>
        `,
        iconSize: [isFocused ? 42 : 36, isFocused ? 42 : 36],
        iconAnchor: [isFocused ? 21 : 18, isFocused ? 42 : 36],
        popupAnchor: [0, isFocused ? -42 : -36]
      });

      const marker = L.marker([report.latitude, report.longitude], { 
        icon: reportIcon 
      }).addTo(mapRef.current!);

      marker.bindPopup(`
        <div style="padding: 14px; min-width: 260px; background: #1f2937; color: white; border-radius: 10px;">
          <h3 style="font-weight: bold; font-size: 17px; margin-bottom: 8px; color: ${markerColor};">
            ${statusIcon} Report #${report.id}
          </h3>
          <div style="margin-bottom: 10px;">
            <p style="font-size: 12px; margin-bottom: 4px; color: #d1d5db;">
              <strong>By:</strong> ${report.user}
            </p>
            <p style="font-size: 12px; margin-bottom: 8px; color: #d1d5db; line-height: 1.4;">
              ${report.description}
            </p>
          </div>
          <div style="display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;">
            <span style="
              background: ${markerColor}30;
              color: ${markerColor};
              padding: 4px 10px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: bold;
              border: 1px solid ${markerColor}50;
            ">${report.status}</span>
            <span style="
              background: #374151;
              color: #d1d5db;
              padding: 4px 10px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: bold;
            ">${report.priority}</span>
          </div>
          <div style="padding-top: 8px; border-top: 1px solid #374151;">
            <p style="font-size: 10px; color: #9ca3af; margin-bottom: 4px;">
              📍 ${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}
            </p>
            <p style="font-size: 10px; color: #9ca3af;">
              📅 ${new Date(report.date).toLocaleString()}
            </p>
          </div>
        </div>
      `, {
        maxWidth: 300,
        className: 'custom-popup'
      });

      if (isFocused) {
        marker.openPopup();
      }

      reportMarkersRef.current.push(marker);
    });

    const handleReportsUpdate = () => {
      const updatedReports = JSON.parse(localStorage.getItem('userReports') || '[]');
      setReports(updatedReports);
    };

    window.addEventListener('reportsUpdated', handleReportsUpdate);
    return () => window.removeEventListener('reportsUpdated', handleReportsUpdate);
  }, [reports, reportId, mapRef.current]);

  // Search location function
  const searchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapRef.current) return;

    setSearching(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        mapRef.current.setView([latitude, longitude], 15);

        // Only admin can mark from search
        if (isAdmin) {
          if (tempMarkerRef.current) {
            tempMarkerRef.current.remove();
          }
          tempMarkerRef.current = L.marker([latitude, longitude])
            .addTo(mapRef.current)
            .bindPopup(`<b>${display_name}</b><br>Click on map to mark hotspot here`)
            .openPopup();

          setNewPosition({ lat: latitude, lng: longitude });
        } else {
          // For non-admin, just show location
          if (tempMarkerRef.current) {
            tempMarkerRef.current.remove();
          }
          tempMarkerRef.current = L.marker([latitude, longitude])
            .addTo(mapRef.current)
            .bindPopup(`<b>${display_name}</b>`)
            .openPopup();
        }
      } else {
        toast.error('Location not found! Try different keywords.');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  // Update hotspot markers and circles (VISIBLE TO ALL)
  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach(marker => marker.remove());
    circlesRef.current.forEach(circle => circle.remove());
    markersRef.current = [];
    circlesRef.current = [];

    hotspots.forEach(spot => {
      const colors = {
        high: '#ef4444',
        medium: '#f97316',
        low: '#22c55e'
      };

      const circle = L.circle([spot.lat, spot.lng], {
        color: colors[spot.severity],
        fillColor: colors[spot.severity],
        fillOpacity: 0.15,
        opacity: 0.4,
        radius: 750,
        weight: 2
      }).addTo(mapRef.current!);

      circlesRef.current.push(circle);

      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="
          background-color: ${colors[spot.severity]};
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      // Delete button only for admin
      const deleteButton = isAdmin ? `
        <div style="display: flex; gap: 8px;">
          <button 
            onclick="window.deleteHotspot(${spot.id})"
            style="
              flex: 1;
              font-size: 11px;
              background-color: #7f1d1d;
              color: #fca5a5;
              padding: 6px 12px;
              border-radius: 6px;
              border: none;
              cursor: pointer;
              font-weight: 500;
            "
            onmouseover="this.style.backgroundColor='#991b1b'"
            onmouseout="this.style.backgroundColor='#7f1d1d'"
          >Delete</button>
        </div>
      ` : '';

      const marker = L.marker([spot.lat, spot.lng], { icon })
        .addTo(mapRef.current!)
        .bindPopup(`
          <div style="padding: 12px; min-width: 220px; background: #1f2937; color: white; border-radius: 8px;">
            <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #60a5fa;">${spot.title}</h3>
            <p style="font-size: 13px; color: #d1d5db; margin-bottom: 10px; line-height: 1.4;">${spot.description}</p>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px;">
              <span style="
                font-size: 11px;
                padding: 4px 12px;
                border-radius: 12px;
                font-weight: 600;
                background-color: ${colors[spot.severity]};
                color: white;
              ">${spot.severity.toUpperCase()}</span>
              ${spot.wardNo ? `<span style="font-size: 11px; color: #9ca3af;">Ward ${spot.wardNo}</span>` : ''}
            </div>
            ${deleteButton}
            <p style="font-size: 10px; color: #9ca3af; margin-top: 8px;">
              📍 Affected area: ~750m radius
            </p>
          </div>
        `, {
          className: 'custom-popup'
        });

      markersRef.current.push(marker);
    });
  }, [hotspots, isAdmin]);

  // Delete hotspot function (ADMIN ONLY)
  useEffect(() => {
    if (isAdmin) {
      (window as any).deleteHotspot = (id: number) => {
        if (confirm('Delete this hotspot?')) {
          setHotspots(prev => {
            const updated = prev.filter(spot => spot.id !== id);
            localStorage.setItem('markedHotspots', JSON.stringify(updated));
            window.dispatchEvent(new Event('hotspotsUpdated'));
            return updated;
          });
        }
      };
    }
  }, [isAdmin]);

  // Add hotspot function (ADMIN ONLY)
  const addHotspot = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast.error('Only administrators can add hotspots');
      return;
    }

    if (!newPosition) {
      toast.error('Please click on map to select a location first!');
      return;
    }

    const formData = new FormData(e.currentTarget);
    
    const newHotspot: Hotspot = {
      id: Date.now(),
      lat: newPosition.lat,
      lng: newPosition.lng,
      title: formData.get('title') as string,
      severity: formData.get('severity') as 'low' | 'medium' | 'high',
      description: formData.get('description') as string,
      wardNo: findNearestWard(newPosition.lat, newPosition.lng),
      createdAt: new Date().toISOString(),
    };

    const updatedHotspots = [...hotspots, newHotspot];
    setHotspots(updatedHotspots);
    localStorage.setItem('markedHotspots', JSON.stringify(updatedHotspots));
    window.dispatchEvent(new Event('hotspotsUpdated'));
    
    if (tempMarkerRef.current) {
      tempMarkerRef.current.remove();
      tempMarkerRef.current = null;
    }
    
    (e.target as HTMLFormElement).reset();
    setNewPosition(null);
    toast.success(`Hotspot added successfully in Ward ${newHotspot.wardNo}!`);
  };

  const clearSelection = () => {
    setNewPosition(null);
    if (tempMarkerRef.current) {
      tempMarkerRef.current.remove();
      tempMarkerRef.current = null;
    }
  };

  return (
    <>
      <style>{`
        .custom-div-icon, .custom-ward-icon, .custom-report-marker {
          background: none;
          border: none;
        }
        
        .leaflet-popup-content-wrapper,
        .leaflet-popup-tip {
          background: #1f2937 !important;
          color: white;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
        }
        
        .leaflet-popup-close-button {
          color: #9ca3af !important;
        }
        
        .leaflet-popup-close-button:hover {
          color: #ffffff !important;
        }
        
        .custom-popup .leaflet-popup-content {
          margin: 0;
        }
        
        .dark-input {
          transition: all 0.2s;
        }
        
        .dark-input:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
        
        .dark-button {
          transition: all 0.2s;
        }
        
        .dark-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        
        .dark-button:active {
          transform: translateY(0);
        }

        .search-button:hover {
          background-color: #2563eb !important;
        }

        .back-button:hover {
          background-color: #374151 !important;
        }
      `}</style>

      <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
        {/* Map Container */}
        <div 
          ref={mapContainerRef} 
          style={{ width: '100%', height: '100%' }}
        />

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="back-button"
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            backgroundColor: '#1f2937',
            padding: '10px 16px',
            borderRadius: '10px',
            border: '1px solid #374151',
            color: '#e5e7eb',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'all 0.2s'
          }}
        >
          <span style={{ fontSize: '18px' }}>←</span>
          <span>Back to Dashboard</span>
        </button>

        {/* Search Box */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          width: '500px',
          maxWidth: '90%'
        }}>
          <form onSubmit={searchLocation} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location... (e.g., Connaught Place Delhi)"
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: '14px',
                border: '2px solid #374151',
                borderRadius: '10px',
                outline: 'none',
                backgroundColor: '#1f2937',
                color: '#f3f4f6',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
              className="dark-input"
            />
            <button
              type="submit"
              disabled={searching}
              className="search-button"
              style={{
                padding: '12px 24px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: searching ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                opacity: searching ? 0.7 : 1
              }}
            >
              {searching ? '🔍 Searching...' : '🔍 Search'}
            </button>
          </form>
        </div>

        {/* Add Hotspot Form - ADMIN ONLY */}
        {isAdmin && (
          <div style={{
            position: 'absolute',
            top: '90px',
            right: '20px',
            backgroundColor: '#1f2937',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
            width: '400px',
            maxWidth: '90%',
            zIndex: 1000,
            border: '2px solid #3b82f6',
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 style={{ 
                fontWeight: 'bold', 
                fontSize: '20px', 
                color: '#60a5fa',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: 0
              }}>
                🚰 Mark Water Hotspot
              </h3>
              <span style={{
                fontSize: '10px',
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: '#f59e0b20',
                color: '#f59e0b',
                fontWeight: '600'
              }}>
                ADMIN ONLY
              </span>
            </div>
            
            {newPosition ? (
              <>
                <p style={{ fontSize: '12px', color: '#22c55e', marginBottom: '16px', fontWeight: '600' }}>
                  ✓ Location Selected<br/>
                  Lat: {newPosition.lat.toFixed(6)}, Lng: {newPosition.lng.toFixed(6)}<br/>
                  <span style={{ color: '#60a5fa' }}>
                    Ward: {findNearestWard(newPosition.lat, newPosition.lng)}
                  </span>
                </p>
                <button
                  onClick={clearSelection}
                  style={{
                    fontSize: '11px',
                    backgroundColor: '#374151',
                    color: '#d1d5db',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    marginBottom: '16px'
                  }}
                >
                  Clear Selection
                </button>
              </>
            ) : (
              <p style={{ fontSize: '12px', color: '#f97316', marginBottom: '20px', fontWeight: '600' }}>
                ⚠️ Click on map or search location to select spot
              </p>
            )}

            <form onSubmit={addHotspot}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  marginBottom: '6px',
                  color: '#e5e7eb'
                }}>
                  Issue Title *
                </label>
                <input
                  name="title"
                  placeholder="e.g., Water Leakage on Main Road"
                  required
                  className="dark-input"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #374151',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#111827',
                    color: '#f3f4f6'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  marginBottom: '6px',
                  color: '#e5e7eb'
                }}>
                  Severity Level *
                </label>
                <select
                  name="severity"
                  required
                  className="dark-input"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #374151',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#111827',
                    color: '#f3f4f6'
                  }}
                >
                  <option value="low">🟢 Low - Minor Issue</option>
                  <option value="medium">🟠 Medium - Needs Attention</option>
                  <option value="high">🔴 High - Urgent/Critical</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  marginBottom: '6px',
                  color: '#e5e7eb'
                }}>
                  Description *
                </label>
                <textarea
                  name="description"
                  placeholder="Describe the water issue in detail..."
                  required
                  rows={4}
                  className="dark-input"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #374151',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'none',
                    backgroundColor: '#111827',
                    color: '#f3f4f6'
                  }}
                />
              </div>

              <button
                type="submit"
                className="dark-button"
                style={{
                  width: '100%',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Add Hotspot
              </button>
            </form>
          </div>
        )}

        {/* Info Badge for Non-Admin */}
        {!isAdmin && (
          <div style={{
            position: 'absolute',
            top: '90px',
            right: '20px',
            backgroundColor: '#1f2937',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            width: '300px',
            maxWidth: '90%',
            zIndex: 1000,
            border: '1px solid #374151'
          }}>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, lineHeight: '1.5' }}>
              <span style={{ fontSize: '16px', marginRight: '8px' }}>ℹ️</span>
              You are viewing the map in <strong style={{ color: '#60a5fa' }}>read-only mode</strong>. 
              All reports and hotspots are visible. Only administrators can add new hotspots.
            </p>
          </div>
        )}

        {/* Total Counter */}
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '20px',
          backgroundColor: '#1f2937',
          padding: '10px 16px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          border: '1px solid #374151'
        }}>
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#e5e7eb', margin: 0, marginBottom: '6px' }}>
            🔵 Hotspots: <span style={{ color: '#60a5fa', fontSize: '15px' }}>{hotspots.length}</span>
          </p>
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#e5e7eb', margin: 0 }}>
            📍 Reports: <span style={{ color: '#f59e0b', fontSize: '15px' }}>{reports.length}</span>
          </p>
        </div>

        {/* Legend */}
        <div style={{
          position: 'absolute',
          bottom: '100px',
          left: '20px',
          backgroundColor: '#1f2937',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          border: '1px solid #374151'
        }}>
          <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px', color: '#e5e7eb' }}>
            Legend:
          </p>
          
          {/* Hotspot Severity */}
          <p style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#9ca3af' }}>
            Hotspot Severity:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '18px', 
                height: '18px', 
                borderRadius: '50%', 
                backgroundColor: '#ef4444',
                border: '2px solid #991b1b'
              }}></div>
              <span style={{ fontSize: '12px', color: '#d1d5db' }}>High - Urgent</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '18px', 
                height: '18px', 
                borderRadius: '50%', 
                backgroundColor: '#f97316',
                border: '2px solid #9a3412'
              }}></div>
              <span style={{ fontSize: '12px', color: '#d1d5db' }}>Medium</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '18px', 
                height: '18px', 
                borderRadius: '50%', 
                backgroundColor: '#22c55e',
                border: '2px solid #166534'
              }}></div>
              <span style={{ fontSize: '12px', color: '#d1d5db' }}>Low - Minor</span>
            </div>
          </div>
          
          {/* Report Status */}
          <div style={{ borderTop: '1px solid #374151', paddingTop: '12px' }}>
            <p style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#9ca3af' }}>
              Report Status:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>⏳</span>
                <span style={{ fontSize: '12px', color: '#3b82f6' }}>Pending</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>⚠️</span>
                <span style={{ fontSize: '12px', color: '#f59e0b' }}>In Progress</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>✅</span>
                <span style={{ fontSize: '12px', color: '#10b981' }}>Resolved</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>❌</span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Rejected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
