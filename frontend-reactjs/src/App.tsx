import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from './components/ui/toaster';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import StudentDashboard from './pages/Student/Dashboard';
import InchargeDashboard from './pages/Incharge/Dashboard';
import HODDashboard from './pages/HOD/Dashboard';
import SecurityDashboard from './pages/Security/Dashboard';
import LandingPage from './pages/LandingPage';

function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: string }) {
    const { user, loading } = useAuth();

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    
    if (role && user.role !== role) {
        return <Navigate to={`/${user.role}`} />;
    }

    return <>{children}</>;
}

function AppContent() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/student/*" element={
                <ProtectedRoute role="student">
                    <StudentDashboard />
                </ProtectedRoute>
            } />
            
            <Route path="/incharge/*" element={
                <ProtectedRoute role="incharge">
                    <InchargeDashboard />
                </ProtectedRoute>
            } />

            <Route path="/hod/*" element={
                <ProtectedRoute role="hod">
                    <HODDashboard />
                </ProtectedRoute>
            } />

            <Route path="/security/*" element={
                <ProtectedRoute role="security">
                    <SecurityDashboard />
                </ProtectedRoute>
            } />

            <Route path="/" element={<LandingPage />} />
        </Routes>
    );
}

import { ThemeProvider } from './components/theme-provider';

function App() {
    return (
        <ThemeProvider defaultTheme="light" storageKey="uniace-ui-theme">
            <AuthProvider>
                <Router>
                    <AppContent />
                    <Toaster />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
