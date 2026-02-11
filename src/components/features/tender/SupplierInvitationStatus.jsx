import {
    Box,
    Typography,
    Paper,
    Button,
    Chip,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SendIcon from "@mui/icons-material/Send";
import { DateDisplay } from "../../common";
import PropTypes from "prop-types";

export const SupplierInvitationStatus = ({
    userInvitation,
    userBid,
    tender,
    tenderId,
    onNavigateToBid,
}) => {
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
                    justifyContent: "space-between",
                    mb: 2,
                    flexWrap: "wrap",
                    gap: 2,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    <PersonIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Din invitasjon
                    </Typography>
                </Box>
                {!userBid &&
                    new Date(tender.deadline) >= new Date() && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SendIcon />}
                            onClick={() => onNavigateToBid(tenderId)}
                        >
                            Send inn tilbud
                        </Button>
                    )}
                {userBid && (
                    <Chip label="Tilbud sendt inn" color="success" />
                )}
            </Box>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                }}
            >
                <Box>
                    <Typography variant="body2" color="text.secondary">
                        Status
                    </Typography>
                    <Chip
                        label={userInvitation.status || "invited"}
                        size="small"
                        color={
                            userInvitation.status === "submitted"
                                ? "success"
                                : userInvitation.status === "viewed"
                                ? "info"
                                : "default"
                        }
                        sx={{ mt: 0.5 }}
                    />
                </Box>
                {userInvitation.invitedAt && (
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Invitert
                        </Typography>
                        <DateDisplay
                            date={userInvitation.invitedAt}
                            variant="body1"
                        />
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

SupplierInvitationStatus.propTypes = {
    userInvitation: PropTypes.shape({
        status: PropTypes.string,
        invitedAt: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.instanceOf(Date),
        ]),
    }).isRequired,
    userBid: PropTypes.object,
    tender: PropTypes.shape({
        deadline: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.instanceOf(Date),
        ]).isRequired,
    }).isRequired,
    tenderId: PropTypes.string.isRequired,
    onNavigateToBid: PropTypes.func.isRequired,
};

