import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
    sendTenderInvitationEmail,
    sendBidSubmissionEmail,
    sendDeadlineReminderEmail,
    sendContractSigningRequestEmail,
    sendAwardLetterEmail,
    sendBidRejectionEmail,
} from "../api/emailService";
import { checkAndSendDeadlineReminders } from "../api/deadlineReminderService";

/**
 * Hook for running email tests
 */
export const useEmailTests = () => {
    const { user } = useAuth();
    const [emailTesting, setEmailTesting] = useState(false);
    const [emailTestResults, setEmailTestResults] = useState(null);
    const [emailTestProgress, setEmailTestProgress] = useState(0);
    const [testEmailAddress, setTestEmailAddress] = useState(user?.email || "");

    const runEmailTests = async () => {
        if (!user) {
            setEmailTestResults({
                success: false,
                error: "Du må være innlogget for å kjøre tester",
                tests: [],
            });
            return;
        }

        if (!testEmailAddress) {
            setEmailTestResults({
                success: false,
                error: "E-postadresse er påkrevd for testing",
                tests: [],
            });
            return;
        }

        setEmailTesting(true);
        setEmailTestProgress(0);
        setEmailTestResults(null);

        const tests = [];
        let passed = 0;
        let failed = 0;

        // Test 1: Tender Invitation Email
        try {
            setEmailTestProgress(20);
            const mockTender1 = {
                id: "test-tender-email-1",
                title: "Test Anskaffelse - E-post Invitasjon",
                description:
                    "Dette er en test anskaffelse for å verifisere e-postfunksjonalitet",
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                contractStandard: "NS 8405",
            };
            const result1 = await sendTenderInvitationEmail(
                testEmailAddress,
                mockTender1,
                "Test Leverandør"
            );
            if (result1.success) {
                tests.push({
                    name: "Tender Invitation Email",
                    message: result1.skipped
                        ? "E-post sending er deaktivert (skippet)"
                        : "Invitasjons-e-post sendt",
                    success: true,
                });
                passed++;
            } else {
                tests.push({
                    name: "Tender Invitation Email",
                    message: result1.error || "Feil ved sending",
                    success: false,
                });
                failed++;
            }
        } catch (error) {
            tests.push({
                name: "Tender Invitation Email",
                message: error.message || "Ukjent feil",
                success: false,
            });
            failed++;
        }

        // Test 2: Deadline Reminder Email
        try {
            setEmailTestProgress(40);
            const mockTender2 = {
                id: "test-tender-email-2",
                title: "Test Anskaffelse - Frist Påminnelse",
                deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            };
            const result2 = await sendDeadlineReminderEmail(
                testEmailAddress,
                mockTender2,
                3
            );
            if (result2.success) {
                tests.push({
                    name: "Deadline Reminder Email",
                    message: result2.skipped
                        ? "E-post sending er deaktivert (skippet)"
                        : "Fristpåminnelses-e-post sendt",
                    success: true,
                });
                passed++;
            } else {
                tests.push({
                    name: "Deadline Reminder Email",
                    message: result2.error || "Feil ved sending",
                    success: false,
                });
                failed++;
            }
        } catch (error) {
            tests.push({
                name: "Deadline Reminder Email",
                message: error.message || "Ukjent feil",
                success: false,
            });
            failed++;
        }

        // Test 3: Bid Submission Email
        try {
            setEmailTestProgress(60);
            const mockTender3 = {
                id: "test-tender-email-3",
                title: "Test Anskaffelse - Tilbud",
            };
            const mockBid = {
                id: "test-bid-email-1",
                companyName: "Test Leverandør AS",
                price: 500000,
                submittedAt: new Date(),
            };
            const result3 = await sendBidSubmissionEmail(
                testEmailAddress,
                mockTender3,
                mockBid
            );
            if (result3.success) {
                tests.push({
                    name: "Bid Submission Email",
                    message: result3.skipped
                        ? "E-post sending er deaktivert (skippet)"
                        : "Tilbuds-e-post sendt",
                    success: true,
                });
                passed++;
            } else {
                tests.push({
                    name: "Bid Submission Email",
                    message: result3.error || "Feil ved sending",
                    success: false,
                });
                failed++;
            }
        } catch (error) {
            tests.push({
                name: "Bid Submission Email",
                message: error.message || "Ukjent feil",
                success: false,
            });
            failed++;
        }

        // Test 4: Contract Signing Request Email
        try {
            setEmailTestProgress(80);
            const mockTender4 = {
                id: "test-tender-email-4",
                title: "Test Anskaffelse - Kontrakt",
                contractStandard: "NS 8405",
            };
            const mockContract = {
                id: "test-contract-email-1",
                tenderId: "test-tender-email-4",
                contractStandard: "NS 8405",
                price: 500000,
                version: 1,
            };
            const result4 = await sendContractSigningRequestEmail(
                testEmailAddress,
                mockContract,
                mockTender4
            );
            if (result4.success) {
                tests.push({
                    name: "Contract Signing Request Email",
                    message: result4.skipped
                        ? "E-post sending er deaktivert (skippet)"
                        : "Kontraktsignering-e-post sendt",
                    success: true,
                });
                passed++;
            } else {
                tests.push({
                    name: "Contract Signing Request Email",
                    message: result4.error || "Feil ved sending",
                    success: false,
                });
                failed++;
            }
        } catch (error) {
            tests.push({
                name: "Contract Signing Request Email",
                message: error.message || "Ukjent feil",
                success: false,
            });
            failed++;
        }

        // Test 5: Award Letter Email
        try {
            setEmailTestProgress(70);
            const mockTender5 = {
                id: "test-tender-email-5",
                title: "Test Anskaffelse - Tildeling",
                contractStandard: "NS 8405",
            };
            const mockBid5 = {
                id: "test-bid-email-5",
                companyName: "Test Vinner AS",
                price: 750000,
            };
            const mockProject5 = {
                id: "test-project-5",
                name: "Test Prosjekt",
            };
            const standstillEndDate = new Date(
                Date.now() + 10 * 24 * 60 * 60 * 1000
            );
            const result5 = await sendAwardLetterEmail(
                testEmailAddress,
                mockTender5,
                mockBid5,
                mockProject5,
                standstillEndDate
            );
            if (result5.success) {
                tests.push({
                    name: "Award Letter Email",
                    message: result5.skipped
                        ? "E-post sending er deaktivert (skippet)"
                        : "Tildelingsbrev sendt",
                    success: true,
                });
                passed++;
            } else {
                tests.push({
                    name: "Award Letter Email",
                    message: result5.error || "Feil ved sending",
                    success: false,
                });
                failed++;
            }
        } catch (error) {
            tests.push({
                name: "Award Letter Email",
                message: error.message || "Ukjent feil",
                success: false,
            });
            failed++;
        }

        // Test 6: Rejection Email
        try {
            setEmailTestProgress(85);
            const mockTender6 = {
                id: "test-tender-email-6",
                title: "Test Anskaffelse - Avslag",
            };
            const mockBid6 = {
                id: "test-bid-email-6",
                companyName: "Test Leverandør AS",
                price: 600000,
                submittedAt: new Date(),
            };
            const result6 = await sendBidRejectionEmail(
                testEmailAddress,
                mockTender6,
                mockBid6,
                "Test Vinner AS"
            );
            if (result6.success) {
                tests.push({
                    name: "Rejection Email",
                    message: result6.skipped
                        ? "E-post sending er deaktivert (skippet)"
                        : "Avslags-e-post sendt",
                    success: true,
                });
                passed++;
            } else {
                tests.push({
                    name: "Rejection Email",
                    message: result6.error || "Feil ved sending",
                    success: false,
                });
                failed++;
            }
        } catch (error) {
            tests.push({
                name: "Rejection Email",
                message: error.message || "Ukjent feil",
                success: false,
            });
            failed++;
        }

        // Test 7: Deadline Reminder Check
        try {
            setEmailTestProgress(100);
            const result7 = await checkAndSendDeadlineReminders({
                reminderDays: [3, 1],
                sendToInvitedSuppliers: false,
                sendToCreator: false,
            });
            tests.push({
                name: "Deadline Reminder Service",
                message: `Sjekket ${result7.checked} anskaffelser, sendt ${result7.sent} påminnelser`,
                success: true,
            });
            passed++;
        } catch (error) {
            tests.push({
                name: "Deadline Reminder Service",
                message: error.message || "Ukjent feil",
                success: false,
            });
            failed++;
        }

        setEmailTestResults({
            success: failed === 0,
            summary: `${passed} av ${tests.length} tester bestått`,
            tests: tests,
        });
        setEmailTesting(false);
        setEmailTestProgress(0);
    };

    return {
        emailTesting,
        emailTestResults,
        emailTestProgress,
        testEmailAddress,
        setTestEmailAddress,
        runEmailTests,
    };
};





