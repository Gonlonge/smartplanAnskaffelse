import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    CardActionArea,
    Skeleton,
    Container,
    useTheme,
    alpha,
    IconButton,
    Tooltip,
    Chip,
    Button,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import BusinessIcon from "@mui/icons-material/Business";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useAuth } from "../contexts/AuthContext";
import { getSendersForSupplier } from "../api/userService";
import { DateDisplay } from "../components/common";

const Contacts = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const [senders, setSenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const loadSenders = async () => {
            setLoading(true);
            try {
                const sendersData = user?.id
                    ? await getSendersForSupplier(user.id, user.email)
                    : [];
                setSenders(sendersData);
            } catch (error) {
                console.error("Error loading senders:", error);
                setSenders([]);
            } finally {
                setLoading(false);
            }
        };

        loadSenders();
    }, [user?.id, user?.email]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const sendersData = user?.id
                ? await getSendersForSupplier(user.id, user.email)
                : [];
            setSenders(sendersData);
        } catch (error) {
            console.error("Error refreshing senders:", error);
        } finally {
            setRefreshing(false);
        }
    };

    const formatCompanyInfo = (companyName, orgNumber) => {
        const name = companyName || "Ukjent firma";
        if (orgNumber) {
            return `${name} (Org.nr: ${orgNumber})`;
        }
        return name;
    };

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 4 } }}>
            {/* Header */}
            <Box
                sx={{
                    mb: 4,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: 2,
                }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontSize: { xs: "1.75rem", sm: "2rem" },
                            fontWeight: 600,
                            mb: 1,
                        }}
                    >
                        Mine kontakter
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            fontSize: { xs: "1rem", sm: "1rem" },
                        }}
                    >
                        Oppdragsgivere du har hatt interaksjon med
                    </Typography>
                </Box>
                <Tooltip title="Oppdater liste">
                    <IconButton
                        onClick={handleRefresh}
                        disabled={refreshing || loading}
                        sx={{
                            backgroundColor: "background.paper",
                            border: 1,
                            borderColor: "divider",
                            minHeight: { xs: 44, md: 36 },
                            minWidth: { xs: 44, md: 36 },
                            "&:hover": {
                                backgroundColor: alpha(
                                    theme.palette.primary.main,
                                    0.08
                                ),
                            },
                        }}
                    >
                        <RefreshIcon
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
                </Tooltip>
            </Box>

            {/* Results Count */}
            {!loading && (
                <Box sx={{ mb: 3 }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            fontSize: { xs: "1rem", sm: "1rem" },
                        }}
                    >
                        {senders.length === 0
                            ? "Ingen kontakter ennå"
                            : senders.length === 1
                            ? "1 kontakt funnet"
                            : `${senders.length} kontakter funnet`}
                    </Typography>
                </Box>
            )}

            {/* Senders Grid */}
            {loading ? (
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    border: 1,
                                    borderColor: "divider",
                                    borderRadius: 2,
                                }}
                            >
                                <Skeleton
                                    variant="text"
                                    width="60%"
                                    height={32}
                                    sx={{ mb: 2 }}
                                />
                                <Skeleton
                                    variant="text"
                                    width="100%"
                                    height={20}
                                    sx={{ mb: 1 }}
                                />
                                <Skeleton
                                    variant="text"
                                    width="80%"
                                    height={20}
                                />
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            ) : senders.length === 0 ? (
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 4, sm: 6 },
                        textAlign: "center",
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 2,
                    }}
                >
                    <BusinessIcon
                        sx={{
                            fontSize: 64,
                            color: "text.secondary",
                            mb: 2,
                        }}
                    />
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        gutterBottom
                    >
                        Ingen kontakter ennå
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                    >
                        Kontakter vil vises her når du mottar invitasjoner eller
                        leverer tilbud
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                    {senders.map((sender) => {
                        const hasContracts = sender.interactions?.contracts > 0;
                        const contractTenderIds =
                            sender.interactions?.contractTenderIds || [];
                        const firstContractTenderId = contractTenderIds[0];

                        const handleCardClick = () => {
                            if (hasContracts && firstContractTenderId) {
                                navigate(
                                    `/tenders/${firstContractTenderId}/contract`
                                );
                            }
                        };

                        return (
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                lg={3}
                                key={sender.id}
                            >
                                <Card
                                    elevation={0}
                                    sx={{
                                        height: "100%",
                                        border: 1,
                                        borderColor: "divider",
                                        borderRadius: 2,
                                        transition: "all 0.2s ease",
                                        ...(hasContracts && {
                                            cursor: "pointer",
                                            "&:hover": {
                                                borderColor: alpha(
                                                    theme.palette.primary.main,
                                                    0.5
                                                ),
                                                boxShadow: 3,
                                                transform: "translateY(-2px)",
                                            },
                                        }),
                                        ...(!hasContracts && {
                                            "&:hover": {
                                                borderColor: alpha(
                                                    theme.palette.primary.main,
                                                    0.3
                                                ),
                                                boxShadow: 2,
                                            },
                                        }),
                                    }}
                                    onClick={
                                        hasContracts
                                            ? handleCardClick
                                            : undefined
                                    }
                                >
                                    <CardContent>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                gap: 2,
                                                mb: 2,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: 1.5,
                                                    backgroundColor: alpha(
                                                        theme.palette.primary
                                                            .main,
                                                        0.1
                                                    ),
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <BusinessIcon
                                                    sx={{
                                                        color: "primary.main",
                                                        fontSize: 24,
                                                    }}
                                                />
                                            </Box>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 600,
                                                        mb: 0.5,
                                                        wordBreak: "break-word",
                                                    }}
                                                >
                                                    {formatCompanyInfo(
                                                        sender.companyName,
                                                        sender.orgNumber
                                                    )}
                                                </Typography>
                                                {sender.email && (
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 0.5,
                                                            mt: 0.5,
                                                        }}
                                                    >
                                                        <EmailIcon
                                                            sx={{
                                                                fontSize: 14,
                                                                color: "text.secondary",
                                                            }}
                                                        />
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            sx={{
                                                                overflow:
                                                                    "hidden",
                                                                textOverflow:
                                                                    "ellipsis",
                                                                whiteSpace:
                                                                    "nowrap",
                                                            }}
                                                        >
                                                            {sender.email}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Interaction Stats */}
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 1.5,
                                                mt: 2,
                                                pt: 2,
                                                borderTop: 1,
                                                borderColor: "divider",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent:
                                                        "space-between",
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1,
                                                    }}
                                                >
                                                    <DescriptionIcon
                                                        sx={{
                                                            fontSize: 18,
                                                            color: "text.secondary",
                                                        }}
                                                    />
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        Invitasjoner
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    label={
                                                        sender.interactions
                                                            ?.invitations || 0
                                                    }
                                                    size="small"
                                                    sx={{ minWidth: 40 }}
                                                />
                                            </Box>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent:
                                                        "space-between",
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1,
                                                    }}
                                                >
                                                    <PersonIcon
                                                        sx={{
                                                            fontSize: 18,
                                                            color: "text.secondary",
                                                        }}
                                                    />
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        Leverte tilbud
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    label={
                                                        sender.interactions
                                                            ?.bids || 0
                                                    }
                                                    size="small"
                                                    sx={{ minWidth: 40 }}
                                                />
                                            </Box>
                                            {sender.interactions?.contracts >
                                                0 && (
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "space-between",
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <CheckCircleIcon
                                                            sx={{
                                                                fontSize: 18,
                                                                color: "success.main",
                                                            }}
                                                        />
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >
                                                            Kontrakter
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        label={
                                                            sender.interactions
                                                                ?.contracts || 0
                                                        }
                                                        size="small"
                                                        color="success"
                                                        sx={{ minWidth: 40 }}
                                                    />
                                                </Box>
                                            )}
                                            {sender.interactions
                                                ?.lastInteraction && (
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Siste interaksjon:
                                                    </Typography>
                                                    <DateDisplay
                                                        date={
                                                            sender.interactions
                                                                .lastInteraction
                                                        }
                                                        variant="caption"
                                                    />
                                                </Box>
                                            )}
                                        </Box>
                                        {hasContracts &&
                                            firstContractTenderId && (
                                                <Box
                                                    sx={{
                                                        mt: 2,
                                                        pt: 2,
                                                        borderTop: 1,
                                                        borderColor: "divider",
                                                    }}
                                                >
                                                    <Button
                                                        fullWidth
                                                        variant="outlined"
                                                        color="primary"
                                                        startIcon={
                                                            <VisibilityIcon />
                                                        }
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(
                                                                `/tenders/${firstContractTenderId}/contract`
                                                            );
                                                        }}
                                                        sx={{
                                                            textTransform:
                                                                "none",
                                                        }}
                                                    >
                                                        Se kontrakt
                                                    </Button>
                                                </Box>
                                            )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Container>
    );
};

export default Contacts;
