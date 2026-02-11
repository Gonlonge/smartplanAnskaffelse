import { Box, Typography, Grid, Paper, Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

/**
 * Display component for NS 8406 specific fields
 */
export const NS8406Display = ({ ns8406Data }) => {
    if (!ns8406Data || Object.keys(ns8406Data).length === 0) {
        return null;
    }

    const formatPercent = (value) => {
        if (value === null || value === undefined || value === "")
            return "Ikke spesifisert";
        return `${value}%`;
    };

    const formatPrisformat = (value) => {
        const mapping = {
            fastpris: "Fastpris",
            timepris: "Timepris",
            estimat: "Estimat",
        };
        return mapping[value] || value || "Ikke spesifisert";
    };

    return (
        <Paper
            elevation={0}
            sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 2 }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Typography
                    component="h2"
                    variant="h6"
                    sx={{ fontWeight: 600 }}
                >
                    NS 8406 – Spesifikke felt
                </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Forenklet utførelsesentreprise – forenklet struktur
            </Typography>

            <Grid container spacing={2}>
                {ns8406Data.prisformat && (
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                            Prisformat
                        </Typography>
                        <Typography variant="body1">
                            {formatPrisformat(ns8406Data.prisformat)}
                        </Typography>
                    </Grid>
                )}

                <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                        Standard betalingsplan
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 0.5,
                        }}
                    >
                        {ns8406Data.standardBetalingsplan ? (
                            <>
                                <CheckCircleIcon
                                    color="success"
                                    fontSize="small"
                                />
                                <Typography variant="body1">Ja</Typography>
                            </>
                        ) : (
                            <>
                                <CancelIcon color="disabled" fontSize="small" />
                                <Typography variant="body1">Nei</Typography>
                            </>
                        )}
                    </Box>
                </Grid>

                {ns8406Data.reklamasjonstidMåneder && (
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                            Reklamasjonstid
                        </Typography>
                        <Typography variant="body1">
                            {ns8406Data.reklamasjonstidMåneder} måneder
                        </Typography>
                    </Grid>
                )}

                {ns8406Data.sikkerhetsstillelseProsent && (
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                            Sikkerhetsstillelse prosent
                        </Typography>
                        <Typography variant="body1">
                            {formatPercent(
                                ns8406Data.sikkerhetsstillelseProsent
                            )}
                        </Typography>
                    </Grid>
                )}

                <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                        Depositum i stedet for sikkerhetsstillelse
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 0.5,
                        }}
                    >
                        {ns8406Data.depositum ? (
                            <>
                                <CheckCircleIcon
                                    color="success"
                                    fontSize="small"
                                />
                                <Typography variant="body1">Ja</Typography>
                            </>
                        ) : (
                            <>
                                <CancelIcon color="disabled" fontSize="small" />
                                <Typography variant="body1">Nei</Typography>
                            </>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default NS8406Display;

