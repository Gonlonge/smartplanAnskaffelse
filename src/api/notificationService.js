/**
 * Notification Service
 * Handles creating, reading, and managing notifications in Firestore
 */

import {
    createDocument,
    getCollection,
    updateDocument,
    deleteDocument,
    queryHelpers,
    getDocument,
} from "../services/firestore";

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
    TENDER_INVITATION: "tender_invitation",
    NEW_BID: "new_bid",
    TENDER_DEADLINE_REMINDER: "tender_deadline_reminder",
    QUESTION_ASKED: "question_asked",
    QUESTION_ANSWERED: "question_answered",
    CONTRACT_UPDATED: "contract_updated",
    CONTRACT_SIGNED: "contract_signed",
    COMPLAINT_SUBMITTED: "complaint_submitted",
    COMPLAINT_STATUS_UPDATE: "complaint_status_update",
};

/**
 * Map notification types to preference keys
 */
const NOTIFICATION_TYPE_TO_PREFERENCE = {
    [NOTIFICATION_TYPES.TENDER_INVITATION]: "invitationNotifications",
    [NOTIFICATION_TYPES.NEW_BID]: "bidNotifications",
    [NOTIFICATION_TYPES.TENDER_DEADLINE_REMINDER]: "deadlineReminderNotifications",
    [NOTIFICATION_TYPES.QUESTION_ASKED]: "questionNotifications",
    [NOTIFICATION_TYPES.QUESTION_ANSWERED]: "questionNotifications",
    [NOTIFICATION_TYPES.CONTRACT_UPDATED]: "contractNotifications",
    [NOTIFICATION_TYPES.CONTRACT_SIGNED]: "contractNotifications",
};

/**
 * Check if user has enabled notifications for a specific type
 * @param {string} userId - User ID
 * @param {string} notificationType - Notification type
 * @returns {Promise<boolean>} True if notification should be sent
 */
const shouldSendNotification = async (userId, notificationType) => {
    try {
        if (!userId) return false;

        const userDoc = await getDocument("users", userId);
        if (!userDoc) return true; // Default to true if user not found

        const preferences = userDoc.notificationPreferences || {};
        const preferenceKey = NOTIFICATION_TYPE_TO_PREFERENCE[notificationType];

        // If no preference key mapping, default to true
        if (!preferenceKey) return true;

        // Default to true if preference not set (backward compatibility)
        return preferences[preferenceKey] !== false;
    } catch (error) {
        console.error("Error checking notification preferences:", error);
        // Default to true on error to ensure notifications are sent
        return true;
    }
};

/**
 * Create a notification
 * @param {Object} notificationData - Notification data
 * @param {string} notificationData.userId - User ID to notify
 * @param {string} notificationData.type - Notification type (from NOTIFICATION_TYPES)
 * @param {string} notificationData.title - Notification title
 * @param {string} notificationData.message - Notification message
 * @param {Object} notificationData.metadata - Additional metadata (tenderId, bidId, contractId, etc.)
 * @param {string} notificationData.actionUrl - URL to navigate to when clicked
 * @param {boolean} notificationData.skipPreferenceCheck - Skip preference check (default: false)
 * @returns {Promise<{success: boolean, notification?: object, error?: string, skipped?: boolean}>}
 */
export const createNotification = async (notificationData) => {
    try {
        // Check user preferences unless explicitly skipped
        if (!notificationData.skipPreferenceCheck) {
            const shouldSend = await shouldSendNotification(
                notificationData.userId,
                notificationData.type
            );
            if (!shouldSend) {
                return {
                    success: true,
                    skipped: true,
                };
            }
        }

        const notification = {
            userId: notificationData.userId,
            type: notificationData.type,
            title: notificationData.title,
            message: notificationData.message,
            metadata: notificationData.metadata || {},
            actionUrl: notificationData.actionUrl || null,
            read: false,
            readAt: null,
            createdAt: new Date(),
        };

        const createdNotification = await createDocument("notifications", notification);

        return {
            success: true,
            notification: createdNotification,
        };
    } catch (error) {
        console.error("Error creating notification:", error);
        return {
            success: false,
            error: "Kunne ikke opprette varsel",
        };
    }
};

/**
 * Get notifications for a user
 * @param {string} userId - User ID
 * @param {Object} options - Options {limit, unreadOnly}
 * @returns {Promise<Array>} Array of notifications
 */
