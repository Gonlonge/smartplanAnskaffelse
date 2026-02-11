/**
 * User Service
 *
 * Handles fetching users, particularly suppliers (receivers)
 * for the supplier directory
 */

import { getCollection, queryHelpers } from "../services/firestore";

/**
 * Get all suppliers (users with role "receiver")
 * @returns {Promise<Array>} Array of supplier user objects
 */
export const getAllSuppliers = async () => {
    try {
        // Query users collection for receivers
        const constraints = [queryHelpers.where("role", "==", "receiver")];

        const suppliers = await getCollection("users", constraints);

        // Sort by company name alphabetically
        suppliers.sort((a, b) => {
            const nameA = (a.companyName || a.name || "").toLowerCase();
            const nameB = (b.companyName || b.name || "").toLowerCase();
            return nameA.localeCompare(nameB, "no");
        });

        return suppliers;
    } catch (error) {
        console.error("Error getting suppliers:", error);
        return [];
    }
};

/**
 * Get supplier by ID
 * @param {string} supplierId - Supplier user ID
 * @returns {Promise<Object|null>} Supplier user object or null
 */
export const getSupplierById = async (supplierId) => {
    try {
        const { getDocument } = await import("../services/firestore");
        const supplier = await getDocument("users", supplierId);

        // Only return if it's a receiver
        if (supplier && supplier.role === "receiver") {
            return supplier;
        }

        return null;
    } catch (error) {
        console.error("Error getting supplier:", error);
        return null;
    }
};

/**
 * Get all supplier admin users (receivers with isAdmin: true)
 * @returns {Promise<Array>} Array of supplier admin user objects
 */
export const getSupplierAdminUsers = async () => {
    try {
        // Query users collection for receivers only (to avoid needing composite index)
        // Filter for isAdmin: true in memory
        const constraints = [queryHelpers.where("role", "==", "receiver")];

        const receivers = await getCollection("users", constraints);

        // Filter for admin users in memory
        const supplierAdmins = receivers.filter(
            (user) => user.isAdmin === true
        );

        // Sort by company name alphabetically
        supplierAdmins.sort((a, b) => {
            const nameA = (a.companyName || a.name || "").toLowerCase();
            const nameB = (b.companyName || b.name || "").toLowerCase();
            return nameA.localeCompare(nameB, "no");
        });

        return supplierAdmins;
    } catch (error) {
        console.error("Error getting supplier admin users:", error);
        return [];
    }
};

/**
 * Get all admin users (both sender admins and supplier admins)
 * @returns {Promise<Array>} Array of all admin user objects with role info
 */
export const getAllAdminUsers = async () => {
    try {
        // Get all users (admins can read all users)
        const allUsers = await getCollection("users", []);

        // Filter for admin users (docToObject already adds id field)
        const adminUsers = allUsers.filter((user) => user.isAdmin === true);

        // Sort by role first (sender, then receiver), then by company name
        adminUsers.sort((a, b) => {
            // First sort by role
            if (a.role !== b.role) {
                return a.role === "sender" ? -1 : 1;
            }
            // Then sort by company name
            const nameA = (a.companyName || a.name || "").toLowerCase();
            const nameB = (b.companyName || b.name || "").toLowerCase();
            return nameA.localeCompare(nameB, "no");
        });

        return adminUsers;
    } catch (error) {
        console.error("Error getting all admin users:", error);
        return [];
    }
};

/**
 * Get all senders (clients) a supplier has interacted with
 * Based on invitations, bids, and contracts
 * @param {string} supplierId - Supplier user ID
 * @param {string} supplierEmail - Supplier email (optional, for fallback matching)
 * @returns {Promise<Array>} Array of sender user objects with interaction stats
 */
