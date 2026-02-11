/**
 * Document Versioning Service
 * 
 * Handles document version history, comparison, and change tracking
 */

import {
    getDocument,
    getCollection,
    createDocument,
    updateDocument,
    queryHelpers,
} from "./firestore";
import { uploadFile, deleteFile } from "./storage";

/**
 * Create a new document version
 * @param {string} documentId - Document ID
 * @param {Object} documentData - Document data (name, url, storagePath, size, type, etc.)
 * @param {Object} user - User creating the version
 * @param {string} context - Context (e.g., 'tender', 'complaint', 'bid')
 * @param {string} contextId - Context ID (e.g., tenderId, complaintId)
 * @param {string} changeReason - Optional reason for the change
 * @returns {Promise<{success: boolean, version?: object, error?: string}>}
 */
export const createDocumentVersion = async (
    documentId,
    documentData,
    user,
    context,
    contextId,
    changeReason = null
) => {
    try {
        // Get existing versions to determine version number
        const existingVersions = await getDocumentVersions(documentId);
        const versionNumber = existingVersions.length + 1;

        // Calculate changes from previous version
        let changes = [];
        if (existingVersions.length > 0) {
            const previousVersion = existingVersions[0]; // Most recent
            changes = calculateDocumentChanges(previousVersion, documentData);
        } else {
            changes = [
                {
                    type: "created",
                    field: "document",
                    oldValue: null,
                    newValue: documentData.name,
                    description: "Dokument opprettet",
                },
            ];
        }

        const version = {
            documentId: documentId,
            versionNumber: versionNumber,
            name: documentData.name,
            url: documentData.url,
            storagePath: documentData.storagePath,
            size: documentData.size,
            type: documentData.type,
            context: context,
            contextId: contextId,
            uploadedBy: user.id,
            uploadedByName: user.name || user.email,
            uploadedAt: new Date(),
            changeReason: changeReason,
            changes: changes,
            isCurrent: true, // This will be the current version
        };

        // Mark all previous versions as not current
        if (existingVersions.length > 0) {
            const updatePromises = existingVersions.map((v) =>
                updateDocument("documentVersions", v.id, { isCurrent: false })
            );
            await Promise.all(updatePromises);
        }

        // Create new version
        const createdVersion = await createDocument("documentVersions", version);

        return {
            success: true,
            version: createdVersion,
        };
    } catch (error) {
        console.error("Error creating document version:", error);
        return {
            success: false,
            error: "Kunne ikke opprette dokumentversjon. Prøv igjen.",
        };
    }
};

/**
 * Get all versions for a document
 * @param {string} documentId - Document ID
 * @returns {Promise<Array>} Array of versions sorted by version number (descending)
 */
export const getDocumentVersions = async (documentId) => {
    try {
        const constraints = [
            queryHelpers.where("documentId", "==", documentId),
            queryHelpers.orderBy("versionNumber", "desc"),
        ];

        const versions = await getCollection("documentVersions", constraints);
        return versions;
    } catch (error) {
        console.error("Error getting document versions:", error);
        return [];
    }
};

/**
 * Get current version of a document
 * @param {string} documentId - Document ID
 * @returns {Promise<Object|null>} Current version or null
 */
export const getCurrentDocumentVersion = async (documentId) => {
    try {
        const constraints = [
            queryHelpers.where("documentId", "==", documentId),
            queryHelpers.where("isCurrent", "==", true),
        ];

        const versions = await getCollection("documentVersions", constraints);
        return versions.length > 0 ? versions[0] : null;
    } catch (error) {
        console.error("Error getting current document version:", error);
        return null;
    }
};

/**
 * Get version by version number
 * @param {string} documentId - Document ID
 * @param {number} versionNumber - Version number
 * @returns {Promise<Object|null>} Version or null
 */
export const getDocumentVersionByNumber = async (documentId, versionNumber) => {
    try {
        const versions = await getDocumentVersions(documentId);
        return versions.find((v) => v.versionNumber === versionNumber) || null;
    } catch (error) {
        console.error("Error getting document version by number:", error);
        return null;
    }
};

/**
 * Compare two document versions
 * @param {Object} version1 - First version
 * @param {Object} version2 - Second version
 * @returns {Object} Comparison result with differences
 */
export const compareDocumentVersions = (version1, version2) => {
    const differences = [];

    // Compare name
    if (version1.name !== version2.name) {
        differences.push({
            field: "name",
            oldValue: version1.name,
            newValue: version2.name,
            type: "modified",
        });
    }

    // Compare size
    if (version1.size !== version2.size) {
        differences.push({
            field: "size",
            oldValue: formatFileSize(version1.size),
            newValue: formatFileSize(version2.size),
            type: "modified",
        });
    }

    // Compare type
    if (version1.type !== version2.type) {
        differences.push({
            field: "type",
            oldValue: version1.type,
            newValue: version2.type,
            type: "modified",
        });
    }

    // Compare uploaded by
    if (version1.uploadedBy !== version2.uploadedBy) {
        differences.push({
            field: "uploadedBy",
            oldValue: version1.uploadedByName,
            newValue: version2.uploadedByName,
            type: "modified",
        });
    }

    // Compare change reason
    if (version1.changeReason !== version2.changeReason) {
        differences.push({
            field: "changeReason",
            oldValue: version1.changeReason || "Ingen begrunnelse",
            newValue: version2.changeReason || "Ingen begrunnelse",
            type: "modified",
        });
    }

    return {
        version1: version1,
        version2: version2,
        differences: differences,
        hasChanges: differences.length > 0,
    };
};

