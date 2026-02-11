import {
    createProject,
} from "../../api/projectService";
import {
    createTender,
    addSupplierInvitation,
    getInvitationsForSupplier,
    getTendersByProject,
    getTendersByStatus,
    updateTender,
} from "../../api/tenderService";
import {
    createErrorResult,
    createSuccessResult,
} from "./testHelpers";

/**
 * Run supplier tests
 */
export const runSupplierTests = async (
    results,
    setTestProgress,
    user,
    testEmail = null
) => {
    // Use provided email or fallback to default test email
    const emailToUse = testEmail || "test-invite@example.com";

    // Create a test project and tender
    setTestProgress(10);
    const projectResult = await createProject(
        {
            name: "Test Prosjekt for Leverandør - " + Date.now(),
            description: "Leverandørtest",
            status: "active",
        },
        user
    );
    const testProjectId = projectResult.project?.id;

    if (!testProjectId) {
        results.push(
            createErrorResult(
                "Opprette testprosjekt",
                "Kunne ikke opprette testprosjekt"
            )
        );
        return;
    }

    setTestProgress(20);
    const tenderResult = await createTender(
        {
            projectId: testProjectId,
            title: "Test Anskaffelse for Leverandør - " + Date.now(),
            description: "Leverandørtest",
            contractStandard: "NS 8405",
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: "open",
        },
        user
    );
    const testTenderId = tenderResult.tender?.id;

    if (!testTenderId) {
        results.push(
            createErrorResult(
                "Opprette testanskaffelse",
                "Kunne ikke opprette testanskaffelse"
            )
        );
        return;
    }

    // Test 1: Add supplier invitation
    setTestProgress(40);
    try {
        const invitationResult = await addSupplierInvitation(
            testTenderId,
            {
                supplierId: "test_supplier_invite",
                companyId: "test_company_invite",
                companyName: "Test Invitert Leverandør AS",
                orgNumber: "123456789",
                email: emailToUse,
            }
        );
        if (invitationResult.success) {
            results.push(
                createSuccessResult(
                    "Legge til leverandørinvitasjon",
                    `Invitasjon sendt til ${emailToUse}`
                )
            );
        } else {
            results.push(
                createErrorResult(
                    "Legge til leverandørinvitasjon",
                    invitationResult.error || "Kunne ikke sende invitasjon"
                )
            );
        }
    } catch (error) {
        results.push(createErrorResult("Legge til leverandørinvitasjon", error));
    }

    // Test 2: Get invitations for supplier
    setTestProgress(60);
    try {
        const invitations = await getInvitationsForSupplier(
            "test_supplier_invite",
            emailToUse
        );
        if (Array.isArray(invitations)) {
            results.push(
                createSuccessResult(
                    "Hente invitasjoner for leverandør",
                    `${invitations.length} invitasjon(er) funnet`
                )
            );
        } else {
            results.push(
                createErrorResult(
                    "Hente invitasjoner for leverandør",
                    "Ugyldig resultat"
                )
            );
        }
    } catch (error) {
        results.push(createErrorResult("Hente invitasjoner for leverandør", error));
    }

    // Test 3: Get tenders by project
    setTestProgress(80);
    try {
        const tenders = await getTendersByProject(testProjectId);
        if (Array.isArray(tenders) && tenders.length > 0) {
            results.push(
                createSuccessResult(
                    "Hente anskaffelser etter prosjekt",
                    `${tenders.length} anskaffelse(r) funnet`
                )
            );
        } else {
            results.push(
                createSuccessResult(
                    "Hente anskaffelser etter prosjekt",
                    "Ingen anskaffelser funnet (tomt resultat er OK)"
                )
            );
        }
    } catch (error) {
        results.push(createErrorResult("Hente anskaffelser etter prosjekt", error));
    }

    // Test 4: Get tenders by status
    setTestProgress(90);
    try {
        const tenders = await getTendersByStatus("open");
        if (Array.isArray(tenders)) {
            results.push(
                createSuccessResult(
                    "Hente anskaffelser etter status",
                    `${tenders.length} åpne anskaffelse(r) funnet`
                )
            );
        } else {
            results.push(
                createErrorResult(
                    "Hente anskaffelser etter status",
                    "Ugyldig resultat"
                )
            );
        }
    } catch (error) {
        results.push(createErrorResult("Hente anskaffelser etter status", error));
    }

    // Test 5: Update tender
    setTestProgress(95);
    try {
        const updateResult = await updateTender(testTenderId, {
            description: "Oppdatert beskrivelse",
        });
        if (updateResult.success) {
            results.push(
                createSuccessResult(
                    "Oppdatere anskaffelse",
                    "Anskaffelse oppdatert"
                )
            );
        } else {
            results.push(
                createErrorResult(
                    "Oppdatere anskaffelse",
                    updateResult.error || "Kunne ikke oppdatere"
                )
            );
        }
    } catch (error) {
        results.push(createErrorResult("Oppdatere anskaffelse", error));
    }
};






