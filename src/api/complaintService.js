/**
 * Complaint Service
 * Handles creating, retrieving, and managing complaints from Firestore
 */

import {
    getDocument,
    getCollection,
    createDocument,
    updateDocument,
    queryHelpers,
} from "../services/firestore";
import {
    uploadFile,
    deleteFile,
} from "../services/storage";
import {
    notifyComplaintSubmitted,
    notifyComplaintStatusUpdate,
} from "./notificationService";

/**
 * Create a new complaint
 * @param {Object} complaintData - Complaint data from form
 * @param {Object} user - Current user object
 * @returns {Promise<{success: boolean, complaint?: object, error?: string}>}
 */
export const createComplaint = async (complaintData, user) => {
    try {
        // Validate required fields
        if (!complaintData.title || !complaintData.title.trim()) {
            return {
                success: false,
                error: "Tittel er påkrevd",
            };
        }

        if (!complaintData.description || !complaintData.description.trim()) {
            return {
                success: false,
                error: "Beskrivelse er påkrevd",
            };
        }

        // Create complaint object
        const newComplaint = {
            title: complaintData.title.trim(),
            description: complaintData.description.trim(),
            category: complaintData.category || "general",
            priority: complaintData.priority || "medium",
            status: "submitted",
            submittedBy: user.id,
            submittedByCompanyId: user.companyId || user.id,
            submittedByName: user.name || user.email,
            submittedByEmail: user.email,
            createdAt: new Date(),
            updatedAt: new Date(),
            relatedTenderId: complaintData.relatedTenderId || null,
            relatedProjectId: complaintData.relatedProjectId || null,
            relatedContractId: complaintData.relatedContractId || null,
            documents: complaintData.documents || [],
            resolution: null,
            resolvedAt: null,
            resolvedBy: null,
            assignedTo: null,
            comments: [],
            history: [
                {
                    action: "submitted",
                    timestamp: new Date(),
                    userId: user.id,
                    userName: user.name || user.email,
                    note: "Klage innsendt",
                },
            ],
        };

        // Create in Firestore
        const createdComplaint = await createDocument("complaints", newComplaint);

        // Send notification to admins/managers
        await notifyComplaintSubmitted(user.id, createdComplaint);

        return {
            success: true,
            complaint: createdComplaint,
        };
    } catch (error) {
        console.error("Error creating complaint:", error);
        return {
            success: false,
            error: "Kunne ikke opprette klage. Prøv igjen.",
        };
    }
};

/**
 * Get all complaints
 * @param {Object} filters - Optional filters (status, category, priority, companyId, userId)
 * @returns {Promise<Array>} Array of complaints
 */
export const getAllComplaints = async (filters = {}) => {
    try {
        const constraints = [];

        // Filter by status
        if (filters.status) {
            constraints.push(queryHelpers.where("status", "==", filters.status));
        }

        // Filter by category
        if (filters.category) {
            constraints.push(queryHelpers.where("category", "==", filters.category));
        }

        // Filter by priority
        if (filters.priority) {
            constraints.push(queryHelpers.where("priority", "==", filters.priority));
        }

        // Filter by company
        if (filters.companyId) {
            constraints.push(
                queryHelpers.where("submittedByCompanyId", "==", filters.companyId)
            );
        }

        // Filter by user
        if (filters.userId) {
            constraints.push(queryHelpers.where("submittedBy", "==", filters.userId));
        }

        // Order by creation date (newest first)
        constraints.push(queryHelpers.orderBy("createdAt", "desc"));

        const complaints = await getCollection("complaints", constraints);
        return complaints;
    } catch (error) {
        console.error("Error fetching complaints:", error);
        throw error;
    }
};

/**
 * Get complaint by ID
 * @param {string} complaintId - Complaint ID
 * @returns {Promise<Object|null>} Complaint object or null
 */
export const getComplaintById = async (complaintId) => {
    try {
        const complaint = await getDocument("complaints", complaintId);
        return complaint;
    } catch (error) {
        console.error("Error fetching complaint:", error);
        throw error;
    }
};

/**
 * Get complaints by user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of complaints
 */
export const getComplaintsByUser = async (userId) => {
    try {
        return await getAllComplaints({ userId });
    } catch (error) {
        console.error("Error fetching user complaints:", error);
        throw error;
    }
};

/**
 * Get complaints by company
 * @param {string} companyId - Company ID
 * @returns {Promise<Array>} Array of complaints
 */
export const getComplaintsByCompany = async (companyId) => {
    try {
        return await getAllComplaints({ companyId });
    } catch (error) {
        console.error("Error fetching company complaints:", error);
        throw error;
    }
};