export const getSendersForSupplier = async (
    supplierId,
    supplierEmail = null
) => {
    try {
        const { getAllTenders } = await import("./tenderService");
        const { getDocument } = await import("../services/firestore");

        // Get supplier user info to check companyId
        const supplierUser = await getDocument("users", supplierId);
        const supplierCompanyId = supplierUser?.companyId;

        // Get all tenders
        const allTenders = await getAllTenders();
        const normalizedSupplierEmail = supplierEmail?.toLowerCase().trim();

        // Map to track unique senders and their interactions
        const sendersMap = new Map();

        // Process each tender
        for (const tender of allTenders) {
            // Check if supplier was invited
            const wasInvited = tender.invitedSuppliers?.some((inv) => {
                if (inv.supplierId === supplierId) return true;
                if (
                    normalizedSupplierEmail &&
                    inv.email?.toLowerCase().trim() === normalizedSupplierEmail
                )
                    return true;
                return false;
            });

            // Check if supplier submitted a bid
            // Match by supplierId or companyId
            const submittedBid = tender.bids?.find((bid) => {
                if (bid.supplierId === supplierId) return true;
                // Also check if bid companyId matches supplier's companyId
                if (supplierCompanyId && bid.companyId === supplierCompanyId)
                    return true;
                return false;
            });

            // Check if supplier was awarded
            const wasAwarded =
                submittedBid && tender.awardedBidId === submittedBid.id;

            // Check if contract actually exists (more accurate than just checking awarded)
            let hasContract = false;
            if (wasAwarded && tender.id) {
                try {
                    const { getContractByTenderId } = await import(
                        "./contractService"
                    );
                    const contract = await getContractByTenderId(tender.id);
                    // Contract exists if it was generated (regardless of status)
                    hasContract = !!contract;
                } catch (error) {
                    console.warn("Error checking contract:", error);
                    // Fallback to wasAwarded if contract check fails
                    hasContract = wasAwarded;
                }
            }

            // Only process if supplier had any interaction
            if (wasInvited || submittedBid) {
                const senderId = tender.createdBy;

                if (!sendersMap.has(senderId)) {
                    // Get sender user info
                    const sender = await getDocument("users", senderId);

                    if (sender && sender.role === "sender") {
                        sendersMap.set(senderId, {
                            ...sender,
                            interactions: {
                                invitations: 0,
                                bids: 0,
                                contracts: 0,
                                lastInteraction: null,
                                contractTenderIds: [], // Store tender IDs with contracts
                            },
                        });
                    }
                }

                const senderData = sendersMap.get(senderId);
                if (senderData) {
                    if (wasInvited) {
                        senderData.interactions.invitations++;
                    }
                    if (submittedBid) {
                        senderData.interactions.bids++;
                        // Use hasContract instead of just wasAwarded
                        if (hasContract) {
                            senderData.interactions.contracts++;
                            // Store tender ID for navigation
                            if (
                                !senderData.interactions.contractTenderIds.includes(
                                    tender.id
                                )
                            ) {
                                senderData.interactions.contractTenderIds.push(
                                    tender.id
                                );
                            }
                        }
                    }

                    // Track last interaction date
                    const interactionDate =
                        submittedBid?.submittedAt ||
                        tender.invitedSuppliers?.find(
                            (inv) =>
                                inv.supplierId === supplierId ||
                                (normalizedSupplierEmail &&
                                    inv.email?.toLowerCase().trim() ===
                                        normalizedSupplierEmail)
                        )?.invitedAt ||
                        tender.createdAt;

                    if (interactionDate) {
                        const date =
                            interactionDate instanceof Date
                                ? interactionDate
                                : new Date(interactionDate);
                        if (
                            !senderData.interactions.lastInteraction ||
                            date > senderData.interactions.lastInteraction
                        ) {
                            senderData.interactions.lastInteraction = date;
                        }
                    }
                }
            }
        }

        // Convert map to array and sort by last interaction (most recent first)
        const senders = Array.from(sendersMap.values()).sort((a, b) => {
            const dateA = a.interactions.lastInteraction || new Date(0);
            const dateB = b.interactions.lastInteraction || new Date(0);
            return dateB - dateA;
        });

        return senders;
    } catch (error) {
        console.error("Error getting senders for supplier:", error);
        return [];
    }
};

/**
 * Get supplier statistics for a specific sender
 * Shows interaction history: invitations, bids, contracts
 * @param {string} supplierId - Supplier user ID
 * @param {string} senderId - Sender user ID (optional, if not provided returns stats for all senders)
 * @param {string} supplierEmail - Supplier email (optional, for fallback matching)
 * @returns {Promise<Object>} Statistics object with counts and last interaction
 */
export const getSupplierStats = async (
    supplierId,
    senderId = null,
    supplierEmail = null
) => {
    try {
        const { getAllTenders } = await import("./tenderService");
        const { getDocument } = await import("../services/firestore");

        // Get supplier user info to check companyId
        const supplierUser = await getDocument("users", supplierId);
        const supplierCompanyId = supplierUser?.companyId;
        const normalizedSupplierEmail = supplierEmail?.toLowerCase().trim();

        // Get all tenders
        const allTenders = await getAllTenders();

        // Filter by sender if provided
        const relevantTenders = senderId
            ? allTenders.filter((t) => t.createdBy === senderId)
            : allTenders;

        let invitations = 0;
        let bids = 0;
        let contracts = 0;
        let lastInteraction = null;

        // Process each tender
        for (const tender of relevantTenders) {
            // Check if supplier was invited
            const wasInvited = tender.invitedSuppliers?.some((inv) => {
                if (inv.supplierId === supplierId) return true;
                if (
                    normalizedSupplierEmail &&
                    inv.email?.toLowerCase().trim() === normalizedSupplierEmail
                )
                    return true;
                return false;
            });

            // Check if supplier submitted a bid
            const submittedBid = tender.bids?.find((bid) => {
                if (bid.supplierId === supplierId) return true;
                if (supplierCompanyId && bid.companyId === supplierCompanyId)
                    return true;
                return false;
            });

            // Check if supplier was awarded and has contract
            let hasContract = false;
            if (
                submittedBid &&
                tender.awardedBidId === submittedBid.id &&
                tender.id
            ) {
                try {
                    const { getContractByTenderId } = await import(
                        "./contractService"
                    );
                    const contract = await getContractByTenderId(tender.id);
                    hasContract = !!contract;
                } catch (error) {
                    console.warn("Error checking contract:", error);
                }
            }

            // Update counts
            if (wasInvited) {
                invitations++;
            }
            if (submittedBid) {
                bids++;
                if (hasContract) {
                    contracts++;
                }
            }

            // Track last interaction date
            const interactionDate =
                submittedBid?.submittedAt ||
                tender.invitedSuppliers?.find(
                    (inv) =>
                        inv.supplierId === supplierId ||
                        (normalizedSupplierEmail &&
                            inv.email?.toLowerCase().trim() ===
                                normalizedSupplierEmail)
                )?.invitedAt ||
                (wasInvited ? tender.createdAt : null);

            if (interactionDate) {
                const date =
                    interactionDate instanceof Date
                        ? interactionDate
                        : new Date(interactionDate);
                if (!lastInteraction || date > lastInteraction) {
                    lastInteraction = date;
                }
            }
        }

        return {
            invitations,
            bids,
            contracts,
            lastInteraction,
            hasHistory: invitations > 0 || bids > 0 || contracts > 0,
        };
    } catch (error) {
        console.error("Error getting supplier stats:", error);
        return {
            invitations: 0,
            bids: 0,
            contracts: 0,
            lastInteraction: null,
            hasHistory: false,
        };
    }
};

