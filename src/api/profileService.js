/**
 * Profile Service
 * 
 * Handles user profile updates (name, email, password, company info)
 * Separated from authService.js to keep file sizes within limits
 */

import {
    updatePassword,
    updateEmail,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { updateDocument, getDocument } from '../services/firestore';

/**
 * Update user profile information (name, companyName, orgNumber, and company details)
 * @param {string} userId - User ID
 * @param {object} updates - Object with fields to update (name, companyName, orgNumber, companyInfo)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const updateProfile = async (userId, updates) => {
    try {
        const allowedFields = [
            'name', 
            'companyName', 
            'orgNumber',
            'bio',
            // Company information fields from BrREG
            'companyFormCode',
            'companyFormDescription',
            'fullAddress',
            'address',
            'postCode',
            'city',
            'country',
            'postalAddress',
            'postalPostCode',
            'postalCity',
            'postalFullAddress',
            'registrationDate',
            'registrationAuthority',
            'status',
            'underLiquidation',
            'underBankruptcy',
            'industryCodes'
        ];
        const filteredUpdates = {};
        
        // Only allow updating specific fields
        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key) && updates[key] !== undefined) {
                // For orgNumber, remove non-numeric characters and limit to 9 digits
                if (key === 'orgNumber') {
                    const cleaned = updates[key].replace(/\D/g, '').slice(0, 9);
                    filteredUpdates[key] = cleaned || null;
                } else if (key === 'industryCodes' && Array.isArray(updates[key])) {
                    // Store industry codes as array
                    filteredUpdates[key] = updates[key];
                } else if (typeof updates[key] === 'string') {
                    filteredUpdates[key] = updates[key].trim();
                } else {
                    filteredUpdates[key] = updates[key];
                }
            }
        });

        if (Object.keys(filteredUpdates).length === 0) {
            return {
                success: false,
                error: "Ingen gyldige felt å oppdatere",
            };
        }

        await updateDocument('users', userId, filteredUpdates);
        
        return {
            success: true,
        };
    } catch (error) {
        console.error('Error updating profile:', error);
        return {
            success: false,
            error: "Kunne ikke oppdatere profil",
        };
    }
};

/**
 * Update user email address
 * Requires reauthentication for security
 * @param {string} currentPassword - Current password for reauthentication
 * @param {string} newEmail - New email address
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const updateUserEmail = async (currentPassword, newEmail) => {
    try {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
            return {
                success: false,
                error: "Ingen bruker er innlogget",
            };
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            return {
                success: false,
                error: "Ugyldig e-postadresse",
            };
        }

        // Reauthenticate user
        const credential = EmailAuthProvider.credential(
            firebaseUser.email,
            currentPassword
        );
        await reauthenticateWithCredential(firebaseUser, credential);

        // Update email in Firebase Auth
        await updateEmail(firebaseUser, newEmail);

        // Update email in Firestore
        await updateDocument('users', firebaseUser.uid, { email: newEmail });

        return {
            success: true,
        };
    } catch (error) {
        console.error('Error updating email:', error);
        
        let errorMessage = "Kunne ikke oppdatere e-postadresse";
        if (error.code === 'auth/wrong-password') {
            errorMessage = "Feil passord";
        } else if (error.code === 'auth/email-already-in-use') {
            errorMessage = "E-postadressen er allerede i bruk";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Ugyldig e-postadresse";
        } else if (error.code === 'auth/requires-recent-login') {
            errorMessage = "Du må logge inn på nytt for å oppdatere e-postadressen";
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
};

/**
 * Update user password
 * Requires reauthentication for security
 * @param {string} currentPassword - Current password for reauthentication
 * @param {string} newPassword - New password
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const updateUserPassword = async (currentPassword, newPassword) => {
    try {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
            return {
                success: false,
                error: "Ingen bruker er innlogget",
            };
        }

        // Validate password length
        if (newPassword.length < 6) {
            return {
                success: false,
                error: "Passordet må være minst 6 tegn",
            };
        }

        // Reauthenticate user
        const credential = EmailAuthProvider.credential(
            firebaseUser.email,
            currentPassword
        );
        await reauthenticateWithCredential(firebaseUser, credential);

        // Update password
        await updatePassword(firebaseUser, newPassword);

        return {
            success: true,
        };
    } catch (error) {
        console.error('Error updating password:', error);
        
        let errorMessage = "Kunne ikke oppdatere passord";
        if (error.code === 'auth/wrong-password') {
            errorMessage = "Feil nåværende passord";
        } else if (error.code === 'auth/weak-password') {
            errorMessage = "Passordet er for svakt";
        } else if (error.code === 'auth/requires-recent-login') {
            errorMessage = "Du må logge inn på nytt for å oppdatere passordet";
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
};

/**
 * Get notification preferences for a user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, preferences?: object, error?: string}>}
 */
export const getNotificationPreferences = async (userId) => {
    try {
        const userDoc = await getDocument('users', userId);
        if (!userDoc) {
            return {
                success: false,
                error: "Bruker ikke funnet",
            };
        }

        // Return preferences with defaults if not set
        const preferences = userDoc.notificationPreferences || {
            emailNotifications: true,
            bidNotifications: true,
            invitationNotifications: true,
            projectNotifications: true,
            questionNotifications: true,
            contractNotifications: true,
            deadlineReminderNotifications: true,
        };

        return {
            success: true,
            preferences,
        };
    } catch (error) {
        console.error('Error getting notification preferences:', error);
        return {
            success: false,
            error: "Kunne ikke hente varselinnstillinger",
        };
    }
};

/**
 * Update notification preferences for a user
 * @param {string} userId - User ID
 * @param {object} preferences - Notification preferences object
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const updateNotificationPreferences = async (userId, preferences) => {
    try {
        const allowedFields = [
            'emailNotifications',
            'bidNotifications',
            'invitationNotifications',
            'projectNotifications',
            'questionNotifications',
            'contractNotifications',
            'deadlineReminderNotifications',
        ];
        
        const filteredPreferences = {};
        
        // Only allow updating specific preference fields
        Object.keys(preferences).forEach(key => {
            if (allowedFields.includes(key) && typeof preferences[key] === 'boolean') {
                filteredPreferences[key] = preferences[key];
            }
        });

        if (Object.keys(filteredPreferences).length === 0) {
            return {
                success: false,
                error: "Ingen gyldige innstillinger å oppdatere",
            };
        }

        // Get existing preferences to merge with new ones
        const userDoc = await getDocument('users', userId);
        const existingPreferences = userDoc?.notificationPreferences || {};
        
        // Merge existing preferences with new ones
        const mergedPreferences = {
            ...existingPreferences,
            ...filteredPreferences,
        };

        await updateDocument('users', userId, {
            notificationPreferences: mergedPreferences,
        });
        
        return {
            success: true,
        };
    } catch (error) {
        console.error('Error updating notification preferences:', error);
        return {
            success: false,
            error: "Kunne ikke oppdatere varselinnstillinger",
        };
    }
};

