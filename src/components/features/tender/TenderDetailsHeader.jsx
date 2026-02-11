import { Box, Typography, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { StatusChip } from "../../common";

const TenderDetailsHeader = ({
    tender,
    isSender,
    isAdmin,
    awardActions,
    onDeleteClick,
}) => {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 4,
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
            }}
        >
            <Box sx={{ flex: 1 }}>
                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                        fontSize: {
                            xs: "1.75rem",
                            sm: "2rem",
                            md: "2.5rem",
                        },
                        fontWeight: 600,
                        mb: 1,
                    }}
                >
                    {tender.title}
                </Typography>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        flexWrap: "wrap",
                    }}
                >
                    <StatusChip status={tender.status} size="medium" />
                    {isSender && tender.status === "draft" && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={awardActions.handlePublishClick}
                            disabled={awardActions.changingStatus}
                            sx={{ mt: { xs: 1, sm: 0 } }}
                        >
                            Publiser Anskaffelse
                        </Button>
                    )}
                    {isSender && tender.status === "open" && (
                        <Button
                            variant="outlined"
                            color="warning"
                            onClick={awardActions.handleCloseClick}
                            disabled={awardActions.changingStatus}
                            sx={{ mt: { xs: 1, sm: 0 } }}
                        >
                            Lukk Anskaffelse
                        </Button>
                    )}
                    {isSender && tender.status === "closed" && (
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={awardActions.handleReopenClick}
                            disabled={awardActions.changingStatus}
                            sx={{ mt: { xs: 1, sm: 0 } }}
                        >
                            Gjenåpne
                        </Button>
                    )}
                    {(isSender || isAdmin) && (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={onDeleteClick}
                            disabled={awardActions.deletingTender}
                            sx={{ mt: { xs: 1, sm: 0 } }}
                        >
                            Slett Anskaffelse
                        </Button>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export { TenderDetailsHeader };

