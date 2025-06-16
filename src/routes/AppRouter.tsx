
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ProfilePage } from '../pages/ProfilePage';
import { TripsPage } from '../pages/TripsPage';
import { TripDetailsPage } from '../pages/TripDetailsPage';
import { AddTripPage } from '../pages/AddTripPage';
import { LandingPage } from '../pages/LandingPage';
import { AuthProvider } from '../contexts/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  return !isLoggedIn ? <>{children}</> : <Navigate to="/trips" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/trips" 
        element={
          <ProtectedRoute>
            <TripsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/trips/add" 
        element={
          <ProtectedRoute>
            <AddTripPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/trips/:tripId" 
        element={
          <ProtectedRoute>
            <TripDetailsPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};
