import { useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Button,
    Grid,
    TextField,
    Alert,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { createProject } from "../api/projectService";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";

const ProjectCreate = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "active",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear errors when user starts typing
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Validate form
        if (!formData.name || !formData.name.trim()) {
            setError("Prosjektnavn er påkrevd");
            setLoading(false);
            return;
        }

        try {
            // Create the project
            const result = await createProject(formData, user);

            setLoading(false);

            if (!result.success) {
                setError(result.error || "Kunne ikke opprette prosjekt");
                return;
            }

            setSuccess(true);

            // Navigate to the projects page after a short delay
            setTimeout(() => {
                navigate("/projects");
            }, 1500);
        } catch (err) {
            console.error("Error creating project:", err);
            setError("En uventet feil oppstod. Prøv igjen.");
            setLoading(false);
        }
    };

    return (
        <Box>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/projects")}
                    sx={{ mb: 3 }}
                >
                    Tilbake
                </Button>

                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                        fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
                        mb: 4,
                    }}
                >
                    Opprett nytt prosjekt
                </Typography>

                <Paper sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            Prosjekt opprettet! Du blir omdirigert...
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
                            {/* Project Name */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    required
                                    id="name"
                                    name="name"
                                    label="Prosjektnavn"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={loading}
                                    autoFocus
                                    helperText="Gi prosjektet et beskrivende navn"
                                    sx={{
                                        "& .MuiInputBase-input": {
                                            fontSize: {
                                                xs: "1rem", // 16px minimum on mobile
                                                sm: "1rem",
                                            },
                                        },
                                    }}
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
                                    onChange={handleChange}
                                    disabled={loading}
                                    multiline
                                    rows={4}
                                    helperText="Beskriv prosjektet (valgfritt)"
                                    sx={{
                                        "& .MuiInputBase-input": {
                                            fontSize: {
                                                xs: "1rem", // 16px minimum on mobile
                                                sm: "1rem",
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Action Buttons */}
                            <Grid item xs={12}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 2,
                                        justifyContent: {
                                            xs: "stretch",
                                            sm: "flex-end",
                                        },
                                        flexDirection: {
                                            xs: "column",
                                            sm: "row",
                                        },
                                        mt: { xs: 2, sm: 3 },
                                    }}
                                >
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate("/projects")}
                                        disabled={loading}
                                        fullWidth={isMobile}
                                        sx={{
                                            fontSize: {
                                                xs: "1rem",
                                                sm: "0.875rem",
                                            },
                                        }}
                                    >
                                        Avbryt
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        startIcon={<SaveIcon />}
                                        disabled={loading}
                                        fullWidth={isMobile}
                                        aria-busy={loading}
                                        sx={{
                                            fontSize: {
                                                xs: "1rem",
                                                sm: "0.875rem",
                                            },
                                        }}
                                    >
                                        {loading ? "Oppretter..." : "Opprett prosjekt"}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Box>
    );
};

export default ProjectCreate;

