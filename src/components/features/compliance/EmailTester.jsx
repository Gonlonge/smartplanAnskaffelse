import PropTypes from 'prop-types';
import {
    Box,
    Typography,
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
import NotificationsIcon from "@mui/icons-material/Notifications";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

/**
 * Email Tester Component
 * Handles email testing and displays results
 */
export const EmailTester = ({
    user,
    emailTesting,
    emailTestResults,
    emailTestProgress,
    testEmailAddress,
    onEmailChange,
    onRunTests,
}) => {
    return (
        <>
            <Typography
                variant="h5"
                component="h2"
                sx={{ mb: 2, fontWeight: 600 }}
            >
                <NotificationsIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                E-post Tester
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    Test alle typer e-poster. E-postene vil bli sendt til
                    e-postadressen du oppgir nedenfor.
                    <br />
                    <strong>Merk:</strong> E-post sending kan være deaktivert i
                    utviklingsmiljøet. Sjekk miljøvariabler for konfigurasjon.
                </Typography>
            </Alert>

            {/* Email Address Input */}
            <Box sx={{ mb: 3, maxWidth: 400 }}>
                <TextField
                    fullWidth
                    type="email"
                    label="E-postadresse for testing"
                    value={testEmailAddress}
                    onChange={(e) => onEmailChange(e.target.value)}
                    placeholder="test@example.com"
                    variant="outlined"
                    size="small"
                />
            </Box>

            {/* Test Button */}
            <Box sx={{ mb: 3 }}>
                <Button
                    variant="contained"
                    onClick={onRunTests}
                    disabled={emailTesting || !user || !testEmailAddress}
                    startIcon={
                        emailTesting ? (
                            <CircularProgress size={20} />
                        ) : (
                            <PlayArrowIcon />
                        )
                    }
                    sx={{ py: 1.5, px: 3 }}
                >
                    {emailTesting
                        ? "Kjører tester..."
                        : "Kjør alle e-post tester"}
                </Button>
            </Box>

            {/* Progress */}
            {emailTesting && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        Kjører e-post tester... {emailTestProgress}%
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={emailTestProgress}
                    />
                </Box>
            )}

            {/* Test Results */}
            {emailTestResults && (
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 2,
                        }}
                    >
                        {emailTestResults.success ? (
                            <Chip
                                icon={<CheckCircleIcon />}
                                label="Alle e-post tester bestått"
                                color="success"
                            />
                        ) : (
                            <Chip
                                icon={<ErrorIcon />}
                                label="Noen e-post tester feilet"
                                color="error"
                            />
                        )}
                        {emailTestResults.summary && (
                            <Typography variant="body2" color="text.secondary">
                                {emailTestResults.summary}
                            </Typography>
                        )}
                    </Box>

                    {emailTestResults.error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {emailTestResults.error}
                        </Alert>
                    )}

                    {emailTestResults.tests &&
                        emailTestResults.tests.length > 0 && (
                            <List dense>
                                {emailTestResults.tests.map((test, index) => (
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

EmailTester.propTypes = {
    user: PropTypes.object,
    emailTesting: PropTypes.bool,
    emailTestResults: PropTypes.shape({
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
    emailTestProgress: PropTypes.number,
    testEmailAddress: PropTypes.string,
    onEmailChange: PropTypes.func.isRequired,
    onRunTests: PropTypes.func.isRequired,
};

