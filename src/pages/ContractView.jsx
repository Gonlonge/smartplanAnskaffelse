import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Paper,
    Button,
    Grid,
    Divider,
    List,
    ListItem,
    ListItemText,
    Chip,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    useTheme,
    useMediaQuery,
    alpha,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import {
    getContractByTenderId,
    signContract,
    addContractChange,
} from "../api/contractService";
import { DateDisplay } from "../components/common";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DescriptionIcon from "@mui/icons-material/Description";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

/**
 * ContractView Page
 * Displays contract details, allows signing, and shows change log
 */
const ContractView = () => {
    const { id } = useParams(); // tenderId
    const { user } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [signing, setSigning] = useState(false);
    const [showChangeDialog, setShowChangeDialog] = useState(false);
    const [changeData, setChangeData] = useState({
        field: "",
        oldValue: "",
        newValue: "",
        reason: "",
    });
    const [error, setError] = useState("");

    useEffect(() => {
        loadContract();
    }, [id]);

    const loadContract = async () => {
        setLoading(true);
        try {
            const foundContract = await getContractByTenderId(id);
            setContract(foundContract);
        } catch (error) {
            console.error("Error loading contract:", error);
            setError("Kunne ikke laste kontrakt");
            setContract(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSign = async () => {
        if (
            !confirm(
                "Er du sikker på at du vil signere denne kontrakten? Dette er juridisk bindende."
            )
        ) {
            return;
        }

        setSigning(true);
        setError("");

        const result = await signContract(contract.id, user);
        setSigning(false);

        if (result.success) {
            loadContract();
        } else {
            setError(result.error || "Kunne ikke signere kontrakt");
        }
    };

    const handleAddChange = async () => {
        if (!changeData.field || !changeData.newValue) {
            setError("Felt og ny verdi er påkrevd");
            return;
        }

        setError("");
        const result = await addContractChange(contract.id, changeData, user);

        if (result.success) {
            setShowChangeDialog(false);
            setChangeData({ field: "", oldValue: "", newValue: "", reason: "" });
            loadContract();
        } else {
            setError(result.error || "Kunne ikke legge til endring");
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("no-NO", {
            style: "currency",
            currency: "NOK",
        }).format(price);
    };

    if (loading) {
        return (
            <Box>
                <Typography variant="body1">Laster...</Typography>
            </Box>
        );
    }

    if (!contract) {
        return (
            <Box>
                    <Typography variant="h5" color="error">
                        Kontrakt ikke funnet
                    </Typography>
                    <Button 
                        onClick={() => navigate(`/tenders/${id}`)} 
                        sx={{ 
                            mt: 2,
                            fontSize: {
                                xs: "1rem",
                                sm: "0.875rem",
                            },
                        }}
                    >
                        Tilbake
                    </Button>
                </Box>
        );
    }

    // Access control: Only sender (customer) or awarded supplier can view contract
    const isSender = user?.role === "sender";
    const isSupplier = contract.supplier?.companyId === user?.companyId;
    const isCustomer = contract.customer?.companyId === user?.companyId;
    
    if (!isCustomer && !isSupplier) {
        return (
            <Box sx={{ textAlign: "center", py: 8 }}>
                <Box
                    sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        backgroundColor: alpha(
                            theme.palette.error.main,
                            0.1
                        ),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 3,
                    }}
                >
                    <DescriptionIcon
                        sx={{
                            fontSize: 40,
                            color: "error.main",
                        }}
                    />
                </Box>
                <Typography
                    variant="h5"
                    color="error"
                    sx={{ mb: 1, fontWeight: 600 }}
                >
                    Ingen tilgang
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                >
                    Du har ikke tilgang til denne kontrakten.
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => navigate("/dashboard")}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                >
                    Tilbake til dashboard
                </Button>
            </Box>
        );
    }

    const canSign =
        contract.status === "draft" || contract.status === "pending_signature";
    const isSigned = contract.status === "signed";

    return (
        <Box>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(`/tenders/${id}`)}
                    sx={{ mb: 3 }}
                >
                    Tilbake
                </Button>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 4,
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 2,
                    }}
                >
                    <Box>
                        <Typography
                            variant="h4"
                            component="h1"
                            gutterBottom
                            sx={{
                                fontSize: {
                                    xs: "1.75rem",
                                    sm: "2rem",
                                    md: "2.5rem",
                                },
                            }}
                        >
                            Kontrakt
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                            <Chip
                                label={contract.contractStandard}
                                color="primary"
                                size="small"
                            />
                            {isSigned && (
                                <Chip
                                    icon={<CheckCircleIcon />}
                                    label="Signert"
                                    color="success"
                                    size="small"
                                />
                            )}
                            {contract.status === "amended" && (
                                <Chip
                                    label={`Versjon ${contract.version}`}
                                    color="info"
                                    size="small"
                                />
                            )}
                        </Box>
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 2,
                                }}
                            >
                                <DescriptionIcon color="primary" />
                                <Typography variant="h6">
                                    Kontraktdetaljer
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                }}
                            >
                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Tittel
                                    </Typography>
                                    <Typography variant="body1">
                                        {contract.title}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Beskrivelse
                                    </Typography>
                                    <Typography variant="body1">
                                        {contract.description}
                                    </Typography>
                                </Box>

                                <Divider />

                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Kunde
                                    </Typography>
                                    <Typography variant="body1">
                                        {contract.customer?.companyName || "N/A"}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Leverandør
                                    </Typography>
                                    <Typography variant="body1">
                                        {contract.supplier?.companyName || "N/A"}
                                    </Typography>
                                </Box>

                                <Divider />

                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Totalpris
                                    </Typography>
                                    <Typography variant="h6" color="primary">
                                        {formatPrice(contract.price)}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Prisstruktur
                                    </Typography>
                                    <Typography variant="body1">
                                        {contract.priceStructure === "fastpris"
                                            ? "Fastpris"
                                            : contract.priceStructure ===
                                              "timepris"
                                            ? "Timepris"
                                            : "Estimat"}
                                    </Typography>
                                </Box>

                                {contract.priceStructure === "timepris" && (
                                    <>
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Timepris
                                            </Typography>
                                            <Typography variant="body1">
                                                {contract.hourlyRate
                                                    ? formatPrice(
                                                          contract.hourlyRate
                                                      )
                                                    : "N/A"}{" "}
                                                / time
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Estimert timer
                                            </Typography>
                                            <Typography variant="body1">
                                                {contract.estimatedHours || "N/A"}
                                            </Typography>
                                        </Box>
                                    </>
                                )}

                                <Divider />

                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Opprettet
                                    </Typography>
                                    <DateDisplay date={contract.createdAt} />
                                </Box>

                                {contract.signedAt && (
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Signert
                                        </Typography>
                                        <DateDisplay date={contract.signedAt} />
                                        {contract.signedBy && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mt: 0.5 }}
                                            >
                                                av {contract.signedBy.userName} (
                                                {contract.signedBy.companyName})
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </Box>
                        </Paper>

                        {/* Change Log */}
                        {contract.changes && contract.changes.length > 0 && (
                            <Paper sx={{ p: 3 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        mb: 2,
                                    }}
                                >
                                    <HistoryIcon color="primary" />
                                    <Typography variant="h6">
                                        Endringslogg
                                    </Typography>
                                </Box>
                                <List>
                                    {contract.changes.map((change, index) => (
                                        <Box key={change.id}>
                                            <ListItem>
                                                <ListItemText
                                                    primary={
                                                        <Box>
                                                            <Typography
                                                                variant="subtitle2"
                                                            >
                                                                Versjon {change.version}
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                            >
                                                                {change.field}: "
                                                                {change.oldValue}" → "
                                                                {change.newValue}"
                                                            </Typography>
                                                            {change.reason && (
                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                    sx={{ mt: 0.5 }}
                                                                >
                                                                    Årsak:{" "}
                                                                    {change.reason}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Box sx={{ mt: 1 }}>
                                                            <DateDisplay
                                                                date={
                                                                    change.changedAt
                                                                }
                                                            />
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                Endret av:{" "}
                                                                {change.changedBy
                                                                    .userName}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                            {index <
                                                contract.changes.length - 1 && (
                                                <Divider />
                                            )}
                                        </Box>
                                    ))}
                                </List>
                            </Paper>
                        )}
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Handlinger
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                }}
                            >
                                {canSign && (isSupplier || isCustomer) && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        onClick={handleSign}
                                        disabled={signing}
                                    >
                                        {signing
                                            ? "Signerer..."
                                            : "Signer kontrakt"}
                                    </Button>
                                )}

                                {isSigned && (
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        onClick={() => setShowChangeDialog(true)}
                                    >
                                        Legg til endring
                                    </Button>
                                )}

                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={() =>
                                        window.print()
                                    }
                                >
                                    Skriv ut kontrakt
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Change Dialog */}
                <Dialog
                    open={showChangeDialog}
                    onClose={() => setShowChangeDialog(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Legg til endring</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                            <TextField
                                fullWidth
                                label="Felt"
                                value={changeData.field}
                                onChange={(e) =>
                                    setChangeData({
                                        ...changeData,
                                        field: e.target.value,
                                    })
                                }
                                required
                            />
                            <TextField
                                fullWidth
                                label="Gammel verdi"
                                value={changeData.oldValue}
                                onChange={(e) =>
                                    setChangeData({
                                        ...changeData,
                                        oldValue: e.target.value,
                                    })
                                }
                            />
                            <TextField
                                fullWidth
                                label="Ny verdi"
                                value={changeData.newValue}
                                onChange={(e) =>
                                    setChangeData({
                                        ...changeData,
                                        newValue: e.target.value,
                                    })
                                }
                                required
                            />
                            <TextField
                                fullWidth
                                label="Årsak til endring"
                                value={changeData.reason}
                                onChange={(e) =>
                                    setChangeData({
                                        ...changeData,
                                        reason: e.target.value,
                                    })
                                }
                                multiline
                                rows={3}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowChangeDialog(false)}>
                            Avbryt
                        </Button>
                        <Button
                            onClick={handleAddChange}
                            variant="contained"
                            color="primary"
                        >
                            Legg til
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
    );
};

export default ContractView;


