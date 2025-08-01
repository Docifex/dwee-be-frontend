// src/App.jsx
import React, {useContext} from 'react';
import { Routes, Route } from 'react-router-dom';
// import the pages (components) we want to route to
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard.tsx'; 
import ProtectedRoute from './components/ProtectedRoute';
import AccountManagement from './components/AccountManagement.tsx';
import DweebeAdminMain from './components/dweebeAdminMain.tsx';
import { AuthContext } from './components/AuthWrapper.jsx';
import { Navigate } from 'react-router-dom';



/**
 * App.jsx defines client-side routes for our application.
 * - `/` renders the landing page
 * - `/dashboard` renders the post-login dashboard
 * 
 * 
 */

// Defining the protected administrative route here in app.jsx

function AdminProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/landingpage" replace />;
  if (!user.roles || !user.roles.includes("admin"))
    return <Navigate to="/dashboard" replace />;

  return <ProtectedRoute>{children}</ProtectedRoute>; // ✅ must return JSX, not an object
}


export default function App() {
  return (
    <Routes>
      <Route path="/landingpage" element={<LandingPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
        />
      <Route
      path="/dweebe-admin-main"
      element={
        <AdminProtectedRoute>
          <DweebeAdminMain />
        </AdminProtectedRoute>
      }
      />

      <Route path="/account-management" element={<AccountManagement />} />
      <Route path="/dweebe-admin-main" element={<DweebeAdminMain />} />
      {/* Redirect root path to landing page */}
      <Route path="/" element={<LandingPage />} />
      {/* Redirect any unknown paths to the landing page */}
      <Route path="*" element={<LandingPage />} />  
    </Routes>
  );
}
