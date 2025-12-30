import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext"; // Import AuthProvider
import MapPage from "./pages/MapPage";
import Analytics from "./pages/Analytics";
import Wards from "./pages/Wards";
import Alerts from "./pages/Alerts";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import { wards } from "@/data/mockData";

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Dashboard Redirect based on role
function DashboardRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Navigate to={user?.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'} replace />;
}

function App() {
  useEffect(() => {
    const existingWardsData = localStorage.getItem('wardsData');
    
    if (!existingWardsData) {
      localStorage.setItem('wardsData', JSON.stringify(wards));
      console.log('✅ Wards data initialized');
    } else {
      try {
        const parsed = JSON.parse(existingWardsData);
        if (!Array.isArray(parsed) || parsed.length !== wards.length) {
          localStorage.setItem('wardsData', JSON.stringify(wards));
          console.log('✅ Wards data updated');
        }
      } catch (error) {
        localStorage.setItem('wardsData', JSON.stringify(wards));
        console.log('✅ Wards data reinitialized');
      }
    }

    const existingHotspots = localStorage.getItem('markedHotspots');
    if (!existingHotspots) {
      localStorage.setItem('markedHotspots', JSON.stringify([]));
      console.log('✅ Hotspots storage initialized');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider>
          <AuthProvider> {/* Wrap with AuthProvider */}
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<DashboardRedirect />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/user-dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                  <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                  <Route path="/wards" element={<ProtectedRoute><Wards /></ProtectedRoute>} />
                  <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
