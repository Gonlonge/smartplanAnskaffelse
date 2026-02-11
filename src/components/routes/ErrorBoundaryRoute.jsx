import { ErrorBoundary } from "../common";

/**
 * Error Boundary Route Wrapper
 * 
 * Wraps a route with an error boundary for more granular error handling.
 * This allows specific routes to have their own error handling without
 * affecting the entire application.
 * 
 * Usage:
 *   <Route
 *     path="/some-path"
 *     element={
 *       <ErrorBoundaryRoute>
 *         <YourComponent />
 *       </ErrorBoundaryRoute>
 *     }
 *   />
 */
const ErrorBoundaryRoute = ({ children, fallback, showDetails = false }) => {
    return (
        <ErrorBoundary fallback={fallback} showDetails={showDetails}>
            {children}
        </ErrorBoundary>
    );
};

export default ErrorBoundaryRoute;




















