import {
    Box,
    Typography,
    Paper,
    Chip,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import EmailIcon from "@mui/icons-material/Email";
import PropTypes from "prop-types";

export const InvitedSuppliersList = ({ invitedSuppliers }) => {
    if (!invitedSuppliers || invitedSuppliers.length === 0) {
        return null;
    }

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2, sm: 3 },
                mb: 3,
                borderRadius: 2,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                }}
            >
                <BusinessIcon sx={{ color: "primary.main" }} />
                <Typography component="h2" variant="h6" sx={{ fontWeight: 600 }}>
                    Inviterte leverandører
                </Typography>
                <Chip
                    label={invitedSuppliers.length}
                    size="small"
                    color="primary"
                />
            </Box>
            <List>
                {invitedSuppliers.map((supplier) => (
                    <ListItem
                        key={supplier.email || supplier.supplierId}
                    >
                        <ListItemText
                            primary={supplier.companyName}
                            secondary={
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                    }}
                                >
                                    <EmailIcon fontSize="small" />
                                    {supplier.email}
                                </Box>
                            }
                        />
                        <Chip
                            label={supplier.status || "invited"}
                            size="small"
                            color={
                                supplier.status === "submitted"
                                    ? "success"
                                    : supplier.status === "viewed"
                                    ? "info"
                                    : "default"
                            }
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

InvitedSuppliersList.propTypes = {
    invitedSuppliers: PropTypes.arrayOf(
        PropTypes.shape({
            email: PropTypes.string,
            supplierId: PropTypes.string,
            companyName: PropTypes.string,
            status: PropTypes.string,
        })
    ),
};

