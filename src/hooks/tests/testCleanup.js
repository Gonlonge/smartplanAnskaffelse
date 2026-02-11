import { getCollection, deleteDocument } from "../../services/firestore";
import {
    createSuccessResult,
    createErrorResult,
} from "./testHelpers";

/**
 * Delete all test data
 */
export const deleteAllTestData = async (
    setDeleting,
    setShowDeleteDialog,
    setTestResults,
    user
) => {
    if (!user) {
        return;
    }

    setDeleting(true);
    try {
        // Get all projects, tenders, and contracts that contain "Test" in the name
        const allProjects = await getCollection("projects", []);
        const allTenders = await getCollection("tenders", []);
        const allContracts = await getCollection("contracts", []);

        // Delete test projects
        const testProjects = allProjects.filter(
            (p) =>
                p.name?.toLowerCase().includes("test") ||
                p.description?.toLowerCase().includes("testprosjekt")
        );
        for (const project of testProjects) {
            await deleteDocument("projects", project.id);
        }

        // Delete test tenders
        const testTenders = allTenders.filter(
            (t) =>
                t.title?.toLowerCase().includes("test") ||
                t.description?.toLowerCase().includes("test")
        );
        for (const tender of testTenders) {
            await deleteDocument("tenders", tender.id);
        }

        // Delete test contracts
        const testContracts = allContracts.filter(
            (c) =>
                c.title?.toLowerCase().includes("test") ||
                testTenders.some((t) => t.id === c.tenderId)
        );
        for (const contract of testContracts) {
            await deleteDocument("contracts", contract.id);
        }

        setTestResults({
            success: true,
            tests: [
                createSuccessResult(
                    "Slett testdata",
                    `Slettet ${testProjects.length} prosjekter, ${testTenders.length} anskaffelser, og ${testContracts.length} kontrakter`
                ),
            ],
            summary: "Testdata slettet",
            category: "delete",
        });
    } catch (error) {
        console.error("Error deleting test data:", error);
        setTestResults({
            success: false,
            error: error.message || "Kunne ikke slette testdata",
            tests: [],
            category: "delete",
        });
    } finally {
        setDeleting(false);
        setShowDeleteDialog(false);
    }
};






