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
} from "@mui/material";

export const NS8405SpecificFields = ({
    formData,
    onChange,
    loading,
    errors = {},
}) => {
    // Get NS 8405 specific data from formData
    const ns8405Data = formData.ns8405 || {};

    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({
            target: {
                name: `ns8405.${name}`,
                value,
            },
        });
    };

    return (
        <>
            <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        NS 8405 – Spesifikke felt
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        Utførelsesentreprise – spesifikke kontraktsvilkår
                    </Typography>
                </Box>
            </Grid>

            {/* Entreprisemodell */}
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel id="entreprisemodell-label">
                        Entreprisemodell
                    </InputLabel>
                    <Select
                        labelId="entreprisemodell-label"
                        id="entreprisemodell"
                        name="entreprisemodell"
                        value={ns8405Data.entreprisemodell || ""}
                        onChange={handleChange}
                        label="Entreprisemodell"
                        disabled={loading}
                    >
                        <MenuItem value="hovedentreprise">
                            Hovedentreprise
                        </MenuItem>
                        <MenuItem value="generalentreprise">
                            Generalentreprise
                        </MenuItem>
                        <MenuItem value="delentreprise">Delentreprise</MenuItem>
                    </Select>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5, display: "block" }}
                    >
                        Velg entreprisemodell for NS 8405
                    </Typography>
                </FormControl>
            </Grid>

            {/* Endringsordre terskelverdi */}
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    id="endringsordreTerskel"
                    name="endringsordreTerskel"
                    label="Endringsordre terskelverdi (NOK)"
                    type="number"
                    value={ns8405Data.endringsordreTerskel || ""}
                    onChange={handleChange}
                    disabled={loading}
                    inputProps={{
                        min: 0,
                        step: 1000,
                    }}
                    helperText="Terskelverdi for når endringsordre må godkjennes"
                />
            </Grid>

            {/* Dagmulkt Section */}
            <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Dagmulkt
                </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
                <TextField
                    fullWidth
                    id="dagmulktSats"
                    name="dagmulktSats"
                    label="Dagmulkt sats (NOK/dag)"
                    type="number"
                    value={ns8405Data.dagmulktSats || ""}
                    onChange={handleChange}
                    disabled={loading}
                    inputProps={{
                        min: 0,
                        step: 100,
                    }}
                    helperText="Dagmulkt per dag ved forsinkelse"
                />
            </Grid>

            <Grid item xs={12} sm={4}>
                <TextField
                    fullWidth
                    id="dagmulktStartdato"
                    name="dagmulktStartdato"
                    label="Dagmulkt startdato"
                    type="date"
                    value={ns8405Data.dagmulktStartdato || ""}
                    onChange={handleChange}
                    disabled={loading}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    helperText="Når starter dagmulkt-regningen?"
                />
            </Grid>

            <Grid item xs={12} sm={4}>
                <TextField
                    fullWidth
                    id="dagmulktMaksProsent"
                    name="dagmulktMaksProsent"
                    label="Maksimal dagmulkt (%)"
                    type="number"
                    value={ns8405Data.dagmulktMaksProsent || ""}
                    onChange={handleChange}
                    disabled={loading}
                    inputProps={{
                        min: 0,
                        max: 100,
                        step: 0.1,
                    }}
                    helperText="Maksimal prosentandel av kontraktsum"
                />
            </Grid>

            {/* Faktureringsplan */}
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel id="faktureringsplan-label">
                        Faktureringsplan
                    </InputLabel>
                    <Select
                        labelId="faktureringsplan-label"
                        id="faktureringsplan"
                        name="faktureringsplan"
                        value={ns8405Data.faktureringsplan || ""}
                        onChange={handleChange}
                        label="Faktureringsplan"
                        disabled={loading}
                    >
                        <MenuItem value="akonto">Akonto</MenuItem>
                        <MenuItem value="milepæler">Milepæler</MenuItem>
                        <MenuItem value="kombinert">Kombinert</MenuItem>
                    </Select>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5, display: "block" }}
                    >
                        Velg faktureringsplan for NS 8405
                    </Typography>
                </FormControl>
            </Grid>

            {/* Sikkerhetsstillelse */}
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel id="sikkerhetsstillelseType-label">
                        Sikkerhetsstillelse type
                    </InputLabel>
                    <Select
                        labelId="sikkerhetsstillelseType-label"
                        id="sikkerhetsstillelseType"
                        name="sikkerhetsstillelseType"
                        value={ns8405Data.sikkerhetsstillelseType || ""}
                        onChange={handleChange}
                        label="Sikkerhetsstillelse type"
                        disabled={loading}
                    >
                        <MenuItem value="bankgaranti">Bankgaranti</MenuItem>
                        <MenuItem value="kontantdepositum">
                            Kontantdepositum
                        </MenuItem>
                        <MenuItem value="forsikring">Forsikring</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    id="sikkerhetsstillelseProsent"
                    name="sikkerhetsstillelseProsent"
                    label="Sikkerhetsstillelse prosent (%)"
                    type="number"
                    value={ns8405Data.sikkerhetsstillelseProsent || ""}
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
                    value={ns8405Data.retensjonProsent || ""}
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

            <Grid item xs={12}>
                <TextField
                    fullWidth
                    id="retensjonUtløpsvilkår"
                    name="retensjonUtløpsvilkår"
                    label="Retensjon utløpsvilkår"
                    value={ns8405Data.retensjonUtløpsvilkår || ""}
                    onChange={handleChange}
                    disabled={loading}
                    multiline
                    rows={2}
                    helperText="Beskriv når retensjon utløper"
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
                    value={ns8405Data.garantiperiodeÅr || ""}
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

            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    id="garantiperiodeType"
                    name="garantiperiodeType"
                    label="Garantiperiode type"
                    value={ns8405Data.garantiperiodeType || ""}
                    onChange={handleChange}
                    disabled={loading}
                    helperText="Type garanti (f.eks. Konstruksjonsgaranti)"
                />
            </Grid>
        </>
    );
};

