import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { createTestRunner } from "./tests/testHelpers";
import { runBrregTests } from "./tests/brregTests";
import { runQATests } from "./tests/qaTests";
import { runDocumentTests } from "./tests/documentTests";
import { runProjectTests } from "./tests/projectTests";
import { runContractTests } from "./tests/contractTests";
import { runSupplierTests } from "./tests/supplierTests";
import { runComplaintsTests } from "./tests/complaintTests";
import { runTenderTests } from "./tests/tenderTests";
import { runAdminLeverandorTests } from "./tests/adminLeverandorTests";
import { runAdminAnskaffelseTests } from "./tests/adminAnskaffelseTests";
import { deleteAllTestData } from "./tests/testCleanup";
// TODO: Import remaining test module:
// import { runTests } from "./tests/allTests";

/**
 * Hook for running compliance tests
 * 
 * This hook has been refactored to split test functions into separate modules
 * following the CODE_ORGANIZATION.md guidelines (max 200 lines for hooks).
 * 
 * Each test category is now in its own file in src/hooks/tests/
 */
export const useComplianceTests = () => {
    const { user } = useAuth();
    const [testing, setTesting] = useState(false);
    const [testResults, setTestResults] = useState(null);
    const [testProgress, setTestProgress] = useState(0);
    const [activeTestCategory, setActiveTestCategory] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Create test runners using the helper function
    const runBrregTestsWrapper = createTestRunner(
        "brreg",
        runBrregTests,
        setTesting,
        setTestProgress,
        setActiveTestCategory,
        setTestResults,
        user
    );

    const runQATestsWrapper = createTestRunner(
        "qa",
        runQATests,
        setTesting,
        setTestProgress,
        setActiveTestCategory,
        setTestResults,
        user
    );

    const runDocumentTestsWrapper = createTestRunner(
        "documents",
        runDocumentTests,
        setTesting,
        setTestProgress,
        setActiveTestCategory,
        setTestResults,
        user
    );

    const runProjectTestsWrapper = createTestRunner(
        "projects",
        runProjectTests,
        setTesting,
        setTestProgress,
        setActiveTestCategory,
        setTestResults,
        user
    );

    const runContractTestsWrapper = createTestRunner(
        "contracts",
        runContractTests,
        setTesting,
        setTestProgress,
        setActiveTestCategory,
        setTestResults,
        user
    );

    const runSupplierTestsWrapper = createTestRunner(
        "suppliers",
        runSupplierTests,
        setTesting,
        setTestProgress,
        setActiveTestCategory,
        setTestResults,
        user
    );

    const runComplaintsTestsWrapper = createTestRunner(
        "complaints",
        runComplaintsTests,
        setTesting,
        setTestProgress,
        setActiveTestCategory,
        setTestResults,
        user
    );

    const runTenderTestsWrapper = createTestRunner(
        "tenders",
        runTenderTests,
        setTesting,
        setTestProgress,
        setActiveTestCategory,
        setTestResults,
        user
    );

    const runAdminLeverandorTestsWrapper = createTestRunner(
        "adminleverandor",
        runAdminLeverandorTests,
        setTesting,
        setTestProgress,
        setActiveTestCategory,
        setTestResults,
        user
    );

    const runAdminAnskaffelseTestsWrapper = createTestRunner(
        "adminanskaffelse",
        runAdminAnskaffelseTests,
        setTesting,
        setTestProgress,
        setActiveTestCategory,
        setTestResults,
        user
    );

    const runTests = async () => {
        // TODO: Extract to ./tests/allTests.js
        // This should run all tests sequentially
        setTestResults({
            success: false,
            error: "All tests module not yet extracted",
            tests: [],
            category: "all",
        });
    };

    const deleteAllTestDataWrapper = async () => {
        await deleteAllTestData(
            setDeleting,
            setShowDeleteDialog,
            setTestResults,
            user
        );
    };

    return {
        testing,
        testResults,
        testProgress,
        activeTestCategory,
        showDeleteDialog,
        deleting,
        setShowDeleteDialog,
        runTests,
        runProjectTests: runProjectTestsWrapper,
        runTenderTests: runTenderTestsWrapper,
        runQATests: runQATestsWrapper,
        runDocumentTests: runDocumentTestsWrapper,
        runContractTests: runContractTestsWrapper,
        runSupplierTests: runSupplierTestsWrapper,
        runAdminLeverandorTests: runAdminLeverandorTestsWrapper,
        runComplaintsTests: runComplaintsTestsWrapper,
        runAdminAnskaffelseTests: runAdminAnskaffelseTestsWrapper,
        runBrregTests: runBrregTestsWrapper,
        deleteAllTestData: deleteAllTestDataWrapper,
    };
};

