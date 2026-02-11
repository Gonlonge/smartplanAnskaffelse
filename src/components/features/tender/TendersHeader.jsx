import {
    Box,
    Typography,
    Button,
    IconButton,
    Tooltip,
    useTheme,
    alpha,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useNavigate } from "react-router-dom";
import { exportTendersToPDF, exportTendersToExcel } from "../../../utils";

/**
 * Header component for Tenders page
 * Displays title, count, and action buttons (refresh, export, create)
 */
export const TendersHeader = ({
    loading,
    refreshing,
    filteredCount,
    totalCount,
    onRefresh,
    filteredTenders,
    projectCache,
    userRole,
}) => {
    const navigate = useNavigate();
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                mb: 4,
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
            }}
        >
            <Box>
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        fontSize: {
                            xs: "1.75rem",
                            sm: "2rem",
                            md: "2.5rem",
                        },
                        fontWeight: 600,
                        mb: 0.5,
                    }}
                >
                    Anskaffelse
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {loading
                        ? "Laster..."
                        : `${filteredCount} av ${totalCount} ${
                              totalCount === 1 ? "anskaffelse" : "anskaffelser"
                          }`}
                </Typography>
            </Box>
            <Box
                sx={{
                    display: "flex",
                    gap: 2, // 16px - recommended comfortable spacing per BUTTONS.md and SPACING.md
                    alignItems: "center",
                    flexWrap: "wrap",
                }}
            >
                <Tooltip title="Oppdater">
                    <span>
                        <IconButton
                            onClick={onRefresh}
                            disabled={refreshing || loading}
                            aria-label="Oppdater"
                            sx={{
                                minHeight: { xs: 44, md: 36 },
                                minWidth: { xs: 44, md: 36 },
                                backgroundColor: alpha(
                                    theme.palette.primary.main,
                                    0.1
                                ),
                                "&:hover": {
                                    backgroundColor: alpha(
                                        theme.palette.primary.main,
                                        0.2
                                    ),
                                },
                            }}
                        >
                            <RefreshIcon
                                aria-hidden="true"
                                sx={{
                                    animation: refreshing
                                        ? "spin 1s linear infinite"
                                        : "none",
                                    "@keyframes spin": {
                                        "0%": { transform: "rotate(0deg)" },
                                        "100%": {
                                            transform: "rotate(360deg)",
                                        },
                                    },
                                }}
                            />
                        </IconButton>
                    </span>
                </Tooltip>
                {filteredTenders.length > 0 && (
                    <>
                        <Tooltip title="Eksporter til PDF">
                            <IconButton
                                onClick={() =>
                                    exportTendersToPDF(
                                        filteredTenders,
                                        projectCache
                                    )
                                }
                                disabled={loading}
                                aria-label="Eksporter til PDF"
                                sx={{
                                    minHeight: { xs: 44, md: 36 },
                                    minWidth: { xs: 44, md: 36 },
                                    backgroundColor: alpha(
                                        theme.palette.error.main,
                                        0.1
                                    ),
                                    "&:hover": {
                                        backgroundColor: alpha(
                                            theme.palette.error.main,
                                            0.2
                                        ),
                                    },
                                }}
                            >
                                <FileDownloadIcon
                                    sx={{ color: "error.main" }}
                                />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Eksporter til Excel">
                            <IconButton
                                onClick={() =>
                                    exportTendersToExcel(
                                        filteredTenders,
                                        projectCache
                                    )
                                }
                                disabled={loading}
                                aria-label="Eksporter til Excel"
                                sx={{
                                    minHeight: { xs: 44, md: 36 },
                                    minWidth: { xs: 44, md: 36 },
                                    backgroundColor: alpha(
                                        theme.palette.success.main,
                                        0.1
                                    ),
                                    "&:hover": {
                                        backgroundColor: alpha(
                                            theme.palette.success.main,
                                            0.2
                                        ),
                                    },
                                }}
                            >
                                <FileDownloadIcon
                                    sx={{ color: "success.main" }}
                                />
                            </IconButton>
                        </Tooltip>
                    </>
                )}
                {userRole === "sender" && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate("/tenders/create")}
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            minWidth: { xs: "100%", sm: "auto" },
                            fontSize: {
                                xs: "1rem",
                                sm: "0.875rem",
                            },
                        }}
                    >
                        Opprett nytt Anskaffelse
                    </Button>
                )}
            </Box>
        </Box>
    );
};

