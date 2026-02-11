import {
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Divider,
    Box,
    IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

export const NS8407SpecificFields = ({
    formData,
    onChange,
    loading,
    errors = {},
}) => {
    // Get NS 8407 specific data from formData
    const ns8407Data = formData.ns8407 || {};

    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({
            target: {
                name: `ns8407.${name}`,
                value,
            },
        });
    };

    const handleMilestoneAdd = (type) => {
        const milestones = ns8407Data[`${type}Milepæler`] || [];
        const newMilestones = [
            ...milestones,
            {
                id: `milestone_${Date.now()}`,
                navn: "",
                dato: "",
            },
        ];
        onChange({
            target: {
                name: `ns8407.${type}Milepæler`,
                value: newMilestones,
            },
        });
    };

    const handleMilestoneChange = (type, index, field, value) => {
        const milestones = [...(ns8407Data[`${type}Milepæler`] || [])];
        milestones[index] = {
            ...milestones[index],
            [field]: value,
        };
        onChange({
            target: {
                name: `ns8407.${type}Milepæler`,
                value: milestones,
            },
        });
    };

    const handleMilestoneDelete = (type, index) => {
        const milestones = (ns8407Data[`${type}Milepæler`] || []).filter(
            (_, i) => i !== index
        );
        onChange({
            target: {
                name: `ns8407.${type}Milepæler`,
                value: milestones,
            },
        });
    };

    return (
        <>
            <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        NS 8407 – Spesifikke felt
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        Totalentreprise – design & build spesifikke
                        kontraktsvilkår
                    </Typography>
                </Box>
            </Grid>

            {/* Prosjekteringsomfang */}
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    id="prosjekteringsomfangProsent"
                    name="prosjekteringsomfangProsent"
                    label="Prosjekteringsomfang (%)"
                    type="number"
                    value={ns8407Data.prosjekteringsomfangProsent || ""}
                    onChange={handleChange}
                    disabled={loading}
                    inputProps={{
                        min: 0,
                        max: 100,
                        step: 1,
                    }}
                    helperText="Hvor mye av prosjektet skal entreprenøren prosjektere?"
                />
            </Grid>

            {/* Prosjekteringsansvar */}
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel id="prosjekteringsansvar-label">
                        Prosjekteringsansvar
                    </InputLabel>
                    <Select
                        labelId="prosjekteringsansvar-label"
                        id="prosjekteringsansvar"
                        name="prosjekteringsansvar"
                        value={ns8407Data.prosjekteringsansvar || ""}
                        onChange={handleChange}
                        label="Prosjekteringsansvar"
                        disabled={loading}
                    >
                        <MenuItem value="fullt">Fullt prosjekteringsansvar</MenuItem>
                        <MenuItem value="delvis">Delvis prosjekteringsansvar</MenuItem>
                        <MenuItem value="koordinert">Koordinert prosjektering</MenuItem>
                    </Select>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5, display: "block" }}
                    >
                        Velg prosjekteringsansvar for NS 8407
                    </Typography>
                </FormControl>
            </Grid>

            {/* Funksjonskrav */}
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    id="funksjonskrav"
                    name="funksjonskrav"
                    label="Funksjonskrav"
                    value={ns8407Data.funksjonskrav || ""}
                    onChange={handleChange}
                    disabled={loading}
                    multiline
                    rows={4}
                    helperText="Beskriv overordnede ytelser og funksjonskrav som entreprenøren skal oppfylle"
                />
            </Grid>

            {/* Ytelsesbeskrivelse */}
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    id="ytelsesbeskrivelse"
                    name="ytelsesbeskrivelse"
                    label="Ytelsesbeskrivelse og kravspesifikasjon"
                    value={ns8407Data.ytelsesbeskrivelse || ""}
                    onChange={handleChange}
                    disabled={loading}
                    multiline
                    rows={3}
                    helperText="Beskriv ytelsesbeskrivelse eller referer til vedlegg"
                />
            </Grid>

            {/* Prosjekterings milepæler */}
            <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Prosjekterings milepæler
                    </Typography>
                    {(ns8407Data.prosjekteringsMilepæler || []).map(
                        (milestone, index) => (
                            <Grid container spacing={2} key={milestone.id || index} sx={{ mb: 1 }}>
                                <Grid item xs={12} sm={5}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Milepæl navn"
                                        value={milestone.navn || ""}
                                        onChange={(e) =>
                                            handleMilestoneChange(
                                                "prosjekterings",
                                                index,
                                                "navn",
                                                e.target.value
                                            )
                                        }
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={5}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Dato"
                                        type="date"
                                        value={milestone.dato || ""}
                                        onChange={(e) =>
                                            handleMilestoneChange(
                                                "prosjekterings",
                                                index,
                                                "dato",
                                                e.target.value
                                            )
                                        }
                                        disabled={loading}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={2}>
                                    <IconButton
                                        onClick={() =>
                                            handleMilestoneDelete(
                                                "prosjekterings",
                                                index
                                            )
                                        }
                                        disabled={loading}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        )
                    )}
                    <IconButton
                        onClick={() => handleMilestoneAdd("prosjekterings")}
                        disabled={loading}
                        color="primary"
                        size="small"
                    >
                        <AddIcon /> Legg til milepæl
                    </IconButton>
                </Box>
            </Grid>

            {/* Utførelses milepæler */}
            <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Utførelses milepæler
                    </Typography>
                    {(ns8407Data.utførelsesMilepæler || []).map(
                        (milestone, index) => (
                            <Grid container spacing={2} key={milestone.id || index} sx={{ mb: 1 }}>
                                <Grid item xs={12} sm={5}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Milepæl navn"
                                        value={milestone.navn || ""}
                                        onChange={(e) =>
                                            handleMilestoneChange(
                                                "utførelses",
                                                index,
                                                "navn",
                                                e.target.value
                                            )
                                        }
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={5}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Dato"
                                        type="date"
                                        value={milestone.dato || ""}
                                        onChange={(e) =>
                                            handleMilestoneChange(
                                                "utførelses",
                                                index,
                                                "dato",
                                                e.target.value
                                            )
                                        }
                                        disabled={loading}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={2}>
                                    <IconButton
                                        onClick={() =>
                                            handleMilestoneDelete(
                                                "utførelses",
                                                index
                                            )
                                        }
                                        disabled={loading}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        )
                    )}
                    <IconButton
                        onClick={() => handleMilestoneAdd("utførelses")}
                        disabled={loading}
                        color="primary"
                        size="small"
                    >
                        <AddIcon /> Legg til milepæl
                    </IconButton>
                </Box>
            </Grid>

            {/* Ansvarlig prosjekterende */}
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    id="ansvarligProsjekterende"
                    name="ansvarligProsjekterende"
                    label="Ansvarlig prosjekterende"
                    value={ns8407Data.ansvarligProsjekterende || ""}
                    onChange={handleChange}
                    disabled={loading}
                    helperText="Navn på ansvarlig prosjekterende"
                />
            </Grid>

            {/* Koordinerende rådgivere */}
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    id="koordinerendeRådgivere"
                    name="koordinerendeRådgivere"
                    label="Koordinerende rådgivere"
                    value={ns8407Data.koordinerendeRådgivere || ""}
                    onChange={handleChange}
                    disabled={loading}
                    multiline
                    rows={3}
                    helperText="Beskriv koordinerende rådgivere, fagområder og roller"
                />
            </Grid>

            {/* Dagmulkt Section */}
            <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Dagmulkt
                </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    id="dagmulktSats"
                    name="dagmulktSats"
                    label="Dagmulkt sats (NOK/dag)"
                    type="number"
                    value={ns8407Data.dagmulktSats || ""}
                    onChange={handleChange}
                    disabled={loading}
                    inputProps={{
                        min: 0,
                        step: 100,
                    }}
                    helperText="Dagmulkt per dag ved forsinkelse"
                />
            </Grid>

            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    id="dagmulktStartdato"
                    name="dagmulktStartdato"
                    label="Dagmulkt startdato"
                    type="date"
                    value={ns8407Data.dagmulktStartdato || ""}
                    onChange={handleChange}
                    disabled={loading}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    helperText="Når starter dagmulkt-regningen?"
                />
            </Grid>

            {/* Sikkerhetsstillelse */}
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    id="sikkerhetsstillelseProsent"
                    name="sikkerhetsstillelseProsent"
                    label="Sikkerhetsstillelse prosent (%)"
                    type="number"
                    value={ns8407Data.sikkerhetsstillelseProsent || ""}
                    onChange={handleChange}
                    disabled={loading}
                    inputProps={{
                        min: 0,
                        max: 100,
                        step: 0.1,
                    }}
                    helperText="Prosentandel av kontraktsum"
                />
            </Grid>

            {/* Retensjon */}
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    id="retensjonProsent"
                    name="retensjonProsent"
                    label="Retensjon prosent (%)"
                    type="number"
                    value={ns8407Data.retensjonProsent || ""}
                    onChange={handleChange}
                    disabled={loading}
                    inputProps={{
                        min: 0,
                        max: 100,
                        step: 0.1,
                    }}
                    helperText="Prosentandel som tilbakeholdes"
                />
            </Grid>

            {/* Garantiperiode */}
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    id="garantiperiodeÅr"
                    name="garantiperiodeÅr"
                    label="Garantiperiode (år)"
                    type="number"
                    value={ns8407Data.garantiperiodeÅr || ""}
                    onChange={handleChange}
                    disabled={loading}
                    inputProps={{
                        min: 0,
                        max: 10,
                        step: 0.5,
                    }}
                    helperText="Antall år garantiperiode"
                />
            </Grid>
        </>
    );
};

