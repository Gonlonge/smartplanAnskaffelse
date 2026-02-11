import {
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    FormLabel,
    FormGroup,
    FormControlLabel,
    Checkbox,
} from "@mui/material";

export const CommonTenderFields = ({
    formData,
    userProjects,
    onChange,
    loading,
    errors = {},
}) => {
    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        // For evaluation criteria, we need to handle array updates
        const currentCriteria = formData.evaluationCriteria || [];
        const newCriteria = checked
            ? [...currentCriteria, value]
            : currentCriteria.filter((c) => c !== value);
        
        // Call onChange with the updated array
        onChange({
            target: {
                name: "evaluationCriteria",
                value: newCriteria,
            },
        });
    };

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
                        value={formData.projectId || ""}
                        onChange={onChange}
                        label="Prosjekt"
                        disabled={loading}
                        aria-describedby={
                            errors.projectId ? "projectId-error" : undefined
                        }
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

            {/* Title / Anskaffelsesnavn */}
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    required
                    id="title"
                    name="title"
                    label="Anskaffelsesnavn / Kontraktsnavn"
                    value={formData.title || ""}
                    onChange={onChange}
                    disabled={loading}
                    autoFocus
                    error={!!errors.title}
                    helperText={
                        errors.title ||
                        "Gi Anskaffelsen en beskrivende tittel"
                    }
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
                    value={formData.description || ""}
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
                        value={formData.contractStandard || ""}
                        onChange={onChange}
                        label="Kontraktstandard"
                        disabled={loading}
                        aria-describedby={
                            errors.contractStandard
                                ? "contractStandard-error"
                                : undefined
                        }
                        aria-invalid={!!errors.contractStandard}
                    >
                        <MenuItem value="NS 8405">NS 8405 – Utførelsesentreprise</MenuItem>
                        <MenuItem value="NS 8406">NS 8406 – Forenklet utførelsesentreprise</MenuItem>
                        <MenuItem value="NS 8407">NS 8407 – Totalentreprise</MenuItem>
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

            {/* Entrepriseform */}
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel id="entrepriseform-label">
                        Entrepriseform
                    </InputLabel>
                    <Select
                        labelId="entrepriseform-label"
                        id="entrepriseform"
                        name="entrepriseform"
                        value={formData.entrepriseform || ""}
                        onChange={onChange}
                        label="Entrepriseform"
                        disabled={loading}
                    >
                        <MenuItem value="generalentreprise">
                            Generalentreprise
                        </MenuItem>
                        <MenuItem value="totalentreprise">
                            Totalentreprise
                        </MenuItem>
                        <MenuItem value="delentreprise">Delentreprise</MenuItem>
                        <MenuItem value="sideentreprise">
                            Sideentreprise
                        </MenuItem>
                    </Select>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5, display: "block" }}
                    >
                        Velg entrepriseform for denne anskaffelsen
                    </Typography>
                </FormControl>
            </Grid>

            {/* CPV / Fagområde */}
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    id="cpv"
                    name="cpv"
                    label="CPV / Fagområde"
                    value={formData.cpv || ""}
                    onChange={onChange}
                    disabled={loading}
                    helperText="CPV-kode eller fagområde (f.eks. 45200000-8 for byggearbeid)"
                />
            </Grid>

            {/* Estimated Price */}
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    id="price"
                    name="price"
                    label="Estimert pris (NOK)"
                    type="number"
                    value={formData.price || ""}
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
                    value={formData.publishDate || ""}
                    onChange={onChange}
                    disabled={loading}
                    error={!!errors.publishDate}
                    helperText={
                        errors.publishDate ||
                        "Når skal Anskaffelsen publiseres?"
                    }
                    InputLabelProps={{
                        shrink: true,
                    }}
                    inputProps={{
                        min: new Date().toISOString().split("T")[0],
                    }}
                    aria-describedby={
                        errors.publishDate ? "publishDate-error" : undefined
                    }
                    aria-invalid={!!errors.publishDate}
                />
            </Grid>

            {/* Question Deadline */}
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    id="questionDeadline"
                    name="questionDeadline"
                    label="Spørsmålfrist"
                    type="date"
                    value={formData.questionDeadline || ""}
                    onChange={onChange}
                    disabled={loading}
                    error={!!errors.questionDeadline}
                    helperText={
                        errors.questionDeadline ||
                        "Frist for å stille spørsmål om anskaffelsen"
                    }
                    InputLabelProps={{
                        shrink: true,
                    }}
                    inputProps={{
                        min: formData.publishDate
                            ? new Date(formData.publishDate)
                                  .toISOString()
                                  .split("T")[0]
                            : new Date().toISOString().split("T")[0],
                        max: formData.deadline
                            ? new Date(formData.deadline)
                                  .toISOString()
                                  .split("T")[0]
                            : undefined,
                    }}
                    aria-describedby={
                        errors.questionDeadline
                            ? "questionDeadline-error"
                            : undefined
                    }
                    aria-invalid={!!errors.questionDeadline}
                />
            </Grid>

            {/* Submission Deadline */}
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    required
                    id="deadline"
                    name="deadline"
                    label="Tilbudsfrist"
                    type="date"
                    value={formData.deadline || ""}
                    onChange={onChange}
                    disabled={loading}
                    error={!!errors.deadline}
                    helperText={
                        errors.deadline || "Når skal tilbud sendes inn?"
                    }
                    InputLabelProps={{
                        shrink: true,
                    }}
                    inputProps={{
                        min:
                            formData.publishDate || formData.questionDeadline
                                ? new Date(
                                      formData.questionDeadline ||
                                          formData.publishDate
                                  )
                                      .toISOString()
                                      .split("T")[0]
                                : new Date().toISOString().split("T")[0],
                    }}
                    aria-describedby={
                        errors.deadline ? "deadline-error" : undefined
                    }
                    aria-invalid={!!errors.deadline}
                />
            </Grid>

            {/* Evaluation Criteria */}
            <Grid item xs={12}>
                <FormControl component="fieldset" fullWidth>
                    <FormLabel component="legend" sx={{ mb: 1 }}>
                        Evalueringskriterier
                    </FormLabel>
                    <FormGroup>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={
                                                formData.evaluationCriteria?.includes(
                                                    "pris"
                                                ) || false
                                            }
                                            onChange={handleCheckboxChange}
                                            name="evaluationCriteria"
                                            value="pris"
                                        />
                                    }
                                    label="Pris"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={
                                                formData.evaluationCriteria?.includes(
                                                    "kvalitet"
                                                ) || false
                                            }
                                            onChange={handleCheckboxChange}
                                            name="evaluationCriteria"
                                            value="kvalitet"
                                        />
                                    }
                                    label="Kvalitet"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={
                                                formData.evaluationCriteria?.includes(
                                                    "kompetanse"
                                                ) || false
                                            }
                                            onChange={handleCheckboxChange}
                                            name="evaluationCriteria"
                                            value="kompetanse"
                                        />
                                    }
                                    label="Kompetanse"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={
                                                formData.evaluationCriteria?.includes(
                                                    "gjennomføringsevne"
                                                ) || false
                                            }
                                            onChange={handleCheckboxChange}
                                            name="evaluationCriteria"
                                            value="gjennomføringsevne"
                                        />
                                    }
                                    label="Gjennomføringsevne"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={
                                                formData.evaluationCriteria?.includes(
                                                    "miljø"
                                                ) || false
                                            }
                                            onChange={handleCheckboxChange}
                                            name="evaluationCriteria"
                                            value="miljø"
                                        />
                                    }
                                    label="Miljø"
                                />
                            </Grid>
                        </Grid>
                    </FormGroup>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: "block" }}
                    >
                        Velg hvilke kriterier som skal brukes ved evaluering av
                        tilbud
                    </Typography>
                </FormControl>
            </Grid>

            {/* Status */}
            <Grid item xs={12}>
                <FormControl fullWidth>
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                        labelId="status-label"
                        id="status"
                        name="status"
                        value={formData.status || "draft"}
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

