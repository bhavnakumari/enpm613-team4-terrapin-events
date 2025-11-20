import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { ParticipantHomePage } from './pages/ParticipantHomePage';
import { AdminHomePage } from './pages/AdminHomePage';
import { LoginPage } from './pages/LoginPage';
import { EventsCatalogPage } from './pages/EventsCatalogPage';
import { CreateEventWizard } from './pages/CreateEventWizard';
import { AdminApprovalPage } from './pages/AdminApprovalPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { PaymentPage } from './pages/PaymentPage';
import { RegistrationConfirmationPage } from './pages/RegistrationConfirmationPage';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';

// Protected Route Component
function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// Home Route Component - determines which home page to show
function HomeRoute() {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <LandingPage />;
  }
  
  if (isAdmin) {
    return <AdminHomePage />;
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
                      <EventsCatalogPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/create-event" element={
                    <ProtectedRoute adminOnly>
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