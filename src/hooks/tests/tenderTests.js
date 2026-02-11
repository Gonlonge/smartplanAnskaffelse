import {
    createProject,
    getAllProjects,
} from "../../api/projectService";
import {
    createTender,
    getTenderById,
    getAllTenders,
    getTendersByStatus,
    closeTender,
    openTender,
    addSupplierInvitation,
} from "../../api/tenderService";
import {
    createErrorResult,
    createSuccessResult,
} from "./testHelpers";

/**
 * Run tender tests
 */
export const runTenderTests = async (
    results,
    setTestProgress,
    user,
    testEmail = null
) => {
    // Use provided email or fallback to default test email
    const emailToUse = testEmail || "test-tender@example.com";

    // Test 1: Create a test project
    setTestProgress(10);
    let testProjectId = null;
    try {
        const projectResult = await createProject(
            {
                name:
                    "Test Prosjekt for Tender Test - " +
                    new Date().toISOString(),
                description: "Midlertidig prosjekt for testing",
                status: "active",
            },
            user
        );

        testProjectId = projectResult.project?.id;

        if (!testProjectId) {
            results.push(
                createErrorResult(
                    "Opprette testprosjekt",
                    "Kunne ikke opprette testprosjekt"
                )
            );
            return;
        }

        results.push(
            createSuccessResult(
                "Opprette testprosjekt",
                `Prosjekt opprettet: ${testProjectId}`
            )
        );
    } catch (error) {
        results.push(createErrorResult("Opprette testprosjekt", error));
        return;
    }

    // Test 2: Create open tender (åpne anskaffelse)
    setTestProgress(30);
    let testOpenTenderId = null;
    try {
        const createOpenResult = await createTender(
            {
                projectId: testProjectId,
                title:
                    "Test Åpne Anskaffelse - " +
                    new Date().toISOString(),
                description: "Test åpne anskaffelse",
                contractStandard: "NS 8405",
                deadline: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000
                ),
                status: "open",
            },
            user
        );

        if (createOpenResult.success && createOpenResult.tender) {
            testOpenTenderId = createOpenResult.tender.id;
            results.push(
                createSuccessResult(
                    "Opprette åpne anskaffelse",
                    `Åpne anskaffelse opprettet: ${testOpenTenderId}`
                )
            );
        } else {
            results.push(
                createErrorResult(
                    "Opprette åpne anskaffelse",
                    createOpenResult.error ||
                        "Kunne ikke opprette åpne anskaffelse"
                )
            );
        }
    } catch (error) {
        results.push(createErrorResult("Opprette åpne anskaffelse", error));
    }

    // Test 3: Create closed tender (lukkede anskaffelse)
    setTestProgress(50);
    let testClosedTenderId = null;
    try {
        const createClosedResult = await createTender(
            {
                projectId: testProjectId,
                title:
                    "Test Lukkede Anskaffelse - " +
                    new Date().toISOString(),
                description: "Test lukkede anskaffelse",
                contractStandard: "NS 8405",
                deadline: new Date(
                    Date.now() - 10 * 24 * 60 * 60 * 1000
                ), // Past deadline for closed tender
                status: "closed",
            },
            user
        );

        if (createClosedResult.success && createClosedResult.tender) {
            testClosedTenderId = createClosedResult.tender.id;
            results.push(
                createSuccessResult(
                    "Opprette lukkede anskaffelse",
                    `Lukkede anskaffelse opprettet: ${testClosedTenderId}`
                )
            );
        } else {
            results.push(
                createErrorResult(
                    "Opprette lukkede anskaffelse",
                    createClosedResult.error ||
                        "Kunne ikke opprette lukkede anskaffelse"
                )
            );
        }
    } catch (error) {
        results.push(createErrorResult("Opprette lukkede anskaffelse", error));
    }

    // Test 4: Get tender by ID
    setTestProgress(70);
    if (testOpenTenderId) {
        try {
            const retrievedTender = await getTenderById(testOpenTenderId);
            if (
                retrievedTender &&
                retrievedTender.id === testOpenTenderId
            ) {
                results.push(
                    createSuccessResult(
                        "Hente anskaffelse etter ID",
                        `Anskaffelse hentet: ${retrievedTender.title}`
                    )
                );
            } else {
                results.push(
                    createErrorResult(
                        "Hente anskaffelse etter ID",
                        "Kunne ikke hente anskaffelse"
                    )
                );
            }
        } catch (error) {
            results.push(createErrorResult("Hente anskaffelse etter ID", error));
        }
    } else {
        results.push(
            createErrorResult(
                "Hente anskaffelse etter ID",
                "Ingen anskaffelse ID tilgjengelig"
            )
        );
    }

    // Test 5: Get all tenders
    setTestProgress(80);
    try {
        const allTenders = await getAllTenders();
        if (Array.isArray(allTenders)) {
            const openCount = allTenders.filter(
                (t) => t.status === "open"
            ).length;
            const closedCount = allTenders.filter(
                (t) => t.status === "closed"
            ).length;
            results.push(
                createSuccessResult(
                    "Hente alle anskaffelser",
                    `${allTenders.length} anskaffelser funnet (${openCount} åpne, ${closedCount} lukkede)`
                )
            );
        } else {
            results.push(
                createSuccessResult(
                    "Hente alle anskaffelser",
                    "Ingen anskaffelser funnet (tomt resultat er OK)"
                )
            );
        }
    } catch (error) {
        results.push(createErrorResult("Hente alle anskaffelser", error));
    }

    // Test 6: Get closed tenders by status
    setTestProgress(85);
    if (testClosedTenderId) {
        try {
            const closedTenders = await getTendersByStatus("closed");
            const foundClosedTender = closedTenders.find(
                (t) => t.id === testClosedTenderId
            );
            if (
                foundClosedTender &&
                foundClosedTender.status === "closed"
            ) {
                results.push(
                    createSuccessResult(
                        "Hente lukkede anskaffelser",
                        `Lukkede anskaffelse funnet: ${foundClosedTender.title}`
                    )
                );
            } else {
                results.push(
                    createErrorResult(
                        "Hente lukkede anskaffelser",
                        "Kunne ikke finne lukkede anskaffelse"
                    )
                );
            }
        } catch (error) {
            results.push(
                createErrorResult("Hente lukkede anskaffelser", error)
            );
        }
    } else {
        results.push(
            createErrorResult(
                "Hente lukkede anskaffelser",
                "Ingen lukkede anskaffelse ID tilgjengelig"
            )
        );
    }

    // Test 7: Close and reopen tender
    if (testOpenTenderId) {
        setTestProgress(90);
        try {
            // Close the tender
            const closeResult = await closeTender(testOpenTenderId);
            if (closeResult.success) {
                // Verify status changed
                const closedTender = await getTenderById(testOpenTenderId);
                if (closedTender && closedTender.status === "closed") {
                    results.push(
                        createSuccessResult(
                            "Lukke anskaffelse",
                            "Anskaffelse lukket suksessfullt"
                        )
                    );

                    // Reopen the tender
                    const reopenResult = await openTender(testOpenTenderId);
                    if (reopenResult.success) {
                        // Verify status changed back
                        const reopenedTender = await getTenderById(
                            testOpenTenderId
                        );
                        if (
                            reopenedTender &&
                            reopenedTender.status === "open"
                        ) {
                            results.push(
                                createSuccessResult(
                                    "Gjenåpne anskaffelse",
                                    "Anskaffelse gjenåpnet suksessfullt"
                                )
                            );
                        } else {
                            results.push(
                                createErrorResult(
                                    "Gjenåpne anskaffelse",
                                    'Status ble ikke oppdatert til "open"'
                                )
                            );
                        }
                    } else {
                        results.push(
                            createErrorResult(
                                "Gjenåpne anskaffelse",
                                reopenResult.error ||
                                    "Kunne ikke gjenåpne anskaffelse"
                            )
                        );
                    }
                } else {
                    results.push(
                        createErrorResult(
                            "Lukke anskaffelse",
                            'Status ble ikke oppdatert til "closed"'
                        )
                    );
                }
            } else {
                results.push(
                    createErrorResult(
                        "Lukke anskaffelse",
                        closeResult.error || "Kunne ikke lukke anskaffelse"
                    )
                );
            }
        } catch (error) {
            results.push(
                createErrorResult("Lukke/gjenåpne anskaffelse", error)
            );
        }
    }

    // Test 8: Add supplier invitation to tender (with email)
    if (testOpenTenderId) {
        setTestProgress(98);
        try {
            const invitationResult = await addSupplierInvitation(
                testOpenTenderId,
                {
                    supplierId: "test_supplier_tender",
                    companyId: "test_company_tender",
                    companyName: "Test Leverandør for Anskaffelse AS",
                    orgNumber: "999888777",
                    email: emailToUse,
                }
            );
            if (invitationResult.success) {
                results.push(
                    createSuccessResult(
                        "Legge til leverandørinvitasjon til anskaffelse",
                        `Invitasjon sendt til ${emailToUse}`
                    )
                );
            } else {
                results.push(
                    createErrorResult(
                        "Legge til leverandørinvitasjon til anskaffelse",
                        invitationResult.error || "Kunne ikke sende invitasjon"
                    )
                );
            }
        } catch (error) {
            results.push(
                createErrorResult(
                    "Legge til leverandørinvitasjon til anskaffelse",
                    error
                )
            );
        }
    }
};






