import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Skeleton,
  alpha,
  useTheme,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import { DateDisplay } from '../components/common';
import { getProjectsByCompany, getProjectsByOwner, deleteProject } from '../api/projectService';
import { useAuth } from '../contexts/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import FolderIcon from '@mui/icons-material/Folder';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { exportProjectsToPDF, exportProjectsToExcel } from '../utils';

const Projects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      
      try {
        if (!user?.id) {
          setProjects([]);
          setLoading(false);
          return;
        }

        console.log('[Projects] Loading projects for user:', {
          userId: user.id,
          companyId: user.companyId
        });

        // Query projects by both companyId and ownerId to catch all cases
        const promises = [];
        
        // Query by companyId if available
        if (user.companyId) {
          promises.push(getProjectsByCompany(user.companyId, 'active'));
        }
        
        // Always query by ownerId as well
        promises.push(getProjectsByOwner(user.id, 'active'));
        
        // Wait for all queries and combine results
        const results = await Promise.all(promises);
        const allProjects = results.flat();
        
        // Remove duplicates (same project might be returned from both queries)
        const uniqueProjects = allProjects.filter((project, index, self) =>
          index === self.findIndex((p) => p.id === project.id)
        );
        
        // Sort by createdAt descending
        uniqueProjects.sort((a, b) => {
          const dateA = a.createdAt?.getTime?.() || new Date(a.createdAt).getTime() || 0;
          const dateB = b.createdAt?.getTime?.() || new Date(b.createdAt).getTime() || 0;
          return dateB - dateA;
        });
        
        console.log('[Projects] Loaded projects:', uniqueProjects.length, uniqueProjects);
        setProjects(uniqueProjects);
      } catch (error) {
        console.error("Error loading projects:", error);
        setProjects([]);
      }
      
      setLoading(false);
    };
    
    loadProjects();
  }, [user?.companyId, user?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    
    try {
      if (!user?.id) {
        setProjects([]);
        setRefreshing(false);
        return;
      }

      // Query projects by both companyId and ownerId to catch all cases
      const promises = [];
      
      // Query by companyId if available
      if (user.companyId) {
        promises.push(getProjectsByCompany(user.companyId, 'active'));
      }
      
      // Always query by ownerId as well
      promises.push(getProjectsByOwner(user.id, 'active'));
      
      // Wait for all queries and combine results
      const results = await Promise.all(promises);
      const allProjects = results.flat();
      
      // Remove duplicates
      const uniqueProjects = allProjects.filter((project, index, self) =>
        index === self.findIndex((p) => p.id === project.id)
      );
      
      // Sort by createdAt descending
      uniqueProjects.sort((a, b) => {
        const dateA = a.createdAt?.getTime?.() || new Date(a.createdAt).getTime() || 0;
        const dateB = b.createdAt?.getTime?.() || new Date(b.createdAt).getTime() || 0;
        return dateB - dateA;
      });
      
      setProjects(uniqueProjects);
    } catch (error) {
      console.error("Error refreshing projects:", error);
    }
    
    setRefreshing(false);
  };

  const handleDeleteClick = (project, e) => {
    e.stopPropagation();
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    setDeleting(true);
    setErrorMessage('');

    try {
      const result = await deleteProject(projectToDelete.id);

      if (!result.success) {
        setErrorMessage(result.error || 'Kunne ikke slette prosjekt. Prøv igjen.');
        setShowErrorSnackbar(true);
        return;
      }

      // Remove from list
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      setSuccessMessage('Prosjekt slettet!');
      setShowSuccessSnackbar(true);
    } catch (error) {
      setErrorMessage('Kunne ikke slette prosjekt. Prøv igjen.');
      setShowErrorSnackbar(true);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  // Check if user can delete (admin or sender role)
  const canDelete = user?.isAdmin || user?.role === 'sender';

  return (
    <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            mb: 4,
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              Prosjekter
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {loading 
                ? "Laster..." 
                : `${projects.length} ${projects.length === 1 ? "prosjekt" : "prosjekter"}`}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Tooltip title="Oppdater">
              <span>
                <IconButton
                  onClick={handleRefresh}
                  disabled={refreshing || loading}
                  aria-label="Oppdater"
                  sx={{
                    minHeight: { xs: 44, md: 36 },
                    minWidth: { xs: 44, md: 36 },
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  <RefreshIcon
                    aria-hidden="true"
                    sx={{
                      animation: refreshing
                        ? 'spin 1s linear infinite'
                        : 'none',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                      },
                    }}
                  />
                </IconButton>
              </span>
            </Tooltip>
            {projects.length > 0 && (
              <>
                <Tooltip title="Eksporter til PDF">
                  <IconButton
                    onClick={() => exportProjectsToPDF(projects)}
                    disabled={loading}
                    aria-label="Eksporter til PDF"
                    sx={{
                      minHeight: { xs: 44, md: 36 },
                      minWidth: { xs: 44, md: 36 },
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.error.main, 0.2),
                      },
                    }}
                  >
                    <FileDownloadIcon sx={{ color: 'error.main' }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eksporter til Excel">
                  <IconButton
                    onClick={() => exportProjectsToExcel(projects)}
                    disabled={loading}
                    aria-label="Eksporter til Excel"
                    sx={{
                      minHeight: { xs: 44, md: 36 },
                      minWidth: { xs: 44, md: 36 },
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.success.main, 0.2),
                      },
                    }}
                  >
                    <FileDownloadIcon sx={{ color: 'success.main' }} />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/projects/create')}
              sx={{
                fontSize: {
                  xs: '1rem',
                  sm: '0.875rem',
                },
                textTransform: 'none',
                fontWeight: 600,
                minWidth: { xs: '100%', sm: 'auto' },
              }}
            >
              Nytt prosjekt
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card elevation={0}>
                  <CardContent>
                    <Skeleton variant="text" width="70%" height={32} sx={{ mb: 2 }} />
                    <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="60%" height={20} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : projects.length > 0 ? (
          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
            {projects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <Card
                  elevation={0}
                  sx={{
                    cursor: 'pointer',
                    height: '100%',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                    },
                  }}
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 1.5,
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <FolderIcon />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {project.name}
                        </Typography>
                      </Box>
                      {canDelete && (
                        <Tooltip title="Slett prosjekt">
                          <IconButton
                            size="small"
                            onClick={(e) => handleDeleteClick(project, e)}
                            sx={{
                              color: 'error.main',
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.error.main, 0.1),
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2 }}>
                      {project.description || 'Ingen beskrivelse'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <DateDisplay date={project.createdAt} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 4, sm: 6 },
              textAlign: 'center',
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <FolderIcon
                sx={{
                  fontSize: 40,
                  color: 'primary.main',
                }}
              />
            </Box>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Ingen prosjekter ennå
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
              Prosjekter vil vises her når de er opprettet. Kom i gang ved å opprette ditt første prosjekt.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/projects/create')}
              sx={{
                fontSize: {
                  xs: '1rem',
                  sm: '0.875rem',
                },
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
              }}
            >
              Opprett ditt første prosjekt
            </Button>
          </Paper>
        )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Slett prosjekt</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Er du sikker på at du vil slette &quot;{projectToDelete?.name}&quot;?
            Denne handlingen kan ikke angres.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Avbryt
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={deleting}
          >
            {deleting ? 'Sletter...' : 'Slett'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSuccessSnackbar(false)} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={showErrorSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowErrorSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowErrorSnackbar(false)} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
      </Box>
  );
};

export default Projects;

