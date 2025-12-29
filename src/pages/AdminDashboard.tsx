import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  FileText, 
  AlertTriangle, 
  MapPin,
  CheckCircle,
  Settings,
  LogOut,
  BarChart3,
  Building2,
  ChevronRight,
  Eye,
  Image as ImageIcon,
  Navigation,
  Check,
  X as XIcon,
  Clock
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [allHotspots, setAllHotspots] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }

    const loadData = () => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const reports = JSON.parse(localStorage.getItem('userReports') || '[]');
      const hotspots = JSON.parse(localStorage.getItem('markedHotspots') || '[]');
      
      setAllUsers(users);
      setAllReports(reports);
      setAllHotspots(hotspots);
    };

    loadData();
    window.addEventListener('reportsUpdated', loadData);
    return () => window.removeEventListener('reportsUpdated', loadData);
  }, [isAuthenticated, user, navigate]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  // Accept Report
  const acceptReport = (reportId: number) => {
    const reports = JSON.parse(localStorage.getItem('userReports') || '[]');
    const updatedReports = reports.map((r: Report) => 
      r.id === reportId ? { ...r, status: 'In Progress' as const } : r
    );
    localStorage.setItem('userReports', JSON.stringify(updatedReports));
    window.dispatchEvent(new Event('reportsUpdated'));
    toast.success('Report accepted and marked as In Progress!');
    setSelectedReport(null);
  };

  // Reject Report
  const rejectReport = (reportId: number) => {
    const reports = JSON.parse(localStorage.getItem('userReports') || '[]');
    const updatedReports = reports.map((r: Report) => 
      r.id === reportId ? { ...r, status: 'Rejected' as const } : r
    );
    localStorage.setItem('userReports', JSON.stringify(updatedReports));
    window.dispatchEvent(new Event('reportsUpdated'));
    toast.error('Report rejected!');
    setSelectedReport(null);
  };

  // Resolve Report
  const resolveReport = (reportId: number) => {
    const reports = JSON.parse(localStorage.getItem('userReports') || '[]');
    const updatedReports = reports.map((r: Report) => 
      r.id === reportId ? { ...r, status: 'Resolved' as const } : r
    );
    localStorage.setItem('userReports', JSON.stringify(updatedReports));
    window.dispatchEvent(new Event('reportsUpdated'));
    toast.success('Report marked as resolved!');
    setSelectedReport(null);
  };

  const stats = {
    totalUsers: allUsers.length,
    totalReports: allReports.length,
    activeAlerts: allReports.filter(r => r.status === 'Pending' || r.status === 'In Progress').length,
    resolvedToday: allReports.filter(r => {
      const reportDate = new Date(r.date);
      const today = new Date();
      return r.status === 'Resolved' && reportDate.toDateString() === today.toDateString();
    }).length,
  };

  const recentReports = allReports
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  const wardPerformance = [
    { name: 'Connaught Place', readiness: 92, reports: allReports.filter(r => r.location.includes('Connaught')).length },
    { name: 'Civil Lines', readiness: 85, reports: allReports.filter(r => r.location.includes('Civil')).length },
    { name: 'Dwarka', readiness: 78, reports: allReports.filter(r => r.location.includes('Dwarka')).length },
    { name: 'Shahdara', readiness: 35, reports: allReports.filter(r => r.location.includes('Shahdara')).length },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'High': return 'bg-warning/20 text-warning border-warning/30';
      case 'Medium': return 'bg-primary/20 text-primary border-primary/30';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-success/20 text-success border-success/30';
      case 'In Progress': return 'bg-warning/20 text-warning border-warning/30';
      case 'Pending': return 'bg-primary/20 text-primary border-primary/30';
      case 'Rejected': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const viewOnMap = (lat: number, lng: number, reportId?: number) => {
    if (reportId) {
      navigate(`/map?lat=${lat}&lng=${lng}&reportId=${reportId}`);
    } else {
      navigate(`/map?lat=${lat}&lng=${lng}`);
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center">
              <Shield className="h-8 w-8 text-warning" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Admin Badge */}
        <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 flex items-center gap-3">
          <Shield className="h-5 w-5 text-warning" />
          <div>
            <p className="font-semibold text-sm">Administrator Access</p>
            <p className="text-xs text-muted-foreground">You have full system access and management capabilities</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/20">
                  <FileText className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalReports}</p>
                  <p className="text-xs text-muted-foreground">Total Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/20">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeAlerts}</p>
                  <p className="text-xs text-muted-foreground">Active Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/20">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.resolvedToday}</p>
                  <p className="text-xs text-muted-foreground">Resolved Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Reports */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Recent Reports
              </CardTitle>
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentReports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">No reports yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentReports.map((report, index) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg bg-secondary/50 border border-border/50 hover:bg-secondary/70 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                            <MapPin className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm">Report #{report.id}</p>
                              {report.image && <ImageIcon className="h-3 w-3 text-primary" />}
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">By: {report.user}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{report.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <Badge className={getStatusColor(report.status)} variant="outline">
                            {report.status}
                          </Badge>
                          <Badge className={getPriorityColor(report.priority)} variant="outline">
                            {report.priority}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                        </span>
                        <span>{new Date(report.date).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        {report.status === 'Pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => acceptReport(report.id)}
                              className="h-7 text-xs bg-success hover:bg-success/90"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => rejectReport(report.id)}
                              className="h-7 text-xs"
                            >
                              <XIcon className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {report.status === 'In Progress' && (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => resolveReport(report.id)}
                            className="h-7 text-xs bg-success hover:bg-success/90"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Mark Resolved
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedReport(report)}
                          className="h-7 text-xs flex-1"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => viewOnMap(report.latitude, report.longitude, report.id)}
                          className="h-7 text-xs flex-1"
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          Map
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ward Performance */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Ward Performance
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/wards">
                  Manage
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {wardPerformance.map((ward, index) => (
                  <motion.div
                    key={ward.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{ward.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{ward.reports} reports</span>
                        <span className={`text-sm font-bold ${ward.readiness >= 60 ? 'text-success' : 'text-destructive'}`}>
                          {ward.readiness}%
                        </span>
                      </div>
                    </div>
                    <Progress value={ward.readiness} className="h-2" />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Admin Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/alerts">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm">Manage Alerts</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/wards">
                  <Building2 className="h-5 w-5" />
                  <span className="text-sm">Ward Management</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/analytics">
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-sm">View Analytics</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/map">
                  <MapPin className="h-5 w-5" />
                  <span className="text-sm">Hotspot Map</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Report Details Modal */}
      <AnimatePresence>
        {selectedReport && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setSelectedReport(null)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl glass-card rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold">Report Details #{selectedReport.id}</h3>
                    <p className="text-sm text-muted-foreground">Submitted by {selectedReport.user}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedReport(null)}>
                    <XIcon className="h-5 w-5" />
                  </Button>
                </div>

                {selectedReport.image && (
                  <div className="mb-6 rounded-xl overflow-hidden border border-border/50">
                    <img src={selectedReport.image} alt="Report" className="w-full h-64 object-cover" />
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{selectedReport.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Latitude</p>
                      <p className="text-sm font-mono">{selectedReport.latitude}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Longitude</p>
                      <p className="text-sm font-mono">{selectedReport.longitude}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <Badge className={getStatusColor(selectedReport.status)}>{selectedReport.status}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Priority</p>
                      <Badge className={getPriorityColor(selectedReport.priority)}>{selectedReport.priority}</Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Submitted On</p>
                    <p className="text-sm">{new Date(selectedReport.date).toLocaleString()}</p>
                  </div>

                  <div className="flex gap-2 pt-4">
                    {selectedReport.status === 'Pending' && (
                      <>
                        <Button className="flex-1 bg-success hover:bg-success/90" onClick={() => acceptReport(selectedReport.id)}>
                          <Check className="h-4 w-4 mr-2" />
                          Accept Report
                        </Button>
                        <Button variant="destructive" className="flex-1" onClick={() => rejectReport(selectedReport.id)}>
                          <XIcon className="h-4 w-4 mr-2" />
                          Reject Report
                        </Button>
                      </>
                    )}
                    {selectedReport.status === 'In Progress' && (
                      <Button className="flex-1 bg-success hover:bg-success/90" onClick={() => resolveReport(selectedReport.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Resolved
                      </Button>
                    )}
                    <Button onClick={() => viewOnMap(selectedReport.latitude, selectedReport.longitude, selectedReport.id)}>
                      <Navigation className="h-4 w-4 mr-2" />
                      View on Map
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default AdminDashboard;
