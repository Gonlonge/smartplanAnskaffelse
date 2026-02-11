import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import {
    notifyTenderInvitation,
    notifyNewBid,
    notifyTenderDeadlineReminder,
    notifyQuestionAsked,
    notifyQuestionAnswered,
    notifyContractUpdate,
} from "../api/notificationService";

/**
 * Hook for running notification tests
 */
export const useNotificationTests = () => {
    const { user } = useAuth();
    const { refreshNotifications } = useNotifications();
    const [notificationTesting, setNotificationTesting] = useState(false);
    const [notificationTestResults, setNotificationTestResults] =
        useState(null);
    const [notificationTestProgress, setNotificationTestProgress] = useState(0);

    const runNotificationTests = async () => {
        if (!user) {
            setNotificationTestResults({
                success: false,
                error: "Du må være innlogget for å kjøre tester",
                tests: [],
            });
            return;
        }

        setNotificationTesting(true);
        setNotificationTestProgress(0);
        setNotificationTestResults(null);

        const tests = [];
        let passed = 0;
        let failed = 0;

        // Test 1: Tender Invitation
        try {
            setNotificationTestProgress(16);
            const mockTender1 = {
                id: "test-tender-1",
                title: "Test Anskaffelse - Invitasjon",
            };
            const result1 = await notifyTenderInvitation(user.id, mockTender1);
            if (result1.success) {
                tests.push({
                    name: "Tender Invitation Notification",
                    message: "Invitasjonsvarsel opprettet",
                    success: true,
                });
                passed++;
            } else {
                tests.push({
                    name: "Tender Invitation Notification",
                    message: result1.error || "Feil ved opprettelse",
                    success: false,
                });
                failed++;
            }
        } catch (error) {
            tests.push({
                name: "Tender Invitation Notification",
                message: error.message || "Ukjent feil",
                success: false,
            });
            failed++;
        }

        // Test 2: New Bid
        try {
            setNotificationTestProgress(33);
            const mockTender2 = {
                id: "test-tender-2",
                title: "Test Anskaffelse - Tilbud",
            };
            const mockBid = {
                id: "test-bid-1",
                companyName: "Test Leverandør AS",
            };
            const result2 = await notifyNewBid(user.id, mockTender2, mockBid);
            if (result2.success) {
                tests.push({
                    name: "New Bid Notification",
                    message: "Tilbudsvarsel opprettet",
                    success: true,
                });
                passed++;
            } else {
                tests.push({
                    name: "New Bid Notification",
                    message: result2.error || "Feil ved opprettelse",
                    success: false,
                });
                failed++;
            }
        } catch (error) {
            tests.push({
                name: "New Bid Notification",
                message: error.message || "Ukjent feil",
                success: false,
            });
            failed++;
        }

        // Test 3: Deadline Reminder
        try {
            setNotificationTestProgress(50);
            const mockTender3 = {
                id: "test-tender-3",
                title: "Test Anskaffelse - Frist",
            };
            const result3 = await notifyTenderDeadlineReminder(
                user.id,
                mockTender3,
                3
            );
            if (result3.success) {
                tests.push({
                    name: "Deadline Reminder Notification",
                    message: "Fristpåminnelsesvarsel opprettet",
                    success: true,
                });
                passed++;
            } else {
                tests.push({
                    name: "Deadline Reminder Notification",
                    message: result3.error || "Feil ved opprettelse",
                    success: false,
                });
                failed++;
            }
        } catch (error) {
            tests.push({
                name: "Deadline Reminder Notification",
                message: error.message || "Ukjent feil",
                success: false,
            });
            failed++;
        }

        // Test 4: Question Asked
        try {
            setNotificationTestProgress(66);
            const mockTender4 = {
                id: "test-tender-4",
                title: "Test Anskaffelse - Spørsmål",
            };
            const mockQuestion = {
                id: "test-question-1",
                askedByCompany: "Test Leverandør AS",
            };
            const result4 = await notifyQuestionAsked(
                user.id,
                mockTender4,
                mockQuestion
            );
            if (result4.success) {
                tests.push({
                    name: "Question Asked Notification",
                    message: "Spørsmålsvarsel opprettet",
                    success: true,
                });
                passed++;
            } else {
                tests.push({
                    name: "Question Asked Notification",
                    message: result4.error || "Feil ved opprettelse",
                    success: false,
                });
                failed++;
            }
        } catch (error) {
            tests.push({
                name: "Question Asked Notification",
                message: error.message || "Ukjent feil",
                success: false,
            });
            failed++;
        }

        // Test 5: Question Answered
        try {
            setNotificationTestProgress(83);
            const mockTender5 = {
                id: "test-tender-5",
                title: "Test Anskaffelse - Svar",
            };
            const mockQuestion2 = {
                id: "test-question-2",
            };
            const result5 = await notifyQuestionAnswered(
                user.id,
                mockTender5,
                mockQuestion2
            );
            if (result5.success) {
                tests.push({
                    name: "Question Answered Notification",
                    message: "Svarvarsel opprettet",
                    success: true,
                });
                passed++;
            } else {
                tests.push({
                    name: "Question Answered Notification",
                    message: result5.error || "Feil ved opprettelse",
                    success: false,
                });
                failed++;
            }
        } catch (error) {
            tests.push({
                name: "Question Answered Notification",
                message: error.message || "Ukjent feil",
                success: false,
            });
            failed++;
        }

        // Test 6: Contract Update
        try {
            setNotificationTestProgress(100);
            const mockContract = {
                id: "test-contract-1",
                tenderId: "test-tender-6",
            };
            const result6 = await notifyContractUpdate(
                user.id,
                mockContract,
                "generated"
            );
            if (result6.success) {
                tests.push({
                    name: "Contract Update Notification",
                    message: "Kontraktvarsel opprettet",
                    success: true,
                });
                passed++;
            } else {
                tests.push({
                    name: "Contract Update Notification",
                    message: result6.error || "Feil ved opprettelse",
                    success: false,
                });
                failed++;
            }
        } catch (error) {
            tests.push({
                name: "Contract Update Notification",
                message: error.message || "Ukjent feil",
                success: false,
            });
            failed++;
        }

        // Refresh notifications to show new ones
        await refreshNotifications();

        setNotificationTestResults({
            success: failed === 0,
            summary: `${passed} av ${tests.length} tester bestått`,
            tests: tests,
        });
        setNotificationTesting(false);
        setNotificationTestProgress(0);
    };

    return {
        notificationTesting,
        notificationTestResults,
        notificationTestProgress,
        runNotificationTests,
    };
};





