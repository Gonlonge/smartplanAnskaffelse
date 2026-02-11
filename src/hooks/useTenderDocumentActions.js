import { useState, useCallback } from "react";
import {
    addDocumentsToTender,
    removeDocumentFromTender,
} from "../api/tenderService";

/**
 * Hook for managing tender document actions
 */
export const useTenderDocumentActions = (tender, loadTender) => {
    const [documentError, setDocumentError] = useState("");
    const [uploadingDocuments, setUploadingDocuments] = useState(false);
    const [showDeleteDocDialog, setShowDeleteDocDialog] = useState(false);
    const [docToDelete, setDocToDelete] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);

    const handleAddDocuments = useCallback(
        async (newDocuments, user) => {
            if (!tender || !user) return;

            setDocumentError("");
            setUploadingDocuments(true);

            try {
                const result = await addDocumentsToTender(
                    tender.id,
                    newDocuments,
                    user
                );

                if (!result.success) {
                    setDocumentError(
                        result.error || "Kunne ikke legge til dokumenter"
                    );
                    return;
                }

                await loadTender();
                setSuccessMessage("Dokumenter lagt til!");
                setShowSuccessSnackbar(true);
            } catch (error) {
                setDocumentError(
                    "Kunne ikke legge til dokumenter. Prøv igjen."
                );
            } finally {
                setUploadingDocuments(false);
            }
        },
        [tender, loadTender]
    );

    const handleRemoveDocumentClick = useCallback((doc) => {
        setDocToDelete(doc);
        setShowDeleteDocDialog(true);
    }, []);

    const handleRemoveDocumentConfirm = useCallback(async () => {
        if (!tender || !docToDelete) return;

        setShowDeleteDocDialog(false);
        setDocumentError("");

        try {
            const result = await removeDocumentFromTender(
                tender.id,
                docToDelete.id
            );

            if (!result.success) {
                setDocumentError(result.error || "Kunne ikke fjerne dokument");
                return;
            }

            await loadTender();
            setSuccessMessage("Dokument fjernet!");
            setShowSuccessSnackbar(true);
            setDocToDelete(null);
        } catch (error) {
            setDocumentError("Kunne ikke fjerne dokument. Prøv igjen.");
        }
    }, [tender, docToDelete, loadTender]);

    return {
        documentError,
        uploadingDocuments,
        showDeleteDocDialog,
        docToDelete,
        handleAddDocuments,
        handleRemoveDocumentClick,
        handleRemoveDocumentConfirm,
        setShowDeleteDocDialog,
        setDocToDelete,
        successMessage,
        showSuccessSnackbar,
        setSuccessMessage,
        setShowSuccessSnackbar,
    };
};





