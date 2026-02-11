import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
    getAllTenders,
    createTender,
    addDocumentsToTender,
} from "../api/tenderService";
import { createProject } from "../api/projectService";
import {
    getDocumentVersions,
    getDocumentChangeHistory,
    compareDocumentVersions,
} from "../services/documentVersioning";

/**
 * Hook for running document versioning tests
 */
export const useDocumentVersioningTests = () => {
    const { user } = useAuth();
    const [versioningTesting, setVersioningTesting] = useState(false);
    const [versioningTestResults, setVersioningTestResults] = useState(null);
    const [versioningTestProgress, setVersioningTestProgress] = useState(0);
    const [testDocumentId, setTestDocumentId] = useState("");
    const [testTenderId, setTestTenderId] = useState("");

    const runVersioningTests = async () => {
        if (!user) {
            setVersioningTestResults({
                success: false,
                error: "Du må være innlogget for å kjøre tester",
                tests: [],
            });
            return;
        }

        setVersioningTesting(true);
        setVersioningTestProgress(0);
        setVersioningTestResults(null);

        const tests = [];
        let passed = 0;
        let failed = 0;
        let testDocId = testDocumentId;
        let testTender = testTenderId;

        try {
            // Test 1: Create test tender and document if needed
            setVersioningTestProgress(10);
            if (!testTender) {
                try {
                    // Get or create a test tender
                    const existingTenders = await getAllTenders({
                        createdBy: user.id,
                    });
                    const testTenderData = existingTenders.find((t) =>
                        t.title?.includes("Test Versioning")
                    );

                    if (testTenderData) {
                        testTender = testTenderData.id;
                    } else {
                        // Create test project
                        const projectResult = await createProject(
                            {
                                name: `Test Prosjekt Versioning - ${Date.now()}`,
                                description:
                                    "Test prosjekt for dokumentversjonering",
                                status: "active",
                            },
                            user
                        );

                        if (projectResult.success && projectResult.project) {
                            // Create test tender
                            const tenderResult = await createTender(
                                {
                                    projectId: projectResult.project.id,
                                    title: `Test Versioning - ${Date.now()}`,
                                    description:
                                        "Test anskaffelse for dokumentversjonering",
                                    contractStandard: "NS 8405",
                                    deadline: new Date(
                                        Date.now() + 30 * 24 * 60 * 60 * 1000
                                    ),
                                    status: "draft",
                                },
                                user
                            );

                            if (tenderResult.success && tenderResult.tender) {
                                testTender = tenderResult.tender.id;
                                setTestTenderId(testTender);
                            }
                        }
                    }
                } catch (error) {
                    tests.push({
                        name: "Opprett test anskaffelse",
                        message:
                            error.message ||
                            "Kunne ikke opprette test anskaffelse",
                        success: false,
                    });
                    failed++;
                }
            }

            if (!testTender) {
                setVersioningTestResults({
                    success: false,
                    error: "Kunne ikke opprette eller finne test anskaffelse",
                    tests: tests,
                });
                setVersioningTesting(false);
                return;
            }

            // Test 2: Create initial document version
            setVersioningTestProgress(30);
            try {
                // Create a mock file for testing
                const mockFile = new File(
                    ["Test document content v1"],
                    "test-document-v1.txt",
                    { type: "text/plain" }
                );

                const uploadResult = await addDocumentsToTender(
                    testTender,
                    [mockFile],
                    user
                );
                if (uploadResult.success) {
                    // Get the tender to find the document ID
                    const { getTenderById } = await import(
                        "../api/tenderService"
                    );
                    const tender = await getTenderById(testTender);
                    const doc = tender?.documents?.[0];
                    if (doc) {
                        testDocId = doc.id;
                        setTestDocumentId(testDocId);
                        tests.push({
                            name: "Opprett første dokumentversjon",
                            message: `Dokument opprettet med ID: ${testDocId}`,
                            success: true,
                        });
                        passed++;
                    } else {
                        tests.push({
                            name: "Opprett første dokumentversjon",
                            message:
                                "Dokument opprettet, men kunne ikke hente ID",
                            success: false,
                        });
                        failed++;
                    }
                } else {
                    tests.push({
                        name: "Opprett første dokumentversjon",
                        message:
                            uploadResult.error ||
                            "Kunne ikke opprette dokument",
                        success: false,
                    });
                    failed++;
                }
            } catch (error) {
                tests.push({
                    name: "Opprett første dokumentversjon",
                    message: error.message || "Ukjent feil",
                    success: false,
                });
                failed++;
            }

            // Test 3: Get document versions
            setVersioningTestProgress(50);
            if (testDocId) {
                try {
                    const versions = await getDocumentVersions(testDocId);
                    tests.push({
                        name: "Hent dokumentversjoner",
                        message: `Fant ${versions.length} versjon(er)`,
                        success: true,
                    });
                    passed++;
                } catch (error) {
                    tests.push({
                        name: "Hent dokumentversjoner",
                        message: error.message || "Kunne ikke hente versjoner",
                        success: false,
                    });
                    failed++;
                }
            }

            // Test 4: Create second version (update document)
            setVersioningTestProgress(70);
            if (testDocId) {
                try {
                    const mockFile2 = new File(
                        ["Test document content v2 - updated"],
                        "test-document-v1.txt", // Same name to trigger versioning
                        { type: "text/plain" }
                    );

                    const uploadResult2 = await addDocumentsToTender(
                        testTender,
                        [mockFile2],
                        user
                    );
                    if (uploadResult2.success) {
                        const versions = await getDocumentVersions(testDocId);
                        if (versions.length >= 2) {
                            tests.push({
                                name: "Opprett ny versjon (oppdatering)",
                                message: `Ny versjon opprettet. Totalt ${versions.length} versjoner`,
                                success: true,
                            });
                            passed++;
                        } else {
                            tests.push({
                                name: "Opprett ny versjon (oppdatering)",
                                message:
                                    "Dokument oppdatert, men versjonering fungerte ikke",
                                success: false,
                            });
                            failed++;
                        }
                    } else {
                        tests.push({
                            name: "Opprett ny versjon (oppdatering)",
                            message:
                                uploadResult2.error ||
                                "Kunne ikke oppdatere dokument",
                            success: false,
                        });
                        failed++;
                    }
                } catch (error) {
                    tests.push({
                        name: "Opprett ny versjon (oppdatering)",
                        message: error.message || "Ukjent feil",
                        success: false,
                    });
                    failed++;
                }
            }

            // Test 5: Get change history
            setVersioningTestProgress(85);
            if (testDocId) {
                try {
                    const history = await getDocumentChangeHistory(testDocId);
                    tests.push({
                        name: "Hent endringshistorikk",
                        message: `Fant ${history.length} endring(er) i historikken`,
                        success: true,
                    });
                    passed++;
                } catch (error) {
                    tests.push({
                        name: "Hent endringshistorikk",
                        message:
                            error.message ||
                            "Kunne ikke hente endringshistorikk",
                        success: false,
                    });
                    failed++;
                }
            }

            // Test 6: Compare versions
            setVersioningTestProgress(95);
            if (testDocId) {
                try {
                    const versions = await getDocumentVersions(testDocId);
                    if (versions.length >= 2) {
                        const comparison = compareDocumentVersions(
                            versions[1],
                            versions[0]
                        );
                        tests.push({
                            name: "Sammenlign versjoner",
                            message: `Sammenligning fullført. ${comparison.differences.length} forskjell(er) funnet`,
                            success: true,
                        });
                        passed++;
                    } else {
                        tests.push({
                            name: "Sammenlign versjoner",
                            message: "Ikke nok versjoner til sammenligning",
                            success: false,
                        });
                        failed++;
                    }
                } catch (error) {
                    tests.push({
                        name: "Sammenlign versjoner",
                        message:
                            error.message || "Kunne ikke sammenligne versjoner",
                        success: false,
                    });
                    failed++;
                }
            }

            setVersioningTestProgress(100);
        } catch (error) {
            console.error("Error in versioning tests:", error);
            tests.push({
                name: "Generell feil",
                message: error.message || "Ukjent feil oppstod",
                success: false,
            });
            failed++;
        }

        setVersioningTestResults({
            success: failed === 0,
            summary: `${passed} av ${tests.length} tester bestått`,
            tests: tests,
            testDocumentId: testDocId,
            testTenderId: testTender,
        });
        setVersioningTesting(false);
        setVersioningTestProgress(0);
    };

    return {
        versioningTesting,
        versioningTestResults,
        versioningTestProgress,
        testDocumentId,
        testTenderId,
        setTestDocumentId,
        setTestTenderId,
        runVersioningTests,
    };
};





