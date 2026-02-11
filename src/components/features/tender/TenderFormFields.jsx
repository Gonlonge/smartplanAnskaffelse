import {
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
} from "@mui/material";

export const TenderFormFields = ({
    formData,
    userProjects,
    onChange,
    loading,
    errors = {},
}) => {
    return (
        <>
            {/* Project Selection */}
            <Grid item xs={12}>
                <FormControl 
                    fullWidth 
                    required 
                    error={!!errors.projectId}
                >
                    <InputLabel id="project-label">Prosjekt</InputLabel>
                    <Select
                        labelId="project-label"
                        id="projectId"
                        name="projectId"
                        value={formData.projectId}
                        onChange={onChange}
                        label="Prosjekt"
                        disabled={loading}
                        aria-describedby={errors.projectId ? "projectId-error" : undefined}
                        aria-invalid={!!errors.projectId}
                    >
                        {userProjects.length > 0 ? (
                            userProjects.map((project) => (
                                <MenuItem key={project.id} value={project.id}>
                                    {project.name}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled>
                                Ingen prosjekter tilgjengelig
                            </MenuItem>
                        )}
                    </Select>
                    {errors.projectId && (
                        <Typography
                            variant="caption"
                            color="error"
                            id="projectId-error"
                            sx={{ mt: 0.5, ml: 1.75 }}
                            role="alert"
                        >
                            {errors.projectId}
                        </Typography>
                    )}
                </FormControl>
            </Grid>

            {/* Title */}
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    required
                    id="title"
                    name="title"
                    label="Tittel"
                    value={formData.title}
                    onChange={onChange}
                    disabled={loading}
                    autoFocus
                    error={!!errors.title}
                    helperText={errors.title || "Gi Anskaffelsen en beskrivende tittel"}
                    aria-describedby={errors.title ? "title-error" : undefined}
                    aria-invalid={!!errors.title}
                />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    id="description"
                    name="description"
                    label="Beskrivelse"
                    value={formData.description}
                    onChange={onChange}
                    disabled={loading}
                    multiline
                    rows={4}
                    helperText="Beskriv hva Anskaffelsen handler om"
                />
            </Grid>

            {/* Contract Standard */}
            <Grid item xs={12} sm={6}>
                <FormControl 
                    fullWidth 
                    required 
                    error={!!errors.contractStandard}
                >
                    <InputLabel id="contract-standard-label">
                        Kontraktstandard
                    </InputLabel>
                    <Select
                        labelId="contract-standard-label"
                        id="contractStandard"
                        name="contractStandard"
                        value={formData.contractStandard}
                        onChange={onChange}
                        label="Kontraktstandard"
                        disabled={loading}
                        aria-describedby={errors.contractStandard ? "contractStandard-error" : undefined}
                        aria-invalid={!!errors.contractStandard}
                    >
                        <MenuItem value="NS 8405">NS 8405</MenuItem>
                        <MenuItem value="NS 8406">NS 8406</MenuItem>
                        <MenuItem value="NS 8407">NS 8407</MenuItem>
                    </Select>
                    {errors.contractStandard && (
                        <Typography
                            variant="caption"
                            color="error"
                            id="contractStandard-error"
                            sx={{ mt: 0.5, ml: 1.75 }}
                            role="alert"
                        >
                            {errors.contractStandard}
                        </Typography>
                    )}
                </FormControl>
            </Grid>

            {/* Price */}
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    id="price"
                    name="price"
                    label="Estimert pris (NOK)"
                    type="number"
                    value={formData.price}
                    onChange={onChange}
                    disabled={loading}
                    inputProps={{
                        min: 0,
                        step: 1000,
                    }}
                    helperText="Estimert budsjett for Anskaffelsen"
                />
            </Grid>

            {/* Publish Date */}
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    id="publishDate"
                    name="publishDate"
                    label="Publiseringsdato"
                    type="date"
                    value={formData.publishDate}
                    onChange={onChange}
                    disabled={loading}
                    error={!!errors.publishDate}
                    helperText={errors.publishDate || "Når skal Anskaffelsen publiseres?"}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    inputProps={{
                        min: new Date().toISOString().split("T")[0],
                    }}
                    aria-describedby={errors.publishDate ? "publishDate-error" : undefined}
                    aria-invalid={!!errors.publishDate}
                />
            </Grid>

            {/* Deadline */}
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    required
                    id="deadline"
                    name="deadline"
                    label="Frist for å akseptere"
                    type="date"
                    value={formData.deadline}
                    onChange={onChange}
                    disabled={loading}
                    error={!!errors.deadline}
                    helperText={errors.deadline || "Når skal tilbud sendes inn?"}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    inputProps={{
                        min: formData.publishDate
                            ? new Date(formData.publishDate)
                                  .toISOString()
                                  .split("T")[0]
                            : new Date().toISOString().split("T")[0],
                    }}
                    aria-describedby={errors.deadline ? "deadline-error" : undefined}
                    aria-invalid={!!errors.deadline}
                />
            </Grid>

            {/* Status */}
            <Grid item xs={12}>
                <FormControl fullWidth>
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                        labelId="status-label"
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={onChange}
                        label="Status"
                        disabled={loading}
                    >
                        <MenuItem value="draft">Utkast</MenuItem>
                        <MenuItem value="open">Åpen</MenuItem>
                    </Select>
                </FormControl>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                >
                    Velg &apos;Utkast&apos; for å lagre uten å publisere, eller
                    &apos;Åpen&apos; for å publisere umiddelbart
                </Typography>
            </Grid>
        </>
    );
};
