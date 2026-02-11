import {
    createComplaint,
    getAllComplaints,
    getComplaintById,
    updateComplaintStatus,
    addComplaintComment,
} from "../../api/complaintService";
import {
    createErrorResult,
    createSuccessResult,
} from "./testHelpers";

/**
 * Run complaint tests
 */
export const runComplaintsTests = async (
    results,
    setTestProgress,
    user
) => {
    // Test 1: Create a complaint
    setTestProgress(10);
    let testComplaintId = null;
    try {
        const complaintResult = await createComplaint(
            {
                title: "Test Klage - " + new Date().toISOString(),
                description:
                    "Dette er en testklage for å verifisere funksjonalitet",
                category: "general",
                priority: "medium",
            },
            user
        );

        if (complaintResult.success && complaintResult.complaint) {
            testComplaintId = complaintResult.complaint.id;
            results.push(
                createSuccessResult(
                    "Opprette klage",
                    `Klage opprettet med ID: ${testComplaintId}`
                )
            );
        } else {
            results.push(
                createErrorResult(
                    "Opprette klage",
                    complaintResult.error || "Kunne ikke opprette klage"
                )
            );
        }
    } catch (error) {
        results.push(
            createErrorResult("Opprette klage", error)
        );
    }

    // Test 2: Get complaint by ID
    setTestProgress(30);
    if (testComplaintId) {
        try {
            const complaint = await getComplaintById(testComplaintId);
            if (complaint && complaint.id === testComplaintId) {
                results.push(
                    createSuccessResult(
                        "Hente klage etter ID",
                        `Klage hentet: ${complaint.title}`
                    )
                );
            } else {
                results.push(
                    createErrorResult(
                        "Hente klage etter ID",
                        "Kunne ikke hente klage"
                    )
                );
            }
        } catch (error) {
            results.push(createErrorResult("Hente klage etter ID", error));
        }
    }

    // Test 3: Get all complaints
    setTestProgress(50);
    try {
        const allComplaints = await getAllComplaints();
        if (Array.isArray(allComplaints)) {
            results.push(
                createSuccessResult(
                    "Hente alle klager",
                    `${allComplaints.length} klage(r) funnet`
                )
            );
        } else {
            results.push(
                createErrorResult(
                    "Hente alle klager",
                    "Ugyldig resultat"
                )
            );
        }
    } catch (error) {
        results.push(createErrorResult("Hente alle klager", error));
    }

    // Test 4: Update complaint status
    setTestProgress(70);
    if (testComplaintId) {
        try {
            const updateResult = await updateComplaintStatus(
                testComplaintId,
                "in_progress",
                user,
                "Test statusoppdatering"
            );
            if (updateResult.success) {
                results.push(
                    createSuccessResult(
                        "Oppdatere klagestatus",
                        'Status oppdatert til "in_progress"'
                    )
                );
            } else {
                results.push(
                    createErrorResult(
                        "Oppdatere klagestatus",
                        updateResult.error || "Kunne ikke oppdatere status"
                    )
                );
            }
        } catch (error) {
            results.push(createErrorResult("Oppdatere klagestatus", error));
        }
    }

    // Test 5: Add comment to complaint
    setTestProgress(85);
    if (testComplaintId) {
        try {
            const commentResult = await addComplaintComment(
                testComplaintId,
                "Dette er en testkommentar",
                user
            );
            if (commentResult.success) {
                results.push(
                    createSuccessResult(
                        "Legge til kommentar til klage",
                        "Kommentar lagt til"
                    )
                );
            } else {
                results.push(
                    createErrorResult(
                        "Legge til kommentar til klage",
                        commentResult.error || "Kunne ikke legge til kommentar"
                    )
                );
            }
        } catch (error) {
            results.push(
                createErrorResult("Legge til kommentar til klage", error)
            );
        }
    }

    // Test 6: Filter complaints by status
    setTestProgress(95);
    try {
        const submittedComplaints = await getAllComplaints({
            status: "submitted",
        });
        if (Array.isArray(submittedComplaints)) {
            results.push(
                createSuccessResult(
                    "Filtrere klager etter status",
                    `${submittedComplaints.length} innsendte klage(r) funnet`
                )
            );
        } else {
            results.push(
                createErrorResult(
                    "Filtrere klager etter status",
                    "Ugyldig resultat"
                )
            );
        }
    } catch (error) {
        results.push(createErrorResult("Filtrere klager etter status", error));
    }
};






