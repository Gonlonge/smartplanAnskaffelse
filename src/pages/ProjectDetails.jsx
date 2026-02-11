import { useParams, useNavigate } from "react-router-dom";
import { StatusChip, DateDisplay } from "../components/common";
import {
    Box,
    Typography,
    Paper,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    useTheme,
    useMediaQuery,
    Skeleton,
    alpha,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Snackbar,
    Alert,
} from "@mui/material";
import { getProjectById, deleteProject } from "../api/projectService";
import { getTendersByProject } from "../api/tenderService";
import { useAuth } from "../contexts/AuthContext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DescriptionIcon from "@mui/icons-material/Description";
import FolderIcon from "@mui/icons-material/Folder";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState, useEffect } from "react";

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [project, setProject] = useState(null);
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            
            try {
                // Get project from Firebase
                const foundProject = await getProjectById(id);
                
                if (foundProject) {
                    setProject(foundProject);
                    
                    // Get tenders for this project
                    const projectTenders = await getTendersByProject(id);
                    setTenders(projectTenders);
                }
            } catch (error) {
                console.error("Error loading project:", error);
            }
            
            setLoading(false);
        };
        
        loadData();
    }, [id]);

    if (loading) {
        return (
            <Box>
                    <Skeleton variant="rectangular" width={200} height={40} sx={{ mb: 3, borderRadius: 1 }} />
                    <Skeleton variant="text" width="60%" height={48} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" width={100} height={32} sx={{ mb: 4, borderRadius: 1 }} />
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <Skeleton variant="rectangular" height={200} sx={{ mb: 3, borderRadius: 2 }} />
                            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
                        </Grid>
                    </Grid>
                </Box>
        );
    }

    if (!project) {
        return (
            <Box sx={{ textAlign: "center", py: 8 }}>
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mx: "auto",
                            mb: 3,
                        }}
                    >
                        <FolderIcon
                            sx={{
                                fontSize: 40,
                                color: "error.main",
                            }}
                        />
                    </Box>
                    <Typography variant="h5" color="error" sx={{ mb: 1, fontWeight: 600 }}>
                        Prosjekt ikke funnet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Prosjektet du leter etter eksisterer ikke eller har blitt slettet.
                    </Typography>
                    <Button 
                        variant="contained"
                        onClick={() => navigate("/projects")} 
                        sx={{ 
                            textTransform: "none", 
                            fontWeight: 600,
                            fontSize: {
                                xs: "1rem",
                                sm: "0.875rem",
                            },
                        }}
                    >
                        Tilbake til Prosjekter
                    </Button>
                </Box>
        );
    }

    // Check if user is sender/admin (can create tenders)
    const isSender = user?.role === "sender";
    const canDelete = user?.isAdmin || user?.role === "sender";

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!project) return;

        setDeleting(true);
        setErrorMessage('');

        try {
            const result = await deleteProject(project.id);

            if (!result.success) {
                setErrorMessage(result.error || 'Kunne ikke slette prosjekt. Prøv igjen.');
                setShowErrorSnackbar(true);
                return;
            }

            setSuccessMessage('Prosjekt slettet!');
            setShowSuccessSnackbar(true);
            // Navigate back to projects list after a short delay
            setTimeout(() => {
                navigate('/projects');
            }, 1500);
        } catch (error) {
            setErrorMessage('Kunne ikke slette prosjekt. Prøv igjen.');
            setShowErrorSnackbar(true);
        } finally {
            setDeleting(false);
            setDeleteDialogOpen(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
    };

    return (
        <Box>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/projects")}
                    sx={{ 
                        mb: 3,
                        textTransform: "none",
                        fontWeight: 500,
                        fontSize: {
                            xs: "1rem",
                            sm: "0.875rem",
                        },
                    }}
                >
                    Tilbake
                </Button>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 4,
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 2,
                    }}
                >
                    <Box>
                        <Typography
                            variant="h4"
                            component="h1"
                            gutterBottom
                            sx={{
                                fontSize: {
                                    xs: "1.75rem",
                                    sm: "2rem",
                                    md: "2.5rem",
                                },
                                fontWeight: 600,
                                mb: 1,
                            }}
                        >
                            {project.name}
                        </Typography>
                        {project.status && (
                            <StatusChip status={project.status} size="medium" />
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {isSender && (
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={() =>
                                    navigate(`/tenders/create?projectId=${project.id}`)
                                }
                                sx={{
                                    fontSize: {
                                        xs: "1rem", // 16px minimum on mobile
                                        sm: "0.875rem",
                                    },
                                }}
                            >
                                Opprett Anskaffelse
                            </Button>
                        )}
                        {canDelete && (
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={handleDeleteClick}
                                disabled={deleting}
                                sx={{
                                    fontSize: {
                                        xs: "1rem",
                                        sm: "0.875rem",
                                    },
                                }}
                            >
                                Slett prosjekt
                            </Button>
                        )}
                    </Box>
                </Box>

                <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
                    <Grid item xs={12} md={8}>
                        {/* Project Description */}
                        <Paper 
                            elevation={0}
                            sx={{ 
                                p: { xs: 2, sm: 3 }, 
                                mb: 3,
                                borderRadius: 2,
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                <DescriptionIcon sx={{ color: "primary.main" }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Beskrivelse
                                </Typography>
                            </Box>
                            <Typography variant="body1" color="text.secondary">
                                {project.description ||
                                    "Ingen beskrivelse tilgjengelig"}
                            </Typography>
                        </Paper>

                        {/* Tenders List */}
                        <Paper 
                            elevation={0}
                            sx={{ 
                                p: { xs: 2, sm: 3 },
                                borderRadius: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 3,
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <DescriptionIcon sx={{ color: "primary.main" }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Anskaffelser ({tenders.length})
                                    </Typography>
                                </Box>
                            </Box>

                            {tenders.length > 0 ? (
                                <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
                                    {tenders.map((tender) => (
                                        <Grid item xs={12} key={tender.id}>
                                            <Card
                                                elevation={0}
                                                sx={{
                                                    cursor: "pointer",
                                                    transition: "all 0.2s ease",
                                                    "&:hover": {
                                                        borderColor: alpha(theme.palette.primary.main, 0.3),
                                                    },
                                                }}
                                                onClick={() =>
                                                    navigate(`/tenders/${tender.id}`)
                                                }
                                            >
                                                <CardContent>
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent:
                                                                "space-between",
                                                            alignItems: "flex-start",
                                                            mb: 1,
                                                            flexWrap: "wrap",
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <Typography variant="h6">
                                                            {tender.title}
                                                        </Typography>
                                                        <StatusChip
                                                            status={tender.status}
                                                            size="small"
                                                        />
                                                    </Box>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        paragraph
                                                    >
                                                        {tender.description ||
                                                            "Ingen beskrivelse"}
                                                    </Typography>
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            flexWrap: "wrap",
                                                            gap: 2,
                                                            mt: 2,
                                                        }}
                                                    >
                                                        <Box>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                Kontraktstandard
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                {tender.contractStandard}
                                                            </Typography>
                                                        </Box>
                                                        <Box>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                Frist
                                                            </Typography>
                                                            <DateDisplay
                                                                date={tender.deadline}
                                                                variant="body2"
                                                            />
                                                        </Box>
                                                        {tender.bids &&
                                                            tender.bids.length > 0 && (
                                                                <Box>
                                                                    <Typography
                                                                        variant="caption"
                                                                        color="text.secondary"
                                                                    >
                                                                        Antall tilbud
                                                                    </Typography>
                                                                    <Typography variant="body2">
                                                                        {
                                                                            tender.bids
                                                                                .length
                                                                        }
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                    </Box>
                                                </CardContent>
                                                <CardActions>
                                                    <Button
                                                        size="small"
                                                        startIcon={
                                                            <DescriptionIcon />
                                                        }
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(
                                                                `/tenders/${tender.id}`
                                                            );
                                                        }}
                                                        sx={{
                                                            fontSize: {
                                                                xs: "1rem", // 16px minimum on mobile
                                                                sm: "0.875rem",
                                                            },
                                                        }}
                                                    >
                                                        Se detaljer
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Box
                                    sx={{
                                        textAlign: "center",
                                        py: { xs: 3, sm: 4 },
                                    }}
                                >
                                    <Typography
                                        variant="body1"
                                        color="text.secondary"
                                        gutterBottom
                                    >
                                        Ingen Anskaffelser ennå
                                    </Typography>
                                    {isSender && (
                                        <Button
                                            variant="outlined"
                                            startIcon={<AddIcon />}
                                            onClick={() =>
                                                navigate(
                                                    `/tenders/create?projectId=${project.id}`
                                                )
                                            }
                                            sx={{
                                                mt: 2,
                                                fontSize: {
                                                    xs: "1rem", // 16px minimum on mobile
                                                    sm: "0.875rem",
                                                },
                                            }}
                                        >
                                            Opprett første Anskaffelse
                                        </Button>
                                    )}
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* Sidebar */}
                    <Grid item xs={12} md={4}>
                        <Paper 
                            elevation={0}
                            sx={{ 
                                p: { xs: 2, sm: 3 },
                                borderRadius: 2,
                                position: "sticky",
                                top: 20,
                            }}
                        >
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                Detaljer
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                }}
                            >
                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Status
                                    </Typography>
                                    <StatusChip
                                        status={project.status || "active"}
                                        size="small"
                                    />
                                </Box>
                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Opprettet
                                    </Typography>
                                    <DateDisplay
                                        date={project.createdAt}
                                        variant="body1"
                                    />
                                </Box>
                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Antall Anskaffelser
                                    </Typography>
                                    <Typography variant="body1">
                                        {tenders.length}
                                    </Typography>
                                </Box>
                                {tenders.length > 0 && (
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Totalt antall tilbud
                                        </Typography>
                                        <Typography variant="body1">
                                            {tenders.reduce(
                                                (sum, tender) =>
                                                    sum +
                                                    (tender.bids?.length || 0),
                                                0
                                            )}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
                <DialogTitle>Slett prosjekt</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Er du sikker på at du vil slette &quot;{project?.name}&quot;?
                        Alle tilknyttede anskaffelser vil også bli slettet. Denne handlingen kan ikke angres.
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

export default ProjectDetails;

