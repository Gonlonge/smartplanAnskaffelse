import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    useTheme,
    useMediaQuery,
    Card,
    CardContent,
    Grid,
} from "@mui/material";
import { DateDisplay } from "../../common";
import { PRICE_STRUCTURE_TYPES } from "../../../constants";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useState, useMemo } from "react";
import PropTypes from "prop-types";

/**
 * BidComparison Component
 * Displays bids in a comparison table/cards for easy evaluation
 */
export const BidComparison = ({
    bids = [],
    onAward,
    awardedBidId = null,
    disabled = false,
    currentUserId = null, // For access control - suppliers can only see their own notes
    isSender = false, // Sender/admin can see all notes
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [selectedBid, setSelectedBid] = useState(awardedBidId);

    const handleAward = (bidId) => {
        if (onAward && !disabled) {
            setSelectedBid(bidId);
            onAward(bidId);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("no-NO", {
            style: "currency",
            currency: "NOK",
        }).format(price);
    };

    const getPriceStructureLabel = (type) => {
        const found = PRICE_STRUCTURE_TYPES.find((t) => t.value === type);
        return found ? found.label : type;
    };

    // Sort bids by price (lowest first) - memoized to prevent recalculation on every render
    const sortedBids = useMemo(() => {
        if (bids.length === 0) return [];
        return [...bids].sort((a, b) => a.price - b.price);
    }, [bids]);

    if (bids.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="body1" color="text.secondary">
                    Ingen tilbud ennå
                </Typography>
            </Paper>
        );
    }

    // Mobile Card View
    const CardView = () => (
        <Grid container spacing={2}>
            {sortedBids.map((bid, index) => (
                <Grid item xs={12} key={bid.id}>
                    <Card
                        variant={
                            selectedBid === bid.id ? "outlined" : "elevation"
                        }
                        sx={{
                            border:
                                selectedBid === bid.id
                                    ? `2px solid ${theme.palette.primary.main}`
                                    : "none",
                        }}
                    >
                        <CardContent>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    mb: 2,
                                    flexWrap: "wrap",
                                    gap: 1,
                                }}
                            >
                                <Typography variant="h6">
                                    {bid.companyName}
                                </Typography>
                                {selectedBid === bid.id && (
                                    <Chip
                                        icon={<CheckCircleIcon />}
                                        label="Tildelt"
                                        color="success"
                                        size="small"
                                    />
                                )}
                                {index === 0 && selectedBid !== bid.id && (
                                    <Chip
                                        label="Lavest pris"
                                        color="info"
                                        size="small"
                                    />
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
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Totalpris
                                    </Typography>
                                    <Typography variant="h6" color="primary">
                                        {formatPrice(bid.price)}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Prisstruktur
                                    </Typography>
                                    <Typography variant="body1">
                                        {getPriceStructureLabel(
                                            bid.priceStructure
                                        )}
                                    </Typography>
                                </Box>

                                {bid.priceStructure === "timepris" && (
                                    <>
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Timepris
                                            </Typography>
                                            <Typography variant="body1">
                                                {bid.hourlyRate
                                                    ? formatPrice(
                                                          bid.hourlyRate
                                                      )
                                                    : "N/A"}{" "}
                                                / time
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Estimert timer
                                            </Typography>
                                            <Typography variant="body1">
                                                {bid.estimatedHours || "N/A"}
                                            </Typography>
                                        </Box>
                                    </>
                                )}

                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Sendt inn
                                    </Typography>
                                    <DateDisplay date={bid.submittedAt} />
                                </Box>

                                {bid.documents && bid.documents.length > 0 && (
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Dokumenter
                                        </Typography>
                                        <Typography variant="body1">
                                            {bid.documents.length} fil(er)
                                        </Typography>
                                    </Box>
                                )}

                                {bid.score !== null && (
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Score
                                        </Typography>
                                        <Typography variant="body1">
                                            {bid.score} / 100
                                        </Typography>
                                    </Box>
                                )}

                                {bid.notes &&
                                    (isSender ||
                                        bid.supplierId === currentUserId) && (
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Notater
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    mt: 0.5,
                                                    p: 1,
                                                    backgroundColor:
                                                        theme.palette.grey[50],
                                                    borderRadius: 1,
                                                    whiteSpace: "pre-wrap",
                                                }}
                                            >
                                                {bid.notes}
                                            </Typography>
                                        </Box>
                                    )}
                            </Box>

                            {!disabled && selectedBid !== bid.id && (
                                <Box sx={{ mt: 2 }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        onClick={() => handleAward(bid.id)}
                                        sx={{
                                            fontSize: {
                                                xs: "1rem",
                                                sm: "0.875rem",
                                            },
                                        }}
                                    >
                                        Tildel kontrakt
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );

    // Desktop Table View
    const TableView = () => (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Leverandør</TableCell>
                        <TableCell align="right">Totalpris</TableCell>
                        <TableCell>Prisstruktur</TableCell>
                        {sortedBids.some(
                            (b) => b.priceStructure === "timepris"
                        ) && (
                            <>
                                <TableCell align="right">Timepris</TableCell>
                                <TableCell align="right">Timer</TableCell>
                            </>
                        )}
                        <TableCell>Sendt inn</TableCell>
                        <TableCell>Dokumenter</TableCell>
                        {sortedBids.some((b) => b.score !== null) && (
                            <TableCell align="right">Score</TableCell>
                        )}
                        {(isSender ||
                            sortedBids.some(
                                (b) => b.notes && b.supplierId === currentUserId
                            )) && <TableCell>Notater</TableCell>}
                        <TableCell align="right">Handling</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedBids.map((bid, index) => (
                        <TableRow
                            key={bid.id}
                            hover
                            sx={{
                                backgroundColor:
                                    selectedBid === bid.id
                                        ? theme.palette.action.selected
                                        : index === 0 && selectedBid !== bid.id
                                        ? theme.palette.action.hover
                                        : "transparent",
                            }}
                        >
                            <TableCell>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                >
                                    <Typography variant="subtitle2">
                                        {bid.companyName}
                                    </Typography>
                                    {selectedBid === bid.id && (
                                        <CheckCircleIcon
                                            color="success"
                                            fontSize="small"
                                        />
                                    )}
                                    {index === 0 && selectedBid !== bid.id && (
                                        <Chip
                                            label="Lavest"
                                            color="info"
                                            size="small"
                                        />
                                    )}
                                </Box>
                            </TableCell>
                            <TableCell align="right">
                                <Typography
                                    variant="subtitle2"
                                    color="primary"
                                    fontWeight="bold"
                                >
                                    {formatPrice(bid.price)}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                {getPriceStructureLabel(bid.priceStructure)}
                            </TableCell>
                            {sortedBids.some(
                                (b) => b.priceStructure === "timepris"
                            ) && (
                                <>
                                    <TableCell align="right">
                                        {bid.hourlyRate
                                            ? formatPrice(bid.hourlyRate)
                                            : "N/A"}
                                    </TableCell>
                                    <TableCell align="right">
                                        {bid.estimatedHours || "N/A"}
                                    </TableCell>
                                </>
                            )}
                            <TableCell>
                                <DateDisplay date={bid.submittedAt} />
                            </TableCell>
                            <TableCell>
                                {bid.documents?.length || 0} fil(er)
                            </TableCell>
                            {sortedBids.some((b) => b.score !== null) && (
                                <TableCell align="right">
                                    {bid.score !== null
                                        ? `${bid.score}/100`
                                        : "-"}
                                </TableCell>
                            )}
                            {(isSender ||
                                sortedBids.some(
                                    (b) =>
                                        b.notes &&
                                        b.supplierId === currentUserId
                                )) && (
                                <TableCell>
                                    {bid.notes &&
                                    (isSender ||
                                        bid.supplierId === currentUserId) ? (
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                maxWidth: 200,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                            title={bid.notes}
                                        >
                                            {bid.notes}
                                        </Typography>
                                    ) : (
                                        "-"
                                    )}
                                </TableCell>
                            )}
                            <TableCell align="right">
                                {!disabled && selectedBid !== bid.id ? (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        onClick={() => handleAward(bid.id)}
                                        sx={{
                                            fontSize: {
                                                xs: "1rem",
                                                sm: "0.875rem",
                                            },
                                        }}
                                    >
                                        Tildel
                                    </Button>
                                ) : selectedBid === bid.id ? (
                                    <Chip
                                        label="Tildelt"
                                        color="success"
                                        size="small"
                                    />
                                ) : null}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    return (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <Typography variant="h6">
                    Tilbudssammenligning ({bids.length})
                </Typography>
            </Box>
            {isMobile ? <CardView /> : <TableView />}
        </Box>
    );
};

BidComparison.propTypes = {
    bids: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            companyName: PropTypes.string.isRequired,
            price: PropTypes.number.isRequired,
            priceStructure: PropTypes.string,
            hourlyRate: PropTypes.number,
            estimatedHours: PropTypes.number,
            submittedAt: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.instanceOf(Date),
            ]),
            documents: PropTypes.array,
            score: PropTypes.number,
            notes: PropTypes.string,
            supplierId: PropTypes.string,
        })
    ),
    onAward: PropTypes.func,
    awardedBidId: PropTypes.string,
    disabled: PropTypes.bool,
    currentUserId: PropTypes.string,
    isSender: PropTypes.bool,
};