/**
 * Test function to check if an anskaffelse (tender) and leverandør (supplier) have a contract
 * This function is exposed to window for dev tools testing
 * @param {string} tenderId - Tender/Anskaffelse ID
 * @param {string} supplierId - Supplier/Leverandør user ID (optional, can use companyId instead)
 * @param {string} companyId - Supplier company ID (optional, alternative to supplierId)
 * @returns {Promise<Object>} Result object with contract information
 *
 * Usage in dev tools:
 *   await window.testContractCheck('tender-id', 'supplier-id')
 *   await window.testContractCheck('tender-id', null, 'company-id')
 */
export const testContractCheck = async (
    tenderId,
    supplierId = null,
    companyId = null
) => {
    try {
        if (!tenderId) {
            return {
                success: false,
                error: "Tender ID (anskaffelse ID) er påkrevd",
                hasContract: false,
            };
        }

        const { getContractByTenderId } = await import("./contractService");
        const { getTenderById } = await import("./tenderService");
        const { getDocument } = await import("../services/firestore");

        // Get the tender
        const tender = await getTenderById(tenderId);
        if (!tender) {
            return {
                success: false,
                error: `Anskaffelse med ID "${tenderId}" ble ikke funnet`,
                hasContract: false,
                tenderId,
            };
        }

        // Get the contract for this tender
        const contract = await getContractByTenderId(tenderId);

        if (!contract) {
            return {
                success: true,
                hasContract: false,
                tenderId,
                tenderTitle: tender.title,
                message: "Ingen kontrakt funnet for denne anskaffelsen",
                contract: null,
            };
        }

        // If supplierId or companyId is provided, verify it matches the contract
        let supplierMatches = true;
        let supplierInfo = null;

        if (supplierId || companyId) {
            // Get supplier info if supplierId is provided
            if (supplierId) {
                supplierInfo = await getDocument("users", supplierId);
                if (supplierInfo) {
                    companyId = supplierInfo.companyId || companyId;
                }
            }

            // Check if the contract's supplier matches
            supplierMatches =
                contract.supplier?.companyId === companyId ||
                contract.supplier?.companyId === supplierId;

            if (!supplierMatches) {
                return {
                    success: true,
                    hasContract: false,
                    tenderId,
                    tenderTitle: tender.title,
                    supplierId,
                    companyId,
                    contractSupplierCompanyId: contract.supplier?.companyId,
                    contractSupplierCompanyName: contract.supplier?.companyName,
                    message:
                        "Kontrakt finnes, men leverandøren matcher ikke den spesifiserte leverandøren",
                    contract: {
                        id: contract.id,
                        status: contract.status,
                        supplier: contract.supplier,
                        customer: contract.customer,
                    },
                };
            }
        }

        return {
            success: true,
            hasContract: true,
            tenderId,
            tenderTitle: tender.title,
            supplierId,
            companyId,
            contract: {
                id: contract.id,
                status: contract.status,
                supplier: {
                    companyId: contract.supplier?.companyId,
                    companyName: contract.supplier?.companyName,
                },
                customer: {
                    companyId: contract.customer?.companyId,
                    companyName: contract.customer?.companyName,
                },
                createdAt: contract.createdAt,
                signedAt: contract.signedAt,
                version: contract.version,
            },
            message: "Kontrakt funnet og leverandør matcher",
        };
    } catch (error) {
        console.error("Error in testContractCheck:", error);
        return {
            success: false,
            error: error.message || "Feil ved sjekking av kontrakt",
            hasContract: false,
        };
    }
};

// Expose to window for dev tools (only in development)
if (typeof window !== "undefined" && import.meta.env.MODE === "development") {
    window.testContractCheck = testContractCheck;
    console.log(
        "🔧 Dev tool available: window.testContractCheck(tenderId, supplierId, companyId)"
    );
    console.log(
        "   Example: await window.testContractCheck('tender-id-123', 'supplier-id-456')"
    );
}
