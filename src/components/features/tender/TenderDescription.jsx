import { Box, Typography, Paper } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";

const TenderDescription = ({ description }) => {
    return (
        <Paper
            elevation={0}
            sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 2 }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                }}
            >
                <DescriptionIcon sx={{ color: "primary.main" }} />
                <Typography
                    component="h2"
                    variant="h6"
                    sx={{ fontWeight: 600 }}
                >
                    Beskrivelse
                </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
                {description || "Ingen beskrivelse tilgjengelig"}
            </Typography>
        </Paper>
    );
};

export { TenderDescription };






