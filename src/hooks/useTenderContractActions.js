import { useState, useCallback } from "react";
import {
    generateContract,
    getContractByTenderId,
} from "../api/contractService";

/**
 * Hook for managing tender contract actions
 */
export const useTenderContractActions = (tender, project, loadTender) => {
    const [generatingContract, setGeneratingContract] = useState(false);
    const [contractError, setContractError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);

    const handleGenerateContract = useCallback(async () => {
        if (!tender || !project || !tender.awardedBidId) {
            setContractError("Mangler informasjon for å generere kontrakt.");
            return;
        }

        const awardedBid = tender.bids?.find(
            (bid) => bid.id === tender.awardedBidId
        );
        if (!awardedBid) {
            setContractError("Tildelt tilbud ikke funnet.");
            return;
        }

        setGeneratingContract(true);
        setContractError("");

        try {
            const result = await generateContract(tender, awardedBid, project);

            if (!result.success) {
                setContractError(
                    result.error || "Kunne ikke generere kontrakt. Prøv igjen."
                );
                return;
            }

            await loadTender();
            const contractData = await getContractByTenderId(tender.id);
            setSuccessMessage("Kontrakt generert!");
            setShowSuccessSnackbar(true);
            return { success: true, contract: contractData };
        } catch (error) {
            console.error("Error generating contract:", error);
            setContractError("Kunne ikke generere kontrakt. Prøv igjen.");
            return { success: false };
        } finally {
            setGeneratingContract(false);
        }
    }, [tender, project, loadTender]);

    return {
        generatingContract,
        contractError,
        handleGenerateContract,
        successMessage,
        showSuccessSnackbar,
        setSuccessMessage,
        setShowSuccessSnackbar,
    };
};





