import { Box, Paper, Typography, Button } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import BusinessIcon from "@mui/icons-material/Business";
import { DateDisplay } from "../../common";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

/**
 * Helper function to format company information
 * Priority: org number first, then company name
 */
const formatCompanyInfo = (companyName, orgNumber) => {
    const name = companyName || "Ukjent firma";
    if (orgNumber) {
        return `${name} (Org.nr: ${orgNumber})`;
    }
    return name;
};

/**
 * Tender information sidebar showing key details
 */
export const TenderInfoSidebar = ({
    tender,
    project,
    createdByUser,
    contract,
    isSender,
    isAdmin,
}) => {
    const navigate = useNavigate();

    // Get awarded supplier information
    const awardedBid = tender?.awardedBidId
        ? tender.bids?.find((bid) => bid.id === tender.awardedBidId)
        : null;

    // Get supplier info from awarded bid or invited suppliers
    const getSupplierInfo = () => {
        if (awardedBid) {
            // Try to find supplier info from invitedSuppliers first (has orgNumber)
            const supplierInvitation = tender.invitedSuppliers?.find(
                (inv) =>
                    inv.supplierId === awardedBid.supplierId ||
                    inv.companyId === awardedBid.companyId
            );

            if (supplierInvitation) {
                return {
                    companyName:
                        supplierInvitation.companyName ||
                        awardedBid.companyName,
                    orgNumber: supplierInvitation.orgNumber,
                    email: supplierInvitation.email,
                };
            }

            // Fallback to bid info
            return {
                companyName: awardedBid.companyName,
                orgNumber: null,
                email: null,
            };
        }
        return null;
    };

    const supplierInfo = getSupplierInfo();

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
                position: { md: "sticky" },
                top: { md: 24 },
            }}
        >
            <Typography
                component="h2"
                variant="h6"
                sx={{
                    fontWeight: 600,
                    mb: 3,
                }}
            >
                Informasjon
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                }}
            >
                {/* Company Information - TOP */}
                {createdByUser && (
                    <Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                        >
                            Firmanavn
                        </Typography>
                        <Typography variant="body1">
                            {formatCompanyInfo(
                                createdByUser.companyName,
                                createdByUser.orgNumber
                            )}
                        </Typography>
                    </Box>
                )}

                {supplierInfo && (
                    <Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                        >
                            Leverandør
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                            }}
                        >
                            <BusinessIcon fontSize="small" color="primary" />
                            <Typography variant="body1">
                                {formatCompanyInfo(
                                    supplierInfo.companyName,
                                    supplierInfo.orgNumber
                                )}
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* Project and Contract Information - MIDDLE */}
                <Box>
                    <Typography variant="body2" color="text.secondary">
                        Prosjekt
                    </Typography>
                    <Typography variant="body1">
                        {project?.name || "Ukjent"}
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="body2" color="text.secondary">
                        Kontraktstandard
                    </Typography>
                    <Typography variant="body1">
                        {tender.contractStandard}
                    </Typography>
                </Box>
                {isSender && (
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Antall tilbud
                        </Typography>
                        <Typography variant="body1">
                            {tender.bids?.length || 0}
                        </Typography>
                    </Box>
                )}
                {isSender && tender.invitedSuppliers && (
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Antall inviterte leverandører
                        </Typography>
                        <Typography variant="body1">
                            {tender.invitedSuppliers.length}
                        </Typography>
                    </Box>
                )}
                {contract && (
                    <Box>
                        <Button
                            variant="outlined"
                            startIcon={<DescriptionIcon />}
                            fullWidth
                            onClick={() =>
                                navigate(`/tenders/${tender.id}/contract`)
                            }
                        >
                            Se kontrakt
                        </Button>
                    </Box>
                )}

                {/* Dates and Price - BOTTOM */}
                <Box sx={{ pt: 1, borderTop: 1, borderColor: "divider" }}>
                    <Typography variant="body2" color="text.secondary">
                        Frist
                    </Typography>
                    <DateDisplay date={tender.deadline} variant="body1" />
                </Box>
                {tender.publishDate && (
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Publiseringsdato
                        </Typography>
                        <DateDisplay
                            date={tender.publishDate}
                            variant="body1"
                        />
                    </Box>
                )}
                {tender.questionDeadline && (
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Spørsmålfrist
                        </Typography>
                        <DateDisplay
                            date={tender.questionDeadline}
                            variant="body1"
                        />
                    </Box>
                )}
                <Box>
                    <Typography variant="body2" color="text.secondary">
                        Opprettet
                    </Typography>
                    <DateDisplay date={tender.createdAt} variant="body1" />
                </Box>
                {tender.awardedAt && (isSender || isAdmin) && (
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Tildelt
                        </Typography>
                        <DateDisplay date={tender.awardedAt} variant="body1" />
                    </Box>
                )}
                {tender.price && (
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Estimert pris
                        </Typography>
                        <Typography variant="body1">
                            {new Intl.NumberFormat("no-NO", {
                                style: "currency",
                                currency: "NOK",
                            }).format(tender.price)}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

TenderInfoSidebar.propTypes = {
    tender: PropTypes.shape({
        id: PropTypes.string.isRequired,
        contractStandard: PropTypes.string.isRequired,
        deadline: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.instanceOf(Date),
        ]).isRequired,
        publishDate: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.instanceOf(Date),
        ]),
        questionDeadline: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.instanceOf(Date),
        ]),
        createdAt: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.instanceOf(Date),
        ]).isRequired,
        awardedAt: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.instanceOf(Date),
        ]),
        price: PropTypes.number,
        awardedBidId: PropTypes.string,
        bids: PropTypes.array,
        invitedSuppliers: PropTypes.array,
    }).isRequired,
    project: PropTypes.shape({
        name: PropTypes.string,
    }),
    createdByUser: PropTypes.shape({
        companyName: PropTypes.string,
        orgNumber: PropTypes.string,
    }),
    contract: PropTypes.object,
    isSender: PropTypes.bool,
    isAdmin: PropTypes.bool,
};

export default TenderInfoSidebar;
