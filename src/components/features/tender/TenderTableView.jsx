import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    useTheme,
    alpha,
    IconButton,
    Tooltip,
} from "@mui/material";
import { StatusChip, DateDisplay } from "../../common";
import DescriptionIcon from "@mui/icons-material/Description";
import FolderIcon from "@mui/icons-material/Folder";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DeleteIcon from "@mui/icons-material/Delete";
import PropTypes from "prop-types";

/**
 * Table view component for displaying tenders on desktop devices
 */
export const TenderTableView = ({
    tenders,
    projectCache,
    canDelete,
    searchQuery,
    statusFilter,
    projectFilter,
    onViewTender,
    onDeleteClick,
    onResetFilters,
}) => {
    const theme = useTheme();

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{ borderRadius: 2 }}
        >
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Tittel</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Prosjekt</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                            Kontraktstandard
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Frist</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Tilbud</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {canDelete ? "Handlinger" : ""}
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tenders.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={7}
                                align="center"
                                sx={{ py: 4 }}
                            >
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                >
                                    Ingen Anskaffelser funnet
                                </Typography>
                                {(searchQuery ||
                                    statusFilter !== "all" ||
                                    projectFilter !== "all") && (
                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={onResetFilters}
                                        sx={{
                                            mt: 1,
                                            textTransform: "none",
                                            fontSize: {
                                                xs: "1rem",
                                                sm: "0.875rem",
                                            },
                                        }}
                                    >
                                        Nullstill filtre
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ) : (
                        tenders.map((tender) => {
                            const project = projectCache[tender.projectId];
                            return (
                                <TableRow
                                    key={tender.id}
                                    hover
                                    sx={{
                                        cursor: "pointer",
                                        "&:hover": {
                                            backgroundColor: alpha(
                                                theme.palette.primary.main,
                                                0.04
                                            ),
                                        },
                                    }}
                                    onClick={() => onViewTender(tender.id)}
                                >
                                    <TableCell>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{ fontWeight: 600 }}
                                        >
                                            {tender.title}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mt: 0.5 }}
                                        >
                                            {tender.description ||
                                                "Ingen beskrivelse"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                            }}
                                        >
                                            <FolderIcon
                                                sx={{
                                                    fontSize: 16,
                                                    color: "text.secondary",
                                                }}
                                            />
                                            {project?.name || "Ukjent"}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                            }}
                                        >
                                            <DescriptionIcon
                                                sx={{
                                                    fontSize: 16,
                                                    color: "text.secondary",
                                                }}
                                            />
                                            {tender.contractStandard}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                            }}
                                        >
                                            <CalendarTodayIcon
                                                sx={{
                                                    fontSize: 16,
                                                    color: "text.secondary",
                                                }}
                                            />
                                            <DateDisplay
                                                date={tender.deadline}
                                            />
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <StatusChip status={tender.status} />
                                    </TableCell>
                                    <TableCell>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                            }}
                                        >
                                            <AttachMoneyIcon
                                                sx={{
                                                    fontSize: 16,
                                                    color: "text.secondary",
                                                }}
                                            />
                                            {tender.bids?.length || 0}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box
                                            sx={{
                                                display: "flex",
                                                gap: 1,
                                                justifyContent: "flex-end",
                                            }}
                                        >
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onViewTender(tender.id);
                                                }}
                                                sx={{
                                                    textTransform: "none",
                                                    fontWeight: 500,
                                                    fontSize: {
                                                        xs: "1rem",
                                                        sm: "0.875rem",
                                                    },
                                                }}
                                            >
                                                Se detaljer
                                            </Button>
                                            {canDelete && (
                                                <Tooltip title="Slett Anskaffelse">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeleteClick(
                                                                tender,
                                                                e
                                                            );
                                                        }}
                                                        sx={{
                                                            color: "error.main",
                                                            "&:hover": {
                                                                backgroundColor:
                                                                    alpha(
                                                                        theme
                                                                            .palette
                                                                            .error
                                                                            .main,
                                                                        0.1
                                                                    ),
                                                            },
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

TenderTableView.propTypes = {
    tenders: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            description: PropTypes.string,
            projectId: PropTypes.string.isRequired,
            contractStandard: PropTypes.string.isRequired,
            deadline: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.instanceOf(Date),
            ]).isRequired,
            status: PropTypes.string.isRequired,
            bids: PropTypes.array,
        })
    ).isRequired,
    projectCache: PropTypes.object.isRequired,
    canDelete: PropTypes.bool,
    searchQuery: PropTypes.string,
    statusFilter: PropTypes.string,
    projectFilter: PropTypes.string,
    onViewTender: PropTypes.func.isRequired,
    onDeleteClick: PropTypes.func.isRequired,
    onResetFilters: PropTypes.func.isRequired,
};

