import {
    Box,
    Typography,
    Button,
    Paper,
    Card,
    CardContent,
    CardActions,
    Grid,
    useTheme,
    alpha,
    IconButton,
    Tooltip,
} from "@mui/material";
import { StatusChip, DateDisplay } from "../../common";
import DescriptionIcon from "@mui/icons-material/Description";
import FolderIcon from "@mui/icons-material/Folder";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DeleteIcon from "@mui/icons-material/Delete";
import PropTypes from "prop-types";

/**
 * Card view component for displaying tenders on mobile devices
 */
export const TenderCardView = ({
    tenders,
    projectCache,
    canDelete,
    onViewTender,
    onDeleteClick,
}) => {
    const theme = useTheme();

    return (
        <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
            {tenders.length === 0 ? (
                <Grid item xs={12}>
                    <Paper
                        sx={{
                            p: 4,
                            textAlign: "center",
                            borderRadius: 2,
                        }}
                    >
                        <Typography
                            variant="h6"
                            color="text.secondary"
                            gutterBottom
                        >
                            Ingen Anskaffelser funnet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Prøv å justere filtrene dine
                        </Typography>
                    </Paper>
                </Grid>
            ) : (
                tenders.map((tender) => {
                    const project = projectCache[tender.projectId];
                    return (
                        <Grid item xs={12} key={tender.id}>
                            <Card
                                elevation={0}
                                sx={{
                                    height: "100%",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        borderColor: alpha(theme.palette.primary.main, 0.3),
                                    },
                                }}
                            >
                                <CardContent>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            mb: 2,
                                            flexWrap: "wrap",
                                            gap: 1,
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            sx={{ fontWeight: 600 }}
                                        >
                                            {tender.title}
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                            }}
                                        >
                                            <StatusChip
                                                status={tender.status}
                                            />
                                            {canDelete && (
                                                <Tooltip title="Slett Anskaffelse">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) =>
                                                            onDeleteClick(
                                                                tender,
                                                                e
                                                            )
                                                        }
                                                        sx={{
                                                            color: "error.main",
                                                            "&:hover": {
                                                                backgroundColor:
                                                                    alpha(
                                                                        theme
                                                                            .palette
                                                                            .error
                                                                            .main,
                                                                        0.1
                                                                    ),
                                                            },
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        paragraph
                                        sx={{ mb: 2 }}
                                    >
                                        {tender.description ||
                                            "Ingen beskrivelse"}
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 1.5,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                            }}
                                        >
                                            <FolderIcon
                                                sx={{
                                                    fontSize: 18,
                                                    color: "text.secondary",
                                                }}
                                            />
                                            <Typography variant="body2">
                                                <strong>Prosjekt:</strong>{" "}
                                                {project?.name || "Ukjent"}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                            }}
                                        >
                                            <DescriptionIcon
                                                sx={{
                                                    fontSize: 18,
                                                    color: "text.secondary",
                                                }}
                                            />
                                            <Typography variant="body2">
                                                <strong>
                                                    Kontraktstandard:
                                                </strong>{" "}
                                                {tender.contractStandard}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                            }}
                                        >
                                            <CalendarTodayIcon
                                                sx={{
                                                    fontSize: 18,
                                                    color: "text.secondary",
                                                }}
                                            />
                                            <DateDisplay
                                                date={tender.deadline}
                                            />
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                            }}
                                        >
                                            <AttachMoneyIcon
                                                sx={{
                                                    fontSize: 18,
                                                    color: "text.secondary",
                                                }}
                                            />
                                            <Typography variant="body2">
                                                <strong>Tilbud:</strong>{" "}
                                                {tender.bids?.length || 0}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                                <CardActions sx={{ px: 2, pb: 2 }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() =>
                                            onViewTender(tender.id)
                                        }
                                        sx={{
                                            textTransform: "none",
                                            fontWeight: 500,
                                            fontSize: {
                                                xs: "1rem",
                                                sm: "0.875rem",
                                            },
                                        }}
                                    >
                                        Se detaljer
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    );
                })
            )}
        </Grid>
    );
};

TenderCardView.propTypes = {
    tenders: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            description: PropTypes.string,
            projectId: PropTypes.string.isRequired,
            contractStandard: PropTypes.string.isRequired,
            deadline: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.instanceOf(Date),
            ]).isRequired,
            status: PropTypes.string.isRequired,
            bids: PropTypes.array,
        })
    ).isRequired,
    projectCache: PropTypes.object.isRequired,
    canDelete: PropTypes.bool,
    onViewTender: PropTypes.func.isRequired,
    onDeleteClick: PropTypes.func.isRequired,
};

