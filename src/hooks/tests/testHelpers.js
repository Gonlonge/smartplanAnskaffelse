/**
 * Helper functions for compliance tests
 * Provides common utilities for test execution
 */

/**
 * Creates a test result object
 */
export const createTestResult = (name, success, message) => ({
    name,
    success,
    message,
});

/**
 * Creates an error test result
 */
export const createErrorResult = (name, error) =>
    createTestResult(name, false, error.message || error || "Ukjent feil");

/**
 * Creates a success test result
 */
export const createSuccessResult = (name, message) =>
    createTestResult(name, true, message);

/**
 * Creates a test results summary object
 */
export const createTestResults = (results, category, error = null) => {
    const allTestsPassed = results.every((r) => r.success);
    const passedCount = results.filter((r) => r.success).length;
    const totalCount = results.length;

    return {
        success: allTestsPassed && !error,
        error: error || null,
        tests: results,
        summary: error
            ? error
            : `${passedCount} av ${totalCount} tester bestått`,
        category,
    };
};

/**
 * Creates a test runner wrapper that handles common setup/teardown
 */
export const createTestRunner = (
    category,
    testFunction,
    setTesting,
    setTestProgress,
    setActiveTestCategory,
    setTestResults,
    user
) => {
    return async (...args) => {
        setActiveTestCategory(category);
        if (!user) {
            setTestResults({
                success: false,
                error: "Du må være innlogget for å kjøre tester",
                tests: [],
                category,
            });
            return;
        }

        setTesting(true);
        setTestProgress(0);
        const results = [];

        try {
            await testFunction(
                results,
                setTestProgress,
                user,
                ...args
            );

            const testResults = createTestResults(results, category);
            setTestResults(testResults);
        } catch (error) {
            const testResults = createTestResults(
                results,
                category,
                error.message || "Ukjent feil oppstod"
            );
            setTestResults(testResults);
        } finally {
            setTesting(false);
            setTestProgress(0);
            setActiveTestCategory(null);
        }
    };
};






