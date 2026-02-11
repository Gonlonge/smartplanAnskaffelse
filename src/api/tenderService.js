/**
 * Tender Service
 * Handles creating and retrieving tenders from Firestore
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
    getTenderDocumentPath,
    deleteFile,
} from "../services/storage";
import { createDocumentVersion } from "../services/documentVersioning";
import {
    notifyTenderInvitation,
    notifyNewBid,
    notifyQuestionAsked,
    notifyQuestionAnswered,
} from "./notificationService";
import {
    sendTenderInvitationEmail,
    sendBidSubmissionEmail,
    sendEmailToUser,
    shouldSendEmail,
} from "./emailService";

/**
 * Create a new tender
 * @param {Object} tenderData - Tender data from form
 * @param {Object} user - Current user object
 * @returns {Promise<{success: boolean, tender?: object, error?: string}>}
 */
export const createTender = async (tenderData, user) => {
    try {
        // Ensure invitedSuppliers is an array and has proper structure
        const invitedSuppliers = Array.isArray(tenderData.invitedSuppliers)
            ? tenderData.invitedSuppliers
            : [];

        // Ensure each invitation has required fields and proper date
        const normalizedInvitedSuppliers = invitedSuppliers.map((inv) => ({
            supplierId: inv.supplierId || null,
            companyId: inv.companyId || null,
            companyName: inv.companyName || "",
            orgNumber: inv.orgNumber || "",
            email: inv.email || "",
            invitedAt:
                inv.invitedAt instanceof Date
                    ? inv.invitedAt
                    : inv.invitedAt
                      ? new Date(inv.invitedAt)
                      : new Date(),
            status: inv.status || "invited",
            viewedAt: inv.viewedAt || null,
        }));

        // Debug logging in development
        if (import.meta.env.MODE === "development") {
            console.log("Creating tender with invitedSuppliers:", {
                count: normalizedInvitedSuppliers.length,
                suppliers: normalizedInvitedSuppliers.map((inv) => ({
                    companyName: inv.companyName,
                    email: inv.email,
                    supplierId: inv.supplierId,
                })),
            });
        }

        // Create tender object matching the structure from mockData
        const newTender = {
            projectId: tenderData.projectId,
            title: tenderData.title.trim(),
            description: tenderData.description.trim() || "",
            contractStandard: tenderData.contractStandard,
            createdBy: user.id,
            createdAt: new Date(),
            deadline: new Date(tenderData.deadline),
            publishDate: tenderData.publishDate
                ? new Date(tenderData.publishDate)
                : null,
            questionDeadline: tenderData.questionDeadline
                ? new Date(tenderData.questionDeadline)
                : null,
            price: tenderData.price ? parseFloat(tenderData.price) : null,
            entrepriseform: tenderData.entrepriseform || null,
            cpv: tenderData.cpv || null,
            evaluationCriteria: tenderData.evaluationCriteria || [],
            status: tenderData.status || "draft",
            documents: tenderData.documents || [],
            invitedSuppliers: normalizedInvitedSuppliers,
            // Flat array of supplier IDs for Firestore security rules
            invitedSupplierIds: normalizedInvitedSuppliers
                .map((inv) => inv.supplierId)
                .filter(Boolean),
            bids: tenderData.bids || [],
            qa: tenderData.qa || [],
            awardedBidId: null,
            awardedAt: null,
            // NS-specific fields (only include if contract standard matches)
            ns8405:
                tenderData.contractStandard === "NS 8405"
                    ? tenderData.ns8405 || {}
                    : null,
            ns8406:
                tenderData.contractStandard === "NS 8406"
                    ? tenderData.ns8406 || {}
                    : null,
            ns8407:
                tenderData.contractStandard === "NS 8407"
                    ? tenderData.ns8407 || {}
                    : null,
        };

        // Create in Firestore
        const createdTender = await createDocument("tenders", newTender);

        // Send invitation emails if tender is published (not draft) and has invited suppliers
        if (
            createdTender.status !== "draft" &&
            normalizedInvitedSuppliers.length > 0
        ) {
            for (const invitation of normalizedInvitedSuppliers) {
                if (!invitation.email) continue;
                const userId = invitation.supplierId || null;
                if (
                    userId &&
                    !(await shouldSendEmail(userId, "TENDER_INVITATION"))
                )
                    continue;
                sendTenderInvitationEmail(
                    invitation.email,
                    createdTender,
                    invitation.companyName || null,
                ).catch((emailError) => {
                    console.warn(
                        `Failed to send invitation email to ${invitation.email}:`,
                        emailError,
                    );
                });
            }
        }

        return {
            success: true,
            tender: createdTender,
        };
    } catch (error) {
        console.error("Error creating tender:", error);
        return {
            success: false,
            error: "Kunne ikke opprette Anskaffelse. Prøv igjen.",
        };
    }
};

