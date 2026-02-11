import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    IconButton,
    Paper,
    alpha,
    useTheme,
} from "@mui/material";
import {
    Notifications as NotificationsIcon,
    Mail as MailIcon,
    Gavel as GavelIcon,
    QuestionAnswer as QuestionAnswerIcon,
    Description as DescriptionIcon,
    Close as CloseIcon,
} from "@mui/icons-material";
import { useNotifications } from "../../../contexts/NotificationContext";
import { NOTIFICATION_TYPES } from "../../../api/notificationService";
// Simple date formatter
const formatTimeAgo = (date) => {
    if (!date) return "";
    const now = new Date();
    const notificationDate =
        date instanceof Date ? date : new Date(date);
    const diffMs = now - notificationDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "nå";
    if (diffMins < 60) return `for ${diffMins} min siden`;
    if (diffHours < 24) return `for ${diffHours} ${diffHours === 1 ? "time" : "timer"} siden`;
    if (diffDays < 7) return `for ${diffDays} ${diffDays === 1 ? "dag" : "dager"} siden`;
    if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `for ${weeks} ${weeks === 1 ? "uke" : "uker"} siden`;
    }
    if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `for ${months} ${months === 1 ? "måned" : "måneder"} siden`;
    }
    const years = Math.floor(diffDays / 365);
    return `for ${years} ${years === 1 ? "år" : "år"} siden`;
};

const getNotificationIcon = (type) => {
    switch (type) {
        case NOTIFICATION_TYPES.TENDER_INVITATION:
            return <MailIcon fontSize="small" />;
        case NOTIFICATION_TYPES.NEW_BID:
            return <GavelIcon fontSize="small" />;
        case NOTIFICATION_TYPES.TENDER_DEADLINE_REMINDER:
            return <NotificationsIcon fontSize="small" />;
        case NOTIFICATION_TYPES.QUESTION_ASKED:
        case NOTIFICATION_TYPES.QUESTION_ANSWERED:
            return <QuestionAnswerIcon fontSize="small" />;
        case NOTIFICATION_TYPES.CONTRACT_UPDATED:
        case NOTIFICATION_TYPES.CONTRACT_SIGNED:
            return <DescriptionIcon fontSize="small" />;
        default:
            return <NotificationsIcon fontSize="small" />;
    }
};

const getNotificationColor = (type, theme) => {
    switch (type) {
        case NOTIFICATION_TYPES.TENDER_INVITATION:
            return theme.palette.info.main;
        case NOTIFICATION_TYPES.NEW_BID:
            return theme.palette.success.main;
        case NOTIFICATION_TYPES.TENDER_DEADLINE_REMINDER:
            return theme.palette.warning.main;
        case NOTIFICATION_TYPES.QUESTION_ASKED:
        case NOTIFICATION_TYPES.QUESTION_ANSWERED:
            return theme.palette.primary.main;
        case NOTIFICATION_TYPES.CONTRACT_UPDATED:
        case NOTIFICATION_TYPES.CONTRACT_SIGNED:
            return theme.palette.secondary.main;
        default:
            return theme.palette.primary.main;
    }
};

export const NotificationItem = ({ notification }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { markAsRead, removeNotification } = useNotifications();

    const handleClick = async () => {
        if (!notification.read) {
            await markAsRead(notification.id);
        }
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        await removeNotification(notification.id);
    };

    const iconColor = getNotificationColor(notification.type, theme);
    const timeAgo = formatTimeAgo(notification.createdAt);

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                mb: 1,
                cursor: "pointer",
                backgroundColor: notification.read
                    ? "background.paper"
                    : alpha(theme.palette.primary.main, 0.04),
                borderLeft: `3px solid ${iconColor}`,
                transition: "all 0.2s ease",
                "&:hover": {
                    backgroundColor: notification.read
                        ? alpha(theme.palette.action.hover, 0.04)
                        : alpha(theme.palette.primary.main, 0.08),
                    transform: "translateX(2px)",
                },
                position: "relative",
            }}
            onClick={handleClick}
        >
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                {/* Icon */}
                <Box
                    sx={{
                        color: iconColor,
                        mt: 0.5,
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    {getNotificationIcon(notification.type)}
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            fontWeight: notification.read ? 400 : 600,
                            mb: 0.5,
                            color: "text.primary",
                        }}
                    >
                        {notification.title}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mb: 1,
                            fontSize: { xs: "1rem", sm: "1rem", md: "0.875rem" },
                            lineHeight: 1.5,
                        }}
                    >
                        {notification.message}
                    </Typography>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: { xs: "1rem", sm: "1rem", md: "0.875rem" } }}
                    >
                        {timeAgo}
                    </Typography>
                </Box>

                {/* Delete button */}
                <IconButton
                    size="small"
                    onClick={handleDelete}
                    sx={{
                        opacity: 0.6,
                        "&:hover": {
                            opacity: 1,
                            backgroundColor: alpha(
                                theme.palette.error.main,
                                0.08
                            ),
                        },
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* Unread indicator */}
            {!notification.read && (
                <Box
                    sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: theme.palette.primary.main,
                    }}
                />
            )}
        </Paper>
    );
};

