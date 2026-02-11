import { StatusChip, DateDisplay } from "../components/common";
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Skeleton,
    alpha,
    useTheme,
    IconButton,
    Tooltip,
} from "@mui/material";
import { getInvitationsForSupplier } from "../api/tenderService";
import { getProjectById } from "../api/projectService";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import RefreshIcon from "@mui/icons-material/Refresh";
import InboxIcon from "@mui/icons-material/Inbox";
import FolderIcon from "@mui/icons-material/Folder";
import DescriptionIcon from "@mui/icons-material/Description";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useState, useEffect } from "react";

const Invitations = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [projectCache, setProjectCache] = useState({});

    useEffect(() => {
        const loadInvitations = async () => {
            setLoading(true);
            try {
                const invs = user?.id ? await getInvitationsForSupplier(user.id, user.email) : [];
                setInvitations(invs);
            } catch (error) {
                console.error("Error loading invitations:", error);
                setInvitations([]);
            }
            setLoading(false);
        };
        loadInvitations();
    }, [user?.id, user?.email]);

    // Load project names for display
    useEffect(() => {
        const loadProjects = async () => {
            const projectIds = [...new Set(invitations.map(t => t.projectId).filter(Boolean))];
            const newCache = { ...projectCache };
            
            for (const projectId of projectIds) {
                if (!newCache[projectId]) {
                    const project = await getProjectById(projectId);
                    if (project) {
                        newCache[projectId] = project;
                    }
                }
            }
            
            setProjectCache(newCache);
        };

        if (invitations.length > 0) {
            loadProjects();
        }
    }, [invitations]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const invs = user?.id ? await getInvitationsForSupplier(user.id, user.email) : [];
            setInvitations(invs);
        } catch (error) {
            console.error("Error refreshing invitations:", error);
        }
        setRefreshing(false);
    };

    return (
        <Box>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        mb: 4,
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 2,
                    }}
                >
                    <Box>
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
                                fontWeight: 600,
                                mb: 0.5,
                            }}
                        >
                            Invitasjoner
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {loading 
                                ? "Laster..." 
                                : `${invitations.length} ${invitations.length === 1 ? "invitasjon" : "invitasjoner"}`}
                        </Typography>
                    </Box>
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
                                    "&:hover": {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                    },
                                }}
                            >
                                <RefreshIcon
                                    aria-hidden="true"
                                    sx={{
                                        animation: refreshing
                                            ? "spin 1s linear infinite"
                                            : "none",
                                        "@keyframes spin": {
                                            "0%": { transform: "rotate(0deg)" },
                                            "100%": { transform: "rotate(360deg)" },
                                        },
                                    }}
                                />
                            </IconButton>
                        </span>
                    </Tooltip>
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
                ) : invitations.length > 0 ? (
                    <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
                        {invitations.map((tender) => {
                            const project = projectCache[tender.projectId];
                            // Find invitation by supplierId or email (case-insensitive)
                            const normalizedUserEmail = user?.email?.toLowerCase().trim();
                            const invitation = tender.invitedSuppliers.find(
                                (inv) => inv.supplierId === user?.id || 
                                    (normalizedUserEmail && inv.email?.toLowerCase().trim() === normalizedUserEmail)
                            );

                            return (
                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={4}
                                    key={tender.id}
                                >
                                    <Card
                                        elevation={0}
                                        sx={{
                                            height: "100%",
                                            transition: "all 0.2s ease",
                                            "&:hover": {
                                                borderColor: alpha(theme.palette.primary.main, 0.3),
                                            },
                                        }}
                                    >
                                        <CardContent>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "flex-start",
                                                    mb: 2,
                                                    gap: 1,
                                                }}
                                            >
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                    {tender.title}
                                                </Typography>
                                                <StatusChip status={tender.status} />
                                            </Box>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                paragraph
                                                sx={{ mb: 2 }}
                                            >
                                                {tender.description || "Ingen beskrivelse"}
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: 1.5,
                                                }}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <FolderIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                                                    <Typography variant="body2">
                                                        <strong>Prosjekt:</strong>{" "}
                                                        {project?.name || "Ukjent"}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <DescriptionIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                                                    <Typography variant="body2">
                                                        <strong>Kontraktstandard:</strong>{" "}
                                                        {tender.contractStandard}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <CalendarTodayIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                                                    <DateDisplay date={tender.deadline} />
                                                </Box>
                                                {invitation && (
                                                    <Box sx={{ mt: 1 }}>
                                                        <StatusChip 
                                                            status={invitation.status === "submitted" ? "submitted" : invitation.status === "viewed" ? "viewed" : "invited"} 
                                                            size="small"
                                                        />
                                                    </Box>
                                                )}
                                            </Box>
                                        </CardContent>
                                        <CardActions sx={{ px: 2, pb: 2 }}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() =>
                                                    navigate(`/tenders/${tender.id}`)
                                                }
                                                sx={{
                                                    textTransform: "none",
                                                    fontWeight: 500,
                                                    fontSize: {
                                                        xs: "1rem",
                                                        sm: "0.875rem",
                                                    },
                                                }}
                                            >
                                                Se detaljer
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                ) : (
                    <Paper 
                        elevation={0}
                        sx={{ 
                            p: { xs: 4, sm: 6 },
                            textAlign: "center",
                            borderRadius: 2,
                        }}
                    >
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: "50%",
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mx: "auto",
                                mb: 3,
                            }}
                        >
                            <InboxIcon
                                sx={{
                                    fontSize: 40,
                                    color: "primary.main",
                                }}
                            />
                        </Box>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                            Ingen invitasjoner ennå
                        </Typography>
                        <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ maxWidth: 400, mx: "auto" }}
                        >
                            Du vil motta invitasjoner her når du blir invitert til Anskaffelse.
                        </Typography>
                    </Paper>
                )}
            </Box>
    );
};

export default Invitations;
