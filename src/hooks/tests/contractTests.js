import {
    createProject,
    getProjectById,
} from "../../api/projectService";
import {
    createTender,
    getTenderById,
} from "../../api/tenderService";
import {
    generateContract,
    getContractById,
    getContractByTenderId,
    getContractsByProject,
    signContract,
    addContractChange,
} from "../../api/contractService";
import {
    createErrorResult,
    createSuccessResult,
} from "./testHelpers";

/**
 * Run contract tests
 */
export const runContractTests = async (
    results,
    setTestProgress,
    user
) => {
    // First, create a test project and tender with a bid
    setTestProgress(10);
    const projectResult = await createProject(
        {
            name: "Test Prosjekt for Kontrakt - " + Date.now(),
            description: "Kontrakttest",
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
            title: "Test Anskaffelse for Kontrakt - " + Date.now(),
            description: "Kontrakttest",
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

    // Submit and award a bid
    setTestProgress(30);
    const { submitBid, awardTender } = await import(
        "../../api/tenderService"
    );
    const bidResult = await submitBid(
        testTenderId,
        { price: 500000, priceStructure: "fastpris" },
        {
            id: "test_supplier",
            companyId: "test_company",
            companyName: "Test Leverandør AS",
        }
    );
    const testBidId = bidResult.bid?.id;

    if (testBidId) {
        await awardTender(testTenderId, testBidId);
    }

    // Test 1: Generate contract
    setTestProgress(40);
    let testContractId = null;
    try {
        const tender = await getTenderById(testTenderId);
        const project = await getProjectById(testProjectId);
        const awardedBid = tender?.bids?.find(
            (b) => b.id === testBidId
        );

        if (tender && project && awardedBid) {
            const contractResult = await generateContract(
                tender,
                awardedBid,
                project
            );
            if (contractResult.success) {
                testContractId = contractResult.contract?.id;
                results.push(
                    createSuccessResult(
                        "Generere kontrakt",
                        `Kontrakt generert med ID: ${testContractId}`
                    )
                );
            } else {
                results.push(
                    createErrorResult(
                        "Generere kontrakt",
                        contractResult.error || "Kunne ikke generere kontrakt"
                    )
                );
            }
        } else {
            results.push(
                createErrorResult(
                    "Generere kontrakt",
                    "Mangler tender, project eller awarded bid"
                )
            );
        }
    } catch (error) {
        results.push(createErrorResult("Generere kontrakt", error));
    }

    // Test 2: Get contract by ID
    setTestProgress(50);
    if (testContractId) {
        try {
            const contract = await getContractById(testContractId);
            if (contract && contract.id === testContractId) {
                results.push(
                    createSuccessResult(
                        "Hente kontrakt etter ID",
                        `Kontrakt hentet: ${contract.id}`
                    )
                );
            } else {
                results.push(
                    createErrorResult(
                        "Hente kontrakt etter ID",
                        "Kunne ikke hente kontrakt"
                    )
                );
            }
        } catch (error) {
            results.push(createErrorResult("Hente kontrakt etter ID", error));
        }
    }

    // Test 3: Get contract by tender ID
    setTestProgress(60);
    try {
        const contract = await getContractByTenderId(testTenderId);
        if (contract && contract.tenderId === testTenderId) {
            results.push(
                createSuccessResult(
                    "Hente kontrakt etter anskaffelse ID",
                    `Kontrakt funnet: ${contract.id}`
                )
            );
        } else {
            results.push(
                createErrorResult(
                    "Hente kontrakt etter anskaffelse ID",
                    "Kunne ikke hente kontrakt"
                )
            );
        }
    } catch (error) {
        results.push(
            createErrorResult("Hente kontrakt etter anskaffelse ID", error)
        );
    }

    // Test 4: Get contracts by project ID
    setTestProgress(70);
    try {
        const contracts = await getContractsByProject(testProjectId);
        if (Array.isArray(contracts)) {
            results.push(
                createSuccessResult(
                    "Hente kontrakter etter prosjekt ID",
                    `${contracts.length} kontrakt(er) funnet`
                )
            );
        } else {
            results.push(
                createErrorResult(
                    "Hente kontrakter etter prosjekt ID",
                    "Ugyldig resultat"
                )
            );
        }
    } catch (error) {
        results.push(
            createErrorResult("Hente kontrakter etter prosjekt ID", error)
        );
    }

    // Test 5: Sign contract
    setTestProgress(80);
    if (testContractId) {
        try {
            const signResult = await signContract(testContractId, user);
            if (signResult.success) {
                results.push(
                    createSuccessResult("Signere kontrakt", "Kontrakt signert")
                );
            } else {
                results.push(
                    createErrorResult(
                        "Signere kontrakt",
                        signResult.error || "Kunne ikke signere"
                    )
                );
            }
        } catch (error) {
            results.push(createErrorResult("Signere kontrakt", error));
        }
    }

    // Test 6: Add contract change
    setTestProgress(90);
    if (testContractId) {
        try {
            const changeResult = await addContractChange(
                testContractId,
                {
                    field: "price",
                    oldValue: 500000,
                    newValue: 550000,
                    reason: "Tillegg for ekstra arbeid",
                },
                user
            );
            if (changeResult.success) {
                results.push(
                    createSuccessResult(
                        "Legge til kontraktendring",
                        "Endring registrert"
                    )
                );
            } else {
                results.push(
                    createErrorResult(
                        "Legge til kontraktendring",
                        changeResult.error || "Kunne ikke legge til endring"
                    )
                );
            }
        } catch (error) {
            results.push(
                createErrorResult("Legge til kontraktendring", error)
            );
        }
    }
};






