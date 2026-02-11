import {
    Box,
    Typography,
    Grid,
    Paper,
} from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import { CODE_EXAMPLES } from "../../../constants/complianceData";

/**
 * Code Examples Component
 * Displays code examples from compliance data
 */
export const CodeExamples = () => {
    return (
        <>
            <Typography
                variant="h5"
                component="h2"
                sx={{ mb: 2, fontWeight: 600 }}
            >
                <CodeIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Kodeeksempler
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {CODE_EXAMPLES.map((example, index) => (
                    <Grid item xs={12} md={6} key={index}>
                        <Paper sx={{ p: 2 }}>
                            <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 600, mb: 1 }}
                            >
                                {example.title}
                            </Typography>
                            <Box
                                component="pre"
                                sx={{
                                    backgroundColor: "grey.100",
                                    p: 2,
                                    borderRadius: 1,
                                    overflow: "auto",
                                    fontSize: "0.75rem",
                                    m: 0,
                                }}
                            >
                                <code>{example.code}</code>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </>
    );
};






