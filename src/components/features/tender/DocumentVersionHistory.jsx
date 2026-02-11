import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Divider,
    Alert,
    CircularProgress,
    Tooltip,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import RestoreIcon from "@mui/icons-material/Restore";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useState, useEffect } from "react";
import {
    getDocumentVersions,
    getDocumentChangeHistory,
    restoreDocumentVersion,
    compareDocumentVersions,
} from "../../../services/documentVersioning";
import { DocumentVersionCompare } from "./DocumentVersionCompare";

/**
 * Document Version History Component
 * Displays version history for a document with comparison and restore functionality
 */
export const DocumentVersionHistory = ({
    documentId,
    documentName,
    context,
    contextId,
    user,
    open,
    onClose,
    onVersionRestored,
}) => {
    const [versions, setVersions] = useState([]);
    const [changeHistory, setChangeHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [error, setError] = useState("");
    const [selectedVersions, setSelectedVersions] = useState([]);
    const [compareVersions, setCompareVersions] = useState(null);

    useEffect(() => {
        if (open && documentId) {
            loadVersionHistory();
        }
    }, [open, documentId]);

    const loadVersionHistory = async () => {
        setLoading(true);
        setError("");
        try {
            const [versionsData, historyData] = await Promise.all([
                getDocumentVersions(documentId),
                getDocumentChangeHistory(documentId),
            ]);
            setVersions(versionsData);
            setChangeHistory(historyData);
        } catch (err) {
            console.error("Error loading version history:", err);
            setError("Kunne ikke laste versjonshistorikk");
        } finally {
            setLoading(false);
        }
    };

    const handleVersionSelect = (version) => {
        if (selectedVersions.length === 0) {
            setSelectedVersions([version]);
        } else if (selectedVersions.length === 1) {
            if (selectedVersions[0].versionNumber === version.versionNumber) {
                setSelectedVersions([]);
            } else {
                // Compare the two versions
                setCompareVersions({
                    version1: selectedVersions[0],
                    version2: version,
                });
                setSelectedVersions([]);
            }
        } else {
            setSelectedVersions([version]);
        }
    };

    const handleRestore = async (versionNumber) => {
        if (
            !window.confirm(
                `Er du sikker på at du vil gjenopprette versjon ${versionNumber}? Dette vil opprette en ny versjon basert på den valgte versjonen.`
            )
        ) {
            return;
        }

        setRestoring(true);
        setError("");
        try {
            const result = await restoreDocumentVersion(
                documentId,
                versionNumber,
                user,
                context,
                contextId
            );

            if (result.success) {
                await loadVersionHistory();
                if (onVersionRestored) {
                    onVersionRestored();
                }
            } else {
                setError(result.error || "Kunne ikke gjenopprette versjon");
            }
        } catch (err) {
            console.error("Error restoring version:", err);
            setError("Kunne ikke gjenopprette versjon");
        } finally {
            setRestoring(false);
        }
    };

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

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
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
                        <HistoryIcon />
                        <Typography variant="h6">Versjonshistorikk</Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {documentName}
                </Typography>
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            py: 4,
                        }}
                    >
                        <CircularProgress />
                    </Box>
                ) : versions.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                        <Typography color="text.secondary">
                            Ingen versjonshistorikk tilgjengelig
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {/* Version List */}
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            Versjoner ({versions.length})
                        </Typography>
                        <List dense>
                            {versions.map((version) => {
                                const isSelected = selectedVersions.some(
                                    (v) => v.versionNumber === version.versionNumber
                                );
                                const isCurrent = version.isCurrent;

                                return (
                                    <ListItem
                                        key={version.id}
                                        sx={{
                                            border: isSelected ? 2 : 1,
                                            borderColor: isSelected
                                                ? "primary.main"
                                                : "divider",
                                            borderRadius: 1,
                                            mb: 1,
                                            backgroundColor: isCurrent
                                                ? "action.selected"
                                                : "background.default",
                                            cursor: "pointer",
                                            "&:hover": {
                                                backgroundColor: "action.hover",
                                            },
                                        }}
                                        onClick={() => handleVersionSelect(version)}
                                    >
                                        <ListItemText
                                            primary={
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1,
                                                    }}
                                                >
                                                    <Typography variant="body2" fontWeight={600}>
                                                        Versjon {version.versionNumber}
                                                    </Typography>
                                                    {isCurrent && (
                                                        <Chip
                                                            label="Nåværende"
                                                            size="small"
                                                            color="primary"
                                                            icon={<CheckCircleIcon />}
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="caption" display="block">
                                                        {formatDate(version.uploadedAt)} •{" "}
                                                        {version.uploadedByName}
                                                    </Typography>
                                                    <Typography variant="caption" display="block">
                                                        {formatFileSize(version.size)} • {version.type}
                                                    </Typography>
                                                    {version.changeReason && (
                                                        <Typography
                                                            variant="caption"
                                                            display="block"
                                                            sx={{ fontStyle: "italic", mt: 0.5 }}
                                                        >
                                                            {version.changeReason}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <Box sx={{ display: "flex", gap: 0.5 }}>
                                                <Tooltip title="Sammenlign versjoner">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleVersionSelect(version);
                                                        }}
                                                    >
                                                        <CompareArrowsIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                {!isCurrent && (
                                                    <Tooltip title="Gjenopprett denne versjonen">
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRestore(version.versionNumber);
                                                            }}
                                                            disabled={restoring}
                                                        >
                                                            <RestoreIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                <Tooltip title="Last ned">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.open(version.url, "_blank");
                                                        }}
                                                    >
                                                        <DownloadIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                );
                            })}
                        </List>

                        <Divider sx={{ my: 2 }} />

                        {/* Change History */}
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            Endringshistorikk
                        </Typography>
                        {changeHistory.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                Ingen endringer registrert
                            </Typography>
                        ) : (
                            <List dense>
                                {changeHistory.map((entry, index) => (
                                    <ListItem key={index} sx={{ py: 0.5 }}>
                                        <ListItemText
                                            primary={
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1,
                                                    }}
                                                >
                                                    <Chip
                                                        label={`v${entry.version}`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    <Typography variant="body2">
                                                        {entry.change.description}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDate(entry.timestamp)} • {entry.user}
                                                    {entry.changeReason && ` • ${entry.changeReason}`}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Lukk</Button>
            </DialogActions>

            {/* Version Compare Dialog */}
            {compareVersions && (
                <DocumentVersionCompare
                    version1={compareVersions.version1}
                    version2={compareVersions.version2}
                    open={!!compareVersions}
                    onClose={() => setCompareVersions(null)}
                />
            )}
        </Dialog>
    );
};

