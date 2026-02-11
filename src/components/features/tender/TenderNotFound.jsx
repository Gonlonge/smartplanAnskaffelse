import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

/**
 * Not found state for TenderDetails page
 */
export const TenderNotFound = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{ textAlign: "center", py: 8 }}
            role="alert"
            aria-live="polite"
        >
            <Typography
                variant="h5"
                color="text.secondary"
                gutterBottom
            >
                Anskaffelse ikke funnet
            </Typography>
            <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3 }}
            >
                Anskaffelsen du leter etter eksisterer ikke eller har
                blitt slettet.
            </Typography>
            <Button
                variant="contained"
                onClick={() => navigate("/tenders")}
                startIcon={<ArrowBackIcon aria-hidden="true" />}
                aria-label="Gå tilbake til anskaffelser"
            >
                Tilbake til anskaffelser
            </Button>
        </Box>
    );
};

export default TenderNotFound;

