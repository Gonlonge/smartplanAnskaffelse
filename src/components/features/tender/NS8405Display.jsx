import { Box, Typography, Grid, Paper } from "@mui/material";
import { DateDisplay } from "../../common";

/**
 * Display component for NS 8405 specific fields
 */
export const NS8405Display = ({ ns8405Data }) => {
    if (!ns8405Data || Object.keys(ns8405Data).length === 0) {
        return null;
    }

    const formatCurrency = (value) => {
        if (!value) return "Ikke spesifisert";
        return new Intl.NumberFormat("no-NO", {
            style: "currency",
            currency: "NOK",
        }).format(value);
    };

    const formatPercent = (value) => {
        if (value === null || value === undefined || value === "")
            return "Ikke spesifisert";
        return `${value}%`;
    };

    const formatEntreprisemodell = (value) => {
        const mapping = {
            hovedentreprise: "Hovedentreprise",
            generalentreprise: "Generalentreprise",
            delentreprise: "Delentreprise",
        };
        return mapping[value] || value || "Ikke spesifisert";
    };

    const formatFaktureringsplan = (value) => {
        const mapping = {
            akonto: "Akonto",
            milepæler: "Milepæler",
            kombinert: "Kombinert",
        };
        return mapping[value] || value || "Ikke spesifisert";
    };

    const formatSikkerhetsstillelseType = (value) => {
        const mapping = {
            bankgaranti: "Bankgaranti",
            kontantdepositum: "Kontantdepositum",
            forsikring: "Forsikring",
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
                    NS 8405 – Spesifikke felt
                </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Utførelsesentreprise – spesifikke kontraktsvilkår
            </Typography>

            <Grid container spacing={2}>
                {ns8405Data.entreprisemodell && (
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                            Entreprisemodell
                        </Typography>
                        <Typography variant="body1">
                            {formatEntreprisemodell(
                                ns8405Data.entreprisemodell
                            )}
                        </Typography>
                    </Grid>
                )}

                {ns8405Data.endringsordreTerskel && (
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                            Endringsordre terskelverdi
                        </Typography>
                        <Typography variant="body1">
                            {formatCurrency(ns8405Data.endringsordreTerskel)}
                        </Typography>
                    </Grid>
                )}

                {/* Dagmulkt Section */}
                {(ns8405Data.dagmulktSats ||
                    ns8405Data.dagmulktStartdato ||
                    ns8405Data.dagmulktMaksProsent) && (
                    <>
                        <Grid item xs={12}>
                            <Typography
                                variant="subtitle2"
                                sx={{ mt: 2, mb: 1 }}
                            >
                                Dagmulkt
                            </Typography>
                        </Grid>
                        {ns8405Data.dagmulktSats && (
                            <Grid item xs={12} sm={4}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Dagmulkt sats
                                </Typography>
                                <Typography variant="body1">
                                    {formatCurrency(ns8405Data.dagmulktSats)}
                                    /dag
                                </Typography>
                            </Grid>
                        )}
                        {ns8405Data.dagmulktStartdato && (
                            <Grid item xs={12} sm={4}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Dagmulkt startdato
                                </Typography>
                                <DateDisplay
                                    date={ns8405Data.dagmulktStartdato}
                                    variant="body1"
                                />
                            </Grid>
                        )}
                        {ns8405Data.dagmulktMaksProsent && (
                            <Grid item xs={12} sm={4}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Maksimal dagmulkt
                                </Typography>
                                <Typography variant="body1">
                                    {formatPercent(
                                        ns8405Data.dagmulktMaksProsent
                                    )}
                                </Typography>
                            </Grid>
                        )}
                    </>
                )}

                {ns8405Data.faktureringsplan && (
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                            Faktureringsplan
                        </Typography>
                        <Typography variant="body1">
                            {formatFaktureringsplan(
                                ns8405Data.faktureringsplan
                            )}
                        </Typography>
                    </Grid>
                )}

                {/* Sikkerhetsstillelse */}
                {(ns8405Data.sikkerhetsstillelseType ||
                    ns8405Data.sikkerhetsstillelseProsent) && (
                    <>
                        <Grid item xs={12}>
                            <Typography
                                variant="subtitle2"
                                sx={{ mt: 2, mb: 1 }}
                            >
                                Sikkerhetsstillelse
                            </Typography>
                        </Grid>
                        {ns8405Data.sikkerhetsstillelseType && (
                            <Grid item xs={12} sm={6}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Type
                                </Typography>
                                <Typography variant="body1">
                                    {formatSikkerhetsstillelseType(
                                        ns8405Data.sikkerhetsstillelseType
                                    )}
                                </Typography>
                            </Grid>
                        )}
                        {ns8405Data.sikkerhetsstillelseProsent && (
                            <Grid item xs={12} sm={6}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Prosent
                                </Typography>
                                <Typography variant="body1">
                                    {formatPercent(
                                        ns8405Data.sikkerhetsstillelseProsent
                                    )}
                                </Typography>
                            </Grid>
                        )}
                    </>
                )}

                {/* Retensjon */}
                {(ns8405Data.retensjonProsent ||
                    ns8405Data.retensjonUtløpsvilkår) && (
                    <>
                        <Grid item xs={12}>
                            <Typography
                                variant="subtitle2"
                                sx={{ mt: 2, mb: 1 }}
                            >
                                Retensjon
                            </Typography>
                        </Grid>
                        {ns8405Data.retensjonProsent && (
                            <Grid item xs={12} sm={6}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Prosent
                                </Typography>
                                <Typography variant="body1">
                                    {formatPercent(ns8405Data.retensjonProsent)}
                                </Typography>
                            </Grid>
                        )}
                        {ns8405Data.retensjonUtløpsvilkår && (
                            <Grid item xs={12}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Utløpsvilkår
                                </Typography>
                                <Typography variant="body1">
                                    {ns8405Data.retensjonUtløpsvilkår}
                                </Typography>
                            </Grid>
                        )}
                    </>
                )}

                {/* Garantiperiode */}
                {(ns8405Data.garantiperiodeÅr ||
                    ns8405Data.garantiperiodeType) && (
                    <>
                        <Grid item xs={12}>
                            <Typography
                                variant="subtitle2"
                                sx={{ mt: 2, mb: 1 }}
                            >
                                Garantiperiode
                            </Typography>
                        </Grid>
                        {ns8405Data.garantiperiodeÅr && (
                            <Grid item xs={12} sm={6}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Periode
                                </Typography>
                                <Typography variant="body1">
                                    {ns8405Data.garantiperiodeÅr} år
                                </Typography>
                            </Grid>
                        )}
                        {ns8405Data.garantiperiodeType && (
                            <Grid item xs={12} sm={6}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Type
                                </Typography>
                                <Typography variant="body1">
                                    {ns8405Data.garantiperiodeType}
                                </Typography>
                            </Grid>
                        )}
                    </>
                )}
            </Grid>
        </Paper>
    );
};

export default NS8405Display;

