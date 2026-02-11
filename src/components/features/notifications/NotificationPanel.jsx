import { useState } from "react";
import {
    Box,
    Typography,
    Button,
    Paper,
    Divider,
    IconButton,
    useTheme,
    alpha,
    CircularProgress,
    Popover,
} from "@mui/material";
import {
    Notifications as NotificationsIcon,
    MarkEmailRead as MarkEmailReadIcon,
    Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useNotifications } from "../../../contexts/NotificationContext";
import { NotificationItem } from "./NotificationItem";
import { useNavigate } from "react-router-dom";

export const NotificationPanel = ({ anchorEl, onClose }) => {
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

    const open = Boolean(anchorEl);

    const handleMarkAllAsRead = async () => {
        setMarkingAllAsRead(true);
        try {
            await markAllAsRead();
        } finally {
            setMarkingAllAsRead(false);
        }
    };

    const handleViewAll = () => {
        onClose();
        navigate("/notifications");
    };

    const displayedNotifications = notifications.slice(0, 10);

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: "right",
            }}
            PaperProps={{
                sx: {
                    width: { xs: "calc(100vw - 32px)", sm: 400 },
                    maxWidth: 400,
                    maxHeight: "calc(100vh - 200px)",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    overflow: "hidden",
                    boxShadow: "none",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    mt: 1,
                },
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    overflow: "hidden",
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        p: 2,
                        borderBottom: 1,
                        borderColor: "divider",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.04
                        ),
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <NotificationsIcon color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Varsler
                        </Typography>
                        {unreadCount > 0 && (
                            <Box
                                sx={{
                                    backgroundColor: theme.palette.primary.main,
                                    color: "white",
                                    borderRadius: "12px",
                                    px: 1,
                                    py: 0.25,
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    minWidth: 24,
                                    textAlign: "center",
                                }}
                            >
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </Box>
                        )}
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                        <IconButton
                            size="small"
                            onClick={refreshNotifications}
                            disabled={loading}
                            sx={{
                                "&:hover": {
                                    backgroundColor: alpha(
                                        theme.palette.primary.main,
                                        0.08
                                    ),
                                },
                            }}
                        >
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                        {unreadCount > 0 && (
                            <IconButton
                                size="small"
                                onClick={handleMarkAllAsRead}
                                disabled={markingAllAsRead || loading}
                                sx={{
                                    "&:hover": {
                                        backgroundColor: alpha(
                                            theme.palette.primary.main,
                                            0.08
                                        ),
                                    },
                                }}
                            >
                                {markingAllAsRead ? (
                                    <CircularProgress size={16} />
                                ) : (
                                    <MarkEmailReadIcon fontSize="small" />
                                )}
                            </IconButton>
                        )}
                    </Box>
                </Box>

                {/* Notifications List */}
                <Box
                    sx={{
                        flex: 1,
                        overflowY: "auto",
                        p: 2,
                        minHeight: 200,
                        maxHeight: 500,
                    }}
                >
                    {loading && notifications.length === 0 ? (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                py: 4,
                            }}
                        >
                            <CircularProgress size={32} />
                        </Box>
                    ) : displayedNotifications.length === 0 ? (
                        <Box
                            sx={{
                                textAlign: "center",
                                py: 4,
                            }}
                        >
                            <NotificationsIcon
                                sx={{
                                    fontSize: 48,
                                    color: "text.disabled",
                                    mb: 1,
                                }}
                            />
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    fontSize: {
                                        xs: "1rem",
                                        sm: "1rem",
                                        md: "0.875rem",
                                    },
                                }}
                            >
                                Ingen varsler
                            </Typography>
                        </Box>
                    ) : (
                        displayedNotifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                            />
                        ))
                    )}
                </Box>

                {/* Footer */}
                {notifications.length > 0 && (
                    <>
                        <Divider />
                        <Box sx={{ p: 1.5 }}>
                            <Button
                                fullWidth
                                variant="text"
                                onClick={handleViewAll}
                                sx={{
                                    textTransform: "none",
                                    fontWeight: 500,
                                    color: "primary.main",
                                }}
                            >
                                Se alle varsler
                            </Button>
                        </Box>
                    </>
                )}
            </Paper>
        </Popover>
    );
};
