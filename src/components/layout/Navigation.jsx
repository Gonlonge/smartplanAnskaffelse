import { useNavigate, useLocation } from "react-router-dom";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Chip,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Divider,
    Avatar,
    Menu,
    MenuItem,
    useTheme,
    useMediaQuery,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    alpha,
    TextField,
    Select,
    FormControl,
    InputLabel,
    CircularProgress,
    Alert,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import DescriptionIcon from "@mui/icons-material/DescriptionOutlined";
import FolderIcon from "@mui/icons-material/FolderOutlined";
import InboxIcon from "@mui/icons-material/InboxOutlined";
import ContactsIcon from "@mui/icons-material/ContactsOutlined";
import CodeIcon from "@mui/icons-material/CodeOutlined";
import LogoutIcon from "@mui/icons-material/LogoutOutlined";
import AccountCircleIcon from "@mui/icons-material/AccountCircleOutlined";
import BusinessIcon from "@mui/icons-material/BusinessOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { NotificationBell } from "../features/notifications";
import { getSupplierAdminUsers, getAllAdminUsers } from "../../api/userService";
import { getStoredSupplierAdminUser, getStoredAdminUser, login as loginService, storeSwitchUsers, getCurrentUser as getCurrentUserService } from "../../api/authService";
import logoBlack from "../../assets/images/smartplan-logo-black.svg";

