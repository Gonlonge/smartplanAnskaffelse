import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Typography, Container } from '@mui/material';
import { AppLayout } from '../layout';

/**
 * ProtectedRoute - Wrapper component that protects routes requiring authentication
 * Automatically wraps authenticated pages with AppLayout for consistent UI
 */
const ProtectedRoute = ({ children, requireRole = null, requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <AppLayout>
        <Container maxWidth="sm">
          <Box
            sx={{
              mt: { xs: 4, sm: 8 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="body1">Laster...</Typography>
          </Box>
        </Container>
      </AppLayout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check admin requirement if specified
  if (requireAdmin && !isAdmin) {
    return (
      <AppLayout>
        <Container maxWidth="sm">
          <Box
            sx={{
              mt: { xs: 4, sm: 8 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="h5" color="error" gutterBottom>
              Ingen tilgang
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Kun administratorer har tilgang til denne siden.
            </Typography>
          </Box>
        </Container>
      </AppLayout>
    );
  }

  // Check role requirement if specified
  if (requireRole && user.role !== requireRole) {
    return (
      <AppLayout>
        <Container maxWidth="sm">
          <Box
            sx={{
              mt: { xs: 4, sm: 8 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="h5" color="error" gutterBottom>
              Ingen tilgang
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Du har ikke tilgang til denne siden.
            </Typography>
          </Box>
        </Container>
      </AppLayout>
    );
  }

  return <AppLayout>{children}</AppLayout>;
};

export default ProtectedRoute;

