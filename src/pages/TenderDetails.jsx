import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Box, Grid, Snackbar, Alert } from "@mui/material";
import { getContractByTenderId } from "../api/contractService";
import { isStandstillPeriodEnded } from "../api";
import { useAuth } from "../contexts/AuthContext";
import {
    useTenderDetailsPage,
    useTenderAwardActions,
    useTenderQAActions,
    useTenderDocumentActions,
    useTenderContractActions,
} from "../hooks";
import {
    AskQuestionForm,
    TenderDetailsSkeleton,
    TenderNotFound,
    TenderInfoSidebar,
    TenderDocumentsSection,
    SupplierBidSummary,
    StandstillPeriod,
    NS8405Display,
    NS8406Display,
    NS8407Display,
    TenderAdditionalInfo,
    TenderQASection,
    SupplierInvitationStatus,
    InvitedSuppliersList,
    TenderBidsSection,
    TenderDetailsBreadcrumbs,
    TenderDetailsHeader,
    TenderDetailsErrorAlerts,
    TenderDescription,
    ContractGenerationAlert,
    TenderDetailsDialogs,
} from "../components/features/tender";

// Constants
const SUCCESS_SNACKBAR_DURATION = 4000;
const DELETE_NAVIGATION_DELAY = 1500;
const URL_REVOKE_DELAY = 100;
const DOWNLOAD_TIMEOUT = 30000; // 30 seconds

const TenderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Use custom hook for data loading
    const { tender, project, createdByUser, loading, loadTender } =
        useTenderDetailsPage(id);

    // Use action hooks
    const awardActions = useTenderAwardActions(tender, project, loadTender);
    const qaActions = useTenderQAActions(tender, loadTender);
    const documentActions = useTenderDocumentActions(tender, loadTender);
    const contractActions = useTenderContractActions(
        tender,
        project,
        loadTender
    );

    // User role checks - simple booleans don't need memoization
    const isSender = user?.role === "sender";
    const isAdmin = user?.isAdmin === true;

    // Check if current user is an invited supplier - memoized
    const userInvitation = useMemo(() => {
        if (!tender?.invitedSuppliers?.length || !user) return null;

        const userEmailNormalized = user.email?.toLowerCase().trim();
        return (
            tender.invitedSuppliers.find(
                (inv) =>
                    inv.supplierId === user.id ||
                    (userEmailNormalized &&
                        inv.email?.toLowerCase().trim() === userEmailNormalized)
            ) || null
        );
    }, [tender?.invitedSuppliers, user?.id, user?.email]);

    // Check if user has already submitted a bid - memoized
    const userBid = useMemo(() => {
        if (!tender?.bids?.length || !user) return null;
        return (
            tender.bids.find(
                (bid) =>
                    bid.supplierId === user.id ||
                    bid.companyId === user.companyId
            ) || null
        );
    }, [tender?.bids, user?.id, user?.companyId]);

    // State for contract
    const [contract, setContract] = useState(null);
    const [contractError, setContractError] = useState("");
    const [loadingContract, setLoadingContract] = useState(false);

    // Ref to track if component is mounted (prevents memory leaks)
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Load contract when tender is available
    useEffect(() => {
        // Clear previous error when starting new load
        setContractError("");
        
        if (!tender?.id) {
            setContract(null);
            setLoadingContract(false);
            return;
        }

        setLoadingContract(true);
        let cancelled = false;

        const loadContract = async () => {
            try {
                const contractData = await getContractByTenderId(tender.id);
                
                // Check if component is still mounted and request wasn't cancelled
                if (isMountedRef.current && !cancelled) {
                    setContract(contractData);
                    setContractError("");
                }
            } catch (error) {
                // Don't set error if request was cancelled or component unmounted
                if (!isMountedRef.current || cancelled) {
                    return;
                }
                
                console.error("Error loading contract:", error);
                if (isMountedRef.current) {
                    setContractError(
                        "Kunne ikke laste kontrakt. Prøv å oppdatere siden."
                    );
                    setContract(null);
                }
            } finally {
                if (isMountedRef.current && !cancelled) {
                    setLoadingContract(false);
                }
            }
        };

        loadContract();

        return () => {
            cancelled = true;
        };
    }, [tender?.id]);

    // Handle delete with navigation - use stable function references
    const handleDeleteConfirm = useCallback(async () => {
        if (!tender) return;
        
        const result = await awardActions.handleDeleteConfirm();
        if (result?.success) {
            awardActions.setSuccessMessage("Anskaffelse slettet!");
            awardActions.setShowSuccessSnackbar(true);
            setTimeout(() => {
                navigate("/tenders");
            }, DELETE_NAVIGATION_DELAY);
        }
    }, [tender?.id, awardActions.handleDeleteConfirm, awardActions.setSuccessMessage, awardActions.setShowSuccessSnackbar, navigate]);

    // Document download handler with proper error handling and cleanup
    const handleDownloadDocument = useCallback(
        async (doc) => {
            if (!doc || !doc.url) {
                documentActions.setDocumentError?.(
                    "Dokument URL mangler. Kan ikke laste ned."
                );
                return;
            }

            let blobUrl = null;
            let timeoutId = null;
            
            try {
                // Add timeout to fetch
                const controller = new AbortController();
                timeoutId = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT);

                const response = await fetch(doc.url, {
                    signal: controller.signal,
                });
                
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(
                        `HTTP error! status: ${response.status}`
                    );
                }

                const blob = await response.blob();
                blobUrl = URL.createObjectURL(blob);
                
                // Use a more React-friendly approach with hidden anchor
                const link = document.createElement("a");
                link.href = blobUrl;
                link.download = doc.name || "document";
                link.style.display = "none";
                link.setAttribute("aria-hidden", "true");
                
                document.body.appendChild(link);
                link.click();
                
                // Cleanup
                setTimeout(() => {
                    if (document.body.contains(link)) {
                        document.body.removeChild(link);
                    }
                    if (blobUrl) {
                        URL.revokeObjectURL(blobUrl);
                    }
                }, URL_REVOKE_DELAY);
            } catch (error) {
                // Cleanup timeout if still active
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                
                // Cleanup blob URL if it was created
                if (blobUrl) {
                    URL.revokeObjectURL(blobUrl);
                }
                
                console.error("Error downloading document:", error);
                
                let errorMessage = "Kunne ikke laste ned dokument. Prøv igjen.";
                if (error.name === "AbortError") {
                    errorMessage = "Nedlasting tok for lang tid. Prøv igjen.";
                } else if (error.message?.includes("Failed to fetch")) {
                    errorMessage = "Nettverksfeil. Sjekk internettforbindelsen.";
                }
                
                documentActions.setDocumentError?.(errorMessage);
            }
        },
        [documentActions]
    );

    // Handle contract generation with contract state update
    const handleGenerateContract = useCallback(async () => {
        const result = await contractActions.handleGenerateContract();
        if (result?.success && result?.contract) {
            setContract(result.contract);
            setContractError("");
        }
    }, [contractActions.handleGenerateContract]);

    // Centralized success message handling
    const successState = useMemo(() => {
        const messages = [
            awardActions.successMessage,
            qaActions.successMessage,
            documentActions.successMessage,
            contractActions.successMessage,
        ].filter(Boolean);

        const showSnackbars = [
            awardActions.showSuccessSnackbar,
            qaActions.showSuccessSnackbar,
            documentActions.showSuccessSnackbar,
            contractActions.showSuccessSnackbar,
        ];

        return {
            message: messages[0] || "", // Show first message if multiple
            show: showSnackbars.some(Boolean),
        };
    }, [
        awardActions.successMessage,
        awardActions.showSuccessSnackbar,
        qaActions.successMessage,
        qaActions.showSuccessSnackbar,
        documentActions.successMessage,
        documentActions.showSuccessSnackbar,
        contractActions.successMessage,
        contractActions.showSuccessSnackbar,
    ]);

    const handleCloseSuccessSnackbar = useCallback(() => {
        // Close all snackbars explicitly
        if (awardActions.setShowSuccessSnackbar) {
            awardActions.setShowSuccessSnackbar(false);
        }
        if (qaActions.setShowSuccessSnackbar) {
            qaActions.setShowSuccessSnackbar(false);
        }
        if (documentActions.setShowSuccessSnackbar) {
            documentActions.setShowSuccessSnackbar(false);
        }
        if (contractActions.setShowSuccessSnackbar) {
            contractActions.setShowSuccessSnackbar(false);
        }
    }, [
        awardActions.setShowSuccessSnackbar,
        qaActions.setShowSuccessSnackbar,
        documentActions.setShowSuccessSnackbar,
        contractActions.setShowSuccessSnackbar,
    ]);

    // Loading state
    if (loading) {
        return <TenderDetailsSkeleton />;
    }

    // Not found state
    if (!tender) {
        return <TenderNotFound />;
    }

    return (
        <Box component="main" role="main" aria-label="Anskaffelse detaljer">
            <TenderDetailsBreadcrumbs tenderTitle={tender.title} />

            <TenderDetailsHeader
                tender={tender}
                isSender={isSender}
                isAdmin={isAdmin}
                awardActions={awardActions}
                onDeleteClick={awardActions.handleDeleteClick}
            />

            <TenderDetailsErrorAlerts
                awardError={awardActions.awardError}
                statusError={awardActions.statusError}
                deleteError={awardActions.deleteError}
                contractError={
                    contractError || contractActions.contractError
                }
            />

            {/* Standstill Period Alert */}
            {tender.status === "awarded" && (
                <StandstillPeriod tender={tender} />
            )}

            {/* Contract Generation Button */}
            {tender.status === "awarded" &&
                isSender &&
                !contract &&
                tender.standstillEndDate &&
                isStandstillPeriodEnded(tender.standstillEndDate) && (
                    <ContractGenerationAlert
                        onGenerateContract={handleGenerateContract}
                        generatingContract={
                            contractActions.generatingContract || loadingContract
                        }
                    />
                )}

            <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
                <Grid item xs={12} md={8}>
                    <TenderDescription description={tender.description} />

                    {/* Additional Information */}
                    <TenderAdditionalInfo tender={tender} />

                    {/* NS-Specific Fields Display */}
                    {tender.contractStandard === "NS 8405" && tender.ns8405 && (
                        <NS8405Display ns8405Data={tender.ns8405} />
                    )}
                    {tender.contractStandard === "NS 8406" && tender.ns8406 && (
                        <NS8406Display ns8406Data={tender.ns8406} />
                    )}
                    {tender.contractStandard === "NS 8407" && tender.ns8407 && (
                        <NS8407Display ns8407Data={tender.ns8407} />
                    )}

                    {/* Documents */}
                    <TenderDocumentsSection
                        tender={tender}
                        isSender={isSender}
                        userInvitation={userInvitation}
                        documentError={documentActions.documentError}
                        uploadingDocuments={documentActions.uploadingDocuments}
                        loading={documentActions.uploadingDocuments}
                        onAddDocuments={(docs) =>
                            documentActions.handleAddDocuments(docs, user)
                        }
                        onRemoveDocument={
                            documentActions.handleRemoveDocumentClick
                        }
                        onDownloadDocument={handleDownloadDocument}
                    />

                    {/* Ask Question Form */}
                    {!isSender &&
                        userInvitation &&
                        tender.status === "open" && (
                            <AskQuestionForm
                                tenderId={tender.id}
                                onQuestionAdded={(text) =>
                                    qaActions.handleAddQuestion(text, user)
                                }
                                loading={loading}
                            />
                        )}
                    {!isSender &&
                        userInvitation &&
                        tender.status === "draft" && (
                            <Alert severity="info" sx={{ mb: 3 }}>
                                Anskaffelsen er ikke publisert ennå. Du kan
                                stille spørsmål når den er publisert.
                            </Alert>
                        )}

                    {/* Q&A Section */}
                    <TenderQASection
                        tender={tender}
                        isSender={isSender}
                        qaActions={qaActions}
                        loading={loading}
                        user={user}
                    />

                    {/* Bids Section */}
                    {isSender && (
                        <TenderBidsSection
                            tender={tender}
                            project={project}
                            onAward={awardActions.handleAwardClick}
                            awardedBidId={tender.awardedBidId}
                            awarding={awardActions.awarding}
                        />
                    )}

                    {/* Supplier's own bid summary */}
                    {userBid && !isSender && (
                        <SupplierBidSummary bid={userBid} tender={tender} />
                    )}

                    {/* Supplier invitation status */}
                    {userInvitation && !isSender && (
                        <SupplierInvitationStatus
                            userInvitation={userInvitation}
                            userBid={userBid}
                            tender={tender}
                            tenderId={id}
                            onNavigateToBid={(tenderId) =>
                                navigate(`/tenders/${tenderId}/bid`)
                            }
                        />
                    )}

                    {/* Invited Suppliers */}
                    {isSender && (
                        <InvitedSuppliersList
                            invitedSuppliers={tender.invitedSuppliers}
                        />
                    )}
                </Grid>

                {/* Sidebar */}
                <Grid item xs={12} md={4}>
                    <TenderInfoSidebar
                        tender={tender}
                        project={project}
                        createdByUser={createdByUser}
                        contract={contract}
                        isSender={isSender}
                        isAdmin={isAdmin}
                    />
                </Grid>
            </Grid>

            <TenderDetailsDialogs
                awardActions={awardActions}
                documentActions={documentActions}
                onDeleteConfirm={handleDeleteConfirm}
                tenderTitle={tender?.title}
            />

            {/* Success Snackbar */}
            <Snackbar
                open={successState.show}
                autoHideDuration={SUCCESS_SNACKBAR_DURATION}
                onClose={handleCloseSuccessSnackbar}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={handleCloseSuccessSnackbar}
                    severity="success"
                    role="alert"
                    aria-live="polite"
                >
                    {successState.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TenderDetails;
