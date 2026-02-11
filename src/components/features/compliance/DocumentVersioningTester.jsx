import PropTypes from "prop-types";
import {
    Box,
    Typography,
    Button,
    Alert,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    LinearProgress,
    CircularProgress,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { DocumentVersionHistory } from "../tender";

/**
 * Document Versioning Tester Component
 * Handles document versioning testing and displays results
 */
export const DocumentVersioningTester = ({
    user,
    versioningTesting,
    versioningTestResults,
    versioningTestProgress,
    testDocumentId,
    testTenderId,
    versionHistoryOpen,
    onRunTests,
    onVersionHistoryOpen,
    onVersionHistoryClose,
    onVersionRestored,
}) => {
    return (
        <>
            <Typography
                variant="h5"
                component="h2"
                sx={{ mb: 2, fontWeight: 600 }}
            >
                <HistoryIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Dokumentversjonering Tester
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    Test dokumentversjonering, versjonshistorikk, sammenligning
                    og gjenoppretting. Tester vil opprette testdokumenter og
                    versjoner i databasen.
                </Typography>
            </Alert>

            {/* Test Document Info */}
            {testDocumentId && testTenderId && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Test dokument ID:</strong> {testDocumentId}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Test anskaffelse ID:</strong> {testTenderId}
                    </Typography>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<HistoryIcon />}
                        onClick={onVersionHistoryOpen}
                        sx={{ mt: 1 }}
                    >
                        Vis versjonshistorikk
                    </Button>
                </Alert>
            )}

            {/* Test Button */}
            <Box sx={{ mb: 3 }}>
                <Button
                    variant="contained"
                    onClick={onRunTests}
                    disabled={versioningTesting || !user}
                    startIcon={
                        versioningTesting ? (
                            <CircularProgress size={20} />
                        ) : (
                            <PlayArrowIcon />
                        )
                    }
                    sx={{ py: 1.5, px: 3 }}
                >
                    {versioningTesting
                        ? "Kjører tester..."
                        : "Kjør alle versjonering tester"}
                </Button>
            </Box>

            {/* Progress */}
            {versioningTesting && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        Kjører versjonering tester... {versioningTestProgress}%
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={versioningTestProgress}
                    />
                </Box>
            )}

            {/* Test Results */}
            {versioningTestResults && (
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 2,
                        }}
                    >
                        {versioningTestResults.success ? (
                            <Chip
                                icon={<CheckCircleIcon />}
                                label="Alle versjonering tester bestått"
                                color="success"
                            />
                        ) : (
                            <Chip
                                icon={<ErrorIcon />}
                                label="Noen versjonering tester feilet"
                                color="error"
                            />
                        )}
                        {versioningTestResults.summary && (
                            <Typography variant="body2" color="text.secondary">
                                {versioningTestResults.summary}
                            </Typography>
                        )}
                    </Box>

                    {versioningTestResults.error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {versioningTestResults.error}
                        </Alert>
                    )}

                    {versioningTestResults.tests &&
                        versioningTestResults.tests.length > 0 && (
                            <List dense>
                                {versioningTestResults.tests.map(
                                    (test, index) => (
                                        <ListItem key={index} sx={{ py: 0.5 }}>
                                            <ListItemIcon sx={{ minWidth: 32 }}>
                                                {test.success ? (
                                                    <CheckCircleIcon
                                                        color="success"
                                                        fontSize="small"
                                                    />
                                                ) : (
                                                    <ErrorIcon
                                                        color="error"
                                                        fontSize="small"
                                                    />
                                                )}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={test.name}
                                                secondary={test.message}
                                                primaryTypographyProps={{
                                                    variant: "body2",
                                                    fontWeight: 500,
                                                }}
                                                secondaryTypographyProps={{
                                                    variant: "caption",
                                                }}
                                            />
                                        </ListItem>
                                    )
                                )}
                            </List>
                        )}
                </Paper>
            )}

            {/* Version History Dialog */}
            {testDocumentId && (
                <DocumentVersionHistory
                    documentId={testDocumentId}
                    documentName="Test Dokument"
                    context="tender"
                    contextId={testTenderId}
                    user={user}
                    open={versionHistoryOpen}
                    onClose={onVersionHistoryClose}
                    onVersionRestored={onVersionRestored}
                />
            )}
        </>
    );
};

DocumentVersioningTester.propTypes = {
    user: PropTypes.object,
    versioningTesting: PropTypes.bool,
    versioningTestResults: PropTypes.shape({
        success: PropTypes.bool,
        summary: PropTypes.string,
        error: PropTypes.string,
        tests: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string,
                message: PropTypes.string,
                success: PropTypes.bool,
            })
        ),
    }),
    versioningTestProgress: PropTypes.number,
    testDocumentId: PropTypes.string,
    testTenderId: PropTypes.string,
    versionHistoryOpen: PropTypes.bool,
    onRunTests: PropTypes.func.isRequired,
    onVersionHistoryOpen: PropTypes.func.isRequired,
    onVersionHistoryClose: PropTypes.func.isRequired,
    onVersionRestored: PropTypes.func.isRequired,
};
