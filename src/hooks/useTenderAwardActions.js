import { useState, useCallback } from "react";
import {
    awardTender,
    closeTender,
    openTender,
    deleteTender,
} from "../api/tenderService";

/**
 * Hook for managing tender award and status actions
 */
export const useTenderAwardActions = (tender, project, loadTender) => {
    // Award state
    const [awarding, setAwarding] = useState(false);
    const [awardError, setAwardError] = useState("");
    const [showAwardDialog, setShowAwardDialog] = useState(false);
    const [awardBidId, setAwardBidId] = useState(null);

    // Status change state
    const [changingStatus, setChangingStatus] = useState(false);
    const [statusError, setStatusError] = useState("");
    const [showCloseDialog, setShowCloseDialog] = useState(false);
    const [showReopenDialog, setShowReopenDialog] = useState(false);

    // Delete state
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletingTender, setDeletingTender] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    // Success message state
    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);

    // Award handlers
    const handleAwardClick = useCallback((bidId) => {
        setAwardBidId(bidId);
        setShowAwardDialog(true);
    }, []);

    const handleAwardConfirm = useCallback(async () => {
        if (!awardBidId || !tender) return;

        setShowAwardDialog(false);
        setAwarding(true);
        setAwardError("");

        try {
            const result = await awardTender(tender.id, awardBidId, project);

            if (!result.success) {
                setAwardError(
                    result.error || "Kunne ikke tildele kontrakt. Prøv igjen."
                );
                return;
            }

            await loadTender();
            setSuccessMessage("Kontrakt tildelt!");
            setShowSuccessSnackbar(true);
            setAwardBidId(null);
        } catch (error) {
            setAwardError("Kunne ikke tildele kontrakt. Prøv igjen.");
        } finally {
            setAwarding(false);
        }
    }, [awardBidId, tender, project, loadTender]);

    // Status handlers
    const handleCloseClick = useCallback(() => {
        setShowCloseDialog(true);
    }, []);

    const handleCloseConfirm = useCallback(async () => {
        if (!tender) return;

        setShowCloseDialog(false);
        setChangingStatus(true);
        setStatusError("");

        try {
            const result = await closeTender(tender.id);

            if (!result.success) {
                setStatusError(
                    result.error || "Kunne ikke lukke Anskaffelse. Prøv igjen."
                );
                return;
            }

            await loadTender();
            setSuccessMessage("Anskaffelse er lukket!");
            setShowSuccessSnackbar(true);
        } catch (error) {
            setStatusError("Kunne ikke lukke Anskaffelse. Prøv igjen.");
        } finally {
            setChangingStatus(false);
        }
    }, [tender, loadTender]);

    const handlePublishClick = useCallback(async () => {
        if (!tender) return;

        setChangingStatus(true);
        setStatusError("");

        try {
            const result = await openTender(tender.id);

            if (!result.success) {
                setStatusError(
                    result.error ||
                        "Kunne ikke publisere Anskaffelse. Prøv igjen."
                );
                return;
            }

            await loadTender();
            setSuccessMessage("Anskaffelse er publisert!");
            setShowSuccessSnackbar(true);
        } catch (error) {
            setStatusError("Kunne ikke publisere Anskaffelse. Prøv igjen.");
        } finally {
            setChangingStatus(false);
        }
    }, [tender, loadTender]);

    const handleReopenClick = useCallback(() => {
        setShowReopenDialog(true);
    }, []);

    const handleReopenConfirm = useCallback(async () => {
        if (!tender) return;

        setShowReopenDialog(false);
        setChangingStatus(true);
        setStatusError("");

        try {
            const result = await openTender(tender.id);

            if (!result.success) {
                setStatusError(
                    result.error ||
                        "Kunne ikke gjenåpne Anskaffelse. Prøv igjen."
                );
                return;
            }

            await loadTender();
            setSuccessMessage("Anskaffelse er gjenåpnet!");
            setShowSuccessSnackbar(true);
        } catch (error) {
            setStatusError("Kunne ikke gjenåpne Anskaffelse. Prøv igjen.");
        } finally {
            setChangingStatus(false);
        }
    }, [tender, loadTender]);

    // Delete handlers
    const handleDeleteClick = useCallback(() => {
        setShowDeleteDialog(true);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!tender) return;

        setShowDeleteDialog(false);
        setDeletingTender(true);
        setDeleteError("");

        try {
            const result = await deleteTender(tender.id);

            if (!result.success) {
                setDeleteError(
                    result.error || "Kunne ikke slette Anskaffelse. Prøv igjen."
                );
                return;
            }

            // Navigate will be handled by parent component
            return { success: true };
        } catch (error) {
            setDeleteError("Kunne ikke slette Anskaffelse. Prøv igjen.");
            return { success: false };
        } finally {
            setDeletingTender(false);
        }
    }, [tender]);

    const handleDeleteCancel = useCallback(() => {
        setShowDeleteDialog(false);
        setDeleteError("");
    }, []);

    return {
        // Award
        awarding,
        awardError,
        showAwardDialog,
        awardBidId,
        handleAwardClick,
        handleAwardConfirm,
        setShowAwardDialog,
        setAwardBidId,

        // Status
        changingStatus,
        statusError,
        showCloseDialog,
        showReopenDialog,
        handleCloseClick,
        handleCloseConfirm,
        handlePublishClick,
        handleReopenClick,
        handleReopenConfirm,
        setShowCloseDialog,
        setShowReopenDialog,

        // Delete
        showDeleteDialog,
        deletingTender,
        deleteError,
        handleDeleteClick,
        handleDeleteConfirm,
        handleDeleteCancel,

        // Success
        successMessage,
        showSuccessSnackbar,
        setSuccessMessage,
        setShowSuccessSnackbar,
    };
};





