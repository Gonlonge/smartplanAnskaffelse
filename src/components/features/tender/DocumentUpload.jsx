import { useState } from "react";
import {
    Box,
    Typography,
    Button,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Alert,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DeleteIcon from "@mui/icons-material/Delete";

/**
 * DocumentUpload Component
 * Allows users to upload images/drawings for tenders
 */
export const DocumentUpload = ({
    documents = [],
    onDocumentsChange,
    disabled = false,
    maxSizeMB = 10,
    acceptedTypes = ["image/*", ".pdf", ".zip"],
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [error, setError] = useState("");

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setError("");

        // Validate files
        const validFiles = [];
        const errors = [];

        files.forEach((file) => {
            // Check file size
            const fileSizeMB = file.size / (1024 * 1024);
            if (fileSizeMB > maxSizeMB) {
                errors.push(
                    `${file.name} er for stor (${fileSizeMB.toFixed(1)}MB). Maks størrelse: ${maxSizeMB}MB`
                );
                return;
            }

            // Check file type
            const isValidType = acceptedTypes.some((type) => {
                if (type.endsWith("/*")) {
                    return file.type.startsWith(type.slice(0, -1));
                }
                return file.type === type || file.name.toLowerCase().endsWith(type);
            });

            if (!isValidType) {
                errors.push(`${file.name} har ikke støttet filtype`);
                return;
            }

            validFiles.push({
                id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: file.name,
                type: file.type || file.name.split(".").pop(),
                size: file.size,
                file: file, // Store file object for actual upload
                uploadedAt: new Date(),
            });
        });

        if (errors.length > 0) {
            setError(errors.join(", "));
        }

        if (validFiles.length > 0) {
            onDocumentsChange([...documents, ...validFiles]);
        }

        // Reset input
        e.target.value = "";
    };

    const handleRemoveDocument = (docId) => {
        onDocumentsChange(documents.filter((doc) => doc.id !== docId));
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Dokumenter / Tegninger
            </Typography>
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
            >
                Last opp bilder, tegninger eller andre dokumenter relatert til
                Anskaffelsen
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            <Box sx={{ mb: 2 }}>
                <input
                    accept={acceptedTypes.join(",")}
                    style={{ display: "none" }}
                    id="document-upload-input"
                    multiple
                    type="file"
                    onChange={handleFileSelect}
                    disabled={disabled}
                />
                <label htmlFor="document-upload-input">
                    <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        disabled={disabled}
                        fullWidth={isMobile}
                        sx={{
                            fontSize: {
                                xs: "1rem",
                                sm: "0.875rem",
                            },
                        }}
                    >
                        Velg filer
                    </Button>
                </label>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                >
                    Støttede formater: Bilder, PDF, ZIP. Maks størrelse:{" "}
                    {maxSizeMB}MB per fil
                </Typography>
            </Box>

            {documents.length > 0 && (
                <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
                    <List dense>
                        {documents.map((doc, index) => (
                            <Box key={doc.id}>
                                <ListItem
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            aria-label="slett dokument"
                                            onClick={() =>
                                                handleRemoveDocument(doc.id)
                                            }
                                            disabled={disabled}
                                            size="small"
                                            sx={{
                                                minHeight: { xs: 44, md: 36 },
                                                minWidth: { xs: 44, md: 36 },
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    }
                                >
                                    <ListItemIcon>
                                        <InsertDriveFileIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={doc.name}
                                        secondary={formatFileSize(doc.size)}
                                    />
                                </ListItem>
                            </Box>
                        ))}
                    </List>
                </Paper>
            )}
        </Box>
    );
};


