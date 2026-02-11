import { Box, Typography, Paper, Grid, Chip } from "@mui/material";
import { DateDisplay } from "../../common";
import PropTypes from "prop-types";

/**
 * Display component for additional tender information
 * Shows evaluation criteria, entrepriseform, cpv, and questionDeadline
 */
export const TenderAdditionalInfo = ({ tender }) => {
    const hasAdditionalInfo =
        (tender.evaluationCriteria && tender.evaluationCriteria.length > 0) ||
        tender.entrepriseform ||
        tender.cpv ||
        tender.questionDeadline;

    if (!hasAdditionalInfo) {
        return null;
    }

    const formatEntrepriseform = (value) => {
        const mapping = {
            as: "AS",
            da: "DA",
            enkeltpersonforetak: "Enkeltpersonforetak",
            stiftelse: "Stiftelse",
            annet: "Annet",
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
                    Tilleggsinformasjon
                </Typography>
            </Box>

            <Grid container spacing={2}>
                {tender.evaluationCriteria &&
                    tender.evaluationCriteria.length > 0 && (
                        <Grid item xs={12}>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                            >
                                Vurderingskriterier
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 1,
                                }}
                            >
                                {tender.evaluationCriteria.map(
                                    (criterion, index) => (
                                        <Chip
                                            key={index}
                                            label={criterion}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    )
                                )}
                            </Box>
                        </Grid>
                    )}

                {tender.entrepriseform && (
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                            Entrepriseform
                        </Typography>
                        <Typography variant="body1">
                            {formatEntrepriseform(tender.entrepriseform)}
                        </Typography>
                    </Grid>
                )}

                {tender.cpv && (
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                            CPV-kode
                        </Typography>
                        <Typography variant="body1">{tender.cpv}</Typography>
                    </Grid>
                )}

                {tender.questionDeadline && (
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                            Spørsmålfrist
                        </Typography>
                        <DateDisplay
                            date={tender.questionDeadline}
                            variant="body1"
                        />
                    </Grid>
                )}
            </Grid>
        </Paper>
    );
};

TenderAdditionalInfo.propTypes = {
    tender: PropTypes.shape({
        evaluationCriteria: PropTypes.arrayOf(PropTypes.string),
        entrepriseform: PropTypes.string,
        cpv: PropTypes.string,
        questionDeadline: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.instanceOf(Date),
        ]),
    }).isRequired,
};

export default TenderAdditionalInfo;

