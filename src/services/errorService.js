/**
 * Error Logging Service
 * 
 * Provides centralized error reporting and logging functionality.
 * Can be extended to integrate with external error tracking services
 * (e.g., Sentry, LogRocket, Firebase Crashlytics).
 */

/**
 * Log an error to the console and optionally to an external service
 * @param {Error} error - The error object
 * @param {Object} errorInfo - Additional error information (e.g., component stack)
 * @param {Object} context - Additional context about where the error occurred
 */
export const logError = (error, errorInfo = null, context = {}) => {
    const errorData = {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        url: typeof window !== 'undefined' ? window.location.href : null,
        ...context,
    };

    // Add component stack if available (from React Error Boundary)
    if (errorInfo) {
        errorData.componentStack = errorInfo.componentStack;
        errorData.errorInfo = errorInfo;
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error logged:', errorData);
        if (errorInfo) {
            console.error('Error Info:', errorInfo);
        }
    }

    // In production, you can send to external error tracking service
    // Example: Sentry, LogRocket, Firebase Crashlytics, etc.
    if (process.env.NODE_ENV === 'production') {
        // TODO: Integrate with error tracking service
        // Example:
        // if (window.Sentry) {
        //     window.Sentry.captureException(error, {
        //         contexts: { react: errorInfo },
        //         extra: context,
        //     });
        // }
        
        // For now, log to console even in production (remove in production)
        console.error('Production error:', errorData);
    }

    // Optionally, send to Firebase or your backend
    // This could be done via a Firebase Cloud Function or your API
    try {
        // Example: Send to Firebase Firestore
        // const { collection, addDoc } = await import('firebase/firestore');
        // const { db } = await import('../config/firebase');
        // await addDoc(collection(db, 'errors'), errorData);
    } catch (loggingError) {
        // Silently fail if error logging itself fails
        console.error('Failed to log error to external service:', loggingError);
    }

    return errorData;
};

/**
 * Log a React Error Boundary error
 * @param {Error} error - The error that was caught
 * @param {Object} errorInfo - React error info with componentStack
 */
export const logErrorBoundaryError = (error, errorInfo) => {
    return logError(error, errorInfo, {
        type: 'error_boundary',
        source: 'react_component',
    });
};

/**
 * Log a general application error
 * @param {Error} error - The error that occurred
 * @param {Object} context - Additional context
 */
export const logApplicationError = (error, context = {}) => {
    return logError(error, null, {
        type: 'application_error',
        ...context,
    });
};

/**
 * Log an API error
 * @param {Error} error - The error from the API call
 * @param {Object} context - Additional context (endpoint, method, etc.)
 */
export const logApiError = (error, context = {}) => {
    return logError(error, null, {
        type: 'api_error',
        ...context,
    });
};




















