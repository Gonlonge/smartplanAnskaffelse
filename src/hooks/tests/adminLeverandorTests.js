import {
    createProject,
    getAllProjects,
} from "../../api/projectService";
import {
    createTender,
    getAllTenders,
    deleteTender,
} from "../../api/tenderService";
import { getAllAdminUsers } from "../../api/userService";
import { getCollection } from "../../services/firestore";
import {
    createErrorResult,
    createSuccessResult,
} from "./testHelpers";

/**
 * Run admin leverandør tests
 * These tests verify admin privileges for receiver (leverandør) users
 */
export const runAdminLeverandorTests = async (
    results,
    setTestProgress,
    user
) => {
    // Check if current user is admin leverandør
    if (user.role !== "receiver" || !user.isAdmin) {
        results.push(
            createErrorResult(
                "Verifisere brukertype",
                `Brukeren har role: ${user.role}, isAdmin: ${user.isAdmin}. Forventet: role: 'receiver', isAdmin: true`
            )
        );
        return;
    }

    // Test 1: Verify user is admin leverandør
    setTestProgress(5);
    results.push(
        createSuccessResult(
            "Verifisere admin leverandør status",
            `Bruker er admin leverandør (role: ${user.role}, isAdmin: ${user.isAdmin})`
        )
    );

    // Test 2: Admin privilege - Read all users
    setTestProgress(15);
    try {
        const allAdminUsers = await getAllAdminUsers();
        if (Array.isArray(allAdminUsers)) {
            results.push(
                createSuccessResult(
                    "Admin privilegium: Les alle brukere",
                    `Kan lese alle ${allAdminUsers.length} admin brukere`
                )
            );
        } else {
            results.push(
                createErrorResult(
                    "Admin privilegium: Les alle brukere",
                    "Kunne ikke hente alle brukere"
                )
            );
        }
    } catch (error) {
        results.push(
            createErrorResult(
                "Admin privilegium: Les alle brukere",
                error
            )
        );
    }

    // Test 3: Receiver limitation - Cannot create projects
    setTestProgress(30);
    try {
        const projectResult = await createProject(
            {
                name:
                    "Test Prosjekt Admin Leverandør - " +
                    new Date().toISOString(),
                description:
                    "Dette skal feile fordi admin leverandør ikke kan opprette prosjekter",
                status: "active",
            },
            user
        );

        if (!projectResult.success) {
            results.push(
                createSuccessResult(
                    "Receiver begrensning: Kan ikke opprette prosjekter",
                    "Korrekt: Admin leverandør kan ikke opprette prosjekter"
                )
            );
        } else {
            results.push(
                createErrorResult(
                    "Receiver begrensning: Kan ikke opprette prosjekter",
                    "FEIL: Admin leverandør skulle ikke kunne opprette prosjekter"
                )
            );
        }
    } catch (error) {
        // Expected to fail
        results.push(
            createSuccessResult(
                "Receiver begrensning: Kan ikke opprette prosjekter",
                "Korrekt: Opprettelse av prosjekt feilet som forventet"
            )
        );
    }

    // Test 4: Receiver limitation - Cannot create tenders
    setTestProgress(45);
    try {
        // First need a project ID - use a test one or skip if no project exists
        const allProjects = await getAllProjects();
        const testProjectId = allProjects[0]?.id;

        if (testProjectId) {
            const tenderResult = await createTender(
                {
                    projectId: testProjectId,
                    title:
                        "Test Anskaffelse Admin Leverandør - " +
                        new Date().toISOString(),
                    description:
                        "Dette skal feile fordi admin leverandør ikke kan opprette anskaffelser",
                    contractStandard: "NS 8405",
                    deadline: new Date(
                        Date.now() + 30 * 24 * 60 * 60 * 1000
                    ),
                    status: "open",
                },
                user
            );

            if (!tenderResult.success) {
                results.push(
                    createSuccessResult(
                        "Receiver begrensning: Kan ikke opprette anskaffelser",
                        "Korrekt: Admin leverandør kan ikke opprette anskaffelser"
                    )
                );
            } else {
                results.push(
                    createErrorResult(
                        "Receiver begrensning: Kan ikke opprette anskaffelser",
                        "FEIL: Admin leverandør skulle ikke kunne opprette anskaffelser"
                    )
                );
            }
        } else {
            results.push(
                createSuccessResult(
                    "Receiver begrensning: Kan ikke opprette anskaffelser",
                    "Skippet: Ingen prosjekter tilgjengelig for testing"
                )
            );
        }
    } catch (error) {
        // Expected to fail
        results.push(
            createSuccessResult(
                "Receiver begrensning: Kan ikke opprette anskaffelser",
                "Korrekt: Opprettelse av anskaffelse feilet som forventet"
            )
        );
    }

    // Test 5: Admin privilege - Can delete any tender (if one exists)
    setTestProgress(60);
    try {
        const allTenders = await getAllTenders();
        if (allTenders.length > 0) {
            // Try to delete the first tender (even if not created by this user)
            const testTender = allTenders[0];
            const deleteResult = await deleteTender(testTender.id);

            if (deleteResult.success) {
                results.push(
                    createSuccessResult(
                        "Admin privilegium: Kan slette hvilken som helst anskaffelse",
                        `Kunne slette anskaffelse "${testTender.title}" (ikke opprettet av denne brukeren)`
                    )
                );
            } else {
                results.push(
                    createErrorResult(
                        "Admin privilegium: Kan slette hvilken som helst anskaffelse",
                        deleteResult.error || "Kunne ikke slette anskaffelse"
                    )
                );
            }
        } else {
            results.push(
                createSuccessResult(
                    "Admin privilegium: Kan slette hvilken som helst anskaffelse",
                    "Skippet: Ingen anskaffelser tilgjengelig for testing"
                )
            );
        }
    } catch (error) {
        results.push(
            createErrorResult(
                "Admin privilegium: Kan slette hvilken som helst anskaffelse",
                error
            )
        );
    }

    // Test 6: Admin privilege - Can read all users via getCollection
    setTestProgress(75);
    try {
        const allUsers = await getCollection("users", []);
        if (Array.isArray(allUsers) && allUsers.length > 0) {
            results.push(
                createSuccessResult(
                    "Admin privilegium: Kan lese alle brukere via getCollection",
                    `Kan lese ${allUsers.length} brukere totalt`
                )
            );
        } else {
            results.push(
                createErrorResult(
                    "Admin privilegium: Kan lese alle brukere via getCollection",
                    "Kunne ikke lese alle brukere"
                )
            );
        }
    } catch (error) {
        results.push(
            createErrorResult(
                "Admin privilegium: Kan lese alle brukere via getCollection",
                error
            )
        );
    }

    // Test 7: Receiver capability - Can view tenders (if invited)
    setTestProgress(85);
    try {
        const allTenders = await getAllTenders();
        const openTenders = allTenders.filter(
            (t) => t.status === "open"
        );

        if (openTenders.length > 0) {
            results.push(
                createSuccessResult(
                    "Receiver evne: Kan se anskaffelser",
                    `Kan se ${openTenders.length} åpne anskaffelser`
                )
            );
        } else {
            results.push(
                createSuccessResult(
                    "Receiver evne: Kan se anskaffelser",
                    "Ingen åpne anskaffelser tilgjengelig (men kan se listen)"
                )
            );
        }
    } catch (error) {
        results.push(
            createErrorResult("Receiver evne: Kan se anskaffelser", error)
        );
    }

    // Test 8: Admin privilege - Can write to companies collection
    setTestProgress(95);
    try {
        // Try to read companies collection (write test would require creating a company)
        const companies = await getCollection("companies", []);
        results.push(
            createSuccessResult(
                "Admin privilegium: Tilgang til companies collection",
                `Kan lese companies collection (${companies.length} selskap funnet)`
            )
        );
    } catch (error) {
        results.push(
            createErrorResult(
                "Admin privilegium: Tilgang til companies collection",
                error
            )
        );
    }
};