export const getNotificationsForUser = async (userId, options = {}) => {
    try {
        if (!userId) return [];

        const constraints = [queryHelpers.where("userId", "==", userId)];

        if (options.unreadOnly) {
            constraints.push(queryHelpers.where("read", "==", false));
        }

        let notifications = await getCollection("notifications", constraints);

        // Sort by createdAt descending (newest first)
        notifications.sort((a, b) => {
            const dateA =
                a.createdAt?.getTime?.() ||
                (a.createdAt instanceof Date
                    ? a.createdAt.getTime()
                    : new Date(a.createdAt).getTime()) ||
                0;
            const dateB =
                b.createdAt?.getTime?.() ||
                (b.createdAt instanceof Date
                    ? b.createdAt.getTime()
                    : new Date(b.createdAt).getTime()) ||
                0;
            return dateB - dateA;
        });

        // Apply limit if specified
        if (options.limit) {
            notifications = notifications.slice(0, options.limit);
        }

        return notifications;
    } catch (error) {
        console.error("Error getting notifications:", error);
        return [];
    }
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const markNotificationAsRead = async (notificationId) => {
    try {
        await updateDocument("notifications", notificationId, {
            read: true,
            readAt: new Date(),
        });

        return { success: true };
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return {
            success: false,
            error: "Kunne ikke markere varsel som lest",
        };
    }
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const markAllNotificationsAsRead = async (userId) => {
    try {
        const unreadNotifications = await getNotificationsForUser(userId, {
            unreadOnly: true,
        });

        const updatePromises = unreadNotifications.map((notification) =>
            markNotificationAsRead(notification.id)
        );

        await Promise.all(updatePromises);

        return { success: true };
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        return {
            success: false,
            error: "Kunne ikke markere alle varsler som lest",
        };
    }
};

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteNotification = async (notificationId) => {
    try {
        await deleteDocument("notifications", notificationId);
        return { success: true };
    } catch (error) {
        console.error("Error deleting notification:", error);
        return {
            success: false,
            error: "Kunne ikke slette varsel",
        };
    }
};

/**
 * Get unread notification count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Count of unread notifications
 */
export const getUnreadNotificationCount = async (userId) => {
    try {
        const unreadNotifications = await getNotificationsForUser(userId, {
            unreadOnly: true,
        });
        return unreadNotifications.length;
    } catch (error) {
        console.error("Error getting unread notification count:", error);
        return 0;
    }
};

/**
 * Helper: Create notification for tender invitation
 * @param {string} supplierId - Supplier user ID
 * @param {Object} tender - Tender object
 * @returns {Promise<{success: boolean}>}
 */
export const notifyTenderInvitation = async (supplierId, tender) => {
    return await createNotification({
        userId: supplierId,
        type: NOTIFICATION_TYPES.TENDER_INVITATION,
        title: "Ny invitasjon til Anskaffelse",
        message: `Du har blitt invitert til å by på "${tender.title}"`,
        metadata: {
            tenderId: tender.id,
            tenderTitle: tender.title,
        },
        actionUrl: `/tenders/${tender.id}`,
    });
};

/**
 * Helper: Create notification for new bid
 * @param {string} senderId - Sender user ID (tender creator)
 * @param {Object} tender - Tender object
 * @param {Object} bid - Bid object
 * @returns {Promise<{success: boolean}>}
 */
export const notifyNewBid = async (senderId, tender, bid) => {
    return await createNotification({
        userId: senderId,
        type: NOTIFICATION_TYPES.NEW_BID,
        title: "Nytt tilbud mottatt",
        message: `${bid.companyName} har sendt inn et tilbud på "${tender.title}"`,
        metadata: {
            tenderId: tender.id,
            bidId: bid.id,
            tenderTitle: tender.title,
            companyName: bid.companyName,
        },
        actionUrl: `/tenders/${tender.id}`,
    });
};

/**
 * Helper: Create notification for tender deadline reminder
 * @param {string} userId - User ID to notify
 * @param {Object} tender - Tender object
 * @param {number} daysUntilDeadline - Days until deadline
 * @returns {Promise<{success: boolean}>}
 */
export const notifyTenderDeadlineReminder = async (
    userId,
    tender,
    daysUntilDeadline
) => {
    const daysText =
        daysUntilDeadline === 1
            ? "1 dag"
            : daysUntilDeadline === 0
            ? "i dag"
            : `${daysUntilDeadline} dager`;

    return await createNotification({
        userId: userId,
        type: NOTIFICATION_TYPES.TENDER_DEADLINE_REMINDER,
        title: "Frist påminnelse",
        message: `Fristen for "${tender.title}" utløper om ${daysText}`,
        metadata: {
            tenderId: tender.id,
            tenderTitle: tender.title,
            daysUntilDeadline: daysUntilDeadline,
        },
        actionUrl: `/tenders/${tender.id}`,
    });
};

/**
 * Helper: Create notification for question asked
 * @param {string} senderId - Sender user ID (tender creator)
 * @param {Object} tender - Tender object
 * @param {Object} question - Question object
 * @returns {Promise<{success: boolean}>}
 */
export const notifyQuestionAsked = async (senderId, tender, question) => {
    return await createNotification({
        userId: senderId,
        type: NOTIFICATION_TYPES.QUESTION_ASKED,
        title: "Nytt spørsmål",
        message: `${question.askedByCompany || "En leverandør"} har stilt et spørsmål om "${tender.title}"`,
        metadata: {
            tenderId: tender.id,
            questionId: question.id,
            tenderTitle: tender.title,
        },
        actionUrl: `/tenders/${tender.id}`,
    });
};

/**
 * Helper: Create notification for question answered
 * @param {string} supplierId - Supplier user ID (question asker)
 * @param {Object} tender - Tender object
 * @param {Object} question - Question object
 * @returns {Promise<{success: boolean}>}
 */
export const notifyQuestionAnswered = async (supplierId, tender, question) => {
    return await createNotification({
        userId: supplierId,
        type: NOTIFICATION_TYPES.QUESTION_ANSWERED,
        title: "Spørsmål besvart",
        message: `Ditt spørsmål om "${tender.title}" har blitt besvart`,
        metadata: {
            tenderId: tender.id,
            questionId: question.id,
            tenderTitle: tender.title,
        },
        actionUrl: `/tenders/${tender.id}`,
    });
};

/**
 * Helper: Create notification for contract update
 * @param {string} userId - User ID to notify
 * @param {Object} contract - Contract object
 * @param {string} updateType - Type of update (e.g., "generated", "amended")
 * @returns {Promise<{success: boolean}>}
 */
export const notifyContractUpdate = async (userId, contract, updateType) => {
    const messages = {
        generated: "En kontrakt har blitt generert",
        amended: "En kontrakt har blitt endret",
        signed: "En kontrakt har blitt signert",
    };

    // Use CONTRACT_SIGNED type for signed contracts, CONTRACT_UPDATED for others
    const notificationType =
        updateType === "signed"
            ? NOTIFICATION_TYPES.CONTRACT_SIGNED
            : NOTIFICATION_TYPES.CONTRACT_UPDATED;

    const title =
        updateType === "signed"
            ? "Kontrakt signert"
            : "Kontrakt oppdatert";

    return await createNotification({
        userId: userId,
        type: notificationType,
        title: title,
        message: messages[updateType] || "En kontrakt har blitt oppdatert",
        metadata: {
            contractId: contract.id,
            tenderId: contract.tenderId,
            updateType: updateType,
        },
        actionUrl: `/tenders/${contract.tenderId}/contract`,
    });
};

/**
 * Helper: Create notification for complaint submitted
 * @param {string} userId - User ID who submitted the complaint
 * @param {Object} complaint - Complaint object
 * @returns {Promise<{success: boolean}>}
 */
export const notifyComplaintSubmitted = async (userId, complaint) => {
    // Notify admins/managers (for now, we'll notify the submitter as confirmation)
    // In a real system, you'd fetch admin users and notify them
    return await createNotification({
        userId: userId,
        type: NOTIFICATION_TYPES.COMPLAINT_SUBMITTED,
        title: "Klage innsendt",
        message: `Din klage "${complaint.title}" har blitt innsendt og vil bli behandlet`,
        metadata: {
            complaintId: complaint.id,
            complaintTitle: complaint.title,
        },
        actionUrl: `/complaints/${complaint.id}`,
    });
};

/**
 * Helper: Create notification for complaint status update
 * @param {string} userId - User ID to notify (complaint submitter)
 * @param {Object} complaint - Complaint object
 * @param {string} status - New status
 * @returns {Promise<{success: boolean}>}
 */
export const notifyComplaintStatusUpdate = async (userId, complaint, status) => {
    const statusMessages = {
        submitted: "Din klage har blitt mottatt",
        in_progress: "Din klage er under behandling",
        resolved: "Din klage har blitt løst",
        closed: "Din klage har blitt lukket",
        rejected: "Din klage har blitt avvist",
    };

    return await createNotification({
        userId: userId,
        type: NOTIFICATION_TYPES.COMPLAINT_STATUS_UPDATE,
        title: "Klage status oppdatert",
        message: statusMessages[status] || `Status for "${complaint.title}" har blitt oppdatert til ${status}`,
        metadata: {
            complaintId: complaint.id,
            complaintTitle: complaint.title,
            status: status,
        },
        actionUrl: `/complaints/${complaint.id}`,
    });
};
