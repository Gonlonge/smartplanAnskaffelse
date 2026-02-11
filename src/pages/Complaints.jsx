import { Box, Typography } from "@mui/material";

/**
 * Complaints Page
 */
const Complaints = () => {
    return (
        <Box>
            <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                    fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
                    mb: 2,
                }}
            >
                Klager
            </Typography>
        </Box>
    );
};

export default Complaints;
