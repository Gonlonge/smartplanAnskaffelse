/**
 * Contract Service
 * Handles contract generation and signing from Firestore
 * Supports NS 8405/8406/8407 light versions
 */

import {
    getDocument,
    getCollection,
    createDocument,
    updateDocument,
    queryHelpers,
} from "../services/firestore";
import { notifyContractUpdate } from "./notificationService";
import {
    sendContractSigningRequestEmail,
    sendEmailToUser,
    shouldSendEmail,
} from "./emailService";
import { isStandstillPeriodEnded } from "./awardLetterService";
import { getTenderById } from "./tenderService";

/**
 * Generate contract based on NS standard
 * @param {Object} tender - Tender object
 * @param {Object} bid - Awarded bid object
 * @param {Object} project - Project object
 * @returns {Promise<{success: boolean, contract?: object, error?: string}>}
 */
export const generateContract = async (tender, bid, project) => {
    try {
        // Check if standstill period has ended
        if (
            tender.standstillEndDate &&
            !isStandstillPeriodEnded(tender.standstillEndDate)
        ) {
            return {
                success: false,
                error: `Kontrakt kan ikke genereres før ventetiden (standstill periode) er utløpt. Ventetiden utløper ${new Date(tender.standstillEndDate).toLocaleDateString("no-NO")}.`,
            };
        }
        const contract = {
            tenderId: tender.id,
            bidId: bid.id,
            projectId: project.id,
            contractStandard: tender.contractStandard,
            status: "draft", // 'draft' | 'pending_signature' | 'signed' | 'amended'
            createdAt: new Date(),
            signedAt: null,
            signedBy: null,
            version: 1,
            changes: [], // Change log

            // Contract parties
            customer: {
                companyId: project.ownerCompanyId,
                companyName: project.name || "Kunde", // Use project name as fallback
            },
            supplier: {
                companyId: bid.companyId,
                companyName: bid.companyName,
            },

            // Contract terms
            title: tender.title,
            description: tender.description,
            price: bid.price,
            priceStructure: bid.priceStructure,
            hourlyRate: bid.hourlyRate,
            estimatedHours: bid.estimatedHours,
            deadline: tender.deadline,

            // NS standard specific fields
            nsStandard: {
                standard: tender.contractStandard,
                // NS 8405/8406/8407 light version - simplified fields
                workDescription: tender.description,
                priceBasis: bid.priceStructure,
                paymentTerms: "30 dager", // Default
                warrantyPeriod: "2 år", // Default for construction
                startDate: null,
                completionDate: null,
            },
        };

        // Create in Firestore
        const createdContract = await createDocument("contracts", contract);

        // Send notification to supplier
        if (bid.supplierId) {
            try {
                await notifyContractUpdate(
                    bid.supplierId,
                    createdContract,
                    "generated",
                );
            } catch (notifError) {
                console.warn(
                    "Failed to send contract notification:",
                    notifError,
                );
                // Don't fail the contract generation if notification fails
            }
        }

        // Send email to supplier for contract signing
        if (bid.supplierId) {
            try {
                if (await shouldSendEmail(bid.supplierId, "CONTRACT_SIGNED")) {
                    await sendEmailToUser(
                        bid.supplierId,
                        async (supplierEmail) => {
                            return await sendContractSigningRequestEmail(
                                supplierEmail,
                                createdContract,
                                tender,
                            );
                        },
                    );
                }
            } catch (emailError) {
                console.warn("Failed to send contract email:", emailError);
                // Don't fail the contract generation if email fails
            }
        }

        return {
            success: true,
            contract: createdContract,
        };
    } catch (error) {
        console.error("Error generating contract:", error);
        return {
            success: false,
            error: "Kunne ikke generere kontrakt",
        };
    }
};

/**
 * Get contract by ID
 * @param {string} contractId - Contract ID
 * @returns {Promise<Object|null>} Contract object or null
 */
export const getContractById = async (contractId) => {
    try {
        if (!contractId) return null;
        const contract = await getDocument("contracts", contractId);
        return contract;
    } catch (error) {
        console.error("Error getting contract:", error);
        return null;
    }
};

/**
 * Get contract by tender ID
 * @param {string} tenderId - Tender ID
 * @returns {Promise<Object|null>} Contract object or null
 */
