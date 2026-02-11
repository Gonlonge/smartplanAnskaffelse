import { useState } from "react";
import { IconButton, Badge, Tooltip, useTheme, alpha } from "@mui/material";
import { NotificationsOutlined as NotificationsIcon } from "@mui/icons-material";
import { useNotifications } from "../../../contexts/NotificationContext";
import { NotificationPanel } from "./NotificationPanel";

export const NotificationBell = () => {
    const theme = useTheme();
    const { unreadCount } = useNotifications();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Tooltip title="Varsler">
                <IconButton
                    onClick={handleClick}
                    sx={{
                        color: "text.secondary", // Gray color to match navbar items
                        "&:hover": {
                            backgroundColor: alpha(
                                theme.palette.text.primary,
                                0.06
                            ),
                            color: "text.primary",
                        },
                    }}
                    aria-label="Varsler"
                    aria-controls={anchorEl ? "notification-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={anchorEl ? "true" : undefined}
                >
                    <Badge
                        badgeContent={unreadCount > 0 ? unreadCount : 0}
                        color="error"
                        max={99}
                        sx={{
                            "& .MuiBadge-badge": {
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                minWidth: 20,
                                height: 20,
                            },
                        }}
                    >
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
            </Tooltip>
            <NotificationPanel anchorEl={anchorEl} onClose={handleClose} />
        </>
    );
};

