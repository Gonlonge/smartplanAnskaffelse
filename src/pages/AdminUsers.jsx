import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    Container,
    useTheme,
    useMediaQuery,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Snackbar,
    CircularProgress,
    Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useAuth } from "../contexts/AuthContext";
import { getAllAdminUsers } from "../api/userService";
import { createAdminUser, updateAdminUserEmail, createSupplierAdminUser } from "../api/authService";

const AdminUsers = () => {
    const { user, isAdmin } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [adminUsers, setAdminUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);

    // Form state
    const [formEmail, setFormEmail] = useState("");
    const [formPassword, setFormPassword] = useState("");
    const [formName, setFormName] = useState("");
    const [formRole, setFormRole] = useState("sender");
    const [submitting, setSubmitting] = useState(false);

    // Load admin users
    useEffect(() => {
        if (isAdmin) {
            loadAdminUsers();
        }
    }, [isAdmin]);

    const loadAdminUsers = async () => {
        setLoading(true);
        try {
            const users = await getAllAdminUsers();
            setAdminUsers(users);
        } catch (error) {
            console.error("Error loading admin users:", error);
            setErrorMessage("Kunne ikke laste administratorer. Prøv igjen.");
            setShowErrorSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await loadAdminUsers();
            setSuccessMessage("Administratorer oppdatert");
            setShowSuccessSnackbar(true);
        } catch (error) {
            setErrorMessage("Kunne ikke oppdatere administratorer.");
            setShowErrorSnackbar(true);
        } finally {
            setRefreshing(false);
        }
    };

    const handleCreateClick = () => {
        setFormEmail("");
        setFormPassword("");
        setFormName("");
        setFormRole("sender");
        setCreateDialogOpen(true);
    };

    const handleEditClick = (adminUser) => {
        setSelectedUser(adminUser);
        setFormEmail(adminUser.email || "");
        setEditDialogOpen(true);
    };

    const handleCreate = async () => {
        if (!formEmail || !formPassword || !formName) {
            setErrorMessage("Alle felt må fylles ut");
            setShowErrorSnackbar(true);
            return;
        }

        setSubmitting(true);
        try {
            let result;
            if (formRole === "receiver") {
                result = await createSupplierAdminUser(formEmail, formPassword, formName);
            } else {
                result = await createAdminUser(formEmail, formPassword, formName, formRole);
            }

            if (result.success) {
                setCreateDialogOpen(false);
                setFormEmail("");
                setFormPassword("");
                setFormName("");
                setFormRole("sender");
                await loadAdminUsers();
                setSuccessMessage("Administrator opprettet");
                setShowSuccessSnackbar(true);
            } else {
                setErrorMessage(result.error || "Kunne ikke opprette administrator");
                setShowErrorSnackbar(true);
            }
        } catch (error) {
            setErrorMessage(error.message || "En feil oppstod");
            setShowErrorSnackbar(true);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateEmail = async () => {
        if (!selectedUser || !formEmail) {
            setErrorMessage("E-postadresse er påkrevd");
            setShowErrorSnackbar(true);
            return;
        }

        setSubmitting(true);
        try {
            const result = await updateAdminUserEmail(selectedUser.id, formEmail);
            if (result.success) {
                setEditDialogOpen(false);
                setSelectedUser(null);
                setFormEmail("");
                await loadAdminUsers();
                setSuccessMessage("E-postadresse oppdatert");
                setShowSuccessSnackbar(true);
            } else {
                setErrorMessage(result.error || "Kunne ikke oppdatere e-postadresse");
                setShowErrorSnackbar(true);
            }
        } catch (error) {
            setErrorMessage(error.message || "En feil oppstod");
            setShowErrorSnackbar(true);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isAdmin) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">Du har ikke tilgang til denne siden.</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                        flexWrap: "wrap",
                        gap: 2,
                    }}
                >
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                        Administratorer
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="Oppdater">
                            <IconButton
                                onClick={handleRefresh}
                                disabled={refreshing}
                                color="primary"
                            >
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleCreateClick}
                        >
                            Opprett administrator
                        </Button>
                    </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                    Administrer alle systemadministratorer (anskaffelse og leverandør med isAdmin: true)
                </Typography>
            </Box>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: "divider" }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "grey.50" }}>
                                <TableCell sx={{ fontWeight: 600 }}>E-post</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Navn</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Rolle</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>Handlinger</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {adminUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">
                                            Ingen administratorer funnet
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                adminUsers.map((adminUser) => (
                                    <TableRow key={adminUser.id || adminUser.email} hover>
                                        <TableCell>{adminUser.email}</TableCell>
                                        <TableCell>{adminUser.companyName || adminUser.name}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={adminUser.role === "sender" ? "Anskaffelse" : "Leverandør"}
                                                size="small"
                                                color={adminUser.role === "sender" ? "primary" : "secondary"}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={adminUser.role === "sender" ? "Anskaffelse Admin" : "Leverandør Admin"}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Rediger e-post">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEditClick(adminUser)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Create Admin Dialog */}
            <Dialog
                open={createDialogOpen}
                onClose={() => !submitting && setCreateDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Opprett administrator</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                        <TextField
                            label="E-postadresse"
                            type="email"
                            fullWidth
                            value={formEmail}
                            onChange={(e) => setFormEmail(e.target.value)}
                            disabled={submitting}
                            required
                        />
                        <TextField
                            label="Passord"
                            type="password"
                            fullWidth
                            value={formPassword}
                            onChange={(e) => setFormPassword(e.target.value)}
                            disabled={submitting}
                            required
                            helperText="Minimum 6 tegn"
                        />
                        <TextField
                            label="Navn / Firmanavn"
                            fullWidth
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            disabled={submitting}
                            required
                        />
                        <FormControl fullWidth>
                            <InputLabel>Rolle</InputLabel>
                            <Select
                                value={formRole}
                                label="Rolle"
                                onChange={(e) => setFormRole(e.target.value)}
                                disabled={submitting}
                            >
                                <MenuItem value="sender">Anskaffelse (Anskaffelse Admin)</MenuItem>
                                <MenuItem value="receiver">Leverandør (Leverandør Admin)</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setCreateDialogOpen(false)}
                        disabled={submitting}
                    >
                        Avbryt
                    </Button>
                    <Button
                        onClick={handleCreate}
                        variant="contained"
                        disabled={submitting || !formEmail || !formPassword || !formName}
                        startIcon={submitting ? <CircularProgress size={16} /> : null}
                    >
                        {submitting ? "Oppretter..." : "Opprett"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Email Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={() => !submitting && setEditDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Rediger e-postadresse</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Dette oppdaterer kun e-postadressen i Firestore. For å oppdatere Firebase Auth e-post, må brukeren logge inn og oppdatere det selv.
                        </Alert>
                        <TextField
                            label="E-postadresse"
                            type="email"
                            fullWidth
                            value={formEmail}
                            onChange={(e) => setFormEmail(e.target.value)}
                            disabled={submitting}
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setEditDialogOpen(false)}
                        disabled={submitting}
                    >
                        Avbryt
                    </Button>
                    <Button
                        onClick={handleUpdateEmail}
                        variant="contained"
                        disabled={submitting || !formEmail}
                        startIcon={submitting ? <CircularProgress size={16} /> : null}
                    >
                        {submitting ? "Oppdaterer..." : "Oppdater"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success Snackbar */}
            <Snackbar
                open={showSuccessSnackbar}
                autoHideDuration={6000}
                onClose={() => setShowSuccessSnackbar(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setShowSuccessSnackbar(false)}
                    severity="success"
                    sx={{ width: "100%" }}
                >
                    {successMessage}
                </Alert>
            </Snackbar>

            {/* Error Snackbar */}
            <Snackbar
                open={showErrorSnackbar}
                autoHideDuration={6000}
                onClose={() => setShowErrorSnackbar(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setShowErrorSnackbar(false)}
                    severity="error"
                    sx={{ width: "100%" }}
                >
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default AdminUsers;

