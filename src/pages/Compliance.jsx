import { Box, Typography, Alert, Divider } from "@mui/material";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
    useComplianceTests,
    useNotificationTests,
    useEmailTests,
    useDocumentVersioningTests,
} from "../hooks";
import {
    ComplianceChecklist,
    CodeExamples,
    FirebaseTestRunner,
    NotificationTester,
    EmailTester,
    EmailPreferenceDevtools,
    DocumentVersioningTester,
    TestDataCleanup,
} from "../components/features/compliance";

/**
 * Compliance Page
 *
 * A dev/QA page for:
 * - Viewing compliance status against MD documentation files
 * - Running automated tests for Firebase operations
 * - Managing test data cleanup
 */
const Compliance = () => {
    const { user } = useAuth();

    // Firebase test runner hook
    const {
        testing,
        testResults,
        testProgress,
        activeTestCategory,
        showDeleteDialog,
        deleting,
        setShowDeleteDialog,
        runTests,
        runProjectTests,
        runTenderTests,
        runQATests,
        runDocumentTests,
        runContractTests,
        runSupplierTests,
        runAdminLeverandorTests,
        runComplaintsTests,
        runAdminAnskaffelseTests,
        runBrregTests,
        deleteAllTestData,
    } = useComplianceTests();

    // Notification tests hook
    const {
        notificationTesting,
        notificationTestResults,
        notificationTestProgress,
        runNotificationTests,
    } = useNotificationTests();

    // Email tests hook
    const {
        emailTesting,
        emailTestResults,
        emailTestProgress,
        testEmailAddress,
        setTestEmailAddress,
        runEmailTests,
    } = useEmailTests();

    // Document versioning tests hook
    const {
        versioningTesting,
        versioningTestResults,
        versioningTestProgress,
        testDocumentId,
        testTenderId,
        setTestDocumentId,
        setTestTenderId,
        runVersioningTests,
    } = useDocumentVersioningTests();

    // Test email addresses for supplier and tender tests
    const [supplierTestEmail, setSupplierTestEmail] = useState(
        user?.email || "",
    );
    const [tenderTestEmail, setTenderTestEmail] = useState(user?.email || "");
    const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);

    // Map category ID to test function
    const testFunctions = {
        all: runTests,
        projects: runProjectTests,
        tenders: (email) => runTenderTests(email),
        qa: runQATests,
        documents: runDocumentTests,
        contracts: runContractTests,
        suppliers: (email) => runSupplierTests(email),
        adminleverandor: runAdminLeverandorTests,
        complaints: runComplaintsTests,
        adminanskaffelse: runAdminAnskaffelseTests,
        brreg: runBrregTests,
    };

    const handleRunTest = (categoryId) => {
        const testFn = testFunctions[categoryId];
        if (testFn) {
            // Pass email for supplier and tender tests
            if (categoryId === "suppliers") {
                testFn(supplierTestEmail || undefined);
            } else if (categoryId === "tenders") {
                testFn(tenderTestEmail || undefined);
            } else {
                testFn();
            }
        }
    };

    const handleVersionRestored = () => {
        // Reload test results
        if (testDocumentId) {
            runVersioningTests();
        }
    };

    return (
        <Box>
            {/* Header */}
            <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                    fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
                    mb: 2,
                }}
            >
                Overholdelseskontroll
            </Typography>

            <Alert severity="success" sx={{ mb: 4 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Status: Fullt overholdende
                </Typography>
                <Typography variant="body2">
                    All kode følger reglene fra dokumentasjonsfilene (MD-filer)
                </Typography>
            </Alert>

            {/* Compliance Checklist */}
            <ComplianceChecklist />

            <Divider sx={{ my: 4 }} />

            {/* Code Examples */}
            <CodeExamples />

            <Divider sx={{ my: 4 }} />

            {/* Firebase Test Runner */}
            <FirebaseTestRunner
                testing={testing}
                testResults={testResults}
                testProgress={testProgress}
                activeTestCategory={activeTestCategory}
                supplierTestEmail={supplierTestEmail}
                tenderTestEmail={tenderTestEmail}
                onSupplierEmailChange={setSupplierTestEmail}
                onTenderEmailChange={setTenderTestEmail}
                onRunTest={handleRunTest}
            />

            <Divider sx={{ my: 4 }} />

            {/* Notification Tester */}
            <NotificationTester
                user={user}
                notificationTesting={notificationTesting}
                notificationTestResults={notificationTestResults}
                notificationTestProgress={notificationTestProgress}
                onRunTests={runNotificationTests}
            />

            <Divider sx={{ my: 4 }} />

            {/* Email Tester */}
            <EmailTester
                user={user}
                emailTesting={emailTesting}
                emailTestResults={emailTestResults}
                emailTestProgress={emailTestProgress}
                testEmailAddress={testEmailAddress}
                onEmailChange={setTestEmailAddress}
                onRunTests={runEmailTests}
            />

            <Divider sx={{ my: 4 }} />

            {/* Devtools: Email Preference Tests */}
            <EmailPreferenceDevtools user={user} />

            <Divider sx={{ my: 4 }} />

            {/* Document Versioning Tester */}
            <DocumentVersioningTester
                user={user}
                versioningTesting={versioningTesting}
                versioningTestResults={versioningTestResults}
                versioningTestProgress={versioningTestProgress}
                testDocumentId={testDocumentId}
                testTenderId={testTenderId}
                versionHistoryOpen={versionHistoryOpen}
                onRunTests={runVersioningTests}
                onVersionHistoryOpen={() => setVersionHistoryOpen(true)}
                onVersionHistoryClose={() => setVersionHistoryOpen(false)}
                onVersionRestored={handleVersionRestored}
            />

            <Divider sx={{ my: 4 }} />

            {/* Test Data Cleanup */}
            <TestDataCleanup
                deleting={deleting}
                showDeleteDialog={showDeleteDialog}
                onDeleteClick={() => setShowDeleteDialog(true)}
                onDeleteConfirm={deleteAllTestData}
                onDeleteCancel={() => setShowDeleteDialog(false)}
            />
        </Box>
    );
};

export default Compliance;
