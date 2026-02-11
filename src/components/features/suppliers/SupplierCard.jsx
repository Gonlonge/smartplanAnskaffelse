import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    Paper,
    useTheme,
    alpha,
    Chip,
    Tooltip,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CategoryIcon from "@mui/icons-material/Category";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GavelIcon from "@mui/icons-material/Gavel";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useAuth } from "../../../contexts/AuthContext";
import { getSupplierStats } from "../../../api/userService";
import PropTypes from "prop-types";

/**
 * SupplierCard component for displaying supplier information
 * @param {Object} supplier - Supplier user object
 * @param {Function} onQuickInvite - Callback when quick invite is clicked
 * @param {Function} onViewDetails - Optional callback when view details is clicked
 */
export const SupplierCard = ({ supplier, onQuickInvite, onViewDetails }) => {
    const theme = useTheme();
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);

    const companyName = supplier.companyName || supplier.name || "Ukjent navn";
    const email = supplier.email || "";
    const orgNumber = supplier.orgNumber || "";
    const city = supplier.city || "";
    const address = supplier.address || "";
    const companyFormDescription = supplier.companyFormDescription || "";
    const industryCodes = supplier.industryCodes || [];
    const underLiquidation = supplier.underLiquidation || false;
    const underBankruptcy = supplier.underBankruptcy || false;

    // Get first industry code for display (if available)
    const primaryIndustry = industryCodes.length > 0 ? industryCodes[0] : null;

    // Load supplier statistics if user is a sender
    useEffect(() => {
        const loadStats = async () => {
            if (!supplier?.id || !user || user.role !== "sender") {
                setLoadingStats(false);
                return;
            }

            try {
                setLoadingStats(true);
                const supplierStats = await getSupplierStats(
                    supplier.id,
                    user.id,
                    supplier.email
                );
                setStats(supplierStats);
            } catch (error) {
                console.error("Error loading supplier stats:", error);
            } finally {
                setLoadingStats(false);
            }
        };

        loadStats();
    }, [supplier?.id, user?.id, user?.role, supplier?.email]);

    // Format date to Norwegian locale
    const formatDate = (date) => {
        if (!date) return "Ikke tilgjengelig";
        try {
            const d = date instanceof Date ? date : new Date(date);
            return d.toLocaleDateString("no-NO", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return "Ikke tilgjengelig";
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                p: { xs: 2, sm: 3 },
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                transition: "all 0.2s ease",
                "&:hover": {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    boxShadow: `0 2px 8px ${alpha(
                        theme.palette.primary.main,
                        0.1
                    )}`,
                },
            }}
        >
            {/* Company Name */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                    mb: 2,
                }}
            >
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1.5,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <BusinessIcon
                        sx={{
                            color: "primary.main",
                            fontSize: 28,
                        }}
                    />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            fontSize: { xs: "1rem", sm: "1.125rem" },
                            mb: 0.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                        }}
                    >
                        {companyName}
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flexWrap: "wrap",
                        }}
                    >
                        {orgNumber && (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    fontSize: "0.75rem",
                                }}
                            >
                                Org.nr: {orgNumber}
                            </Typography>
                        )}
                        {(underLiquidation || underBankruptcy) && (
                            <Tooltip
                                title={
                                    underBankruptcy
                                        ? "Under konkurs"
                                        : "Under likvidasjon"
                                }
                            >
                                <WarningIcon
                                    sx={{
                                        fontSize: 16,
                                        color: "warning.main",
                                    }}
                                />
                            </Tooltip>
                        )}
                        {/* Show verified badge if supplier has completed contracts */}
                        {stats && stats.contracts > 0 && (
                            <Tooltip
                                title={`${stats.contracts} fullførte kontrakter`}
                            >
                                <CheckCircleIcon
                                    sx={{
                                        fontSize: 16,
                                        color: "success.main",
                                    }}
                                />
                            </Tooltip>
                        )}
                    </Box>
                    {companyFormDescription && (
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                fontSize: "0.7rem",
                                mt: 0.5,
                            }}
                        >
                            {companyFormDescription}
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* Statistics Section - Only show if user is sender and stats are available */}
            {user?.role === "sender" && stats && stats.hasHistory && (
                <Box
                    sx={{
                        mb: 2,
                        p: 1.5,
                        backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.05
                        ),
                        borderRadius: 1,
                        border: 1,
                        borderColor: alpha(theme.palette.primary.main, 0.1),
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            flexWrap: "wrap",
                        }}
                    >
                        {stats.contracts > 0 && (
                            <Tooltip title="Fullførte kontrakter">
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                    }}
                                >
                                    <AssignmentIcon
                                        sx={{
                                            fontSize: 16,
                                            color: "success.main",
                                        }}
                                    />
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            fontSize: "0.75rem",
                                            fontWeight: 500,
                                            color: "success.main",
                                        }}
                                    >
                                        {stats.contracts}
                                    </Typography>
                                </Box>
                            </Tooltip>
                        )}
                        {stats.bids > 0 && (
                            <Tooltip title="Innsendte tilbud">
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                    }}
                                >
                                    <GavelIcon
                                        sx={{
                                            fontSize: 16,
                                            color: "primary.main",
                                        }}
                                    />
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            fontSize: "0.75rem",
                                            fontWeight: 500,
                                            color: "text.secondary",
                                        }}
                                    >
                                        {stats.bids} tilbud
                                    </Typography>
                                </Box>
                            </Tooltip>
                        )}
                    </Box>
                </Box>
            )}

            {/* Contact Information */}
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    mb: 2,
                }}
            >
                {email && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                        }}
                    >
                        <EmailIcon
                            sx={{
                                fontSize: 18,
                                color: "text.secondary",
                                flexShrink: 0,
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
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {email}
                        </Typography>
                    </Box>
                )}

                {(city || address) && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1,
                        }}
                    >
                        <LocationOnIcon
                            sx={{
                                fontSize: 18,
                                color: "text.secondary",
                                flexShrink: 0,
                                mt: 0.25,
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
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                            }}
                        >
                            {address && city
                                ? `${address}, ${city}`
                                : city || address}
                        </Typography>
                    </Box>
                )}

                {/* Last Interaction - Only show if user is sender and stats are available */}
                {user?.role === "sender" && stats && stats.lastInteraction && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                        }}
                    >
                        <CalendarTodayIcon
                            sx={{
                                fontSize: 18,
                                color: "text.secondary",
                                flexShrink: 0,
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
                            Siste interaksjon:{" "}
                            {formatDate(stats.lastInteraction)}
                        </Typography>
                    </Box>
                )}

                {/* Industry Codes */}
                {primaryIndustry && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flexWrap: "wrap",
                        }}
                    >
                        <CategoryIcon
                            sx={{
                                fontSize: 16,
                                color: "text.secondary",
                                flexShrink: 0,
                            }}
                        />
                        <Chip
                            label={primaryIndustry.code || primaryIndustry}
                            size="small"
                            sx={{
                                height: 20,
                                fontSize: { xs: "1rem", md: "0.875rem" },
                                backgroundColor: alpha(
                                    theme.palette.primary.main,
                                    0.1
                                ),
                                color: "primary.main",
                            }}
                        />
                        {industryCodes.length > 1 && (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    fontSize: "0.7rem",
                                }}
                            >
                                +{industryCodes.length - 1} mer
                            </Typography>
                        )}
                    </Box>
                )}
            </Box>

            {/* Action Buttons */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", lg: "row" },
                    gap: 2,
                }}
            >
                {onViewDetails && (
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<InfoIcon />}
                        onClick={() => onViewDetails(supplier)}
                        sx={{
                            textTransform: "none",
                            borderRadius: 1.5,
                            py: 1.25,
                            fontSize: { xs: "1rem", md: "0.875rem" },
                            fontWeight: 500,
                            minHeight: { xs: 44, md: 36 },
                            width: { xs: "100%", lg: "auto" },
                            flex: { xs: "none", lg: 1 },
                        }}
                    >
                        Detaljer
                    </Button>
                )}
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PersonAddIcon />}
                    onClick={() => onQuickInvite(supplier)}
                    sx={{
                        textTransform: "none",
                        borderRadius: 1.5,
                        py: 1.25,
                        fontSize: { xs: "1rem", md: "0.875rem" },
                        fontWeight: 500,
                        minHeight: { xs: 44, md: 36 },
                        width: { xs: "100%", lg: "auto" },
                        flex: { xs: "none", lg: 1 },
                    }}
                >
                    Inviter
                </Button>
            </Box>
        </Paper>
    );
};

SupplierCard.propTypes = {
    supplier: PropTypes.shape({
        id: PropTypes.string,
        companyName: PropTypes.string,
        name: PropTypes.string,
        email: PropTypes.string,
        orgNumber: PropTypes.string,
        city: PropTypes.string,
        address: PropTypes.string,
        companyFormDescription: PropTypes.string,
        industryCodes: PropTypes.array,
        underLiquidation: PropTypes.bool,
        underBankruptcy: PropTypes.bool,
    }).isRequired,
    onQuickInvite: PropTypes.func.isRequired,
    onViewDetails: PropTypes.func,
};