/**
 * Get all tenders
 * @param {Object} filters - Optional filters {status, projectId, createdBy, companyId}
 * @returns {Promise<Array>} Array of tenders
 */
export const getAllTenders = async (filters = {}) => {
    try {
        // Use only one where clause to avoid needing composite indexes
        // Filter and sort in memory instead
        const constraints = [];
        let usedFilter = null; // Track which filter was used in query

        // Prioritize filters: projectId > createdBy > status
        // Use only the first filter in the query, filter others in memory
        if (filters.projectId) {
            constraints.push(
                queryHelpers.where("projectId", "==", filters.projectId),
            );
            usedFilter = "projectId";
        } else if (filters.createdBy) {
            constraints.push(
                queryHelpers.where("createdBy", "==", filters.createdBy),
            );
            usedFilter = "createdBy";
        } else if (filters.status) {
            constraints.push(
                queryHelpers.where("status", "==", filters.status),
            );
            usedFilter = "status";
        }

        // Don't use orderBy in query - sort in memory instead
        let tenders = await getCollection("tenders", constraints);

        // Apply remaining filters in memory
        if (filters.status && usedFilter !== "status") {
            tenders = tenders.filter((t) => t.status === filters.status);
        }
        if (filters.projectId && usedFilter !== "projectId") {
            tenders = tenders.filter((t) => t.projectId === filters.projectId);
        }
        if (filters.createdBy && usedFilter !== "createdBy") {
            tenders = tenders.filter((t) => t.createdBy === filters.createdBy);
        }

        // Sort by createdAt descending in memory
        tenders.sort((a, b) => {
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

        return tenders;
    } catch (error) {
        console.error("Error getting tenders:", error);
        return [];
    }
};

/**
 * Get tender by ID
 * @param {string} tenderId - Tender ID
 * @returns {Promise<Object|null>} Tender object or null
 */
export const getTenderById = async (tenderId) => {
    try {
        if (!tenderId) return null;
        const tender = await getDocument("tenders", tenderId);
        return tender;
    } catch (error) {
        console.error("Error getting tender:", error);
        return null;
    }
};

/**
 * Get tenders by project ID
 * @param {string} projectId - Project ID
 * @returns {Promise<Array>} Array of tenders
 */
export const getTendersByProject = async (projectId) => {
    try {
        if (!projectId) return [];
        return await getAllTenders({ projectId });
    } catch (error) {
        console.error("Error getting tenders by project:", error);
        return [];
    }
};

/**
 * Get tenders by status
 * @param {string} status - Status ('draft', 'open', 'closed', 'awarded')
 * @returns {Promise<Array>} Array of tenders
 */
export const getTendersByStatus = async (status) => {
    try {
        return await getAllTenders({ status });
    } catch (error) {
        console.error("Error getting tenders by status:", error);
        return [];
    }
};

/**
 * Get invitations for a supplier
 * @param {string} supplierId - Supplier user ID
 * @param {string} supplierEmail - Supplier email (optional, for fallback matching)
 * @returns {Promise<Array>} Array of tenders the supplier is invited to
 */
export const getInvitationsForSupplier = async (
    supplierId,
    supplierEmail = null,
) => {
    try {
        const allTenders = await getAllTenders();
        const normalizedSupplierEmail = supplierEmail?.toLowerCase().trim();

        return allTenders.filter((tender) => {
            if (tender.status === "draft") {
                return false;
            }

            if (
                !tender.invitedSuppliers ||
                tender.invitedSuppliers.length === 0
            ) {
                return false;
            }

            return tender.invitedSuppliers.some((inv) => {
                // Check by supplierId first
                if (inv.supplierId && inv.supplierId === supplierId) {
                    return true;
                }
                // Fallback to case-insensitive email matching
                if (normalizedSupplierEmail && inv.email) {
                    return (
                        inv.email.toLowerCase().trim() ===
                        normalizedSupplierEmail
                    );
                }
                return false;
            });
        });
    } catch (error) {
        console.error("Error getting invitations for supplier:", error);
        return [];
    }
};

/**
 * Update a tender
 * @param {string} tenderId - Tender ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{success: boolean, tender?: object, error?: string}>}
 */
export const updateTender = async (tenderId, updates) => {
    try {
        const updatedTender = await updateDocument(
            "tenders",
            tenderId,
            updates,
        );
        return {
            success: true,
            tender: updatedTender,
        };
    } catch (error) {
        console.error("Error updating tender:", error);
        return {
            success: false,
            error: "Kunne ikke oppdatere Anskaffelse. Prøv igjen.",
        };
    }
};

/**
 * Close a tender
 * @param {string} tenderId - Tender ID
 * @returns {Promise<{success: boolean, tender?: object, error?: string}>}
 */
export const closeTender = async (tenderId) => {
    return await updateTender(tenderId, { status: "closed" });
};

/**
 * Open/reopen a tender
 * @param {string} tenderId - Tender ID
 * @returns {Promise<{success: boolean, tender?: object, error?: string}>}
 */
export const openTender = async (tenderId) => {
    return await updateTender(tenderId, { status: "open" });
};

/**
 * Delete a tender (hard delete)
 * @param {string} tenderId - Tender ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteTender = async (tenderId) => {
    try {
        const { deleteDocument } = await import("../services/firestore");
        await deleteDocument("tenders", tenderId);
        return { success: true };
    } catch (error) {
        console.error("Error deleting tender:", error);
        return {
            success: false,
            error: "Kunne ikke slette Anskaffelse. Prøv igjen.",
        };
    }
};

/**
 * Automatically close tenders that have passed their deadline
 * @param {string} createdBy - Optional user ID to filter tenders by creator
 * @returns {Promise<{closed: number, errors: Array}>}
 */
export const closeExpiredTenders = async (createdBy = null) => {
    try {
        const filters = createdBy ? { createdBy } : {};
        const openTenders = await getAllTenders({ ...filters, status: "open" });

        const now = new Date();
        const expiredTenders = openTenders.filter((tender) => {
            if (!tender.deadline) return false;
            const deadline =
                tender.deadline instanceof Date
                    ? tender.deadline
                    : new Date(tender.deadline);
            return deadline < now;
        });

        let closed = 0;
        const errors = [];

        for (const tender of expiredTenders) {
            try {
                const result = await closeTender(tender.id);
                if (result.success) {
                    closed++;
                } else {
                    errors.push({ tenderId: tender.id, error: result.error });
                }
            } catch (error) {
                errors.push({ tenderId: tender.id, error: error.message });
            }
        }

        return { closed, errors };
    } catch (error) {
        console.error("Error closing expired tenders:", error);
        return { closed: 0, errors: [{ error: error.message }] };
    }
};

/**
 * Add a question to a tender
 * @param {string} tenderId - Tender ID
 * @param {string} question - Question text
 * @param {Object} user - User asking the question
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const addQuestionToTender = async (tenderId, question, user) => {
    try {
        const tender = await getTenderById(tenderId);
        if (!tender) {
            return {
                success: false,
                error: "Anskaffelse ikke funnet",
            };
        }

        if (tender.status === "draft") {
            return {
                success: false,
                error: "Du kan ikke stille spørsmål før Anskaffelsen er publisert. Endre status til 'Åpen' først.",
            };
        }

        const newQuestion = {
            id: `qa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            tenderId: tenderId,
            question: question.trim(),
            askedBy: user.id,
            askedByCompany: user.companyName || "",
            askedAt: new Date(),
            answer: "",
            answeredBy: null,
            answeredAt: null,
        };

        const qa = tender.qa || [];
        const updatedQa = [...qa, newQuestion];

        await updateTender(tenderId, { qa: updatedQa });

        // Send notification to tender creator
        if (tender.createdBy) {
            try {
                await notifyQuestionAsked(
                    tender.createdBy,
                    tender,
                    newQuestion,
                );
            } catch (notifError) {
                console.warn(
                    "Failed to send question notification:",
                    notifError,
                );
                // Don't fail the question if notification fails
            }
        }

        return {
            success: true,
        };
    } catch (error) {
        console.error("Error adding question:", error);
        return {
            success: false,
            error: "Kunne ikke legge til spørsmål. Prøv igjen.",
        };
    }
};

/**
 * Answer a question on a tender
 * @param {string} tenderId - Tender ID
 * @param {string} questionId - Question ID
 * @param {string} answer - Answer text
 * @param {Object} user - User answering the question
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const answerQuestion = async (tenderId, questionId, answer, user) => {
    try {
        const tender = await getTenderById(tenderId);
        if (!tender) {
            return {
                success: false,
                error: "Anskaffelse ikke funnet",
            };
        }

        if (tender.status === "draft") {
            return {
                success: false,
                error: "Du kan ikke besvare spørsmål før Anskaffelsen er publisert. Endre status til 'Åpen' først.",
            };
        }

        const qa = tender.qa || [];
        const questionIndex = qa.findIndex((q) => q.id === questionId);

        if (questionIndex < 0) {
            return {
                success: false,
                error: "Spørsmål ikke funnet",
            };
        }

        const updatedQa = [...qa];
        const answeredQuestion = {
            ...updatedQa[questionIndex],
            answer: answer.trim(),
            answeredBy: user.id,
            answeredAt: new Date(),
        };
        updatedQa[questionIndex] = answeredQuestion;

        await updateTender(tenderId, { qa: updatedQa });

        // Send notification to question asker
        if (answeredQuestion.askedBy) {
            try {
                await notifyQuestionAnswered(
                    answeredQuestion.askedBy,
                    tender,
                    answeredQuestion,
                );
            } catch (notifError) {
                console.warn("Failed to send answer notification:", notifError);
                // Don't fail the answer if notification fails
            }
        }

        return {
            success: true,
        };
    } catch (error) {
        console.error("Error answering question:", error);
        return {
            success: false,
            error: "Kunne ikke besvare spørsmål. Prøv igjen.",
        };
    }
};

/**
 * Add documents to a tender
 * @param {string} tenderId - Tender ID
 * @param {Array} files - Array of File objects to upload
 * @param {Object} user - User uploading the documents
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const addDocumentsToTender = async (tenderId, files, user) => {
    try {
        const tender = await getTenderById(tenderId);
        if (!tender) {
            return {
                success: false,
                error: "Anskaffelse ikke funnet",
            };
        }

        // Upload files to Firebase Storage and create document objects
        const uploadPromises = files.map(async (file) => {
            const storagePath = getTenderDocumentPath(tenderId, file.name);
            const uploadResult = await uploadFile(file, storagePath);

            const documentId = `doc_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`;

            const documentData = {
                id: documentId,
                name: file.name,
                type:
                    file.type ||
                    (file.name.split(".").pop()?.toLowerCase() === "pdf"
                        ? "pdf"
                        : "file"),
                size: file.size,
                url: uploadResult.url,
                storagePath: uploadResult.path,
                uploadedAt: new Date(),
                uploadedBy: user.id,
            };

            // Check if document with same name already exists (update scenario)
            const existingDocuments = tender.documents || [];
            const existingDoc = existingDocuments.find(
                (doc) => doc.name === file.name,
            );

            // Create version for document
            if (existingDoc) {
                // This is an update - create a new version
                await createDocumentVersion(
                    existingDoc.id,
                    documentData,
                    user,
                    "tender",
                    tenderId,
                    "Dokument oppdatert",
                );
                // Update the existing document
                return {
                    ...existingDoc,
                    ...documentData,
                };
            } else {
                // This is a new document - create initial version
                await createDocumentVersion(
                    documentId,
                    documentData,
                    user,
                    "tender",
                    tenderId,
                    "Dokument opprettet",
                );
                return documentData;
            }
        });

        const newDocuments = await Promise.all(uploadPromises);
        const existingDocuments = tender.documents || [];

        // Merge documents - update existing ones or add new ones
        const updatedDocuments = [...existingDocuments];
        newDocuments.forEach((newDoc) => {
            const existingIndex = updatedDocuments.findIndex(
                (doc) => doc.id === newDoc.id || doc.name === newDoc.name,
            );
            if (existingIndex >= 0) {
                updatedDocuments[existingIndex] = newDoc;
            } else {
                updatedDocuments.push(newDoc);
            }
        });

        await updateTender(tenderId, { documents: updatedDocuments });

        return {
            success: true,
        };
    } catch (error) {
        console.error("Error adding documents:", error);
        return {
            success: false,
            error: "Kunne ikke legge til dokumenter. Prøv igjen.",
        };
    }
};

/**
 * Remove a document from a tender
 * @param {string} tenderId - Tender ID
 * @param {string} documentId - Document ID to remove
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const removeDocumentFromTender = async (tenderId, documentId) => {
    try {
        const tender = await getTenderById(tenderId);
        if (!tender) {
            return {
                success: false,
                error: "Anskaffelse ikke funnet",
            };
        }

        const documents = tender.documents || [];
        const documentToRemove = documents.find((doc) => doc.id === documentId);

        if (!documentToRemove) {
            return {
                success: false,
                error: "Dokument ikke funnet",
            };
        }

        // Delete from Firebase Storage if it has a storage path
        if (documentToRemove.storagePath) {
            try {
                await deleteFile(documentToRemove.storagePath);
            } catch (storageError) {
                console.warn("Error deleting file from storage:", storageError);
                // Continue with removing from Firestore even if storage delete fails
            }
        }

        // Remove from documents array
        const updatedDocuments = documents.filter(
            (doc) => doc.id !== documentId,
        );
        await updateTender(tenderId, { documents: updatedDocuments });

        return {
            success: true,
        };
    } catch (error) {
        console.error("Error removing document:", error);
        return {
            success: false,
            error: "Kunne ikke fjerne dokument. Prøv igjen.",
        };
    }
};

/**
 * Add or update supplier invitation
 * @param {string} tenderId - Tender ID
 * @param {Object} invitation - Invitation object {supplierId, companyId, companyName, orgNumber, email}
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const addSupplierInvitation = async (tenderId, invitation) => {
    try {
        const tender = await getTenderById(tenderId);
        if (!tender) {
            return {
                success: false,
                error: "Anskaffelse ikke funnet",
            };
        }

        const invitedSuppliers = tender.invitedSuppliers || [];
        const invitedSupplierIds = tender.invitedSupplierIds || [];

        // Check if supplier is already invited
        const existingIndex = invitedSuppliers.findIndex(
            (inv) =>
                inv.supplierId === invitation.supplierId ||
                inv.email === invitation.email,
        );

        const newInvitation = {
            supplierId: invitation.supplierId,
            companyId: invitation.companyId,
            companyName: invitation.companyName,
            orgNumber: invitation.orgNumber,
            email: invitation.email,
            invitedAt: new Date(),
            status: "invited",
            viewedAt: null,
        };

        let updatedInvitations;
        let updatedSupplierIds;

        if (existingIndex >= 0) {
            // Update existing invitation
            updatedInvitations = [...invitedSuppliers];
            updatedInvitations[existingIndex] = {
                ...updatedInvitations[existingIndex],
                ...newInvitation,
            };
            updatedSupplierIds = invitedSupplierIds;
        } else {
            // Add new invitation
            updatedInvitations = [...invitedSuppliers, newInvitation];
            // Add supplierId to flat array for security rules
            updatedSupplierIds = invitation.supplierId
                ? [...invitedSupplierIds, invitation.supplierId]
                : invitedSupplierIds;
        }

        await updateTender(tenderId, {
            invitedSuppliers: updatedInvitations,
            invitedSupplierIds: updatedSupplierIds,
        });

        // Send notification to supplier if this is a new invitation
        if (existingIndex < 0 && invitation.supplierId) {
            try {
                await notifyTenderInvitation(invitation.supplierId, tender);
            } catch (notifError) {
                console.warn(
                    "Failed to send invitation notification:",
                    notifError,
                );
                // Don't fail the invitation if notification fails
            }
        }

        // Send email to supplier if this is a new invitation
        if (existingIndex < 0 && invitation.email) {
            try {
                const userId = invitation.supplierId || null;
                if (
                    !userId ||
                    (await shouldSendEmail(userId, "TENDER_INVITATION"))
                ) {
                    await sendTenderInvitationEmail(
                        invitation.email,
                        tender,
                        invitation.companyName || null,
                    );
                }
            } catch (emailError) {
                console.warn("Failed to send invitation email:", emailError);
                // Don't fail the invitation if email fails
            }
        }

        return {
            success: true,
        };
    } catch (error) {
        console.error("Error adding supplier invitation:", error);
        return {
            success: false,
            error: "Kunne ikke invitere leverandør. Prøv igjen.",
        };
    }
};

/**
 * Submit a bid for a tender
 * @param {string} tenderId - Tender ID
 * @param {Object} bidData - Bid data {price, priceStructure, documents, notes, etc.}
 * @param {Object} user - User submitting the bid
 * @returns {Promise<{success: boolean, bid?: object, error?: string}>}
 */
export const submitBid = async (tenderId, bidData, user) => {
    try {
        const tender = await getTenderById(tenderId);
        if (!tender) {
            return {
                success: false,
                error: "Anskaffelse ikke funnet",
            };
        }

        // Upload bid documents if provided
        let bidDocuments = [];
        if (bidData.files && bidData.files.length > 0) {
            const { getBidDocumentPath } = await import("../services/storage");
            const uploadPromises = bidData.files.map(async (file) => {
                const storagePath = getBidDocumentPath(
                    tenderId,
                    `bid_${Date.now()}`,
                    file.name,
                );
                const uploadResult = await uploadFile(file, storagePath);

                return {
                    id: `bidoc_${Date.now()}_${Math.random()
                        .toString(36)
                        .substr(2, 9)}`,
                    name: file.name,
                    type: file.type || "file",
                    size: file.size,
                    url: uploadResult.url,
                    storagePath: uploadResult.path,
                };
            });
            bidDocuments = await Promise.all(uploadPromises);
        }

        const newBid = {
            id: `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            tenderId: tenderId,
            supplierId: user.id,
            companyId: user.companyId,
            companyName: user.companyName,
            submittedAt: new Date(),
            price: bidData.price ? parseFloat(bidData.price) : null,
            priceStructure: bidData.priceStructure || "fastpris",
            hourlyRate: bidData.hourlyRate || null,
            estimatedHours: bidData.estimatedHours || null,
            documents: bidDocuments,
            notes: bidData.notes || null,
            status: "submitted",
            score: null,
        };

        const bids = tender.bids || [];
        const updatedBids = [...bids, newBid];

        await updateTender(tenderId, { bids: updatedBids });

        // Send notification to tender creator
        if (tender.createdBy) {
            try {
                await notifyNewBid(tender.createdBy, tender, newBid);
            } catch (notifError) {
                console.warn("Failed to send bid notification:", notifError);
                // Don't fail the bid submission if notification fails
            }
        }

        // Send email to tender creator
        if (tender.createdBy) {
            try {
                if (await shouldSendEmail(tender.createdBy, "NEW_BID")) {
                    await sendEmailToUser(
                        tender.createdBy,
                        async (senderEmail) => {
                            return await sendBidSubmissionEmail(
                                senderEmail,
                                tender,
                                newBid,
                            );
                        },
                    );
                }
            } catch (emailError) {
                console.warn("Failed to send bid email:", emailError);
                // Don't fail the bid submission if email fails
            }
        }

        return {
            success: true,
            bid: newBid,
        };
    } catch (error) {
        console.error("Error submitting bid:", error);
        return {
            success: false,
            error: "Kunne ikke sende inn tilbud. Prøv igjen.",
        };
    }
};

/**
 * Award a tender to a bid
 * @param {string} tenderId - Tender ID
 * @param {string} bidId - Bid ID to award
 * @param {Object} project - Project object (optional, for award letter)
 * @returns {Promise<{success: boolean, error?: string, awardLetter?: object}>}
 */
export const awardTender = async (tenderId, bidId, project = null) => {
    try {
        const tender = await getTenderById(tenderId);
        if (!tender) {
            return {
                success: false,
                error: "Anskaffelse ikke funnet",
            };
        }

        const bids = tender.bids || [];
        const bidIndex = bids.findIndex((b) => b.id === bidId);

        if (bidIndex < 0) {
            return {
                success: false,
                error: "Tilbud ikke funnet",
            };
        }

        const awardedBid = bids[bidIndex];
        const awardDate = new Date();

        // Import award letter service
        const { generateAwardLetter, sendAwardLetter, sendRejectionEmails } =
            await import("./awardLetterService");

        // Generate award letter data
        const awardLetter = generateAwardLetter(
            tender,
            awardedBid,
            project,
            awardDate,
        );

        // Update bid status
        const updatedBids = [...bids];
        updatedBids[bidIndex] = {
            ...updatedBids[bidIndex],
            status: "awarded",
        };

        // Mark other bids as rejected
        updatedBids.forEach((bid, index) => {
            if (index !== bidIndex && bid.status !== "rejected") {
                bid.status = "rejected";
            }
        });

        // Update tender with award information and standstill period
        await updateTender(tenderId, {
            status: "awarded",
            awardedBidId: bidId,
            awardedAt: awardDate,
            standstillStartDate: awardLetter.standstillStartDate,
            standstillEndDate: awardLetter.standstillEndDate,
            awardLetter: awardLetter,
            bids: updatedBids,
        });

        // Send award letter email to awarded supplier
        try {
            await sendAwardLetter(
                tender,
                awardedBid,
                project,
                awardLetter.standstillEndDate,
            );
        } catch (emailError) {
            console.warn("Failed to send award letter email:", emailError);
            // Don't fail the award if email fails
        }

        // Send rejection emails to non-awarded suppliers (non-blocking)
        try {
            const rejectionResult = await sendRejectionEmails(
                tender,
                awardedBid,
            );
            if (rejectionResult.failed > 0) {
                console.warn(
                    `Failed to send ${rejectionResult.failed} rejection emails:`,
                    rejectionResult.errors,
                );
            }
        } catch (rejectionError) {
            console.warn("Failed to send rejection emails:", rejectionError);
            // Don't fail the award if rejection emails fail
        }

        return {
            success: true,
            awardLetter: awardLetter,
        };
    } catch (error) {
        console.error("Error awarding tender:", error);
        return {
            success: false,
            error: "Kunne ikke tildele Anskaffelse. Prøv igjen.",
        };
    }
};
