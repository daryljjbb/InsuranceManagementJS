import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomerDetail from './pages/CustomerDetail';

// Bootstrap imports
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Optional: Adds dropdowns/modals support

// A wrapper to protect routes from unauthenticated users
const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    // If no user is logged in, redirect to the login page
    return user ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-vh-100 bg-light">
                    <Routes>
                        {/* Public Route */}
                        <Route path="/login" element={<Login />} />

                        {/* Protected Routes (Require Login) */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/customer/:id"
                            element={
                                <ProtectedRoute>
                                    <CustomerDetail />
                                </ProtectedRoute>
                            }
                        />

                        {/* Fallback: redirect anything else to dashboard */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;

