import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { COMPLIANCE_ITEMS } from "../../../constants/complianceData";

/**
 * Compliance Checklist Component
 * Displays compliance status against MD documentation files
 */
export const ComplianceChecklist = () => {
    return (
        <>
            <Typography
                variant="h5"
                component="h2"
                sx={{ mb: 2, fontWeight: 600 }}
            >
                Compliance Sjekkliste
            </Typography>
            <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 4 }}>
                {COMPLIANCE_ITEMS.map((item) => (
                    <Grid item xs={12} md={6} key={item.category}>
                        <Card>
                            <CardContent>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        mb: 2,
                                    }}
                                >
                                    <Typography variant="h6">
                                        {item.category}
                                    </Typography>
                                    <Chip
                                        icon={<CheckCircleIcon />}
                                        label="Fullført"
                                        color="success"
                                        size="small"
                                    />
                                </Box>
                                <List dense>
                                    {item.items.map((listItem, index) => (
                                        <ListItem
                                            key={index}
                                            sx={{ px: 0, py: 0.5 }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 32 }}>
                                                <CheckCircleIcon
                                                    color="success"
                                                    fontSize="small"
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={listItem}
                                                primaryTypographyProps={{
                                                    variant: "body2",
                                                }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </>
    );
};