export const getContractByTenderId = async (tenderId) => {
    try {
        if (!tenderId) return null;

        // Query without orderBy to avoid needing composite index, sort in memory
        const constraints = [queryHelpers.where("tenderId", "==", tenderId)];

        let contracts = await getCollection("contracts", constraints);

        // Sort by createdAt descending in memory and take first
        contracts.sort((a, b) => {
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

        return contracts.length > 0 ? contracts[0] : null;
    } catch (error) {
        console.error("Error getting contract by tender ID:", error);
        return null;
    }
};

/**
 * Get contracts by project ID
 * @param {string} projectId - Project ID
 * @returns {Promise<Array>} Array of contracts
 */
export const getContractsByProject = async (projectId) => {
    try {
        if (!projectId) return [];

        // Query without orderBy to avoid needing composite index, sort in memory
        const constraints = [queryHelpers.where("projectId", "==", projectId)];

        let contracts = await getCollection("contracts", constraints);

        // Sort by createdAt descending in memory
        contracts.sort((a, b) => {
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

        return contracts;
    } catch (error) {
        console.error("Error getting contracts by project:", error);
        return [];
    }
};

/**
 * Save contract (create or update)
 * @param {Object} contract - Contract object
 * @returns {Promise<{success: boolean, contract?: object, error?: string}>}
 */
export const saveContract = async (contract) => {
    try {
        if (contract.id) {
            // Update existing contract
            const updatedContract = await updateDocument(
                "contracts",
                contract.id,
                contract,
            );
            return {
                success: true,
                contract: updatedContract,
            };
        } else {
            // Create new contract
            const createdContract = await createDocument("contracts", contract);
            return {
                success: true,
                contract: createdContract,
            };
        }
    } catch (error) {
        console.error("Error saving contract:", error);
        return {
            success: false,
            error: "Kunne ikke lagre kontrakt",
        };
    }
};

/**
 * Sign contract
 * @param {string} contractId - Contract ID
 * @param {Object} user - User signing the contract
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const signContract = async (contractId, user) => {
    try {
        const contract = await getContractById(contractId);
        if (!contract) {
            return { success: false, error: "Kontrakt ikke funnet" };
        }

        // Check if standstill period has ended
        if (contract.tenderId) {
            const tender = await getTenderById(contract.tenderId);
            if (
                tender?.standstillEndDate &&
                !isStandstillPeriodEnded(tender.standstillEndDate)
            ) {
                const endDate = new Date(tender.standstillEndDate);
                return {
                    success: false,
                    error: `Kontrakt kan ikke signeres før ventetiden (standstill periode) er utløpt. Ventetiden utløper ${endDate.toLocaleDateString(
                        "no-NO",
                        {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        },
                    )}.`,
                };
            }
        }

        const updates = {
            status: "signed",
            signedAt: new Date(),
            signedBy: {
                userId: user.id,
                userName: user.name,
                userEmail: user.email,
                companyId: user.companyId,
                companyName: user.companyName,
            },
        };

        await updateDocument("contracts", contractId, updates);

        // Send notification about contract being signed
        const updatedContract = await getContractById(contractId);
        if (updatedContract) {
            try {
                await notifyContractUpdate(user.id, updatedContract, "signed");
            } catch (notifError) {
                console.warn(
                    "Failed to send contract signed notification:",
                    notifError,
                );
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Error signing contract:", error);
        return { success: false, error: "Kunne ikke signere kontrakt" };
    }
};

/**
 * Add change to contract
 * @param {string} contractId - Contract ID
 * @param {Object} change - Change object {field, oldValue, newValue, reason}
 * @param {Object} user - User making the change
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const addContractChange = async (contractId, change, user) => {
    try {
        const contract = await getContractById(contractId);
        if (!contract) {
            return { success: false, error: "Kontrakt ikke funnet" };
        }

        const changeEntry = {
            id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            version: contract.version + 1,
            changedAt: new Date(),
            changedBy: {
                userId: user.id,
                userName: user.name,
                userEmail: user.email,
                companyId: user.companyId,
            },
            field: change.field,
            oldValue: change.oldValue,
            newValue: change.newValue,
            reason: change.reason || "",
        };

        const changes = contract.changes || [];
        const updatedChanges = [...changes, changeEntry];

        const updates = {
            changes: updatedChanges,
            version: changeEntry.version,
            status: "amended",
        };

        await updateDocument("contracts", contractId, updates);

        // Send notification about contract amendment
        const updatedContract = await getContractById(contractId);
        if (updatedContract) {
            try {
                await notifyContractUpdate(user.id, updatedContract, "amended");
            } catch (notifError) {
                console.warn(
                    "Failed to send contract amendment notification:",
                    notifError,
                );
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Error adding contract change:", error);
        return { success: false, error: "Kunne ikke legge til endring" };
    }
};
