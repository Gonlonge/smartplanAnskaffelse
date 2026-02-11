import React from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    Button,
    Paper,
    Alert,
    AlertTitle,
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import { logErrorBoundaryError } from '../../services/errorService';

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 * 
 * Usage:
 *   <ErrorBoundary>
 *     <YourComponent />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError() {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to our error service
        this.setState({
            error,
            errorInfo,
        });

        // Log error with context
        logErrorBoundaryError(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleGoHome = () => {
        window.location.href = '/dashboard';
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback(this.state.error, this.state.errorInfo);
            }

            // Default fallback UI
            return (
                <Box
                    sx={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 3,
                        backgroundColor: 'background.default',
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            maxWidth: 600,
                            width: '100%',
                        }}
                    >
                        <Alert
                            severity="error"
                            icon={<ErrorIcon />}
                            sx={{ mb: 3 }}
                        >
                            <AlertTitle>Noe gikk galt</AlertTitle>
                            En uventet feil oppstod. Vi beklager uleiligheten.
                        </Alert>

                        <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                            Hva kan du gjøre?
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <Button
                                variant="contained"
                                startIcon={<RefreshIcon />}
                                onClick={this.handleReset}
                            >
                                Prøv igjen
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<HomeIcon />}
                                onClick={this.handleGoHome}
                            >
                                Gå til dashboard
                            </Button>
                        </Box>

                        {import.meta.env.DEV && this.state.error && (
                            <Box
                                sx={{
                                    mt: 3,
                                    p: 2,
                                    backgroundColor: 'grey.100',
                                    borderRadius: 1,
                                    overflow: 'auto',
                                }}
                            >
                                <Typography variant="subtitle2" gutterBottom>
                                    Feilmelding (kun i utviklingsmiljø):
                                </Typography>
                                <Typography
                                    variant="body2"
                                    component="pre"
                                    sx={{
                                        fontFamily: 'monospace',
                                        fontSize: '0.75rem',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        color: 'error.main',
                                    }}
                                >
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack && (
                                        <>
                                            {'\n\n'}
                                            {this.state.errorInfo.componentStack}
                                        </>
                                    )}
                                </Typography>
                            </Box>
                        )}

                        {this.props.showDetails && !import.meta.env.DEV && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Feil-ID: {this.state.error?.name || 'Unknown'}
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Box>
            );
        }

        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    fallback: PropTypes.func,
    showDetails: PropTypes.bool,
    children: PropTypes.node.isRequired,
};

export default ErrorBoundary;

