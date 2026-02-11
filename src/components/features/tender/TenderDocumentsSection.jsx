import {
    Box,
    Typography,
    Paper,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Alert,
    Tooltip,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import HistoryIcon from "@mui/icons-material/History";
import { useState } from "react";
import { DocumentVersionHistory } from "./DocumentVersionHistory";
import { DocumentVersionCompare } from "./DocumentVersionCompare";
import { useAuth } from "../../../contexts/AuthContext";
import PropTypes from "prop-types";

/**
 * Document section for TenderDetails page
 * Displays documents and allows upload/delete for authorized users
 */
export const TenderDocumentsSection = ({
    tender,
    isSender,
    userInvitation,
    documentError,
    uploadingDocuments,
    loading,
    onAddDocuments,
    onRemoveDocument,
    onDownloadDocument,
}) => {
    const { user } = useAuth();
    const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [compareVersions, setCompareVersions] = useState(null);
    const getFileIcon = (docType) => {
        const type = docType?.toLowerCase() || "";
        if (type === "pdf" || type.includes("pdf")) {
            return <PictureAsPdfIcon sx={{ color: "error.main" }} />;
        }
        if (type === "zip" || type.includes("zip")) {
            return <FolderZipIcon sx={{ color: "primary.main" }} />;
        }
        return <InsertDriveFileIcon sx={{ color: "primary.main" }} />;
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            await onAddDocuments(files);
        }
        // Reset input
        e.target.value = "";
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2, sm: 3 },
                mb: 3,
                borderRadius: 2,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                    flexWrap: "wrap",
                    gap: 2,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <DescriptionIcon
                        sx={{ color: "primary.main" }}
                        aria-hidden="true"
                    />
                    <Typography
                        component="h2"
                        variant="h6"
                        sx={{ fontWeight: 600 }}
                    >
                        Dokumenter
                    </Typography>
                </Box>
                {/* Upload button for senders and invited suppliers */}
                {(isSender || userInvitation) && (
                    <>
                        <input
                            accept="image/*,.pdf,.zip"
                            style={{ display: "none" }}
                            id="tender-document-upload"
                            multiple
                            type="file"
                            onChange={handleFileChange}
                            disabled={uploadingDocuments || loading}
                        />
                        <label htmlFor="tender-document-upload">
                            <Button
                                component="span"
                                variant="outlined"
                                startIcon={<CloudUploadIcon aria-hidden="true" />}
                                disabled={uploadingDocuments || loading}
                                aria-label="Last opp dokumenter (PDF, bilder eller ZIP-filer)"
                                sx={{ textTransform: "none" }}
                            >
                                {uploadingDocuments
                                    ? "Laster opp..."
                                    : "Last opp dokumenter"}
                            </Button>
                        </label>
                    </>
                )}
            </Box>

            {documentError && (
                <Alert
                    severity="error"
                    role="alert"
                    aria-live="polite"
                    sx={{ mb: 2 }}
                >
                    {documentError}
                </Alert>
            )}

            {tender.documents && tender.documents.length > 0 ? (
                <List
                    role="list"
                    aria-label="Dokumentliste"
                    sx={{ py: 0 }}
                >
                    {tender.documents.map((doc) => (
                        <ListItem
                            key={doc.id}
                            role="listitem"
                            sx={{
                                borderRadius: 1,
                                mb: 1,
                                backgroundColor: "background.default",
                                "&:last-child": { mb: 0 },
                            }}
                        >
                            <Box sx={{ mr: 2, display: "flex" }}>
                                {getFileIcon(doc.type)}
                            </Box>
                            <ListItemText
                                primary={doc.name}
                                secondary={
                                    doc.size
                                        ? formatFileSize(doc.size)
                                        : "Ukjent størrelse"
                                }
                            />
                            <ListItemSecondaryAction>
                                <Tooltip title="Versjonshistorikk">
                                    <IconButton
                                        edge="end"
                                        aria-label={`Vis versjonshistorikk for ${doc.name}`}
                                        onClick={() => {
                                            setSelectedDocument(doc);
                                            setVersionHistoryOpen(true);
                                        }}
                                        sx={{ mr: 1 }}
                                        size="small"
                                    >
                                        <HistoryIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <IconButton
                                    edge="end"
                                    aria-label={`Last ned ${doc.name}`}
                                    onClick={() => onDownloadDocument(doc)}
                                    sx={{ mr: isSender ? 1 : 0 }}
                                >
                                    <DownloadIcon />
                                </IconButton>
                                {isSender && (
                                    <IconButton
                                        edge="end"
                                        aria-label={`Slett ${doc.name}`}
                                        onClick={() => onRemoveDocument(doc)}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                )}
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            ) : (
                <Box
                    sx={{
                        textAlign: "center",
                        py: 4,
                        color: "text.secondary",
                    }}
                >
                    <DescriptionIcon
                        sx={{ fontSize: 48, mb: 1, opacity: 0.5 }}
                        aria-hidden="true"
                    />
                    <Typography>Ingen dokumenter lastet opp ennå</Typography>
                    {(isSender || userInvitation) && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Klikk på &quot;Last opp dokumenter&quot; for å legge
                            til filer
                        </Typography>
                    )}
                </Box>
            )}

            {/* Version History Dialog */}
            {selectedDocument && (
                <DocumentVersionHistory
                    documentId={selectedDocument.id}
                    documentName={selectedDocument.name}
                    context="tender"
                    contextId={tender.id}
                    user={user}
                    open={versionHistoryOpen}
                    onClose={() => {
                        setVersionHistoryOpen(false);
                        setSelectedDocument(null);
                    }}
                    onVersionRestored={() => {
                        // Reload tender data if needed
                        window.location.reload();
                    }}
                />
            )}

            {/* Version Compare Dialog */}
            {compareVersions && (
                <DocumentVersionCompare
                    version1={compareVersions.version1}
                    version2={compareVersions.version2}
                    open={!!compareVersions}
                    onClose={() => setCompareVersions(null)}
                />
            )}
        </Paper>
    );
};

TenderDocumentsSection.propTypes = {
    tender: PropTypes.shape({
        id: PropTypes.string.isRequired,
        documents: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired,
                type: PropTypes.string,
                size: PropTypes.number,
            })
        ),
    }).isRequired,
    isSender: PropTypes.bool.isRequired,
    userInvitation: PropTypes.object,
    documentError: PropTypes.string,
    uploadingDocuments: PropTypes.bool,
    loading: PropTypes.bool,
    onAddDocuments: PropTypes.func.isRequired,
    onRemoveDocument: PropTypes.func.isRequired,
    onDownloadDocument: PropTypes.func.isRequired,
};

export default TenderDocumentsSection;

