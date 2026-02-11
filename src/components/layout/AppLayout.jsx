import { Box, Container } from '@mui/material';
import Navigation from './Navigation';

/**
 * AppLayout - Main layout wrapper for authenticated pages
 */
const AppLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navigation />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: { xs: 3, sm: 4, md: 5 },
          px: { xs: 2, sm: 3 },
          // Ensure background is visible for glass effect
          backgroundColor: 'transparent',
        }}
      >
        <Container maxWidth="xl">{children}</Container>
      </Box>
    </Box>
  );
};

export default AppLayout;

