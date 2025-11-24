import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { ParticipantHomePage } from './pages/ParticipantHomePage';
import { AdminHomePage } from './pages/AdminHomePage';
import { OrganiserHomePage } from './pages/OrganiserHomePage';
import { LoginPage } from './pages/LoginPage';
import { EventsCatalogPage } from './pages/EventsCatalogPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { PaymentPage } from './pages/PaymentPage';
import { RegistrationConfirmationPage } from './pages/RegistrationConfirmationPage';
import { CreateEventWizard } from './pages/CreateEventWizard';
import { AdminApprovalPage } from './pages/AdminApprovalPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { FeedbackPage } from './pages/FeedbackPage';

// Protected Route Component
function ProtectedRoute({ 
  children, 
  adminOnly = false, 
  organizerOnly = false 
}: { 
  children: React.ReactNode; 
  adminOnly?: boolean;
  organizerOnly?: boolean;
}) {
  const { isAuthenticated, isAdmin, isOrganizer, isLoading } = useAuth();
  
  // Wait for auth check to complete
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E21833] mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  if (organizerOnly && !(isOrganizer || isAdmin)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// Home Route Component - determines which home page to show
function HomeRoute() {
  const { isAuthenticated, isAdmin, isOrganizer } = useAuth();
  
  if (!isAuthenticated) {
    return <LandingPage />;
  }
  
  if (isAdmin) {
    return <AdminHomePage />;
  }
  
  if (isOrganizer) {
    return <OrganiserHomePage />;
  }
  
  return <ParticipantHomePage />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Login page without Layout */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* All other routes with Layout */}
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<HomeRoute />} />
                  <Route path="/events" element={
                    <ProtectedRoute>
                      <EventsCatalogPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/events/:id" element={
                    <ProtectedRoute>
                      <EventDetailsPage />
                    </ProtectedRoute>
                  } />

              {/* Public feedback page, used from email links */}
                  <Route path="/events/:id/feedback" element={<FeedbackPage />} />
                  <Route path="/payment" element={
                    <ProtectedRoute>
                      <PaymentPage />
                    </ProtectedRoute>
                  } />

                  <Route path="/payment" element={
                    <ProtectedRoute>
                      <PaymentPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/registration-confirmation" element={
                    <ProtectedRoute>
                      <RegistrationConfirmationPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/create-event" element={
                    <ProtectedRoute organizerOnly>
                      <CreateEventWizard />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute adminOnly>
                      <AdminApprovalPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <UserProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/analytics" element={
                    <ProtectedRoute adminOnly>
                      <AnalyticsDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}