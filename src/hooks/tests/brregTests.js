import {
    searchCompanyByOrgNumber,
    searchCompaniesByName,
} from "../../api/brregService";
import {
    createTestResult,
    createErrorResult,
    createSuccessResult,
    createTestResults,
} from "./testHelpers";

/**
 * Run Brreg API tests
 */
export const runBrregTests = async (
    results,
    setTestProgress,
    user
) => {
    // Test 1: Search company by org number (Equinor)
    setTestProgress(25);
    try {
        const result = await searchCompanyByOrgNumber("923609016");
        if (result.success && result.company) {
            results.push(
                createSuccessResult(
                    "Søk etter selskap med org.nr",
                    `Funnet: ${result.company.name} (${result.company.orgNumber})`
                )
            );
        } else {
            results.push(
                createErrorResult(
                    "Søk etter selskap med org.nr",
                    result.error || "Kunne ikke finne selskap"
                )
            );
        }
    } catch (error) {
        results.push(createErrorResult("Søk etter selskap med org.nr", error));
    }

    // Test 2: Search with invalid org number
    setTestProgress(50);
    try {
        const result = await searchCompanyByOrgNumber("123");
        if (!result.success) {
            results.push(
                createSuccessResult(
                    "Validere ugyldig org.nr",
                    "Korrekt feilmelding for ugyldig org.nr"
                )
            );
        } else {
            results.push(
                createErrorResult(
                    "Validere ugyldig org.nr",
                    "Burde ha feilet for ugyldig org.nr"
                )
            );
        }
    } catch (error) {
        results.push(
            createSuccessResult(
                "Validere ugyldig org.nr",
                "Validering fungerer korrekt"
            )
        );
    }

    // Test 3: Search companies by name
    setTestProgress(75);
    try {
        const result = await searchCompaniesByName("Equinor");
        if (result.success && Array.isArray(result.companies)) {
            results.push(
                createSuccessResult(
                    "Søk etter selskap med navn",
                    `Fant ${result.companies.length} selskap(er)`
                )
            );
        } else {
            results.push(
                createErrorResult(
                    "Søk etter selskap med navn",
                    result.error || "Kunne ikke søke"
                )
            );
        }
    } catch (error) {
        results.push(createErrorResult("Søk etter selskap med navn", error));
    }

    // Test 4: Search with short name (should fail validation)
    setTestProgress(100);
    try {
        const result = await searchCompaniesByName("A");
        if (!result.success) {
            results.push(
                createSuccessResult(
                    "Validere for kort navn",
                    "Korrekt feilmelding for for kort navn"
                )
            );
        } else {
            results.push(
                createErrorResult(
                    "Validere for kort navn",
                    "Burde ha feilet for for kort navn"
                )
            );
        }
    } catch (error) {
        results.push(
            createSuccessResult(
                "Validere for kort navn",
                "Validering fungerer korrekt"
            )
        );
    }
};






