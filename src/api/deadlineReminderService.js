/**
 * Deadline Reminder Service
 *
 * Handles sending deadline reminder emails for tenders
 * Checks for tenders with deadlines 3 days and 1 day away
 *
 * Can be called manually or scheduled via Firebase Functions / Cloud Scheduler
 */

import { getAllTenders } from "./tenderService";
import {
    sendDeadlineReminderEmail,
    sendEmailToUser,
    shouldSendEmail,
} from "./emailService";
import { notifyTenderDeadlineReminder } from "./notificationService";

/**
 * Calculate days until deadline
 * @param {Date} deadline - Deadline date
 * @returns {number} Days until deadline (can be negative if past)
 */
const getDaysUntilDeadline = (deadline) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const deadlineDate =
        deadline instanceof Date ? new Date(deadline) : new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);

    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
};

/**
 * Check if reminder should be sent for a deadline
 * @param {number} daysUntilDeadline - Days until deadline
 * @param {Array} reminderDays - Array of days to send reminders (e.g., [3, 1])
 * @returns {boolean} Whether reminder should be sent
 */
const shouldSendReminder = (daysUntilDeadline, reminderDays = [3, 1]) => {
    return reminderDays.includes(daysUntilDeadline) && daysUntilDeadline >= 0;
};

/**
 * Send deadline reminders for a single tender
 * @param {Object} tender - Tender object
 * @param {number} daysUntilDeadline - Days until deadline
 * @param {Object} options - Options {sendToInvitedSuppliers, sendToCreator}
 * @returns {Promise<{sent: number, errors: Array}>}
 */
export const sendRemindersForTender = async (
    tender,
    daysUntilDeadline,
    options = {},
) => {
    const { sendToInvitedSuppliers = true, sendToCreator = false } = options;

    const results = {
        sent: 0,
        errors: [],
    };

    // Send to invited suppliers
    if (
        sendToInvitedSuppliers &&
        tender.invitedSuppliers &&
        tender.invitedSuppliers.length > 0
    ) {
        for (const invitation of tender.invitedSuppliers) {
            // Only send to suppliers who haven't submitted a bid yet
            const hasBid = tender.bids?.some(
                (bid) => bid.supplierId === invitation.supplierId,
            );
            if (hasBid) continue;

            try {
                // Send email if email is available and user has enabled deadline reminder emails
                if (
                    invitation.email &&
                    (!invitation.supplierId ||
                        (await shouldSendEmail(
                            invitation.supplierId,
                            "DEADLINE_REMINDER",
                        )))
                ) {
                    await sendDeadlineReminderEmail(
                        invitation.email,
                        tender,
                        daysUntilDeadline,
                    );
                }

                // Send in-app notification if supplierId is available
                if (invitation.supplierId) {
                    await notifyTenderDeadlineReminder(
                        invitation.supplierId,
                        tender,
                        daysUntilDeadline,
                    );
                }

                results.sent++;
            } catch (error) {
                console.error(
                    `Error sending reminder to ${invitation.email || invitation.supplierId}:`,
                    error,
                );
                results.errors.push({
                    type: "supplier",
                    email: invitation.email,
                    supplierId: invitation.supplierId,
                    error: error.message,
                });
            }
        }
    }

    // Send to tender creator (optional)
    if (sendToCreator && tender.createdBy) {
        try {
            if (await shouldSendEmail(tender.createdBy, "DEADLINE_REMINDER")) {
                await sendEmailToUser(
                    tender.createdBy,
                    async (creatorEmail) => {
                        return await sendDeadlineReminderEmail(
                            creatorEmail,
                            tender,
                            daysUntilDeadline,
                        );
                    },
                );
            }
            await notifyTenderDeadlineReminder(
                tender.createdBy,
                tender,
                daysUntilDeadline,
            );
            results.sent++;
        } catch (error) {
            console.error(`Error sending reminder to creator:`, error);
            results.errors.push({
                type: "creator",
                userId: tender.createdBy,
                error: error.message,
            });
        }
    }

    return results;
};

/**
 * Check and send deadline reminders for all open tenders
 * @param {Object} options - Options
 * @param {Array} options.reminderDays - Days before deadline to send reminders (default: [3, 1])
 * @param {boolean} options.sendToInvitedSuppliers - Send to invited suppliers (default: true)
 * @param {boolean} options.sendToCreator - Send to tender creator (default: false)
 * @param {string} options.status - Tender status to check (default: 'open')
 * @returns {Promise<{checked: number, sent: number, errors: Array}>}
 */
export const checkAndSendDeadlineReminders = async (options = {}) => {
    const {
        reminderDays = [3, 1],
        sendToInvitedSuppliers = true,
        sendToCreator = false,
        status = "open",
    } = options;

    try {
        // Get all open tenders
        const tenders = await getAllTenders({ status });

        const results = {
            checked: 0,
            sent: 0,
            errors: [],
        };

        for (const tender of tenders) {
            if (!tender.deadline) continue;

            results.checked++;

            const daysUntilDeadline = getDaysUntilDeadline(tender.deadline);

            // Check if we should send a reminder
            if (shouldSendReminder(daysUntilDeadline, reminderDays)) {
                try {
                    const reminderResults = await sendRemindersForTender(
                        tender,
                        daysUntilDeadline,
                        {
                            sendToInvitedSuppliers,
                            sendToCreator,
                        },
                    );

                    results.sent += reminderResults.sent;
                    results.errors.push(...reminderResults.errors);
                } catch (error) {
                    console.error(
                        `Error processing reminder for tender ${tender.id}:`,
                        error,
                    );
                    results.errors.push({
                        type: "tender",
                        tenderId: tender.id,
                        tenderTitle: tender.title,
                        error: error.message,
                    });
                }
            }
        }

        return results;
    } catch (error) {
        console.error("Error checking deadline reminders:", error);
        return {
            checked: 0,
            sent: 0,
            errors: [
                {
                    type: "system",
                    error: error.message,
                },
            ],
        };
    }
};

/**
 * Send reminders for a specific tender ID
 * @param {string} tenderId - Tender ID
 * @param {Object} options - Options
 * @returns {Promise<{success: boolean, sent: number, errors: Array}>}
 */
export const sendRemindersForTenderId = async (tenderId, options = {}) => {
    try {
        const { getTenderById } = await import("./tenderService");
        const tender = await getTenderById(tenderId);

        if (!tender) {
            return {
                success: false,
                sent: 0,
                errors: [{ error: "Tender not found" }],
            };
        }

        if (!tender.deadline) {
            return {
                success: false,
                sent: 0,
                errors: [{ error: "Tender has no deadline" }],
            };
        }

        const daysUntilDeadline = getDaysUntilDeadline(tender.deadline);
        const reminderResults = await sendRemindersForTender(
            tender,
            daysUntilDeadline,
            options,
        );

        return {
            success: true,
            sent: reminderResults.sent,
            errors: reminderResults.errors,
        };
    } catch (error) {
        console.error("Error sending reminders for tender:", error);
        return {
            success: false,
            sent: 0,
            errors: [{ error: error.message }],
        };
    }
};