const Navigation = () => {
    const { user, logout, isAdmin, switchToSupplierAdmin, switchToOtherUser, switchBackToAdmin, originalAdminUser, otherSwitchUser, isInSwitchMode, isSwitchedUser, createSupplierAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [userMenuAnchor, setUserMenuAnchor] = useState(null);
    const [showSwitchBackDialog, setShowSwitchBackDialog] = useState(false);
    const [showCreateSupplierAdminDialog, setShowCreateSupplierAdminDialog] = useState(false);
    const [supplierAdmins, setSupplierAdmins] = useState([]);
    const [selectedSupplierAdmin, setSelectedSupplierAdmin] = useState("");
    const [allAdminUsers, setAllAdminUsers] = useState([]);
    const [selectedAdminUser, setSelectedAdminUser] = useState("");
    const [password, setPassword] = useState("");
    const [switchError, setSwitchError] = useState("");
    const [switching, setSwitching] = useState(false);
    const [createEmail, setCreateEmail] = useState("");
    const [createPassword, setCreatePassword] = useState("");
    const [createName, setCreateName] = useState("");
    const [creating, setCreating] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleNavigation = (path) => {
        navigate(path);
        if (isMobile) {
            setMobileOpen(false);
        }
        setUserMenuAnchor(null);
    };


    // Load users when switch back dialog opens
    useEffect(() => {
        if (showSwitchBackDialog && isAdmin) {
            const loadUsers = async () => {
                try {
                    if (user?.role === 'sender') {
                        // Currently sender admin, load supplier admins
                        const admins = await getSupplierAdminUsers();
                        setSupplierAdmins(admins);
                        setAllAdminUsers([]);
                        // Pre-select the other switch user if available
                        if (otherSwitchUser?.email && admins.some(a => a.email === otherSwitchUser.email)) {
                            setSelectedSupplierAdmin(otherSwitchUser.email);
                        } else if (admins.length > 0) {
                            setSelectedSupplierAdmin(admins[0].email || "");
                        }
                    } else {
                        // Currently receiver admin, load all admin users
                        const admins = await getAllAdminUsers();
                        setAllAdminUsers(admins);
                        setSupplierAdmins([]);
                        // Pre-select the other switch user if available, otherwise first admin
                        if (otherSwitchUser?.email && admins.some(a => a.email === otherSwitchUser.email)) {
                            setSelectedAdminUser(otherSwitchUser.email);
                        } else if (originalAdminUser?.email && admins.some(a => a.email === originalAdminUser.email)) {
                            setSelectedAdminUser(originalAdminUser.email);
                        } else if (admins.length > 0) {
                            setSelectedAdminUser(admins[0].email || "");
                        }
                    }
                } catch (error) {
                    console.error("Error loading users:", error);
                }
            };
            loadUsers();
        }
    }, [showSwitchBackDialog, isAdmin, otherSwitchUser, originalAdminUser, user?.role]);


    const handleSwitchBack = async () => {
        if (!password) {
            setSwitchError("Skriv inn passord");
            return;
        }

        setSwitching(true);
        setSwitchError("");

        try {
            if (user?.role === 'sender') {
                // Currently sender admin, switching to supplier admin
                if (!selectedSupplierAdmin) {
                    setSwitchError("Velg en leverandør administrator");
                    setSwitching(false);
                    return;
                }

                // If in switch mode and switching to stored supplier admin, use bidirectional switch
                if (isInSwitchMode && otherSwitchUser && selectedSupplierAdmin === otherSwitchUser.email) {
                    const result = await switchToOtherUser(password);
                    if (result.success) {
                        setShowSwitchBackDialog(false);
                        setPassword("");
                        setSelectedSupplierAdmin("");
                        setMobileOpen(false);
                        navigate("/dashboard");
                    } else {
                        setSwitchError(result.error || "Kunne ikke bytte bruker");
                    }
                } else {
                    // First time switching - use original switch function
                    const result = await switchToSupplierAdmin(selectedSupplierAdmin, password);
                    if (result.success) {
                        setShowSwitchBackDialog(false);
                        setPassword("");
                        setSelectedSupplierAdmin("");
                        setMobileOpen(false);
                        navigate("/dashboard");
                    } else {
                        setSwitchError(result.error || "Kunne ikke bytte bruker");
                    }
                }
            } else {
                // Currently receiver admin, switching to sender admin
                if (!selectedAdminUser) {
                    setSwitchError("Velg en administrator");
                    setSwitching(false);
                    return;
                }

                // If switching to the stored other user, use bidirectional switch
                if (isInSwitchMode && otherSwitchUser && selectedAdminUser === otherSwitchUser.email) {
                    const result = await switchToOtherUser(password);
                    if (result.success) {
                        setShowSwitchBackDialog(false);
                        setPassword("");
                        setSelectedAdminUser("");
                        setMobileOpen(false);
                        navigate("/dashboard");
                    } else {
                        setSwitchError(result.error || "Kunne ikke bytte tilbake");
                    }
                } else {
                    // Switching to a different admin user - login as that user and store switch state
                    const currentUser = await getCurrentUserService();
                    if (!currentUser || !currentUser.isAdmin) {
                        setSwitchError("Kun administratorer kan bytte bruker");
                        setSwitching(false);
                        return;
                    }

                    // Login as the selected admin user
                    const loginResult = await loginService(selectedAdminUser, password);
                    
                    if (!loginResult.success) {
                        setSwitchError(loginResult.error || "Kunne ikke bytte tilbake");
                        setSwitching(false);
                        return;
                    }

                    // Verify the user is an admin
                    if (!loginResult.user.isAdmin) {
                        setSwitchError("Brukeren er ikke en administrator");
                        setSwitching(false);
                        return;
                    }

                    // Store both users for bidirectional switching
                    // storeSwitchUsers expects (senderAdmin, receiverAdmin)
                    const senderAdmin = currentUser.role === 'sender' ? currentUser : loginResult.user;
                    const receiverAdmin = currentUser.role === 'receiver' ? currentUser : loginResult.user;
                    
                    // Only store if we have both a sender and receiver admin
                    if (senderAdmin.role === 'sender' && receiverAdmin.role === 'receiver') {
                        storeSwitchUsers(senderAdmin, receiverAdmin);
                    } else {
                        // If both are same role, store them anyway (might be used for future features)
                        if (loginResult.user.role === 'sender') {
                            storeSwitchUsers(loginResult.user, currentUser);
                        } else {
                            storeSwitchUsers(currentUser, loginResult.user);
                        }
                    }

                    setShowSwitchBackDialog(false);
                    setPassword("");
                    setSelectedAdminUser("");
                    setMobileOpen(false);
                    navigate("/dashboard");
                }
            }
        } catch (error) {
            setSwitchError(error.message || "En feil oppstod");
        } finally {
            setSwitching(false);
        }
    };

    const handleCreateSupplierAdmin = async () => {
        if (!createEmail || !createPassword || !createName) {
            setSwitchError("Alle felt må fylles ut");
            return;
        }

        if (createPassword.length < 6) {
            setSwitchError("Passordet må være minst 6 tegn");
            return;
        }

        setCreating(true);
        setSwitchError("");

        try {
            const result = await createSupplierAdmin(createEmail, createPassword, createName);
            if (result.success) {
                // Reload supplier admins
                const admins = await getSupplierAdminUsers();
                setSupplierAdmins(admins);
                if (admins.length > 0) {
                    setSelectedSupplierAdmin(admins[0].email || "");
                }
                // Close create dialog and reset form
                setShowCreateSupplierAdminDialog(false);
                setCreateEmail("");
                setCreatePassword("");
                setCreateName("");
            } else {
                setSwitchError(result.error || "Kunne ikke opprette leverandør administrator");
            }
        } catch (error) {
            setSwitchError(error.message || "En feil oppstod");
        } finally {
            setCreating(false);
        }
    };

    const isActive = (path) => {
        // Exact match or sub-route match (e.g., /tenders matches /tenders/123)
        return (
            location.pathname === path ||
            location.pathname.startsWith(path + "/")
        );
    };

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!user?.companyName) return "U";
        const names = user.companyName.split(" ");
        if (names.length >= 2) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return user.companyName.substring(0, 2).toUpperCase();
    };

    // Navigation items based on user role with icons
    const getNavItems = () => {
        const baseItems = [
            { label: "Dashboard", path: "/dashboard", icon: DashboardIcon },
        ];
        const devToolsItem = {
            label: "Dev Tools",
            path: "/compliance",
            icon: CodeIcon,
        };

        const items = [];

        if (user?.role === "sender") {
            items.push(
                ...baseItems,
                {
                    label: "Anskaffelse",
                    path: "/tenders",
                    icon: DescriptionIcon,
                },
                { label: "Prosjekter", path: "/projects", icon: FolderIcon },
                {
                    label: "Leverandører",
                    path: "/suppliers",
                    icon: BusinessIcon,
                }
            );
        } else if (user?.role === "receiver") {
            items.push(
                ...baseItems,
                {
                    label: "Invitasjoner",
                    path: "/invitations",
                    icon: InboxIcon,
                },
                {
                    label: "Mine kontakter",
                    path: "/contacts",
                    icon: ContactsIcon,
                }
            );
        }

        // Only add Dev Tools and Admin Users for admin users
        if (isAdmin) {
            items.push(devToolsItem);
            items.push({
                label: "Administratorer",
                path: "/admin-users",
                icon: BusinessIcon,
            });
        }

        // Add switch user option if in switch mode AND user is admin
        if (isAdmin && isInSwitchMode && otherSwitchUser) {
            if (user?.role === 'sender') {
                // Currently sender admin, show option to switch to supplier admin
                items.push({
                    label: "Bytt admin til leverandør",
                    path: null, // Special action item
                    icon: SwapHorizIcon,
                    action: () => {
                        // Pre-fill the supplier admin email and show switch dialog
                        const supplierAdmin = getStoredSupplierAdminUser();
                        if (supplierAdmin) {
                            setSelectedSupplierAdmin(supplierAdmin.email);
                            setShowSwitchBackDialog(true);
                        }
                    },
                });
            } else if (user?.role === 'receiver') {
                // Currently receiver admin, show option to switch to sender admin
                items.push({
                    label: "Bytt tilbake til admin",
                    path: null, // Special action item
                    icon: SwapHorizIcon,
                    action: () => setShowSwitchBackDialog(true),
                });
            }
        }

        return items;
    };

    const navItems = getNavItems();

    const drawer = (
        <Box
            sx={{
                width: "100%",
                maxWidth: 360,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflowX: "hidden",
            }}
        >
            {/* Brand Header */}
            <Box
                sx={{
                    px: 3,
                    py: 2.5,
                    borderBottom: 1,
                    borderColor: "divider",
                    cursor: "pointer",
                    "&:hover": {
                        backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.04
                        ),
                    },
                }}
                onClick={() => handleNavigation("/dashboard")}
            >
                <Box
                    sx={{
                        display: "inline-flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                    }}
                >
                    <Box
                        component="img"
                        src={logoBlack}
                        alt="Smartplan"
                        sx={{
                            height: { xs: 32, sm: 40 },
                            width: "auto",
                            maxWidth: "100%",
                        }}
                    />
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            fontSize: { xs: "1rem", sm: "0.75rem" },
                            fontWeight: 400,
                            lineHeight: 1,
                            alignSelf: "flex-end",
                        }}
                    >
                        Anbudsplattform
                    </Typography>
                </Box>
            </Box>

            {/* Navigation Items */}
            <List sx={{ flex: 1, pt: 1, overflowX: "hidden", width: "100%" }}>
                {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const active = item.path ? isActive(item.path) : false;
                    const isActionItem = !!item.action;
                    return (
                        <ListItem key={item.path || `action-${index}`} disablePadding>
                            <ListItemButton
                                selected={active}
                                onClick={() => {
                                    if (isActionItem && item.action) {
                                        item.action();
                                    } else if (item.path) {
                                        handleNavigation(item.path);
                                    }
                                }}
                                sx={{
                                    mx: 1,
                                    mb: 0.5,
                                    borderRadius: 1.5,
                                    minHeight: 48,
                                    color: active || isActionItem
                                        ? "primary.main"
                                        : "text.secondary",
                                    backgroundColor: "transparent",
                                    "&.Mui-selected": {
                                        backgroundColor: "transparent",
                                        color: "primary.main",
                                        fontWeight: 600,
                                        "&:hover": {
                                            backgroundColor: alpha(
                                                theme.palette.text.primary,
                                                0.06
                                            ),
                                        },
                                        "& .MuiListItemIcon-root": {
                                            color: "primary.main",
                                        },
                                    },
                                    "&:hover": {
                                        backgroundColor: alpha(
                                            theme.palette.text.primary,
                                            0.06
                                        ),
                                        color: active || isActionItem
                                            ? "primary.main"
                                            : "text.primary",
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 40,
                                        color: "inherit",
                                    }}
                                >
                                    <Icon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontSize: "0.9375rem",
                                        fontWeight: active || isActionItem ? 600 : 400,
                                        color: "inherit",
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            {/* User Section */}
            <Box
                sx={{
                    borderTop: 1,
                    borderColor: "divider",
                    width: "100%",
                    overflowX: "hidden",
                }}
            >
                <Box
                    sx={{
                        px: 2,
                        py: 2,
                        width: "100%",
                        boxSizing: "border-box",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            mb: 1.5,
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 40,
                                height: 40,
                                bgcolor: "primary.main",
                                fontSize: { xs: "1rem", md: "0.875rem" },
                                fontWeight: 600,
                            }}
                        >
                            {getUserInitials()}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: 500,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {user?.companyName}
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    fontSize: { xs: "1rem", md: "0.875rem" },
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    display: "block",
                                }}
                            >
                                {user?.email}
                            </Typography>
                        </Box>
                    </Box>
                    {isAdmin && (
                        <Chip
                            label={user?.role === "sender" ? "Anskaffelse Admin" : "Leverandør Admin"}
                            color="secondary"
                            size="small"
                            sx={{
                                height: 24,
                                    fontSize: { xs: "1rem", md: "0.875rem" },
                                fontWeight: 500,
                                mb: 1.5,
                            }}
                        />
                    )}
                    {!isAdmin && user?.role && (
                        <Chip
                            label={user?.role === "sender" ? "Anskaffelse" : "Leverandør"}
                            size="small"
                            sx={{
                                height: 24,
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                mb: 1.5,
                                backgroundColor: "grey.300",
                                color: "text.primary",
                            }}
                        />
                    )}
                    {isInSwitchMode && otherSwitchUser && (
                        <Chip
                            label={`Byttbar med: ${otherSwitchUser.companyName || otherSwitchUser.email}`}
                            color="warning"
                            size="small"
                            sx={{
                                height: 24,
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                mb: 1.5,
                            }}
                        />
                    )}
                    {isInSwitchMode && otherSwitchUser ? (
                        // In switch mode - show switch to other user button
                        <Button
                            fullWidth
                            variant="outlined"
                            color="primary"
                            startIcon={<SwapHorizIcon />}
                            onClick={() => {
                                setMobileOpen(false);
                                setShowSwitchBackDialog(true);
                            }}
                            sx={{
                                textTransform: "none",
                                borderRadius: 1.5,
                                py: 1,
                                mb: 1.5,
                                borderColor: alpha(theme.palette.primary.main, 0.3),
                                color: "primary.main",
                                "&:hover": {
                                    borderColor: "primary.main",
                                    backgroundColor: alpha(
                                        theme.palette.primary.main,
                                        0.04
                                    ),
                                },
                            }}
                        >
                            {user?.role === 'sender' 
                                ? "Bytt admin til leverandør" 
                                : "Bytt admin til anskaffelse"}
                        </Button>
                    ) : isAdmin && !isInSwitchMode ? (
                        // Not in switch mode yet - show initial switch button
                        <Button
                            fullWidth
                            variant="outlined"
                            color="primary"
                            startIcon={<SwapHorizIcon />}
                            onClick={() => {
                                setMobileOpen(false);
                                setShowSwitchBackDialog(true);
                            }}
                            sx={{
                                textTransform: "none",
                                borderRadius: 1.5,
                                py: 1,
                                mb: 1.5,
                                borderColor: alpha(theme.palette.primary.main, 0.3),
                                color: "primary.main",
                                "&:hover": {
                                    borderColor: "primary.main",
                                    backgroundColor: alpha(
                                        theme.palette.primary.main,
                                        0.04
                                    ),
                                },
                            }}
                        >
                            Bytt admin til leverandør
                        </Button>
                    ) : null}
                    <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        startIcon={<LogoutIcon />}
                        onClick={() => {
                            setMobileOpen(false);
                            setShowLogoutDialog(true);
                        }}
                        sx={{
                            textTransform: "none",
                            borderRadius: 1.5,
                            py: 1,
                            borderColor: alpha(theme.palette.error.main, 0.3),
                            color: "error.main",
                            "&:hover": {
                                borderColor: "error.main",
                                backgroundColor: alpha(
                                    theme.palette.error.main,
                                    0.04
                                ),
                            },
                        }}
                    >
                        Logg ut
                    </Button>
                </Box>
            </Box>
        </Box>
    );

    return (
        <>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    // Subtle glass effect - reduced for better readability
                    backgroundColor: {
                        xs: "rgba(255, 255, 255, 0.95)", // More opaque on mobile
                        md: "rgba(255, 255, 255, 0.85)", // Slightly more transparent on desktop
                    },
                    backdropFilter: {
                        xs: "blur(8px) saturate(120%)", // Minimal blur on mobile
                        md: "blur(12px) saturate(140%)", // Slightly more on desktop
                    },
                    WebkitBackdropFilter: {
                        xs: "blur(8px) saturate(120%)", // Safari
                        md: "blur(12px) saturate(140%)",
                    },
                    // Fallback for browsers that don't support backdrop-filter
                    "@supports not (backdrop-filter: blur(1px))": {
                        backgroundColor: "rgba(255, 255, 255, 0.98)",
                    },
                    borderBottom: "0.5px solid rgba(0, 0, 0, 0.08)",
                    boxShadow: "none",
                    // Ensure it's above content
                    zIndex: (theme) => theme.zIndex.appBar,
                }}
            >
                <Toolbar
                    sx={{
                        px: { xs: 2, sm: 3 },
                        minHeight: { xs: 64, md: 70 },
                        justifyContent: "space-between",
                    }}
                >
                    {/* Left Section: Brand */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <Box
                            onClick={() => handleNavigation("/dashboard")}
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                cursor: "pointer",
                                transition: "opacity 0.2s",
                                "&:hover": {
                                    opacity: 0.8,
                                },
                            }}
                        >
                            <Box
                                component="img"
                                src={logoBlack}
                                alt="Smartplan"
                                sx={{
                                    height: { xs: 32, sm: 40 },
                                    width: "auto",
                                }}
                            />
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    fontSize: { xs: "1rem", sm: "0.75rem" },
                                    fontWeight: 400,
                                    lineHeight: 1,
                                    alignSelf: "flex-end",
                                }}
                            >
                                Anbudsplattform
                            </Typography>
                        </Box>
                    </Box>

                    {/* Desktop Navigation */}
                    {!isMobile && (
                        <Box
                            component="nav"
                            role="navigation"
                            aria-label="Main navigation"
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                mx: 3,
                            }}
                        >
                            {navItems.map((item, index) => {
                                const Icon = item.icon;
                                const active = item.path ? isActive(item.path) : false;
                                const isActionItem = !!item.action;
                                return (
                                    <Button
                                        key={item.path || `action-${index}`}
                                        startIcon={<Icon fontSize="small" />}
                                        onClick={() => {
                                            if (isActionItem && item.action) {
                                                item.action();
                                            } else if (item.path) {
                                                handleNavigation(item.path);
                                            }
                                        }}
                                        sx={{
                                            px: 2,
                                            py: 1,
                                            fontSize: { xs: "1rem", md: "0.875rem" },
                                            fontWeight: active || isActionItem ? 600 : 400,
                                            color: active || isActionItem
                                                ? "primary.main"
                                                : "text.secondary",
                                            backgroundColor: "transparent",
                                            borderRadius: 2,
                                            textTransform: "none",
                                            transition: "all 0.2s ease",
                                            "&:hover": {
                                                backgroundColor: alpha(
                                                    theme.palette.text.primary,
                                                    0.06
                                                ),
                                                color: active || isActionItem
                                                    ? "primary.main"
                                                    : "text.primary",
                                            },
                                            "& .MuiButton-startIcon": {
                                                mr: 0.75,
                                                color: "inherit",
                                            },
                                        }}
                                    >
                                        {item.label}
                                    </Button>
                                );
                            })}
                        </Box>
                    )}

                    {/* Right Section: Mobile Menu / Notifications + User Menu */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            ml: 2,
                            pl: { xs: 0, md: 2 },
                            borderLeft: {
                                xs: "none",
                                md: `1px solid rgba(0, 0, 0, 0.08)`,
                            },
                        }}
                    >
                        {isMobile && (
                            <IconButton
                                aria-label="open drawer"
                                aria-expanded={mobileOpen}
                                aria-controls="navigation-drawer"
                                edge="end"
                                onClick={handleDrawerToggle}
                                sx={{
                                    minHeight: { xs: 44, md: 40 },
                                    minWidth: { xs: 44, md: 40 },
                                    color: "text.primary",
                                    "&:hover": {
                                        backgroundColor: alpha(
                                            theme.palette.text.primary,
                                            0.08
                                        ),
                                    },
                                }}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
                        {!isMobile && (
                            <>
                                {isAdmin && (
                                    <Chip
                                        label={user?.role === "sender" ? "Anskaffelse Admin" : "Leverandør Admin"}
                                        color="secondary"
                                        size="small"
                                        sx={{
                                            height: 26,
                                            fontSize: "0.75rem",
                                            fontWeight: 500,
                                        }}
                                    />
                                )}
                                {!isAdmin && user?.role && (
                                    <Chip
                                        label={user?.role === "sender" ? "Anskaffelse" : "Leverandør"}
                                        size="small"
                                        sx={{
                                            height: 26,
                                            fontSize: "0.75rem",
                                            fontWeight: 500,
                                            backgroundColor: "grey.300",
                                            color: "text.primary",
                                        }}
                                    />
                                )}
                                <NotificationBell />
                                <IconButton
                                    onClick={(e) =>
                                        setUserMenuAnchor(e.currentTarget)
                                    }
                                    sx={{
                                        p: 0.5,
                                        "&:hover": {
                                            backgroundColor: alpha(
                                                theme.palette.text.primary,
                                                0.06
                                            ),
                                        },
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            bgcolor: "primary.main",
                                            color: "primary.contrastText",
                                            fontSize: { xs: "1rem", md: "0.875rem" },
                                            fontWeight: 600,
                                            border: `1px solid rgba(0, 0, 0, 0.08)`,
                                        }}
                                    >
                                        {getUserInitials()}
                                    </Avatar>
                                </IconButton>
                                <Menu
                                    anchorEl={userMenuAnchor}
                                    open={Boolean(userMenuAnchor)}
                                    onClose={() => setUserMenuAnchor(null)}
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
                                            mt: 1,
                                            minWidth: 240,
                                            borderRadius: 2,
                                            boxShadow: "none",
                                            border: "1px solid rgba(0, 0, 0, 0.08)",
                                            backgroundColor: "#ffffff", // Solid white background
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            px: 2,
                                            py: 1.5,
                                            borderBottom: 1,
                                            borderColor: "divider",
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{ fontWeight: 500, mb: 0.5 }}
                                        >
                                            {user?.companyName}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ fontSize: "0.75rem" }}
                                        >
                                            {user?.email}
                                        </Typography>
                                    </Box>
                                    <MenuItem
                                        onClick={() => {
                                            setUserMenuAnchor(null);
                                            handleNavigation("/profile");
                                        }}
                                        sx={{
                                            py: 1.5,
                                            "&:hover": {
                                                backgroundColor: alpha(
                                                    theme.palette.primary.main,
                                                    0.08
                                                ),
                                            },
                                        }}
                                    >
                                        <AccountCircleIcon
                                            sx={{ mr: 1.5, fontSize: 20 }}
                                        />
                                        <Typography variant="body2">
                                            Min profil
                                        </Typography>
                                    </MenuItem>
                                    {isAdmin && !isSwitchedUser && (
                                        <>
                                            <Divider />
                                            <MenuItem
                                                onClick={() => {
                                                    setUserMenuAnchor(null);
                                                    setShowSwitchBackDialog(true);
                                                }}
                                                sx={{
                                                    py: 1.5,
                                                    "&:hover": {
                                                        backgroundColor: alpha(
                                                            theme.palette.primary.main,
                                                            0.08
                                                        ),
                                                    },
                                                }}
                                            >
                                                <SwapHorizIcon
                                                    sx={{ mr: 1.5, fontSize: 20 }}
                                                />
                                                <Typography variant="body2">
                                                    {user?.role === 'sender' ? "Bytt admin til leverandør" : "Bytt admin til anskaffelse"}
                                                </Typography>
                                            </MenuItem>
                                        </>
                                    )}
                                    {isAdmin && isSwitchedUser && (
                                        <>
                                            <Divider />
                                            <MenuItem
                                                onClick={() => {
                                                    setUserMenuAnchor(null);
                                                    setShowSwitchBackDialog(true);
                                                }}
                                                sx={{
                                                    py: 1.5,
                                                    "&:hover": {
                                                        backgroundColor: alpha(
                                                            theme.palette.primary.main,
                                                            0.08
                                                        ),
                                                    },
                                                }}
                                            >
                                                <SwapHorizIcon
                                                    sx={{ mr: 1.5, fontSize: 20 }}
                                                />
                                                <Typography variant="body2">
                                                    {user?.role === 'receiver' ? "Bytt admin til anskaffelse" : "Bytt admin til leverandør"}
                                                </Typography>
                                            </MenuItem>
                                        </>
                                    )}
                                    <Divider />
                                    <MenuItem
                                        onClick={() => {
                                            setUserMenuAnchor(null);
                                            setShowLogoutDialog(true);
                                        }}
                                        sx={{
                                            py: 1.5,
                                            color: "error.main",
                                            "&:hover": {
                                                backgroundColor: alpha(
                                                    theme.palette.error.main,
                                                    0.08
                                                ),
                                            },
                                        }}
                                    >
                                        <LogoutIcon
                                            sx={{ mr: 1.5, fontSize: 20 }}
                                        />
                                        <Typography variant="body2">
                                            Logg ut
                                        </Typography>
                                    </MenuItem>
                                </Menu>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                id="navigation-drawer"
                aria-label="Navigation menu"
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile
                }}
                sx={{
                    display: { xs: "block", md: "none" },
                    "& .MuiDrawer-paper": {
                        boxSizing: "border-box",
                        width: { xs: "85vw", sm: 360 },
                        maxWidth: 360,
                        boxShadow: "none",
                        borderRight: "1px solid rgba(0, 0, 0, 0.08)",
                        backgroundColor: "#ffffff", // Solid white background
                        overflowX: "hidden",
                    },
                }}
            >
                {drawer}
            </Drawer>

            {/* Logout Confirmation Dialog */}
            <Dialog
                open={showLogoutDialog}
                onClose={() => setShowLogoutDialog(false)}
                aria-labelledby="logout-dialog-title"
                aria-describedby="logout-dialog-description"
                PaperProps={{
                    sx: {
                        backgroundColor: "#ffffff", // Solid white background
                    },
                }}
            >
                <DialogTitle id="logout-dialog-title">Logg ut</DialogTitle>
                <DialogContent>
                    <DialogContentText id="logout-dialog-description">
                        Er du sikker på at du vil logge ut?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setShowLogoutDialog(false)}
                        sx={{ textTransform: "none" }}
                    >
                        Avbryt
                    </Button>
                    <Button
                        onClick={() => {
                            setShowLogoutDialog(false);
                            logout();
                        }}
                        variant="contained"
                        color="primary"
                        autoFocus
                        sx={{ textTransform: "none" }}
                    >
                        Logg ut
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Switch Back to Admin Dialog */}
            <Dialog
                open={showSwitchBackDialog}
                onClose={() => {
                    if (!switching) {
                        setShowSwitchBackDialog(false);
                        setPassword("");
                        setSelectedAdminUser("");
                        setSwitchError("");
                    }
                }}
                aria-labelledby="switch-back-dialog-title"
                PaperProps={{
                    sx: {
                        backgroundColor: "#ffffff",
                        minWidth: 400,
                    },
                }}
            >
                <DialogTitle id="switch-back-dialog-title">
                    {user?.role === 'sender' ? "Bytt admin til leverandør" : "Bytt admin til anskaffelse"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        {user?.role === 'sender' 
                            ? "Velg en leverandør administrator og skriv inn passord for å bytte bruker."
                            : "Velg en administrator og skriv inn passord for å bytte."}
                    </DialogContentText>
                    {switchError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {switchError}
                        </Alert>
                    )}
                    {user?.role === 'sender' ? (
                        <>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel id="supplier-admin-select-label">
                                    Leverandør administrator
                                </InputLabel>
                                <Select
                                    labelId="supplier-admin-select-label"
                                    id="supplier-admin-select"
                                    value={selectedSupplierAdmin}
                                    label="Leverandør administrator"
                                    onChange={(e) => setSelectedSupplierAdmin(e.target.value)}
                                    disabled={switching || supplierAdmins.length === 0}
                                >
                                    {supplierAdmins.map((admin) => (
                                        <MenuItem key={admin.email} value={admin.email}>
                                            {admin.companyName || admin.name} ({admin.email})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {supplierAdmins.length === 0 && (
                                <Alert 
                                    severity="info" 
                                    sx={{ mb: 2 }}
                                    action={
                                        <Button
                                            color="inherit"
                                            size="small"
                                            onClick={() => {
                                                setShowSwitchBackDialog(false);
                                                setShowCreateSupplierAdminDialog(true);
                                            }}
                                            disabled={switching}
                                        >
                                            Opprett en
                                        </Button>
                                    }
                                >
                                    Ingen leverandør administratorer funnet.
                                </Alert>
                            )}
                        </>
                    ) : (
                        <>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel id="admin-user-select-label">
                                    Administrator
                                </InputLabel>
                                <Select
                                    labelId="admin-user-select-label"
                                    id="admin-user-select"
                                    value={selectedAdminUser}
                                    label="Administrator"
                                    onChange={(e) => setSelectedAdminUser(e.target.value)}
                                    disabled={switching || allAdminUsers.length === 0}
                                >
                                    {allAdminUsers.map((admin) => (
                                        <MenuItem key={admin.email} value={admin.email}>
                                            {admin.role === 'sender' ? 'Admin anskaffelse' : 'Admin leverandør'}: {admin.companyName || admin.name} ({admin.email})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {allAdminUsers.length === 0 && (
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    Ingen administratorer funnet.
                                </Alert>
                            )}
                        </>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        id="password-back"
                        label="Passord"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={switching}
                        onKeyPress={(e) => {
                            if (e.key === "Enter" && !switching && password) {
                                if (user?.role === 'sender' && selectedSupplierAdmin) {
                                    handleSwitchBack();
                                } else if (user?.role === 'receiver' && selectedAdminUser) {
                                    handleSwitchBack();
                                }
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setShowSwitchBackDialog(false);
                            setPassword("");
                            setSelectedAdminUser("");
                            setSelectedSupplierAdmin("");
                            setSwitchError("");
                        }}
                        disabled={switching}
                        sx={{ textTransform: "none" }}
                    >
                        Avbryt
                    </Button>
                    <Button
                        onClick={handleSwitchBack}
                        variant="contained"
                        color="primary"
                        disabled={
                            switching || 
                            !password || 
                            (user?.role === 'sender' && (!selectedSupplierAdmin || supplierAdmins.length === 0)) ||
                            (user?.role === 'receiver' && (!selectedAdminUser || allAdminUsers.length === 0))
                        }
                        sx={{ textTransform: "none" }}
                        startIcon={switching ? <CircularProgress size={16} /> : null}
                    >
                        {switching ? "Bytter..." : "Bytt bruker"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create Supplier Admin Dialog */}
            <Dialog
                open={showCreateSupplierAdminDialog}
                onClose={() => {
                    if (!creating) {
                        setShowCreateSupplierAdminDialog(false);
                        setCreateEmail("");
                        setCreatePassword("");
                        setCreateName("");
                        setSwitchError("");
                    }
                }}
                aria-labelledby="create-supplier-admin-dialog-title"
                PaperProps={{
                    sx: {
                        backgroundColor: "#ffffff",
                        minWidth: 400,
                    },
                }}
            >
                <DialogTitle id="create-supplier-admin-dialog-title">
                    Opprett leverandør administrator
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Opprett en ny leverandør administrator (leverandør med isAdmin: true) for testing.
                    </DialogContentText>
                    {switchError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {switchError}
                        </Alert>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        id="create-name"
                        label="Firmanavn"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                        disabled={creating}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        id="create-email"
                        label="E-postadresse"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={createEmail}
                        onChange={(e) => setCreateEmail(e.target.value)}
                        disabled={creating}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        id="create-password"
                        label="Passord"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={createPassword}
                        onChange={(e) => setCreatePassword(e.target.value)}
                        disabled={creating}
                        onKeyPress={(e) => {
                            if (e.key === "Enter" && !creating && createEmail && createPassword && createName) {
                                handleCreateSupplierAdmin();
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setShowCreateSupplierAdminDialog(false);
                            setCreateEmail("");
                            setCreatePassword("");
                            setCreateName("");
                            setSwitchError("");
                        }}
                        disabled={creating}
                        sx={{ textTransform: "none" }}
                    >
                        Avbryt
                    </Button>
                    <Button
                        onClick={handleCreateSupplierAdmin}
                        variant="contained"
                        color="primary"
                        disabled={creating || !createEmail || !createPassword || !createName}
                        sx={{ textTransform: "none" }}
                        startIcon={creating ? <CircularProgress size={16} /> : null}
                    >
                        {creating ? "Oppretter..." : "Opprett"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Navigation;
