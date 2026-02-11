import { Box, Typography, Button } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { BidComparison } from "./BidComparison";
import {
    exportBidComparisonToPDF,
    exportBidComparisonToExcel,
} from "../../../utils";
import PropTypes from "prop-types";

export const TenderBidsSection = ({
    tender,
    project,
    onAward,
    awardedBidId,
    awarding,
}) => {
    if (!tender.bids || tender.bids.length === 0) {
        return null;
    }

    return (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                    flexWrap: "wrap",
                    gap: 2,
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Tilbudssammenligning
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<FileDownloadIcon />}
                        onClick={() =>
                            exportBidComparisonToPDF(
                                tender,
                                tender.bids,
                                project
                            )
                        }
                        sx={{
                            textTransform: "none",
                            fontSize: {
                                xs: "1rem",
                                sm: "0.875rem",
                            },
                        }}
                    >
                        PDF
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<FileDownloadIcon />}
                        onClick={() =>
                            exportBidComparisonToExcel(
                                tender,
                                tender.bids,
                                project
                            )
                        }
                        sx={{
                            textTransform: "none",
                            fontSize: {
                                xs: "1rem",
                                sm: "0.875rem",
                            },
                        }}
                    >
                        Excel
                    </Button>
                </Box>
            </Box>
            <BidComparison
                bids={tender.bids}
                onAward={onAward}
                awardedBidId={awardedBidId}
                awarding={awarding}
            />
        </Box>
    );
};

TenderBidsSection.propTypes = {
    tender: PropTypes.shape({
        bids: PropTypes.array,
    }).isRequired,
    project: PropTypes.object,
    onAward: PropTypes.func,
    awardedBidId: PropTypes.string,
    awarding: PropTypes.bool,
};

