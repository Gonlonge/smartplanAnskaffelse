import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    Grid,
    Button,
    TextField,
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
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { TEST_CATEGORIES } from "../../../constants/complianceData";

/**
 * Firebase Test Runner Component
 * Handles running Firebase tests and displaying results
 */
export const FirebaseTestRunner = ({
    testing,
    testResults,
    testProgress,
    activeTestCategory,
    supplierTestEmail,
    tenderTestEmail,
    onSupplierEmailChange,
    onTenderEmailChange,
    onRunTest,
}) => {
    return (
        <>
            <Typography
                variant="h5"
                component="h2"
                sx={{ mb: 2, fontWeight: 600 }}
            >
                <PlayArrowIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Firebase Tester
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    Disse testene verifiserer at alle Firebase-operasjoner
                    fungerer korrekt. Test data vil bli opprettet i databasen.
                </Typography>
            </Alert>

            {/* Email Inputs for Supplier and Tender Tests */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        type="email"
                        label="E-post for Leverandør tester"
                        value={supplierTestEmail}
                        onChange={(e) => onSupplierEmailChange(e.target.value)}
                        placeholder="test@example.com"
                        variant="outlined"
                        size="small"
                        helperText="E-postadresse som skal motta invitasjoner i leverandørtester"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        type="email"
                        label="E-post for Anskaffelse tester"
                        value={tenderTestEmail}
                        onChange={(e) => onTenderEmailChange(e.target.value)}
                        placeholder="test@example.com"
                        variant="outlined"
                        size="small"
                        helperText="E-postadresse som skal motta invitasjoner i anskaffelsetester"
                    />
                </Grid>
            </Grid>

            {/* Test Buttons */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {TEST_CATEGORIES.map((category) => (
                    <Grid item xs={12} sm={6} md={3} key={category.id}>
                        <Button
                            variant={
                                activeTestCategory === category.id
                                    ? "contained"
                                    : "outlined"
                            }
                            fullWidth
                            onClick={() => onRunTest(category.id)}
                            disabled={testing}
                            startIcon={
                                testing &&
                                activeTestCategory === category.id ? (
                                    <CircularProgress size={20} />
                                ) : (
                                    <PlayArrowIcon />
                                )
                            }
                            sx={{ py: 1.5 }}
                        >
                            {category.label}
                        </Button>
                    </Grid>
                ))}
            </Grid>

            {/* Progress */}
            {testing && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        Kjører tester... {testProgress}%
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={testProgress}
                    />
                </Box>
            )}

            {/* Test Results */}
            {testResults && (
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 2,
                        }}
                    >
                        {testResults.success ? (
                            <Chip
                                icon={<CheckCircleIcon />}
                                label="Alle tester bestått"
                                color="success"
                            />
                        ) : (
                            <Chip
                                icon={<ErrorIcon />}
                                label="Noen tester feilet"
                                color="error"
                            />
                        )}
                        {testResults.summary && (
                            <Typography variant="body2" color="text.secondary">
                                {testResults.summary}
                            </Typography>
                        )}
                    </Box>

                    {testResults.error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {testResults.error}
                        </Alert>
                    )}

                    {testResults.tests && testResults.tests.length > 0 && (
                        <List dense>
                            {testResults.tests.map((test, index) => (
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
                            ))}
                        </List>
                    )}
                </Paper>
            )}
        </>
    );
};

FirebaseTestRunner.propTypes = {
    testing: PropTypes.bool,
    testResults: PropTypes.shape({
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
    testProgress: PropTypes.number,
    activeTestCategory: PropTypes.string,
    supplierTestEmail: PropTypes.string,
    tenderTestEmail: PropTypes.string,
    onSupplierEmailChange: PropTypes.func.isRequired,
    onTenderEmailChange: PropTypes.func.isRequired,
    onRunTest: PropTypes.func.isRequired,
};

