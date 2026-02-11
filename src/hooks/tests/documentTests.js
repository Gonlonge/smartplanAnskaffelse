import {
    getAllTenders,
    createTender,
    addDocumentsToTender,
    removeDocumentFromTender,
    getTenderById,
} from "../../api/tenderService";
import { createProject } from "../../api/projectService";
import {
    createErrorResult,
    createSuccessResult,
} from "./testHelpers";

/**
 * Run document tests
 */
export const runDocumentTests = async (
    results,
    setTestProgress,
    user
) => {
    // First, get an existing tender or create one
    const existingTenders = await getAllTenders();
    let testTenderId = existingTenders[0]?.id;

    if (!testTenderId) {
        // Create a test project and tender
        const projectResult = await createProject(
            {
                name: "Test Prosjekt for Docs - " + Date.now(),
                description: "Doc Test",
                status: "active",
            },
            user
        );
        if (projectResult.project) {
            const tenderResult = await createTender(
                {
                    projectId: projectResult.project.id,
                    title: "Test Anskaffelse for Docs - " + Date.now(),
                    description: "Doc Test",
                    contractStandard: "NS 8405",
                    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    status: "open",
                },
                user
            );
            testTenderId = tenderResult.tender?.id;
        }
    }

    if (!testTenderId) {
        results.push(
            createErrorResult(
                "Legge til dokument",
                "Kunne ikke opprette eller finne test anskaffelse"
            )
        );
        return;
    }

    // Add document
    setTestProgress(50);
    let testDocumentId = null;
    try {
        const mockFile = new File(
            ["test content"],
            "test-dokument.pdf",
            {
                type: "application/pdf",
            }
        );

        const documentResult = await addDocumentsToTender(
            testTenderId,
            [mockFile],
            user
        );

        if (documentResult.success) {
            const updatedTender = await getTenderById(testTenderId);
            const documents = updatedTender?.documents || [];
            testDocumentId = documents[documents.length - 1]?.id;
            results.push(
                createSuccessResult(
                    "Legge til filer/dokumenter",
                    `Dokument lagt til: ${testDocumentId}`
                )
            );
        } else {
            results.push(
                createErrorResult(
                    "Legge til filer/dokumenter",
                    documentResult.error || "Kunne ikke legge til"
                )
            );
        }
    } catch (error) {
        results.push(createErrorResult("Legge til filer/dokumenter", error));
    }

    // Remove document
    setTestProgress(100);
    if (testDocumentId) {
        try {
            const removeResult = await removeDocumentFromTender(
                testTenderId,
                testDocumentId
            );

            if (removeResult.success) {
                results.push(
                    createSuccessResult("Fjerne dokument", "Dokument fjernet")
                );
            } else {
                results.push(
                    createErrorResult(
                        "Fjerne dokument",
                        removeResult.error || "Kunne ikke fjerne"
                    )
                );
            }
        } catch (error) {
            results.push(createErrorResult("Fjerne dokument", error));
        }
    } else {
        results.push(
            createErrorResult("Fjerne dokument", "Ingen dokument å fjerne")
        );
    }
};






