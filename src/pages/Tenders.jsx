import {
    Box,
    Typography,
    Button,
    Paper,
    Grid,
    Card,
    CardContent,
    Skeleton,
    Snackbar,
    Alert,
    useTheme,
    useMediaQuery,
    alpha,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import DescriptionIcon from "@mui/icons-material/Description";
import { useAuth } from "../contexts/AuthContext";
import { useTendersPage } from "../hooks/useTendersPage";
import {
    TendersHeader,
    TenderCardView,
    TenderTableView,
    TenderDeleteDialog,
} from "../components/features/tender";

const Tenders = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const {
        tenders,
        filteredAndSortedTenders,
        projectCache,
        loading,
        refreshing,
        canDelete,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        projectFilter,
        setProjectFilter,
        handleRefresh,
        handleDeleteClick,
        handleDeleteConfirm,
        handleDeleteCancel,
        deleteDialogOpen,
        tenderToDelete,
        deleting,
        successMessage,
        showSuccessSnackbar,
        setShowSuccessSnackbar,
        errorMessage,
        showErrorSnackbar,
        setShowErrorSnackbar,
    } = useTendersPage();

    const handleViewTender = (tenderId) => {
        navigate(`/tenders/${tenderId}`);
    };

    const handleResetFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setProjectFilter("all");
    };

    return (
        <Box>
            <TendersHeader
                loading={loading}
                refreshing={refreshing}
                filteredCount={filteredAndSortedTenders.length}
                totalCount={tenders.length}
                onRefresh={handleRefresh}
                filteredTenders={filteredAndSortedTenders}
                projectCache={projectCache}
                userRole={user?.role}
            />

            {loading ? (
                <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Grid item xs={12} key={index}>
                            <Card elevation={0}>
                                <CardContent>
                                    <Skeleton
                                        variant="text"
                                        width="60%"
                                        height={32}
                                        sx={{ mb: 2 }}
                                    />
                                    <Skeleton
                                        variant="text"
                                        width="100%"
                                        height={20}
                                        sx={{ mb: 1 }}
                                    />
                                    <Skeleton
                                        variant="text"
                                        width="80%"
                                        height={20}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : filteredAndSortedTenders.length > 0 || tenders.length > 0 ? (
                isMobile ? (
                    <TenderCardView
                        tenders={filteredAndSortedTenders}
                        projectCache={projectCache}
                        canDelete={canDelete}
                        onViewTender={handleViewTender}
                        onDeleteClick={handleDeleteClick}
                    />
                ) : (
                    <TenderTableView
                        tenders={filteredAndSortedTenders}
                        projectCache={projectCache}
                        canDelete={canDelete}
                        searchQuery={searchQuery}
                        statusFilter={statusFilter}
                        projectFilter={projectFilter}
                        onViewTender={handleViewTender}
                        onDeleteClick={handleDeleteClick}
                        onResetFilters={handleResetFilters}
                    />
                )
            ) : (
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 4, sm: 6 },
                        textAlign: "center",
                        borderRadius: 2,
                    }}
                >
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            backgroundColor: alpha(
                                theme.palette.primary.main,
                                0.1
                            ),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mx: "auto",
                            mb: 3,
                        }}
                    >
                        <DescriptionIcon
                            sx={{
                                fontSize: 40,
                                color: "primary.main",
                            }}
                        />
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                        Ingen Anskaffelse ennå
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3, maxWidth: 400, mx: "auto" }}
                    >
                        {user?.role === "sender"
                            ? "Opprett ditt første Anskaffelse for å komme i gang."
                            : "Du har ikke tilgang til noen Anskaffelse ennå."}
                    </Typography>
                    {user?.role === "sender" && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate("/tenders/create")}
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                px: 3,
                                fontSize: {
                                    xs: "1rem",
                                    sm: "0.875rem",
                                },
                            }}
                        >
                            Opprett nytt Anskaffelse
                        </Button>
                    )}
                </Paper>
            )}

            <TenderDeleteDialog
                open={deleteDialogOpen}
                tender={tenderToDelete}
                deleting={deleting}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />

            {/* Success Snackbar */}
            <Snackbar
                open={showSuccessSnackbar}
                autoHideDuration={4000}
                onClose={() => setShowSuccessSnackbar(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setShowSuccessSnackbar(false)}
                    severity="success"
                >
                    {successMessage}
                </Alert>
            </Snackbar>

            {/* Error Snackbar */}
            <Snackbar
                open={showErrorSnackbar}
                autoHideDuration={6000}
                onClose={() => setShowErrorSnackbar(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setShowErrorSnackbar(false)}
                    severity="error"
                >
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Tenders;
