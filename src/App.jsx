import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { theme } from "./styles";
import {
    Login,
    Register,
    Dashboard,
    Tenders,
    TenderCreate,
    TenderDetails,
    BidSubmit,
    ContractView,
    Projects,
    ProjectCreate,
    ProjectDetails,
    Invitations,
    Contacts,
    Compliance,
    Complaints,
    Profile,
    Notifications,
    Suppliers,
    AdminUsers,
} from "./pages";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import ErrorBoundaryRoute from "./components/routes/ErrorBoundaryRoute";
import { ErrorBoundary } from "./components/common";
import { useState, useEffect } from "react";

// Import userService to ensure testContractCheck is exposed to window in development
// The side-effect code in userService.js will handle window assignment
import "./api/userService";

const AuthPages = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showRegister, setShowRegister] = useState(false);

    // Sync showRegister state with URL path
    useEffect(() => {
        if (location.pathname === "/register") {
            setShowRegister(true);
        } else if (location.pathname === "/login") {
            setShowRegister(false);
        }
    }, [location.pathname]);

    const handleSwitchToLogin = () => {
        setShowRegister(false);
        navigate("/login", { replace: true });
    };

    const handleSwitchToRegister = () => {
        setShowRegister(true);
        navigate("/register", { replace: true });
    };

    return showRegister ? (
        <Register key="register" onSwitchToLogin={handleSwitchToLogin} />
    ) : (
        <Login key="login" onSwitchToRegister={handleSwitchToRegister} />
    );
};

const AppRoutes = () => {
    const { user } = useAuth();

    return (
        <Routes>
            {/* Public routes */}
            <Route
                path="/login"
                element={
                    user ? <Navigate to="/dashboard" replace /> : <AuthPages />
                }
            />
            <Route
                path="/register"
                element={
                    user ? <Navigate to="/dashboard" replace /> : <AuthPages />
                }
            />

            {/* Protected routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/tenders"
                element={
                    <ProtectedRoute>
                        <Tenders />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/tenders/create"
                element={
                    <ProtectedRoute requireRole="sender">
                        <TenderCreate />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/tenders/:id"
                element={
                    <ProtectedRoute>
                        <ErrorBoundaryRoute>
                            <TenderDetails />
                        </ErrorBoundaryRoute>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/tenders/:id/bid"
                element={
                    <ProtectedRoute>
                        <BidSubmit />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/tenders/:id/contract"
                element={
                    <ProtectedRoute>
                        <ContractView />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/projects"
                element={
                    <ProtectedRoute requireRole="sender">
                        <Projects />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/projects/create"
                element={
                    <ProtectedRoute requireRole="sender">
                        <ProjectCreate />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/projects/:id"
                element={
                    <ProtectedRoute requireRole="sender">
                        <ProjectDetails />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/invitations"
                element={
                    <ProtectedRoute requireRole="receiver">
                        <Invitations />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/contacts"
                element={
                    <ProtectedRoute requireRole="receiver">
                        <Contacts />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/suppliers"
                element={
                    <ProtectedRoute requireRole="sender">
                        <Suppliers />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/compliance"
                element={
                    <ProtectedRoute requireAdmin={true}>
                        <Compliance />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/complaints"
                element={
                    <ProtectedRoute>
                        <Complaints />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/complaints/:id"
                element={
                    <ProtectedRoute>
                        <Complaints />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/notifications"
                element={
                    <ProtectedRoute>
                        <Notifications />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin-users"
                element={
                    <ProtectedRoute requireAdmin={true}>
                        <AdminUsers />
                    </ProtectedRoute>
                }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};

function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <AuthProvider>
                    <NotificationProvider>
                        <AppRoutes />
                    </NotificationProvider>
                </AuthProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;
