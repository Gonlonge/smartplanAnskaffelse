import PropTypes from 'prop-types';
import { Grid, Card, CardContent, Box, Typography, Button, alpha, useTheme } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AddIcon from "@mui/icons-material/Add";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNavigate } from "react-router-dom";

/**
 * Dashboard quick actions section
 */
export const DashboardQuickActions = ({ isSender, isReceiver }) => {
    const navigate = useNavigate();
    const theme = useTheme();

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={isSender ? 6 : 12}>
                <Card elevation={0} sx={{ height: "100%" }}>
                    <CardContent>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 3,
                            }}
                        >
                            <Box
                                sx={{
                                    p: 1,
                                    borderRadius: 1.5,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    color: "primary.main",
                                    mr: 1.5,
                                }}
                            >
                                <AssignmentIcon />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Hurtighandlinger
                            </Typography>
                        </Box>
                        {isSender && (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    fullWidth
                                    onClick={() => navigate("/tenders/create")}
                                    size="large"
                                    sx={{
                                        py: 1.5,
                                        fontWeight: 600,
                                        textTransform: "none",
                                        fontSize: {
                                            xs: "1rem",
                                            sm: "0.875rem",
                                        },
                                        boxShadow: 2,
                                        "&:hover": {
                                            boxShadow: 4,
                                        },
                                    }}
                                >
                                    Opprett nytt Anskaffelse
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    fullWidth
                                    onClick={() => navigate("/projects/create")}
                                    size="large"
                                    sx={{
                                        py: 1.5,
                                        fontWeight: 600,
                                        textTransform: "none",
                                        fontSize: {
                                            xs: "1rem",
                                            sm: "0.875rem",
                                        },
                                        borderWidth: 2,
                                        "&:hover": {
                                            borderWidth: 2,
                                        },
                                    }}
                                >
                                    Opprett nytt prosjekt
                                </Button>
                            </Box>
                        )}
                        {isReceiver && (
                            <Button
                                variant="contained"
                                startIcon={<NotificationsIcon />}
                                fullWidth
                                onClick={() => navigate("/invitations")}
                                size="large"
                                sx={{
                                    py: 1.5,
                                    fontWeight: 600,
                                    textTransform: "none",
                                    fontSize: {
                                        xs: "1rem",
                                        sm: "0.875rem",
                                    },
                                    boxShadow: 2,
                                    "&:hover": {
                                        boxShadow: 4,
                                    },
                                }}
                            >
                                Se alle invitasjoner
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

DashboardQuickActions.propTypes = {
    isSender: PropTypes.bool,
    isReceiver: PropTypes.bool,
};