/**
 * Calculate changes between two document versions
 * @param {Object} oldVersion - Previous version
 * @param {Object} newDocumentData - New document data
 * @returns {Array} Array of change objects
 */
const calculateDocumentChanges = (oldVersion, newDocumentData) => {
    const changes = [];

    // Name change
    if (oldVersion.name !== newDocumentData.name) {
        changes.push({
            type: "modified",
            field: "name",
            oldValue: oldVersion.name,
            newValue: newDocumentData.name,
            description: `Navn endret fra "${oldVersion.name}" til "${newDocumentData.name}"`,
        });
    }

    // Size change
    if (oldVersion.size !== newDocumentData.size) {
        const sizeDiff = newDocumentData.size - oldVersion.size;
        const sizeDiffPercent = ((sizeDiff / oldVersion.size) * 100).toFixed(1);
        changes.push({
            type: "modified",
            field: "size",
            oldValue: formatFileSize(oldVersion.size),
            newValue: formatFileSize(newDocumentData.size),
            description: `Størrelse endret fra ${formatFileSize(
                oldVersion.size
            )} til ${formatFileSize(newDocumentData.size)} (${sizeDiffPercent > 0 ? "+" : ""}${sizeDiffPercent}%)`,
        });
    }

    // Type change
    if (oldVersion.type !== newDocumentData.type) {
        changes.push({
            type: "modified",
            field: "type",
            oldValue: oldVersion.type,
            newValue: newDocumentData.type,
            description: `Filtype endret fra ${oldVersion.type} til ${newDocumentData.type}`,
        });
    }

    // File replaced (if URL or storage path changed)
    if (
        oldVersion.url !== newDocumentData.url ||
        oldVersion.storagePath !== newDocumentData.storagePath
    ) {
        changes.push({
            type: "replaced",
            field: "file",
            oldValue: oldVersion.url,
            newValue: newDocumentData.url,
            description: "Fil erstattet med ny versjon",
        });
    }

    return changes;
};

/**
 * Get document change history
 * @param {string} documentId - Document ID
 * @returns {Promise<Array>} Array of change history entries
 */
export const getDocumentChangeHistory = async (documentId) => {
    try {
        const versions = await getDocumentVersions(documentId);
        const history = [];

        versions.forEach((version, index) => {
            if (version.changes && version.changes.length > 0) {
                version.changes.forEach((change) => {
                    history.push({
                        version: version.versionNumber,
                        timestamp: version.uploadedAt,
                        user: version.uploadedByName,
                        userId: version.uploadedBy,
                        change: change,
                        changeReason: version.changeReason,
                    });
                });
            } else if (index === versions.length - 1) {
                // First version (creation)
                history.push({
                    version: version.versionNumber,
                    timestamp: version.uploadedAt,
                    user: version.uploadedByName,
                    userId: version.uploadedBy,
                    change: {
                        type: "created",
                        field: "document",
                        description: "Dokument opprettet",
                    },
                    changeReason: version.changeReason,
                });
            }
        });

        return history.sort((a, b) => {
            const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
            const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
            return dateB - dateA; // Most recent first
        });
    } catch (error) {
        console.error("Error getting document change history:", error);
        return [];
    }
};

/**
 * Restore a document to a specific version
 * @param {string} documentId - Document ID
 * @param {number} versionNumber - Version number to restore
 * @param {Object} user - User performing the restore
 * @param {string} context - Context (e.g., 'tender', 'complaint')
 * @param {string} contextId - Context ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const restoreDocumentVersion = async (
    documentId,
    versionNumber,
    user,
    context,
    contextId
) => {
    try {
        const versionToRestore = await getDocumentVersionByNumber(
            documentId,
            versionNumber
        );

        if (!versionToRestore) {
            return {
                success: false,
                error: "Versjon ikke funnet",
            };
        }

        // Create a new version based on the restored version
        const restoredDocumentData = {
            name: versionToRestore.name,
            url: versionToRestore.url,
            storagePath: versionToRestore.storagePath,
            size: versionToRestore.size,
            type: versionToRestore.type,
        };

        const result = await createDocumentVersion(
            documentId,
            restoredDocumentData,
            user,
            context,
            contextId,
            `Gjenopprettet fra versjon ${versionNumber}`
        );

        return result;
    } catch (error) {
        console.error("Error restoring document version:", error);
        return {
            success: false,
            error: "Kunne ikke gjenopprette versjon. Prøv igjen.",
        };
    }
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

