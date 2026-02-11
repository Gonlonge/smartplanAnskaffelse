import { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Divider,
    Grid,
    Chip,
    IconButton,
    useTheme,
    alpha,
    Alert,
    Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BusinessIcon from "@mui/icons-material/Business";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CategoryIcon from "@mui/icons-material/Category";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import WarningIcon from "@mui/icons-material/Warning";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PublicIcon from "@mui/icons-material/Public";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GavelIcon from "@mui/icons-material/Gavel";
import MailIcon from "@mui/icons-material/Mail";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useAuth } from "../../../contexts/AuthContext";
import { getSupplierStats } from "../../../api/userService";
import PropTypes from "prop-types";

/**
 * SupplierDetailModal component for displaying detailed supplier information
 * @param {Object} supplier - Supplier user object
 * @param {boolean} open - Whether modal is open
 * @param {Function} onClose - Callback when modal is closed
 * @param {Function} onQuickInvite - Callback when quick invite is clicked
 */
export const SupplierDetailModal = ({
    supplier,
    open,
    onClose,
    onQuickInvite,
}) => {
    const theme = useTheme();
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);

    // Extract all available fields - use safe defaults if supplier is null
    const companyName =
        supplier?.companyName || supplier?.name || "Ukjent navn";
    const email = supplier?.email || "";
    const orgNumber = supplier?.orgNumber || "";
    const city = supplier?.city || "";
    const postCode = supplier?.postCode || "";
    const address = supplier?.address || "";
    const fullAddress = supplier?.fullAddress || "";
    const country = supplier?.country || "";
    const postalAddress = supplier?.postalAddress || "";
    const postalPostCode = supplier?.postalPostCode || "";
    const postalCity = supplier?.postalCity || "";
    const postalFullAddress = supplier?.postalFullAddress || "";
    const companyFormCode = supplier?.companyFormCode || "";
    const companyFormDescription = supplier?.companyFormDescription || "";
    const industryCodes = supplier?.industryCodes || [];
    const underLiquidation = supplier?.underLiquidation || false;
    const underBankruptcy = supplier?.underBankruptcy || false;
    const registrationDate = supplier?.registrationDate || null;
    const registrationAuthority = supplier?.registrationAuthority || null;
    const status = supplier?.status || "";
    const createdAt = supplier?.createdAt || null;
    const bio = supplier?.bio || "";

    // Check if postal address exists and is different from business address
    const hasBusinessAddress = fullAddress || address || city;
    const hasPostalAddress = postalFullAddress || (postalAddress && postalCity);
    const hasDifferentPostalAddress =
        hasPostalAddress &&
        postalFullAddress !== fullAddress &&
        (postalAddress !== address || postalCity !== city);

    // Load supplier statistics if user is a sender
    useEffect(() => {
        const loadStats = async () => {
            if (!supplier?.id || !user || user.role !== "sender" || !open) {
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
    }, [supplier?.id, user?.id, user?.role, supplier?.email, open]);

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

    // Don't render if supplier is null
    if (!supplier) {
        return null;
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    backgroundColor: "#ffffff", // Ensure solid white background for readability
                },
            }}
        >
            <DialogTitle>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                        }}
                    >
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: 1.5,
                                backgroundColor: alpha(
                                    theme.palette.primary.main,
                                    0.1
                                ),
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <BusinessIcon
                                sx={{
                                    color: "primary.main",
                                    fontSize: 32,
                                }}
                            />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                {companyName}
                            </Typography>
                            {orgNumber && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Org.nr: {orgNumber}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                {/* Status Warnings */}
                {(underLiquidation || underBankruptcy) && (
                    <Alert
                        severity="warning"
                        icon={<WarningIcon />}
                        sx={{ mb: 3 }}
                    >
                        {underBankruptcy
                            ? "Denne bedriften er under konkurs (tvangsavvikling eller tvangsoppløsning)"
                            : "Denne bedriften er under likvidasjon (under avvikling)"}
                    </Alert>
                )}

                {/* Statistics Section - Only show if user is sender and stats are available */}
                {user?.role === "sender" && stats && stats.hasHistory && (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            mb: 3,
                            backgroundColor: alpha(
                                theme.palette.primary.main,
                                0.05
                            ),
                            border: 1,
                            borderColor: alpha(theme.palette.primary.main, 0.1),
                            borderRadius: 2,
                        }}
                    >
                        <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ mb: 2, fontWeight: 600 }}
                        >
                            Interaksjonshistorikk
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                >
                                    <MailIcon
                                        sx={{
                                            fontSize: 20,
                                            color: "primary.main",
                                        }}
                                    />
                                    <Box>
                                        <Typography
                                            variant="h6"
                                            sx={{ fontWeight: 600 }}
                                        >
                                            {stats.invitations}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Invitasjoner
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                >
                                    <GavelIcon
                                        sx={{
                                            fontSize: 20,
                                            color: "primary.main",
                                        }}
                                    />
                                    <Box>
                                        <Typography
                                            variant="h6"
                                            sx={{ fontWeight: 600 }}
                                        >
                                            {stats.bids}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Innsendte tilbud
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                >
                                    <AssignmentIcon
                                        sx={{
                                            fontSize: 20,
                                            color: "success.main",
                                        }}
                                    />
                                    <Box>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                color: "success.main",
                                            }}
                                        >
                                            {stats.contracts}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Fullførte kontrakter
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            {stats.lastInteraction && (
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 1 }} />
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
                                            }}
                                        />
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Siste interaksjon:{" "}
                                            {formatDate(stats.lastInteraction)}
                                        </Typography>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </Paper>
                )}

                <Grid container spacing={3}>
                    {/* Contact Information */}
                    <Grid item xs={12} md={6}>
                        <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ mb: 1.5, fontWeight: 600 }}
                        >
                            Kontaktinformasjon
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1.5,
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
                                            fontSize: 20,
                                            color: "text.secondary",
                                        }}
                                    />
                                    <Typography variant="body2">
                                        {email}
                                    </Typography>
                                </Box>
                            )}
                            {hasBusinessAddress && (
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: 1,
                                    }}
                                >
                                    <LocationOnIcon
                                        sx={{
                                            fontSize: 20,
                                            color: "text.secondary",
                                            mt: 0.25,
                                        }}
                                    />
                                    <Box>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Forretningsadresse
                                        </Typography>
                                        <Typography variant="body2">
                                            {fullAddress ||
                                                (address && city
                                                    ? `${address}, ${postCode} ${city}`
                                                    : city || address)}
                                        </Typography>
                                        {country && country !== "Norge" && (
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {country}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            )}
                            {hasDifferentPostalAddress && (
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: 1,
                                    }}
                                >
                                    <PublicIcon
                                        sx={{
                                            fontSize: 20,
                                            color: "text.secondary",
                                            mt: 0.25,
                                        }}
                                    />
                                    <Box>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Postadresse
                                        </Typography>
                                        <Typography variant="body2">
                                            {postalFullAddress ||
                                                (postalAddress && postalCity
                                                    ? `${postalAddress}, ${postalPostCode} ${postalCity}`
                                                    : postalCity ||
                                                      postalAddress)}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Grid>

                    {/* Company Information */}
                    <Grid item xs={12} md={6}>
                        <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ mb: 1.5, fontWeight: 600 }}
                        >
                            Bedriftsinformasjon
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1.5,
                            }}
                        >
                            {companyFormDescription && (
                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Organisasjonsform
                                    </Typography>
                                    <Typography variant="body2">
                                        {companyFormDescription}
                                        {companyFormCode && (
                                            <Typography
                                                component="span"
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ ml: 0.5 }}
                                            >
                                                ({companyFormCode})
                                            </Typography>
                                        )}
                                    </Typography>
                                </Box>
                            )}
                            {status && (
                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Status
                                    </Typography>
                                    <Typography variant="body2">
                                        {status}
                                    </Typography>
                                </Box>
                            )}
                            {registrationDate && (
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
                                        }}
                                    />
                                    <Box>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Stiftelsesdato
                                        </Typography>
                                        <Typography variant="body2">
                                            {formatDate(registrationDate)}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                            {registrationAuthority && (
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                >
                                    <AccountBalanceIcon
                                        sx={{
                                            fontSize: 18,
                                            color: "text.secondary",
                                        }}
                                    />
                                    <Box>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Registrert i Enhetsregisteret
                                        </Typography>
                                        <Typography variant="body2">
                                            {formatDate(registrationAuthority)}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                            {createdAt && (
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
                                        }}
                                    />
                                    <Box>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Bruker registrert
                                        </Typography>
                                        <Typography variant="body2">
                                            {formatDate(createdAt)}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Grid>

                    {/* Industry Codes */}
                    {industryCodes.length > 0 && (
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <Typography
                                variant="subtitle2"
                                color="text.secondary"
                                sx={{ mb: 1.5, fontWeight: 600 }}
                            >
                                Næringskoder
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 1,
                                }}
                            >
                                {industryCodes.map((code, index) => (
                                    <Chip
                                        key={index}
                                        label={
                                            typeof code === "object"
                                                ? `${code.code || ""} - ${
                                                      code.description || ""
                                                  }`
                                                : code
                                        }
                                        icon={<CategoryIcon />}
                                        sx={{
                                            backgroundColor: alpha(
                                                theme.palette.primary.main,
                                                0.1
                                            ),
                                            color: "primary.main",
                                        }}
                                    />
                                ))}
                            </Box>
                        </Grid>
                    )}

                    {/* Bio Section */}
                    {bio && (
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <Typography
                                variant="subtitle2"
                                color="text.secondary"
                                sx={{ mb: 1.5, fontWeight: 600 }}
                            >
                                Om oss
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    whiteSpace: "pre-wrap",
                                    lineHeight: 1.6,
                                }}
                            >
                                {bio}
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={onClose} sx={{ textTransform: "none" }}>
                    Lukk
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PersonAddIcon />}
                    onClick={() => {
                        onQuickInvite(supplier);
                        onClose();
                    }}
                    sx={{ textTransform: "none" }}
                >
                    Inviter til Anskaffelse
                </Button>
            </DialogActions>
        </Dialog>
    );
};

SupplierDetailModal.propTypes = {
    supplier: PropTypes.shape({
        id: PropTypes.string,
        companyName: PropTypes.string,
        name: PropTypes.string,
        email: PropTypes.string,
        orgNumber: PropTypes.string,
        city: PropTypes.string,
        postCode: PropTypes.string,
        address: PropTypes.string,
        fullAddress: PropTypes.string,
        country: PropTypes.string,
        postalAddress: PropTypes.string,
        postalPostCode: PropTypes.string,
        postalCity: PropTypes.string,
        postalFullAddress: PropTypes.string,
        companyFormCode: PropTypes.string,
        companyFormDescription: PropTypes.string,
        industryCodes: PropTypes.array,
        underLiquidation: PropTypes.bool,
        underBankruptcy: PropTypes.bool,
        registrationDate: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.instanceOf(Date),
        ]),
        registrationAuthority: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.instanceOf(Date),
        ]),
        status: PropTypes.string,
        createdAt: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.instanceOf(Date),
        ]),
        bio: PropTypes.string,
    }),
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onQuickInvite: PropTypes.func.isRequired,
};