/**
 * Update complaint status
 * @param {string} complaintId - Complaint ID
 * @param {string} status - New status (submitted, in_progress, resolved, closed, rejected)
 * @param {Object} user - Current user object
 * @param {string} note - Optional note for history
 * @returns {Promise<{success: boolean, complaint?: object, error?: string}>}
 */
export const updateComplaintStatus = async (
    complaintId,
    status,
    user,
    note = null
) => {
    try {
        const complaint = await getComplaintById(complaintId);
        if (!complaint) {
            return {
                success: false,
                error: "Klage ikke funnet",
            };
        }

        const validStatuses = [
            "submitted",
            "in_progress",
            "resolved",
            "closed",
            "rejected",
        ];
        if (!validStatuses.includes(status)) {
            return {
                success: false,
                error: "Ugyldig status",
            };
        }

        const updates = {
            status,
            updatedAt: new Date(),
        };

        // Add resolution info if resolved
        if (status === "resolved") {
            updates.resolvedAt = new Date();
            updates.resolvedBy = user.id;
        }

        // Add history entry
        const historyEntry = {
            action: `status_changed_to_${status}`,
            timestamp: new Date(),
            userId: user.id,
            userName: user.name || user.email,
            note: note || `Status endret til ${status}`,
        };

        updates.history = [...(complaint.history || []), historyEntry];

        const updatedComplaint = await updateDocument("complaints", complaintId, updates);

        // Send notification to submitter
        await notifyComplaintStatusUpdate(
            complaint.submittedBy,
            updatedComplaint,
            status
        );

        return {
            success: true,
            complaint: updatedComplaint,
        };
    } catch (error) {
        console.error("Error updating complaint status:", error);
        return {
            success: false,
            error: "Kunne ikke oppdatere klage. Prøv igjen.",
        };
    }
};

/**
 * Add resolution to complaint
 * @param {string} complaintId - Complaint ID
 * @param {string} resolution - Resolution text
 * @param {Object} user - Current user object
 * @returns {Promise<{success: boolean, complaint?: object, error?: string}>}
 */
export const addComplaintResolution = async (complaintId, resolution, user) => {
    try {
        const complaint = await getComplaintById(complaintId);
        if (!complaint) {
            return {
                success: false,
                error: "Klage ikke funnet",
            };
        }

        const updates = {
            resolution: resolution.trim(),
            resolvedAt: new Date(),
            resolvedBy: user.id,
            status: "resolved",
            updatedAt: new Date(),
        };

        // Add history entry
        const historyEntry = {
            action: "resolution_added",
            timestamp: new Date(),
            userId: user.id,
            userName: user.name || user.email,
            note: "Løsning lagt til",
        };

        updates.history = [...(complaint.history || []), historyEntry];

        const updatedComplaint = await updateDocument("complaints", complaintId, updates);

        // Send notification
        await notifyComplaintStatusUpdate(
            complaint.submittedBy,
            updatedComplaint,
            "resolved"
        );

        return {
            success: true,
            complaint: updatedComplaint,
        };
    } catch (error) {
        console.error("Error adding resolution:", error);
        return {
            success: false,
            error: "Kunne ikke legge til løsning. Prøv igjen.",
        };
    }
};

/**
 * Add comment to complaint
 * @param {string} complaintId - Complaint ID
 * @param {string} comment - Comment text
 * @param {Object} user - Current user object
 * @returns {Promise<{success: boolean, complaint?: object, error?: string}>}
 */
export const addComplaintComment = async (complaintId, comment, user) => {
    try {
        const complaint = await getComplaintById(complaintId);
        if (!complaint) {
            return {
                success: false,
                error: "Klage ikke funnet",
            };
        }

        const newComment = {
            id: Date.now().toString(),
            text: comment.trim(),
            userId: user.id,
            userName: user.name || user.email,
            userEmail: user.email,
            createdAt: new Date(),
        };

        const updates = {
            comments: [...(complaint.comments || []), newComment],
            updatedAt: new Date(),
        };

        // Add history entry
        const historyEntry = {
            action: "comment_added",
            timestamp: new Date(),
            userId: user.id,
            userName: user.name || user.email,
            note: "Kommentar lagt til",
        };

        updates.history = [...(complaint.history || []), historyEntry];

        const updatedComplaint = await updateDocument("complaints", complaintId, updates);

        return {
            success: true,
            complaint: updatedComplaint,
        };
    } catch (error) {
        console.error("Error adding comment:", error);
        return {
            success: false,
            error: "Kunne ikke legge til kommentar. Prøv igjen.",
        };
    }
};

