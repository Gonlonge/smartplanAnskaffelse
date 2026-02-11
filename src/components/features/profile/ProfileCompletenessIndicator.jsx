import { useMemo } from "react";
import {
    Box,
    Typography,
    LinearProgress,
    Alert,
    AlertTitle,
    Chip,
    useTheme,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";

const ProfileCompletenessIndicator = ({ user }) => {
    const theme = useTheme();

    // Calculate profile completeness
    const completeness = useMemo(() => {
        if (!user) return { percentage: 0, missingFields: [] };

        const fields = {
            companyName: user.companyName,
            orgNumber: user.orgNumber,
            city: user.city,
            bio: user.bio,
            industryCodes: user.industryCodes && user.industryCodes.length > 0,
        };

        const totalFields = Object.keys(fields).length;
        const completedFields = Object.values(fields).filter(Boolean).length;
        const percentage = Math.round((completedFields / totalFields) * 100);

        const missingFields = [];
        if (!fields.companyName) missingFields.push("Firmanavn");
        if (!fields.orgNumber) missingFields.push("Organisasjonsnummer");
        if (!fields.city) missingFields.push("By/Sted");
        if (!fields.bio) missingFields.push("Beskrivelse av virksomheten");
        if (!fields.industryCodes)
            missingFields.push("Næringskoder (fra BrREG)");

        return { percentage, missingFields, completedFields, totalFields };
    }, [user]);

    // Don't show if profile is complete
    if (completeness.percentage === 100) {
        return null;
    }

    const getProgressColor = () => {
        if (completeness.percentage >= 80) return "success";
        if (completeness.percentage >= 50) return "warning";
        return "error";
    };

    return (
        <Alert
            severity={completeness.percentage >= 50 ? "info" : "warning"}
            icon={<InfoIcon />}
            sx={{
                mb: 3,
                "& .MuiAlert-message": {
                    width: "100%",
                },
            }}
            role="alert"
        >
            <AlertTitle sx={{ fontWeight: 600, mb: 1 }}>
                Fullfør profilen din for bedre synlighet
            </AlertTitle>

            <Box sx={{ mb: 2 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        Profilfullføring: {completeness.percentage}%
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 600,
                            color: theme.palette[getProgressColor()].main,
                        }}
                    >
                        {completeness.completedFields} av{" "}
                        {completeness.totalFields} felt utfylt
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={completeness.percentage}
                    color={getProgressColor()}
                    sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: theme.palette.grey[200],
                    }}
                />
            </Box>

            <Typography variant="body2" sx={{ mb: 2 }}>
                <Box
                    component="span"
                    sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        mr: 1,
                    }}
                >
                    <SearchIcon fontSize="small" />
                </Box>
                En mer komplett profil gjør at du er lettere å finne når
                anskaffere søker etter leverandører. Legg til:
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    mb: 2,
                }}
            >
                {completeness.missingFields.map((field) => (
                    <Chip
                        key={field}
                        label={field}
                        size="small"
                        icon={<CheckCircleIcon />}
                        sx={{
                            "& .MuiChip-icon": {
                                color: "text.secondary",
                            },
                        }}
                    />
                ))}
            </Box>
        </Alert>
    );
};

export default ProfileCompletenessIndicator;

