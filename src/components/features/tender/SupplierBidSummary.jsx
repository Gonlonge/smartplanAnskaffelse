import {
    Box,
    Typography,
    Paper,
    Grid,
    Chip,
    alpha,
    useTheme,
} from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { DateDisplay } from "../../common";
import { PRICE_STRUCTURE_TYPES } from "../../../constants";
import PropTypes from "prop-types";

/**
 * Summary of supplier's submitted bid
 * Visible only to the supplier who submitted the bid
 */
export const SupplierBidSummary = ({ bid, tender }) => {
    const theme = useTheme();
    const isAwarded = tender.awardedBidId === bid.id;

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2, sm: 3 },
                mb: 3,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.success.main, 0.05),
                border: 1,
                borderColor: alpha(theme.palette.success.main, 0.2),
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 3,
                    flexWrap: "wrap",
                    gap: 2,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AttachMoneyIcon color="success" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Ditt innsendte tilbud
                    </Typography>
                </Box>
                {isAwarded && (
                    <Chip
                        icon={<CheckCircleIcon />}
                        label="Tildelt kontrakt"
                        color="success"
                        size="medium"
                    />
                )}
                {bid.status === "submitted" && !isAwarded && (
                    <Chip label="Sendt inn" color="success" size="small" />
                )}
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                    <Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                        >
                            Totalpris
                        </Typography>
                        <Typography
                            variant="h5"
                            color="primary"
                            sx={{ fontWeight: 600 }}
                        >
                            {new Intl.NumberFormat("no-NO", {
                                style: "currency",
                                currency: "NOK",
                            }).format(bid.price || 0)}
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                        >
                            Prisstruktur
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {PRICE_STRUCTURE_TYPES.find(
                                (t) => t.value === bid.priceStructure
                            )?.label || bid.priceStructure}
                        </Typography>
                    </Box>
                </Grid>

                {bid.priceStructure === "timepris" && (
                    <>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 0.5 }}
                                >
                                    Timepris
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{ fontWeight: 500 }}
                                >
                                    {bid.hourlyRate
                                        ? new Intl.NumberFormat("no-NO", {
                                              style: "currency",
                                              currency: "NOK",
                                          }).format(bid.hourlyRate)
                                        : "N/A"}{" "}
                                    / time
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 0.5 }}
                                >
                                    Estimert timer
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{ fontWeight: 500 }}
                                >
                                    {bid.estimatedHours || "N/A"}
                                </Typography>
                            </Box>
                        </Grid>
                    </>
                )}

                <Grid item xs={12} sm={6} md={4}>
                    <Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                        >
                            Sendt inn
                        </Typography>
                        <DateDisplay date={bid.submittedAt} variant="body1" />
                    </Box>
                </Grid>

                {bid.score !== null && bid.score !== undefined && (
                    <Grid item xs={12} sm={6} md={4}>
                        <Box>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 0.5 }}
                            >
                                Score
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {bid.score}
                            </Typography>
                        </Box>
                    </Grid>
                )}

                {bid.notes && (
                    <Grid item xs={12}>
                        <Box>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 0.5 }}
                            >
                                Notater
                            </Typography>
                            <Typography variant="body1">{bid.notes}</Typography>
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Paper>
    );
};

SupplierBidSummary.propTypes = {
    bid: PropTypes.shape({
        id: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        priceStructure: PropTypes.string.isRequired,
        hourlyRate: PropTypes.number,
        estimatedHours: PropTypes.number,
        submittedAt: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.instanceOf(Date),
        ]).isRequired,
        score: PropTypes.number,
        notes: PropTypes.string,
        status: PropTypes.string,
    }).isRequired,
    tender: PropTypes.shape({
        awardedBidId: PropTypes.string,
    }).isRequired,
};

export default SupplierBidSummary;

