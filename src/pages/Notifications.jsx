import { useState } from "react";
import {
    Box,
    Typography,
    Paper,
    IconButton,
    Button,
    useTheme,
    alpha,
    CircularProgress,
    Divider,
} from "@mui/material";
import {
    Notifications as NotificationsIcon,
    MarkEmailRead as MarkEmailReadIcon,
    Refresh as RefreshIcon,
    ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../contexts/NotificationContext";
import { NotificationItem } from "../components/features/notifications";

const Notifications = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        loading,
        markAllAsRead,
        refreshNotifications,
    } = useNotifications();
    const [markingAllAsRead, setMarkingAllAsRead] = useState(false);

    const handleMarkAllAsRead = async () => {
        setMarkingAllAsRead(true);
        try {
            await markAllAsRead();
        } finally {
            setMarkingAllAsRead(false);
        }
    };

    return (
        <Box>
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 3,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{
                            "&:hover": {
                                backgroundColor: alpha(
                                    theme.palette.primary.main,
                                    0.08
                                ),
                            },
                        }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <NotificationsIcon
                            sx={{
                                fontSize: 32,
                                color: theme.palette.primary.main,
                            }}
                        />
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
                            }}
                        >
                            Varsler
                        </Typography>
                        {unreadCount > 0 && (
                            <Box
                                sx={{
                                    backgroundColor: theme.palette.primary.main,
                                    color: "white",
                                    borderRadius: "12px",
                                    px: 1.5,
                                    py: 0.5,
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    minWidth: 32,
                                    textAlign: "center",
                                }}
                            >
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </Box>
                        )}
                    </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={refreshNotifications}
                        disabled={loading}
                        size="small"
                    >
                        Oppdater
                    </Button>
                    {unreadCount > 0 && (
                        <Button
                            variant="contained"
                            startIcon={
                                markingAllAsRead ? (
                                    <CircularProgress size={16} />
                                ) : (
                                    <MarkEmailReadIcon />
                                )
                            }
                            onClick={handleMarkAllAsRead}
                            disabled={markingAllAsRead || loading}
                            size="small"
                        >
                            Marker alle som lest
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Notifications List */}
            <Paper
                elevation={0}
                sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    overflow: "hidden",
                }}
            >
                {loading && notifications.length === 0 ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            py: 8,
                        }}
                    >
                        <CircularProgress size={48} />
                    </Box>
                ) : notifications.length === 0 ? (
                    <Box
                        sx={{
                            textAlign: "center",
                            py: 8,
                        }}
                    >
                        <NotificationsIcon
                            sx={{
                                fontSize: 64,
                                color: "text.disabled",
                                mb: 2,
                            }}
                        />
                        <Typography
                            variant="h6"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                        >
                            Ingen varsler
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Du har ingen varsler ennå. Nye varsler vil vises her.
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {notifications.map((notification, index) => (
                            <Box key={notification.id}>
                                <Box sx={{ p: 2 }}>
                                    <NotificationItem
                                        notification={notification}
                                    />
                                </Box>
                                {index < notifications.length - 1 && (
                                    <Divider />
                                )}
                            </Box>
                        ))}
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default Notifications;

