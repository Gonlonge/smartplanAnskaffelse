import { useState, useCallback } from "react";
import { addQuestionToTender, answerQuestion } from "../api/tenderService";

/**
 * Hook for managing tender Q&A actions
 */
export const useTenderQAActions = (tender, loadTender) => {
    const [qaError, setQaError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);

    const handleAddQuestion = useCallback(
        async (questionText, user) => {
            if (!user || !tender) return;

            setQaError("");

            try {
                const result = await addQuestionToTender(
                    tender.id,
                    questionText,
                    user
                );

                if (!result.success) {
                    setQaError(result.error || "Kunne ikke legge til spørsmål");
                    return;
                }

                await loadTender();
                setSuccessMessage("Spørsmål sendt!");
                setShowSuccessSnackbar(true);
            } catch (error) {
                setQaError("Kunne ikke legge til spørsmål. Prøv igjen.");
            }
        },
        [tender, loadTender]
    );

    const handleAnswerQuestion = useCallback(
        async (questionId, answerText, user) => {
            if (!user || !tender) return;

            setQaError("");

            try {
                const result = await answerQuestion(
                    tender.id,
                    questionId,
                    answerText,
                    user
                );

                if (!result.success) {
                    setQaError(result.error || "Kunne ikke svare på spørsmål");
                    return;
                }

                await loadTender();
                setSuccessMessage("Svar sendt!");
                setShowSuccessSnackbar(true);
            } catch (error) {
                setQaError("Kunne ikke svare på spørsmål. Prøv igjen.");
            }
        },
        [tender, loadTender]
    );

    return {
        qaError,
        handleAddQuestion,
        handleAnswerQuestion,
        successMessage,
        showSuccessSnackbar,
        setSuccessMessage,
        setShowSuccessSnackbar,
    };
};





