/**
 * Award Letter Service
 * 
 * Handles award letter generation and standstill period management
 * - Generates award letters
 * - Manages standstill period (10 days default)
 * - Sends award/rejection emails
 */

import { STANDSTILL_PERIOD_DAYS } from '../constants';
import { sendAwardLetterEmail, sendBidRejectionEmail } from './emailService';
import { getDocument } from '../services/firestore';

/**
 * Calculate standstill period end date
 * @param {Date} awardDate - Date when tender was awarded
 * @param {number} days - Number of days for standstill period (default: STANDSTILL_PERIOD_DAYS)
 * @returns {Date} Standstill period end date
 */
export const calculateStandstillEndDate = (awardDate, days = STANDSTILL_PERIOD_DAYS) => {
    const endDate = new Date(awardDate);
    endDate.setDate(endDate.getDate() + days);
    // Set to end of day (23:59:59)
    endDate.setHours(23, 59, 59, 999);
    return endDate;
};

/**
 * Check if standstill period has ended
 * @param {Date} standstillEndDate - Standstill period end date
 * @returns {boolean} True if standstill period has ended
 */
export const isStandstillPeriodEnded = (standstillEndDate) => {
    if (!standstillEndDate) return true; // If no standstill date, assume ended
    const now = new Date();
    const endDate = standstillEndDate instanceof Date 
        ? standstillEndDate 
        : new Date(standstillEndDate);
    return now >= endDate;
};

/**
 * Get remaining days in standstill period
 * @param {Date} standstillEndDate - Standstill period end date
 * @returns {number|null} Remaining days, or null if period has ended
 */
export const getRemainingStandstillDays = (standstillEndDate) => {
    if (!standstillEndDate) return null;
    
    const now = new Date();
    const endDate = standstillEndDate instanceof Date 
        ? standstillEndDate 
        : new Date(standstillEndDate);
    
    if (now >= endDate) return 0;
    
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

/**
 * Generate award letter data
 * @param {Object} tender - Tender object
 * @param {Object} bid - Awarded bid object
 * @param {Object} project - Project object
 * @param {Date} awardDate - Date when tender was awarded
 * @returns {Object} Award letter data
 */
export const generateAwardLetter = (tender, bid, project, awardDate) => {
    const standstillEndDate = calculateStandstillEndDate(awardDate);
    
    return {
        tenderId: tender.id,
        bidId: bid.id,
        projectId: project?.id,
        awardedTo: {
            companyId: bid.companyId,
            companyName: bid.companyName,
            supplierId: bid.supplierId,
        },
        awardedAt: awardDate,
        standstillStartDate: awardDate,
        standstillEndDate: standstillEndDate,
        standstillPeriodDays: STANDSTILL_PERIOD_DAYS,
        contractStandard: tender.contractStandard,
        price: bid.price,
        priceStructure: bid.priceStructure,
        status: 'standstill', // 'standstill' | 'ready_for_signing' | 'signed'
        generatedAt: new Date(),
    };
};

/**
 * Send award letter email to awarded supplier
 * @param {Object} tender - Tender object
 * @param {Object} bid - Awarded bid object
 * @param {Object} project - Project object
 * @param {Date} standstillEndDate - Standstill period end date
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendAwardLetter = async (tender, bid, project, standstillEndDate) => {
    if (!bid.supplierId) {
        return {
            success: false,
            error: 'Supplier ID is required for award letter',
        };
    }

    try {
        // Get supplier email from invitation or user profile
        const supplierEmail = await getSupplierEmail(tender, bid);
        
        if (!supplierEmail) {
            console.warn('Could not find supplier email for award letter');
            return {
                success: false,
                error: 'Supplier email not found',
            };
        }

        return await sendAwardLetterEmail(
            supplierEmail,
            tender,
            bid,
            project,
            standstillEndDate
        );
    } catch (error) {
        console.error('Error sending award letter:', error);
        return {
            success: false,
            error: error.message || 'Failed to send award letter',
        };
    }
};

/**
 * Send rejection emails to non-awarded suppliers
 * @param {Object} tender - Tender object
 * @param {Object} awardedBid - Awarded bid object
 * @returns {Promise<{success: number, failed: number, errors: Array}>}
 */
export const sendRejectionEmails = async (tender, awardedBid) => {
    const bids = tender.bids || [];
    const nonAwardedBids = bids.filter(bid => bid.id !== awardedBid.id);
    
    let successCount = 0;
    let failedCount = 0;
    const errors = [];

    for (const bid of nonAwardedBids) {
        try {
            const supplierEmail = await getSupplierEmail(tender, bid);
            
            if (!supplierEmail) {
                console.warn(`Could not find email for bid ${bid.id}`);
                failedCount++;
                errors.push({
                    bidId: bid.id,
                    error: 'Supplier email not found',
                });
                continue;
            }

            const result = await sendBidRejectionEmail(
                supplierEmail,
                tender,
                bid,
                awardedBid.companyName
            );

            if (result.success) {
                successCount++;
            } else {
                failedCount++;
                errors.push({
                    bidId: bid.id,
                    error: result.error || 'Failed to send rejection email',
                });
            }
        } catch (error) {
            console.error(`Error sending rejection email for bid ${bid.id}:`, error);
            failedCount++;
            errors.push({
                bidId: bid.id,
                error: error.message || 'Failed to send rejection email',
            });
        }
    }

    return {
        success: successCount,
        failed: failedCount,
        errors,
    };
};

/**
 * Get supplier email from invitation or user profile
 * @param {Object} tender - Tender object
 * @param {Object} bid - Bid object
 * @returns {Promise<string|null>} Supplier email or null
 */
const getSupplierEmail = async (tender, bid) => {
    try {
        // First, try to get email from invitation
        const invitation = tender.invitedSuppliers?.find(
            inv => inv.supplierId === bid.supplierId || 
                   inv.companyId === bid.companyId ||
                   inv.email
        );
        
        if (invitation?.email) {
            return invitation.email;
        }

        // If no email in invitation, try to get from user profile
        if (bid.supplierId) {
            const user = await getDocument('users', bid.supplierId);
            if (user?.email) {
                return user.email;
            }
        }

        return null;
    } catch (error) {
        console.error('Error getting supplier email:', error);
        return null;
    }
};

