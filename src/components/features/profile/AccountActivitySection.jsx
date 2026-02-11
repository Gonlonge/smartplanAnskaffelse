import {
    Box,
    Typography,
    Card,
    CardContent,
    useTheme,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";

const AccountActivitySection = ({ user }) => {
    const theme = useTheme();

    return (
        <Card
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <CardContent>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 3,
                    }}
                >
                    <HistoryIcon
                        sx={{
                            mr: 1.5,
                            color: theme.palette.primary.main,
                            fontSize: 28,
                        }}
                    />
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                        Kontoinformasjon
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary">
                            Rolle
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {user?.role === "sender"
                                ? "Anskaffende"
                                : user?.role === "receiver"
                                ? "Leverandør"
                                : user?.role}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary">
                            E-postadresse
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {user?.email}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary">
                            Bruker-ID
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                fontFamily: "monospace",
                                fontSize: "0.75rem",
                                wordBreak: "break-all",
                            }}
                        >
                            {user?.id}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default AccountActivitySection;

