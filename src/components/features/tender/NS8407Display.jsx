import {
    Box,
    Typography,
    Grid,
    Paper,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";
import { DateDisplay } from "../../common";

/**
 * Display component for NS 8407 specific fields
 */
export const NS8407Display = ({ ns8407Data }) => {
    if (!ns8407Data || Object.keys(ns8407Data).length === 0) {
        return null;
    }

    const formatPercent = (value) => {
        if (value === null || value === undefined || value === "")
            return "Ikke spesifisert";
        return `${value}%`;
    };

    const formatCurrency = (value) => {
        if (!value) return "Ikke spesifisert";
        return new Intl.NumberFormat("no-NO", {
            style: "currency",
            currency: "NOK",
        }).format(value);
    };

    const formatProsjekteringsansvar = (value) => {
        const mapping = {
            fullt: "Fullt prosjekteringsansvar",
            delvis: "Delvis prosjekteringsansvar",
            koordinert: "Koordinert prosjektering",
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
                    NS 8407 – Spesifikke felt
                </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Totalentreprise – design & build spesifikke kontraktsvilkår
            </Typography>

            <Grid container spacing={2}>
                {ns8407Data.prosjekteringsomfangProsent && (
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                            Prosjekteringsomfang
                        </Typography>
                        <Typography variant="body1">
                            {formatPercent(
                                ns8407Data.prosjekteringsomfangProsent
                            )}
                        </Typography>
                    </Grid>
                )}

                {ns8407Data.prosjekteringsansvar && (
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                            Prosjekteringsansvar
                        </Typography>
                        <Typography variant="body1">
                            {formatProsjekteringsansvar(
                                ns8407Data.prosjekteringsansvar
                            )}
                        </Typography>
                    </Grid>
                )}

                {ns8407Data.funksjonskrav && (
                    <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                            Funksjonskrav
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.5 }}>
                            {ns8407Data.funksjonskrav}
                        </Typography>
                    </Grid>
                )}

                {ns8407Data.ytelsesbeskrivelse && (
                    <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                            Ytelsesbeskrivelse og kravspesifikasjon
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.5 }}>
                            {ns8407Data.ytelsesbeskrivelse}
                        </Typography>
                    </Grid>
                )}

                {/* Prosjekterings milepæler */}
                {ns8407Data.prosjekteringsMilepæler &&
                    ns8407Data.prosjekteringsMilepæler.length > 0 && (
                        <Grid item xs={12}>
                            <Typography
                                variant="subtitle2"
                                sx={{ mt: 2, mb: 1 }}
                            >
                                Prosjekterings milepæler
                            </Typography>
                            <List dense>
                                {ns8407Data.prosjekteringsMilepæler.map(
                                    (milestone, index) => (
                                        <ListItem key={milestone.id || index}>
                                            <ListItemText
                                                primary={
                                                    milestone.navn ||
                                                    "Ikke navngitt"
                                                }
                                                secondary={
                                                    milestone.dato ? (
                                                        <DateDisplay
                                                            date={
                                                                milestone.dato
                                                            }
                                                        />
                                                    ) : (
                                                        "Ingen dato"
                                                    )
                                                }
                                            />
                                        </ListItem>
                                    )
                                )}
                            </List>
                        </Grid>
                    )}

                {/* Utførelses milepæler */}
                {ns8407Data.utførelsesMilepæler &&
                    ns8407Data.utførelsesMilepæler.length > 0 && (
                        <Grid item xs={12}>
                            <Typography
                                variant="subtitle2"
                                sx={{ mt: 2, mb: 1 }}
                            >
                                Utførelses milepæler
                            </Typography>
                            <List dense>
                                {ns8407Data.utførelsesMilepæler.map(
                                    (milestone, index) => (
                                        <ListItem key={milestone.id || index}>
                                            <ListItemText
                                                primary={
                                                    milestone.navn ||
                                                    "Ikke navngitt"
                                                }
                                                secondary={
                                                    milestone.dato ? (
                                                        <DateDisplay
                                                            date={
                                                                milestone.dato
                                                            }
                                                        />
                                                    ) : (
                                                        "Ingen dato"
                                                    )
                                                }
                                            />
                                        </ListItem>
                                    )
                                )}
                            </List>
                        </Grid>
                    )}

                {ns8407Data.ansvarligProsjekterende && (
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                            Ansvarlig prosjekterende
                        </Typography>
                        <Typography variant="body1">
                            {ns8407Data.ansvarligProsjekterende}
                        </Typography>
                    </Grid>
                )}

                {ns8407Data.koordinerendeRådgivere && (
                    <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                            Koordinerende rådgivere
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.5 }}>
                            {ns8407Data.koordinerendeRådgivere}
                        </Typography>
                    </Grid>
                )}

                {/* Dagmulkt Section */}
                {(ns8407Data.dagmulktSats || ns8407Data.dagmulktStartdato) && (
                    <>
                        <Grid item xs={12}>
                            <Typography
                                variant="subtitle2"
                                sx={{ mt: 2, mb: 1 }}
                            >
                                Dagmulkt
                            </Typography>
                        </Grid>
                        {ns8407Data.dagmulktSats && (
                            <Grid item xs={12} sm={6}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Dagmulkt sats
                                </Typography>
                                <Typography variant="body1">
                                    {formatCurrency(ns8407Data.dagmulktSats)}
                                    /dag
                                </Typography>
                            </Grid>
                        )}
                        {ns8407Data.dagmulktStartdato && (
                            <Grid item xs={12} sm={6}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Dagmulkt startdato
                                </Typography>
                                <DateDisplay
                                    date={ns8407Data.dagmulktStartdato}
                                    variant="body1"
                                />
                            </Grid>
                        )}
                    </>
                )}

                {ns8407Data.sikkerhetsstillelseProsent && (
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                            Sikkerhetsstillelse prosent
                        </Typography>
                        <Typography variant="body1">
                            {formatPercent(
                                ns8407Data.sikkerhetsstillelseProsent
                            )}
                        </Typography>
                    </Grid>
                )}

                {ns8407Data.retensjonProsent && (
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                            Retensjon prosent
                        </Typography>
                        <Typography variant="body1">
                            {formatPercent(ns8407Data.retensjonProsent)}
                        </Typography>
                    </Grid>
                )}

                {ns8407Data.garantiperiodeÅr && (
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                            Garantiperiode
                        </Typography>
                        <Typography variant="body1">
                            {ns8407Data.garantiperiodeÅr} år
                        </Typography>
                    </Grid>
                )}
            </Grid>
        </Paper>
    );
};

export default NS8407Display;

