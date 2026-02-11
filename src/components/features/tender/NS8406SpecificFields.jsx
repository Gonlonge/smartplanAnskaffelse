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
    FormControlLabel,
    Checkbox,
} from "@mui/material";

export const NS8406SpecificFields = ({
    formData,
    onChange,
    loading,
    errors = {},
}) => {
    // Get NS 8406 specific data from formData
    const ns8406Data = formData.ns8406 || {};

    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({
            target: {
                name: `ns8406.${name}`,
                value,
            },
        });
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        onChange({
            target: {
                name: `ns8406.${name}`,
                value: checked,
            },
        });
    };

    return (
        <>
            <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        NS 8406 – Spesifikke felt
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        Forenklet utførelsesentreprise – forenklet struktur
                    </Typography>
                </Box>
            </Grid>

            {/* Prisformat */}
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel id="prisformat-label">Prisformat</InputLabel>
                    <Select
                        labelId="prisformat-label"
                        id="prisformat"
                        name="prisformat"
                        value={ns8406Data.prisformat || ""}
                        onChange={handleChange}
                        label="Prisformat"
                        disabled={loading}
                    >
                        <MenuItem value="fastpris">Fastpris</MenuItem>
                        <MenuItem value="timepris">Timepris</MenuItem>
                        <MenuItem value="estimat">Estimat</MenuItem>
                    </Select>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5, display: "block" }}
                    >
                        Velg prisformat for NS 8406
                    </Typography>
                </FormControl>
            </Grid>

            {/* Standard betalingsplan */}
            <Grid item xs={12} sm={6}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={ns8406Data.standardBetalingsplan || false}
                            onChange={handleCheckboxChange}
                            name="standardBetalingsplan"
                            disabled={loading}
                        />
                    }
                    label="Standard betalingsplan"
                    sx={{ mt: 2 }}
                />
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block", ml: 4 }}
                >
                    Bruk standard betalingsplan for NS 8406
                </Typography>
            </Grid>

            {/* Reklamasjonstid */}
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    id="reklamasjonstidMåneder"
                    name="reklamasjonstidMåneder"
                    label="Reklamasjonstid (måneder)"
                    type="number"
                    value={ns8406Data.reklamasjonstidMåneder || ""}
                    onChange={handleChange}
                    disabled={loading}
                    inputProps={{
                        min: 0,
                        max: 60,
                        step: 1,
                    }}
                    helperText="Reklamasjonstid i måneder (forenklet)"
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
                    value={ns8406Data.sikkerhetsstillelseProsent || ""}
                    onChange={handleChange}
                    disabled={loading}
                    inputProps={{
                        min: 0,
                        max: 100,
                        step: 0.1,
                    }}
                    helperText="Prosentandel av kontraktsum (forenklet)"
                />
            </Grid>

            {/* Depositum */}
            <Grid item xs={12}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={ns8406Data.depositum || false}
                            onChange={handleCheckboxChange}
                            name="depositum"
                            disabled={loading}
                        />
                    }
                    label="Depositum i stedet for sikkerhetsstillelse"
                />
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block", ml: 4 }}
                >
                    Bruk depositum for forenklet sikkerhetsstillelse
                </Typography>
            </Grid>
        </>
    );
};

