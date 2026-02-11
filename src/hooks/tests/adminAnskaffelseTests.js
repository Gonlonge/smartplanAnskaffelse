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
 * Run admin anskaffelse tests
 * These tests verify admin privileges for sender (anskaffelse) users
 */
export const runAdminAnskaffelseTests = async (
    results,
    setTestProgress,
    user
) => {
    // Check if current user is admin anskaffelse
    if (user.role !== "sender" || !user.isAdmin) {
        results.push(
            createErrorResult(
                "Verifisere brukertype",
                `Brukeren har role: ${user.role}, isAdmin: ${user.isAdmin}. Forventet: role: 'sender', isAdmin: true`
            )
        );
        return;
    }

    // Test 1: Verify user is admin anskaffelse
    setTestProgress(5);
    results.push(
        createSuccessResult(
            "Verifisere admin anskaffelse status",
            `Bruker er admin anskaffelse (role: ${user.role}, isAdmin: ${user.isAdmin})`
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

    // Test 3: Sender capability - Can create projects
    setTestProgress(30);
    try {
        const projectResult = await createProject(
            {
                name:
                    "Test Prosjekt Admin Anskaffelse - " +
                    new Date().toISOString(),
                description:
                    "Test prosjekt opprettet av admin anskaffelse",
                status: "active",
            },
            user
        );

        if (projectResult.success && projectResult.project) {
            results.push(
                createSuccessResult(
                    "Sender evne: Kan opprette prosjekter",
                    `Prosjekt opprettet: ${projectResult.project.id}`
                )
            );
        } else {
            results.push(
                createErrorResult(
                    "Sender evne: Kan opprette prosjekter",
                    projectResult.error || "Kunne ikke opprette prosjekt"
                )
            );
        }
    } catch (error) {
        results.push(
            createErrorResult("Sender evne: Kan opprette prosjekter", error)
        );
    }

    // Test 4: Sender capability - Can create tenders
    setTestProgress(50);
    try {
        const allProjects = await getAllProjects();
        const testProjectId = allProjects[0]?.id;

        if (testProjectId) {
            const tenderResult = await createTender(
                {
                    projectId: testProjectId,
                    title:
                        "Test Anskaffelse Admin - " +
                        new Date().toISOString(),
                    description:
                        "Test anskaffelse opprettet av admin anskaffelse",
                    contractStandard: "NS 8405",
                    deadline: new Date(
                        Date.now() + 30 * 24 * 60 * 60 * 1000
                    ),
                    status: "open",
                },
                user
            );

            if (tenderResult.success && tenderResult.tender) {
                results.push(
                    createSuccessResult(
                        "Sender evne: Kan opprette anskaffelser",
                        `Anskaffelse opprettet: ${tenderResult.tender.id}`
                    )
                );
            } else {
                results.push(
                    createErrorResult(
                        "Sender evne: Kan opprette anskaffelser",
                        tenderResult.error || "Kunne ikke opprette anskaffelse"
                    )
                );
            }
        } else {
            results.push(
                createSuccessResult(
                    "Sender evne: Kan opprette anskaffelser",
                    "Skippet: Ingen prosjekter tilgjengelig for testing"
                )
            );
        }
    } catch (error) {
        results.push(
            createErrorResult("Sender evne: Kan opprette anskaffelser", error)
        );
    }

    // Test 5: Admin privilege - Can delete any tender
    setTestProgress(70);
    try {
        const allTenders = await getAllTenders();
        if (allTenders.length > 0) {
            const testTender = allTenders[0];
            const deleteResult = await deleteTender(testTender.id);

            if (deleteResult.success) {
                results.push(
                    createSuccessResult(
                        "Admin privilegium: Kan slette hvilken som helst anskaffelse",
                        `Kunne slette anskaffelse "${testTender.title}"`
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
    setTestProgress(85);
    try {
        const allUsers = await getCollection("users", []);
        if (Array.isArray(allUsers) && allUsers.length > 0) {
            results.push(
                createSuccessResult(
                    "Admin privilegium: Kan lese alle brukere",
                    `Kan lese ${allUsers.length} brukere totalt`
                )
            );
        } else {
            results.push(
                createErrorResult(
                    "Admin privilegium: Kan lese alle brukere",
                    "Kunne ikke lese alle brukere"
                )
            );
        }
    } catch (error) {
        results.push(
            createErrorResult(
                "Admin privilegium: Kan lese alle brukere",
                error
            )
        );
    }
};






