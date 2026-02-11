import { useAuth } from "../contexts/AuthContext";
import {
    Box,
    Typography,
    IconButton,
    Tooltip,
    alpha,
    useTheme,
    Alert,
    CircularProgress,
} from "@mui/material";
import {
    getAllTenders,
    getInvitationsForSupplier,
    closeExpiredTenders,
} from "../api/tenderService";
import {
    getProjectsByCompany,
    getProjectsByOwner,
} from "../api/projectService";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { DashboardStats } from "../components/features/dashboard/DashboardStats";
import { DashboardQuickActions } from "../components/features/dashboard/DashboardQuickActions";
import { DashboardRecentActivity } from "../components/features/dashboard/DashboardRecentActivity";

const Dashboard = () => {
    const { user } = useAuth();
    const theme = useTheme();
    const isSender = user?.role === "sender";
    const isReceiver = user?.role === "receiver";
    const [allTenders, setAllTenders] = useState([]);
    const [projects, setProjects] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Ref to track if component is mounted
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Memoized data loading function
    const loadData = useCallback(async (signal) => {
        if (!user) {
            if (isMountedRef.current) {
                setLoading(false);
            }
            return;
        }

        try {
            if (isMountedRef.current) {
                setError(null);
            }

            if (isSender) {
                // Load tenders and projects for sender
                const projectPromises = [];

                if (user.companyId) {
                    projectPromises.push(
                        getProjectsByCompany(user.companyId, "active")
                    );
                }

                projectPromises.push(getProjectsByOwner(user.id, "active"));

                const [tendersData, ...projectResults] = await Promise.all([
                    getAllTenders({ createdBy: user.id }),
                    ...projectPromises,
                ]);

                // Check if cancelled
                if (signal?.aborted || !isMountedRef.current) return;

                // Automatically close expired tenders
                let finalTendersData = tendersData;
                try {
                    const closeResult = await closeExpiredTenders(user.id);
                    if (closeResult.closed > 0) {
                        finalTendersData = await getAllTenders({
                            createdBy: user.id,
                        });
                    }
                } catch (err) {
                    console.error("Error closing expired tenders:", err);
                }

                // Check again if cancelled
                if (signal?.aborted || !isMountedRef.current) return;

                // Combine and deduplicate project results
                const allProjects = projectResults.flat();
                const uniqueProjects = allProjects.filter(
                    (project, index, self) =>
                        index === self.findIndex((p) => p.id === project.id)
                );

                if (isMountedRef.current) {
                    setAllTenders(finalTendersData);
                    setProjects(uniqueProjects);
                }
            } else if (isReceiver) {
                const invitationsData = await getInvitationsForSupplier(
                    user.id,
                    user.email
                );

                if (signal?.aborted || !isMountedRef.current) return;

                if (isMountedRef.current) {
                    setInvitations(invitationsData);
                }
            }
        } catch (err) {
            if (signal?.aborted || !isMountedRef.current) return;
            console.error("Error loading dashboard data:", err);
            if (isMountedRef.current) {
                setError("Kunne ikke laste data. Prøv å oppdatere siden.");
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, [user?.id, user?.companyId, user?.email, isSender, isReceiver]);

    // Load data from Firestore
    useEffect(() => {
        const abortController = new AbortController();
        setLoading(true);
        loadData(abortController.signal);

        return () => {
            abortController.abort();
        };
    }, [loadData]);

    const handleRefresh = useCallback(async () => {
        const abortController = new AbortController();
        try {
            setRefreshing(true);
            setError(null);
            await loadData(abortController.signal);
        } catch (err) {
            if (!abortController.signal.aborted && isMountedRef.current) {
                console.error("Error refreshing dashboard data:", err);
                setError("Kunne ikke oppdatere data. Prøv igjen.");
            }
        } finally {
            if (isMountedRef.current) {
                setRefreshing(false);
            }
        }
    }, [loadData]);

    // Memoized calculations to prevent unnecessary recalculations
    const openTenders = useMemo(
        () => (isSender ? allTenders.filter((t) => t.status === "open") : []),
        [isSender, allTenders]
    );

    const closedTenders = useMemo(
        () => (isSender ? allTenders.filter((t) => t.status === "closed") : []),
        [isSender, allTenders]
    );

    const recentTenders = useMemo(() => {
        if (isSender) {
            return allTenders
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);
        }
        return invitations.slice(0, 5);
    }, [isSender, allTenders, invitations]);

    const stats = useMemo(() => {
        if (isSender) {
            return {
                totalTenders: allTenders.length,
                openTenders: openTenders.length,
                closedTenders: closedTenders.length,
                totalProjects: projects.length,
            };
        }
        return {
            invitations: invitations.length,
            pendingBids: invitations.filter((inv) => {
                const hasBid = inv.bids?.some(
                    (bid) => bid.supplierId === user?.id
                );
                return !hasBid;
            }).length,
            submittedBids: invitations.filter((inv) => {
                return inv.bids?.some((bid) => bid.supplierId === user?.id);
            }).length,
        };
    }, [isSender, allTenders, openTenders, closedTenders, projects, invitations, user?.id]);

    // Show loading state
    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "400px",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    // Show error state
    if (error) {
        return (
            <Box>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "400px",
                    }}
                >
                    <IconButton
                        onClick={handleRefresh}
                        disabled={refreshing}
                        aria-label="Oppdater"
                    >
                        <RefreshIcon />
                    </IconButton>
                </Box>
            </Box>
        );
    }

    return (
        <Box>
            {/* Header Section */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    flexDirection: { xs: "column", sm: "row" },
                    mb: 4,
                    gap: 2,
                }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontSize: {
                                xs: "1.75rem",
                                sm: "2rem",
                                md: "2.5rem",
                            },
                            fontWeight: 600,
                            mb: 0.5,
                        }}
                    >
                        {user?.companyName}
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ fontSize: { xs: "1rem", sm: "1rem" } }}
                    >
                        {isSender
                            ? "Oversikt over dine anskaffelser og prosjekter"
                            : "Oversikt over dine invitasjoner og tilbud"}
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
                                backgroundColor: alpha(
                                    theme.palette.primary.main,
                                    0.1
                                ),
                                "&:hover": {
                                    backgroundColor: alpha(
                                        theme.palette.primary.main,
                                        0.2
                                    ),
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

            {/* Statistics Cards */}
            <DashboardStats
                stats={stats}
                isSender={isSender}
                loading={loading}
            />

            {/* Quick Actions */}
            <DashboardQuickActions
                isSender={isSender}
                isReceiver={isReceiver}
            />

            {/* Recent Activity */}
            <DashboardRecentActivity
                recentTenders={recentTenders}
                isSender={isSender}
                loading={loading}
            />
        </Box>
    );
};

export default Dashboard;
