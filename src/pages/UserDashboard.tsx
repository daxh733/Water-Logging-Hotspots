import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Camera, 
  Bell, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  LogOut,
  Settings,
  ChevronRight
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { ReportIssueModal } from '@/components/user/ReportIssueModal';

interface Report {
  id: number;
  location: string;
  status: 'Resolved' | 'In Progress' | 'Pending';
  date: string;
  description: string;
  userId: string;
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [userReports, setUserReports] = useState<Report[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load user's reports from localStorage
  useEffect(() => {
    const loadReports = () => {
      if (user) {
        const allReports = JSON.parse(localStorage.getItem('userReports') || '[]');
        
        // Filter reports for this user
        const myReports = allReports.filter((r: Report) => r.userId === user.id);
        setUserReports(myReports);
      }
    };

    loadReports();

    // Listen for report updates
    window.addEventListener('reportsUpdated', loadReports);

    return () => {
      window.removeEventListener('reportsUpdated', loadReports);
    };
  }, [user]);

  if (!user) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-success/20 text-success border-success/30';
      case 'In Progress': return 'bg-warning/20 text-warning border-warning/30';
      case 'Pending': return 'bg-primary/20 text-primary border-primary/30';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  // Calculate stats
  const resolvedCount = userReports.filter(r => r.status === 'Resolved').length;
  const inProgressCount = userReports.filter(r => r.status === 'In Progress').length;
  const pendingCount = userReports.filter(r => r.status === 'Pending').length;

  // Get last active time
  const getLastActive = () => {
    const now = new Date();
    const created = new Date(user.createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return created.toLocaleDateString();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
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
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">Member since: {getLastActive()}</p>
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

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userReports.length}</p>
                  <p className="text-xs text-muted-foreground">Reports Submitted</p>
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
                  <p className="text-2xl font-bold">{resolvedCount}</p>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/20">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inProgressCount}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
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
                  <p className="text-2xl font-bold">{pendingCount}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              {/* Report Issue Button - Opens Modal */}
              <Button 
                className="h-auto py-6 flex-col gap-2 gradient-primary text-primary-foreground"
                onClick={() => setIsReportModalOpen(true)}
              >
                <Camera className="h-6 w-6" />
                <span>Report Issue</span>
              </Button>
              
              <Button variant="outline" className="h-auto py-6 flex-col gap-2" asChild>
                <Link to="/map">
                  <MapPin className="h-6 w-6" />
                  <span>View Hotspots</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col gap-2" asChild>
                <Link to="/alerts">
                  <Bell className="h-6 w-6" />
                  <span>My Alerts</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">My Recent Reports</CardTitle>
            {userReports.length > 0 && (
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {userReports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-2">No Reports Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start by reporting waterlogging issues in your area
                </p>
                <Button onClick={() => setIsReportModalOpen(true)}>
                  <Camera className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userReports.slice(0, 5).map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-secondary/50 border border-border/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium">{report.location}</span>
                      </div>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                    <p className="text-xs text-muted-foreground">Submitted: {new Date(report.date).toLocaleString()}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Report Issue Modal */}
      <ReportIssueModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />
    </Layout>
  );
};

export default UserDashboard;
