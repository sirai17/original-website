import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
// Corrected AuthProvider import path based on its actual location
import { AuthProvider } from './contexts/AuthContext'; 
import { useAuth } from './hooks/useAuth';

import Navbar from './components/layout/Navbar';
import RedirectPage from './components/pages/RedirectPage';
import HomePage from './components/pages/HomePage';
import HistoryPage from './components/pages/HistoryPage';
import TimelinePage from './components/pages/TimelinePage';
import SettingsPage from './components/pages/SettingsPage';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col"> {/* Ensure full height for sticky footer or similar */}
      <Navbar />
      {/* Apply a general padding for content area below navbar, adjust as needed */}
      <main className="flex-grow container mx-auto px-4 py-8"> 
        <Outlet /> {/* Nested routes will render here */}
      </main>
      {/* Footer could go here */}
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { authState } = useAuth();
  const location = useLocation();

  if (authState.loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-700">Loading authentication...</p>
      </div>
    );
  }

  if (!authState.user) {
    // Redirect to the root (RedirectPage), which should handle authentication or guide the user.
    // HomePage also has a sign-in prompt if not logged in.
    // This simplifies protected route logic: if no user, RedirectPage flow starts.
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

// Main App component
function App() {
  return (
    <AuthProvider> {/* AuthProvider wraps the entire application */}
      <HashRouter>
        <Routes>
          <Route path="/" element={<RedirectPage />} />
          
          {/* Routes with Navbar and main layout */}
          <Route element={<AppLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route 
              path="/history" 
              element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} 
            />
            <Route 
              path="/timeline" 
              element={<ProtectedRoute><TimelinePage /></ProtectedRoute>} 
            />
            <Route 
              path="/settings" 
              element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} 
            />
            {/* Optional: If /app is hit directly, redirect to /home within the layout */}
            {/* <Route index element={<Navigate to="/home" replace />} />  -- this would need /app as path for AppLayout */}
          </Route>

          {/* Fallback for any other unmatched route, redirects to home or root */}
          {/* This logic might need adjustment based on whether user is typically authenticated or not */}
          <Route path="*" element={<Navigate to="/" replace />} /> 
          {/* Or redirect to "/" if RedirectPage is the main gatekeeper: <Route path="*" element={<Navigate to="/" replace />} /> */}
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
