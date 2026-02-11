import PropTypes from 'prop-types';
import {
    Grid,
    Paper,
    Box,
    Typography,
    Button,
    Divider,
    List,
    ListItem,
    ListItemText,
    Skeleton,
    alpha,
    useTheme,
} from "@mui/material";
import { StatusChip, DateDisplay } from "../../../components/common";
import { useNavigate } from "react-router-dom";
import DescriptionIcon from "@mui/icons-material/Description";
import InboxIcon from "@mui/icons-material/Inbox";
import AddIcon from "@mui/icons-material/Add";

/**
 * Dashboard recent activity section
 */
export const DashboardRecentActivity = ({ recentTenders, isSender, loading }) => {
    const navigate = useNavigate();
    const theme = useTheme();

    return (
        <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
            <Grid item xs={12}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, sm: 3 },
                        borderRadius: 2,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {isSender ? "Nylige Anskaffelse" : "Nylige invitasjoner"}
                        </Typography>
                        {recentTenders.length > 0 && (
                            <Button
                                size="small"
                                onClick={() => navigate(isSender ? "/tenders" : "/invitations")}
                                sx={{
                                    textTransform: "none",
                                    fontSize: {
                                        xs: "1rem",
                                        sm: "0.875rem",
                                    },
                                }}
                            >
                                Se alle
                            </Button>
                        )}
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    {loading ? (
                        <Box>
                            {Array.from({ length: 3 }).map((_, index) => (
                                <Box key={index} sx={{ mb: 2 }}>
                                    <Skeleton
                                        variant="rectangular"
                                        height={80}
                                        sx={{ borderRadius: 1 }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    ) : recentTenders.length > 0 ? (
                        <List sx={{ p: 0 }}>
                            {recentTenders.map((tender, index) => (
                                <Box key={tender.id}>
                                    <ListItem
                                        sx={{
                                            flexDirection: {
                                                xs: "column",
                                                sm: "row",
                                            },
                                            alignItems: {
                                                xs: "flex-start",
                                                sm: "center",
                                            },
                                            px: 0,
                                            py: 2,
                                            transition: "background-color 0.2s",
                                            borderRadius: 1,
                                            "&:hover": {
                                                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                            },
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1.5,
                                                        flexWrap: "wrap",
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    <Typography
                                                        variant="subtitle1"
                                                        sx={{
                                                            fontWeight: 600,
                                                            fontSize: { xs: "1rem", sm: "1rem" },
                                                        }}
                                                    >
                                                        {tender.title}
                                                    </Typography>
                                                    <StatusChip status={tender.status} />
                                                </Box>
                                            }
                                            secondary={
                                                <Box sx={{ mt: 0.5 }}>
                                                    <DateDisplay date={tender.deadline} />
                                                    {tender.description && (
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{
                                                                mt: 0.5,
                                                                display: {
                                                                    xs: "none",
                                                                    sm: "block",
                                                                },
                                                            }}
                                                        >
                                                            {tender.description.length > 100
                                                                ? `${tender.description.substring(0, 100)}...`
                                                                : tender.description}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />
                                        <Box
                                            sx={{
                                                mt: { xs: 2, sm: 0 },
                                                ml: {
                                                    xs: 0,
                                                    sm: "auto",
                                                },
                                            }}
                                        >
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => navigate(`/tenders/${tender.id}`)}
                                                sx={{
                                                    textTransform: "none",
                                                    fontWeight: 500,
                                                    minWidth: { xs: "100%", sm: "auto" },
                                                    fontSize: {
                                                        xs: "1rem",
                                                        sm: "0.875rem",
                                                    },
                                                }}
                                            >
                                                Se detaljer
                                            </Button>
                                        </Box>
                                    </ListItem>
                                    {index < recentTenders.length - 1 && <Divider sx={{ my: 0.5 }} />}
                                </Box>
                            ))}
                        </List>
                    ) : (
                        <Box
                            sx={{
                                textAlign: "center",
                                py: 6,
                                px: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: "50%",
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    mx: "auto",
                                    mb: 3,
                                }}
                            >
                                {isSender ? (
                                    <DescriptionIcon
                                        sx={{
                                            fontSize: 40,
                                            color: "primary.main",
                                        }}
                                    />
                                ) : (
                                    <InboxIcon
                                        sx={{
                                            fontSize: 40,
                                            color: "primary.main",
                                        }}
                                    />
                                )}
                            </Box>
                            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                                {isSender ? "Ingen Anskaffelse ennå" : "Ingen invitasjoner ennå"}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 3, maxWidth: 400, mx: "auto" }}
                            >
                                {isSender
                                    ? "Kom i gang ved å opprette ditt første anskaffelse eller prosjekt."
                                    : "Du vil motta invitasjoner her når noen inviterer deg til et anskaffelse."}
                            </Typography>
                            {isSender && (
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => navigate("/tenders/create")}
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: 600,
                                        fontSize: {
                                            xs: "1rem",
                                            sm: "0.875rem",
                                        },
                                        px: 3,
                                    }}
                                >
                                    Opprett første Anskaffelse
                                </Button>
                            )}
                        </Box>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );
};

DashboardRecentActivity.propTypes = {
    recentTenders: PropTypes.arrayOf(PropTypes.object),
    isSender: PropTypes.bool,
    loading: PropTypes.bool,
};

