import {
    Box,
    Typography,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Grid,
    Chip,
    Divider,
    Alert,
} from "@mui/material";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { compareDocumentVersions } from "../../../services/documentVersioning";

/**
 * Document Version Comparison Component
 * Displays side-by-side comparison of two document versions
 */
export const DocumentVersionCompare = ({
    version1,
    version2,
    open,
    onClose,
}) => {
    if (!version1 || !version2) return null;

    const comparison = compareDocumentVersions(version1, version2);

    const formatDate = (date) => {
        if (!date) return "Ukjent dato";
        try {
            const dateObj = date instanceof Date ? date : new Date(date);
            return dateObj.toLocaleDateString("nb-NO", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "Ukjent dato";
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return "0 B";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getFieldLabel = (field) => {
        const labels = {
            name: "Navn",
            size: "Størrelse",
            type: "Filtype",
            uploadedBy: "Lastet opp av",
            changeReason: "Begrunnelse",
        };
        return labels[field] || field;
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 },
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CompareArrowsIcon />
                        <Typography variant="h6">Sammenlign versjoner</Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                {!comparison.hasChanges ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Ingen forskjeller funnet mellom versjonene.
                    </Alert>
                ) : (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        {comparison.differences.length} forskjell(er) funnet mellom versjonene.
                    </Alert>
                )}

                <Grid container spacing={2}>
                    {/* Version 1 */}
                    <Grid item xs={12} md={6}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                backgroundColor: "background.default",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    mb: 2,
                                }}
                            >
                                <Typography variant="subtitle1" fontWeight={600}>
                                    Versjon {version1.versionNumber}
                                </Typography>
                                {version1.isCurrent && (
                                    <Chip
                                        label="Nåværende"
                                        size="small"
                                        color="primary"
                                        icon={<CheckCircleIcon />}
                                    />
                                )}
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Navn
                                </Typography>
                                <Typography variant="body2">{version1.name}</Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Størrelse
                                </Typography>
                                <Typography variant="body2">{formatFileSize(version1.size)}</Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Filtype
                                </Typography>
                                <Typography variant="body2">{version1.type}</Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Lastet opp av
                                </Typography>
                                <Typography variant="body2">{version1.uploadedByName}</Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Dato
                                </Typography>
                                <Typography variant="body2">{formatDate(version1.uploadedAt)}</Typography>
                            </Box>

                            {version1.changeReason && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Begrunnelse
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                                        {version1.changeReason}
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* Version 2 */}
                    <Grid item xs={12} md={6}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                backgroundColor: "background.default",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    mb: 2,
                                }}
                            >
                                <Typography variant="subtitle1" fontWeight={600}>
                                    Versjon {version2.versionNumber}
                                </Typography>
                                {version2.isCurrent && (
                                    <Chip
                                        label="Nåværende"
                                        size="small"
                                        color="primary"
                                        icon={<CheckCircleIcon />}
                                    />
                                )}
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Navn
                                </Typography>
                                <Typography variant="body2">{version2.name}</Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Størrelse
                                </Typography>
                                <Typography variant="body2">{formatFileSize(version2.size)}</Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Filtype
                                </Typography>
                                <Typography variant="body2">{version2.type}</Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Lastet opp av
                                </Typography>
                                <Typography variant="body2">{version2.uploadedByName}</Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Dato
                                </Typography>
                                <Typography variant="body2">{formatDate(version2.uploadedAt)}</Typography>
                            </Box>

                            {version2.changeReason && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Begrunnelse
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                                        {version2.changeReason}
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>

                {/* Differences */}
                {comparison.hasChanges && (
                    <>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                            Forskjeller
                        </Typography>
                        <Box>
                            {comparison.differences.map((diff, index) => (
                                <Paper
                                    key={index}
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        mb: 2,
                                        backgroundColor: "action.hover",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            mb: 1,
                                        }}
                                    >
                                        <CancelIcon color="warning" fontSize="small" />
                                        <Typography variant="body2" fontWeight={600}>
                                            {getFieldLabel(diff.field)}
                                        </Typography>
                                    </Box>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Før
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    textDecoration: "line-through",
                                                    color: "error.main",
                                                }}
                                            >
                                                {diff.oldValue || "Ingen verdi"}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Etter
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: "success.main",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {diff.newValue || "Ingen verdi"}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            ))}
                        </Box>
                    </>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Lukk</Button>
            </DialogActions>
        </Dialog>
    );
};

