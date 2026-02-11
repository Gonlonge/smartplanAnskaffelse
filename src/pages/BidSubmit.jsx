import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Paper,
    Button,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Divider,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { getTenderById, submitBid } from "../api/tenderService";
import { PRICE_STRUCTURE_TYPES } from "../constants";
import { DocumentUpload } from "../components/features";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import { DateDisplay } from "../components/common";

/**
 * BidSubmit Page
 * Allows suppliers to submit bids for tenders they're invited to
 */
const BidSubmit = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [tender, setTender] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [bidData, setBidData] = useState({
        price: "",
        priceStructure: "fastpris",
        hourlyRate: "",
        estimatedHours: "",
        notes: "",
    });

    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        const loadTender = async () => {
            const foundTender = await getTenderById(id);
            setTender(foundTender);

            // Check if user is invited (case-insensitive email matching)
            if (foundTender) {
                const normalizedUserEmail = user?.email?.toLowerCase().trim();
                const isInvited = foundTender.invitedSuppliers?.some(
                    (inv) =>
                        inv.supplierId === user?.id ||
                        (normalizedUserEmail &&
                            inv.email?.toLowerCase().trim() ===
                                normalizedUserEmail)
                );

                if (!isInvited && user?.role !== "sender") {
                    setError("Du er ikke invitert til dette Anskaffelse");
                }
            }
        };
        loadTender();
    }, [id, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBidData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        // Validation
        if (!bidData.price || parseFloat(bidData.price) <= 0) {
            setError("Pris er påkrevd og må være større enn 0");
            return;
        }

        if (bidData.priceStructure === "timepris") {
            if (!bidData.hourlyRate || parseFloat(bidData.hourlyRate) <= 0) {
                setError("Timepris er påkrevd når prisstruktur er timepris");
                return;
            }
            if (
                !bidData.estimatedHours ||
                parseFloat(bidData.estimatedHours) <= 0
            ) {
                setError("Estimert antall timer er påkrevd");
                return;
            }
        }

        // Check deadline
        if (new Date(tender.deadline) < new Date()) {
            setError("Fristen for å sende inn tilbud har gått ut");
            return;
        }

        setLoading(true);

        // Submit bid using Firebase service
        const result = await submitBid(
            tender.id,
            {
                price: parseFloat(bidData.price),
                priceStructure: bidData.priceStructure,
                hourlyRate:
                    bidData.priceStructure === "timepris"
                        ? parseFloat(bidData.hourlyRate)
                        : null,
                estimatedHours:
                    bidData.priceStructure === "timepris"
                        ? parseFloat(bidData.estimatedHours)
                        : null,
                files: documents,
                notes: bidData.notes.trim(),
            },
            user
        );

        setLoading(false);

        if (!result.success) {
            setError(result.error || "Kunne ikke sende inn tilbud");
            return;
        }

        setSuccess(true);

        // Navigate back to tender details
        setTimeout(() => {
            navigate(`/tenders/${tender.id}`);
        }, 2000);
    };

    if (!tender) {
        return (
            <Box>
                <Typography variant="h5" color="error">
                    Anskaffelse ikke funnet
                </Typography>
                <Button
                    onClick={() => navigate("/tenders")}
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

    return (
        <Box>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(`/tenders/${id}`)}
                sx={{ mb: 3 }}
            >
                Tilbake
            </Button>

            <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                    fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
                    mb: 2,
                }}
            >
                Send inn tilbud
            </Typography>

            <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    {tender.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    {tender.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                        <strong>Frist:</strong>{" "}
                        <DateDisplay date={tender.deadline} />
                    </Typography>
                    <Typography variant="body2">
                        <strong>Kontraktstandard:</strong>{" "}
                        {tender.contractStandard}
                    </Typography>
                </Box>
            </Paper>

            <Paper sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        Tilbud sendt inn! Du blir omdirigert...
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
                        {/* Price Structure */}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel id="price-structure-label">
                                    Prisstruktur
                                </InputLabel>
                                <Select
                                    labelId="price-structure-label"
                                    id="priceStructure"
                                    name="priceStructure"
                                    value={bidData.priceStructure}
                                    onChange={handleChange}
                                    label="Prisstruktur"
                                    disabled={loading}
                                >
                                    {PRICE_STRUCTURE_TYPES.map((type) => (
                                        <MenuItem
                                            key={type.value}
                                            value={type.value}
                                        >
                                            {type.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Price */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                id="price"
                                name="price"
                                label="Totalpris (NOK)"
                                type="number"
                                value={bidData.price}
                                onChange={handleChange}
                                disabled={loading}
                                inputProps={{
                                    min: 0,
                                    step: "any",
                                }}
                                helperText={
                                    bidData.priceStructure === "fastpris"
                                        ? "Fast totalpris"
                                        : bidData.priceStructure === "timepris"
                                        ? "Beregnet totalpris"
                                        : "Estimert pris"
                                }
                            />
                        </Grid>

                        {/* Hourly Rate (for timepris) */}
                        {bidData.priceStructure === "timepris" && (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        required
                                        id="hourlyRate"
                                        name="hourlyRate"
                                        label="Timepris (NOK)"
                                        type="number"
                                        value={bidData.hourlyRate}
                                        onChange={handleChange}
                                        disabled={loading}
                                        inputProps={{
                                            min: 0,
                                            step: "any",
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        required
                                        id="estimatedHours"
                                        name="estimatedHours"
                                        label="Estimert antall timer"
                                        type="number"
                                        value={bidData.estimatedHours}
                                        onChange={handleChange}
                                        disabled={loading}
                                        inputProps={{
                                            min: 0,
                                            step: "any",
                                        }}
                                    />
                                </Grid>
                            </>
                        )}

                        {/* Notes */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="notes"
                                name="notes"
                                label="Notater / Kommentarer"
                                value={bidData.notes}
                                onChange={handleChange}
                                disabled={loading}
                                multiline
                                rows={4}
                                helperText="Legg til eventuelle notater eller kommentarer til tilbudet"
                            />
                        </Grid>

                        {/* Document Upload */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <DocumentUpload
                                documents={documents}
                                onDocumentsChange={setDocuments}
                                disabled={loading}
                            />
                        </Grid>

                        {/* Submit Button */}
                        <Grid item xs={12}>
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 2,
                                    justifyContent: {
                                        xs: "stretch",
                                        sm: "flex-end",
                                    },
                                    flexDirection: {
                                        xs: "column",
                                        sm: "row",
                                    },
                                }}
                            >
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate(`/tenders/${id}`)}
                                    disabled={loading}
                                    fullWidth={isMobile}
                                    sx={{
                                        fontSize: {
                                            xs: "1rem",
                                            sm: "0.875rem",
                                        },
                                    }}
                                >
                                    Avbryt
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    startIcon={<SendIcon />}
                                    disabled={loading}
                                    fullWidth={isMobile}
                                    aria-busy={loading}
                                    sx={{
                                        fontSize: {
                                            xs: "1rem",
                                            sm: "0.875rem",
                                        },
                                    }}
                                >
                                    {loading ? "Sender..." : "Send inn tilbud"}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Box>
    );
};

export default BidSubmit;