/**
 * Assign complaint to user
 * @param {string} complaintId - Complaint ID
 * @param {string} assignedToUserId - User ID to assign to
 * @param {Object} user - Current user object (assigner)
 * @returns {Promise<{success: boolean, complaint?: object, error?: string}>}
 */
export const assignComplaint = async (complaintId, assignedToUserId, user) => {
    try {
        const complaint = await getComplaintById(complaintId);
        if (!complaint) {
            return {
                success: false,
                error: "Klage ikke funnet",
            };
        }

        const updates = {
            assignedTo: assignedToUserId,
            status: assignedToUserId ? "in_progress" : complaint.status,
            updatedAt: new Date(),
        };

        // Add history entry
        const historyEntry = {
            action: assignedToUserId ? "assigned" : "unassigned",
            timestamp: new Date(),
            userId: user.id,
            userName: user.name || user.email,
            note: assignedToUserId
                ? `Klage tildelt til ${assignedToUserId}`
                : "Tildeling fjernet",
        };

        updates.history = [...(complaint.history || []), historyEntry];

        const updatedComplaint = await updateDocument("complaints", complaintId, updates);

        return {
            success: true,
            complaint: updatedComplaint,
        };
    } catch (error) {
        console.error("Error assigning complaint:", error);
        return {
            success: false,
            error: "Kunne ikke tildele klage. Prøv igjen.",
        };
    }
};

/**
 * Add document to complaint
 * @param {string} complaintId - Complaint ID
 * @param {File} file - File to upload
 * @param {Object} user - Current user object
 * @returns {Promise<{success: boolean, complaint?: object, error?: string}>}
 */
export const addDocumentToComplaint = async (complaintId, file, user) => {
    try {
        const complaint = await getComplaintById(complaintId);
        if (!complaint) {
            return {
                success: false,
                error: "Klage ikke funnet",
            };
        }

        // Upload file to storage
        const filePath = `complaints/${complaintId}/${Date.now()}_${file.name}`;
        const uploadResult = await uploadFile(file, filePath);

        const newDocument = {
            id: Date.now().toString(),
            name: file.name,
            path: uploadResult.path || filePath,
            url: uploadResult.url,
            uploadedBy: user.id,
            uploadedByName: user.name || user.email,
            uploadedAt: new Date(),
            size: uploadResult.size || file.size,
            type: uploadResult.type || file.type,
        };

        const updates = {
            documents: [...(complaint.documents || []), newDocument],
            updatedAt: new Date(),
        };

        // Add history entry
        const historyEntry = {
            action: "document_added",
            timestamp: new Date(),
            userId: user.id,
            userName: user.name || user.email,
            note: `Dokument lagt til: ${file.name}`,
        };

        updates.history = [...(complaint.history || []), historyEntry];

        const updatedComplaint = await updateDocument("complaints", complaintId, updates);

        return {
            success: true,
            complaint: updatedComplaint,
        };
    } catch (error) {
        console.error("Error adding document:", error);
        return {
            success: false,
            error: "Kunne ikke legge til dokument. Prøv igjen.",
        };
    }
};

/**
 * Remove document from complaint
 * @param {string} complaintId - Complaint ID
 * @param {string} documentId - Document ID to remove
 * @param {Object} user - Current user object
 * @returns {Promise<{success: boolean, complaint?: object, error?: string}>}
 */
export const removeDocumentFromComplaint = async (
    complaintId,
    documentId,
    user
) => {
    try {
        const complaint = await getComplaintById(complaintId);
        if (!complaint) {
            return {
                success: false,
                error: "Klage ikke funnet",
            };
        }

        const document = complaint.documents?.find((doc) => doc.id === documentId);
        if (!document) {
            return {
                success: false,
                error: "Dokument ikke funnet",
            };
        }

        // Delete file from storage
        if (document.path) {
            await deleteFile(document.path);
        }

        const updates = {
            documents: complaint.documents.filter((doc) => doc.id !== documentId),
            updatedAt: new Date(),
        };

        // Add history entry
        const historyEntry = {
            action: "document_removed",
            timestamp: new Date(),
            userId: user.id,
            userName: user.name || user.email,
            note: `Dokument fjernet: ${document.name}`,
        };

        updates.history = [...(complaint.history || []), historyEntry];

        const updatedComplaint = await updateDocument("complaints", complaintId, updates);

        return {
            success: true,
            complaint: updatedComplaint,
        };
    } catch (error) {
        console.error("Error removing document:", error);
        return {
            success: false,
            error: "Kunne ikke fjerne dokument. Prøv igjen.",
        };
    }
};

