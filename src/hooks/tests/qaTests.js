import {
    getAllTenders,
    createTender,
    addQuestionToTender,
    answerQuestion,
    getTenderById,
} from "../../api/tenderService";
import { createProject } from "../../api/projectService";
import {
    createErrorResult,
    createSuccessResult,
} from "./testHelpers";

/**
 * Run Q&A tests
 */
export const runQATests = async (
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
                name: "Test Prosjekt for QA - " + Date.now(),
                description: "QA Test",
                status: "active",
            },
            user
        );
        if (projectResult.project) {
            const tenderResult = await createTender(
                {
                    projectId: projectResult.project.id,
                    title: "Test Anskaffelse for QA - " + Date.now(),
                    description: "QA Test",
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
                "Legge til spørsmål",
                "Kunne ikke opprette eller finne test anskaffelse"
            )
        );
        return;
    }

    // Add question
    setTestProgress(50);
    let testQuestionId = null;
    try {
        const questionResult = await addQuestionToTender(
            testTenderId,
            "Dette er et testspørsmål",
            user
        );

        if (questionResult.success) {
            const updatedTender = await getTenderById(testTenderId);
            const questions = updatedTender?.qa || [];
            testQuestionId = questions[questions.length - 1]?.id;
            results.push(
                createSuccessResult(
                    "Legge til spørsmål/kommentar",
                    `Spørsmål lagt til: ${testQuestionId}`
                )
            );
        } else {
            results.push(
                createErrorResult(
                    "Legge til spørsmål/kommentar",
                    questionResult.error || "Kunne ikke legge til"
                )
            );
        }
    } catch (error) {
        results.push(createErrorResult("Legge til spørsmål/kommentar", error));
    }

    // Answer question
    setTestProgress(100);
    if (testQuestionId) {
        try {
            const answerResult = await answerQuestion(
                testTenderId,
                testQuestionId,
                "Dette er et testsvar",
                user
            );

            if (answerResult.success) {
                results.push(
                    createSuccessResult("Besvare spørsmål", "Spørsmål besvart")
                );
            } else {
                results.push(
                    createErrorResult(
                        "Besvare spørsmål",
                        answerResult.error || "Kunne ikke besvare"
                    )
                );
            }
        } catch (error) {
            results.push(createErrorResult("Besvare spørsmål", error));
        }
    } else {
        results.push(
            createErrorResult("Besvare spørsmål", "Ingen spørsmål å besvare")
        );
    }
};






