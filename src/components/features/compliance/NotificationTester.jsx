import PropTypes from 'prop-types';
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
import NotificationsIcon from "@mui/icons-material/Notifications";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

/**
 * Notification Tester Component
 * Handles notification testing and displays results
 */
export const NotificationTester = ({
    user,
    notificationTesting,
    notificationTestResults,
    notificationTestProgress,
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
                Notification Tester
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    Test alle typer varsler. Varsler vil bli opprettet for din
                    bruker og vises i varselikonet øverst til høyre.
                </Typography>
            </Alert>

            {/* Test Button */}
            <Box sx={{ mb: 3 }}>
                <Button
                    variant="contained"
                    onClick={onRunTests}
                    disabled={notificationTesting || !user}
                    startIcon={
                        notificationTesting ? (
                            <CircularProgress size={20} />
                        ) : (
                            <PlayArrowIcon />
                        )
                    }
                    sx={{ py: 1.5, px: 3 }}
                >
                    {notificationTesting
                        ? "Kjører tester..."
                        : "Kjør alle notification tester"}
                </Button>
            </Box>

            {/* Progress */}
            {notificationTesting && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        Kjører notification tester... {notificationTestProgress}
                        %
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={notificationTestProgress}
                    />
                </Box>
            )}

            {/* Test Results */}
            {notificationTestResults && (
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 2,
                        }}
                    >
                        {notificationTestResults.success ? (
                            <Chip
                                icon={<CheckCircleIcon />}
                                label="Alle notification tester bestått"
                                color="success"
                            />
                        ) : (
                            <Chip
                                icon={<ErrorIcon />}
                                label="Noen notification tester feilet"
                                color="error"
                            />
                        )}
                        {notificationTestResults.summary && (
                            <Typography variant="body2" color="text.secondary">
                                {notificationTestResults.summary}
                            </Typography>
                        )}
                    </Box>

                    {notificationTestResults.error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {notificationTestResults.error}
                        </Alert>
                    )}

                    {notificationTestResults.tests &&
                        notificationTestResults.tests.length > 0 && (
                            <List dense>
                                {notificationTestResults.tests.map(
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

            <Alert severity="success" sx={{ mb: 4 }}>
                <Typography variant="body2">
                    Klikk på varselikonet (klokken) øverst til høyre for å se
                    varslene dine.
                </Typography>
            </Alert>
        </>
    );
};

NotificationTester.propTypes = {
    user: PropTypes.object,
    notificationTesting: PropTypes.bool,
    notificationTestResults: PropTypes.shape({
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
    notificationTestProgress: PropTypes.number,
    onRunTests: PropTypes.func.isRequired,
};

