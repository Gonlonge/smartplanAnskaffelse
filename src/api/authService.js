/**
 * Firebase Authentication Service
 *
 * Handles user authentication using Firebase Auth
 * User profile data is stored in Firestore 'users' collection
 */

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendEmailVerification,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { getDocument, createDocumentWithId } from "../services/firestore";

// Build action settings for email verification links
const getVerificationSettings = () => {
    const baseUrl =
        import.meta.env.VITE_APP_URL ||
        (typeof window !== "undefined" ? window.location.origin : "");
    return {
        url: `${baseUrl}/login`,
        handleCodeInApp: false,
    };
};

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const login = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );
        const firebaseUser = userCredential.user;

        if (!firebaseUser.emailVerified) {
            let verificationEmailSent = false;
            try {
                await sendEmailVerification(
                    firebaseUser,
                    getVerificationSettings()
                );
                verificationEmailSent = true;
            } catch (verificationError) {
                console.error(
                    "Failed to send verification email on login:",
                    verificationError
                );
            }

            await signOut(auth);

            return {
                success: false,
                requiresEmailVerification: true,
                verificationEmailSent,
                error: verificationEmailSent
                    ? "E-posten din er ikke bekreftet. Vi har sendt en ny bekreftelseslenke."
                    : "E-posten din er ikke bekreftet. Få tilsendt en ny lenke og bekreft før du logger inn.",
            };
        }

        // Get user profile from Firestore
        const userProfile = await getUserProfile(firebaseUser.uid);

        if (!userProfile) {
            // User exists in Auth but not in Firestore - create profile
            // This shouldn't happen in normal flow, but handle it gracefully
            return {
                success: false,
                error: "Brukerprofil ikke funnet. Kontakt administrator.",
            };
        }

        // Return user data including all company information fields
        const userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: userProfile.name,
            role: userProfile.role,
            companyId: userProfile.companyId,
            companyName: userProfile.companyName,
            isAdmin: userProfile.isAdmin || false,
            // Include all company information fields
            orgNumber: userProfile.orgNumber || null,
            companyFormCode: userProfile.companyFormCode || null,
            companyFormDescription: userProfile.companyFormDescription || null,
            fullAddress: userProfile.fullAddress || null,
            address: userProfile.address || null,
            postCode: userProfile.postCode || null,
            city: userProfile.city || null,
            country: userProfile.country || null,
            postalAddress: userProfile.postalAddress || null,
            postalPostCode: userProfile.postalPostCode || null,
            postalCity: userProfile.postalCity || null,
            postalFullAddress: userProfile.postalFullAddress || null,
            registrationDate: userProfile.registrationDate || null,
            registrationAuthority: userProfile.registrationAuthority || null,
            status: userProfile.status || null,
            underLiquidation: userProfile.underLiquidation || false,
            underBankruptcy: userProfile.underBankruptcy || false,
            industryCodes: userProfile.industryCodes || [],
        };

        return {
            success: true,
            user: userData,
        };
    } catch (error) {
        console.error("Login error:", error);

        let errorMessage = "Ugyldig e-post eller passord";
        if (error.code === "auth/user-not-found") {
            errorMessage = "Ingen bruker funnet med denne e-postadressen";
        } else if (error.code === "auth/wrong-password") {
            errorMessage = "Feil passord";
        } else if (error.code === "auth/invalid-email") {
            errorMessage = "Ugyldig e-postadresse";
        } else if (error.code === "auth/too-many-requests") {
            errorMessage = "For mange forsøk. Prøv igjen senere.";
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
};

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User name
 * @param {string} userType - User type ('admin', 'supplier', or 'user')
 * @param {string} role - User role ('sender' or 'receiver') - deprecated, use userType instead
 * @param {string} companyId - Company ID (optional)
 * @param {string} companyName - Company name (optional)
 * @param {string} orgNumber - Organization number (optional, 9 digits)
 * @param {object} companyData - Full company data from BrREG (optional)
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const register = async (
    email,
    password,
    name,
    userType = "user",
    role = null,
    companyId = null,
    companyName = null,
    orgNumber = null,
    companyData = null
) => {
    try {
        // Validate input
        if (!email || !password || !name) {
            return {
                success: false,
                error: "Alle felt må fylles ut",
            };
        }

        // Validate userType - support both new and legacy values
        const validUserTypes = [
            "admin_anskaffelse",
            "admin_leverandor",
            "anskaffelse",
            "leverandor",
            // Legacy values for backward compatibility
            "admin",
            "supplier",
            "user",
        ];

        if (!userType || !validUserTypes.includes(userType)) {
            return {
                success: false,
                error: "Ugyldig brukertype",
            };
        }

        if (password.length < 6) {
            return {
                success: false,
                error: "Passordet må være minst 6 tegn",
            };
        }

        // Map userType to role and isAdmin
        let mappedRole = "sender";
        let isAdmin = false;

        if (userType === "admin_anskaffelse" || userType === "admin") {
            // Admin anskaffelse: sender role with admin privileges
            mappedRole = "sender";
            isAdmin = true;
        } else if (userType === "admin_leverandor") {
            // Admin leverandør: receiver role with admin privileges
            mappedRole = "receiver";
            isAdmin = true;
        } else if (userType === "anskaffelse" || userType === "user") {
            // Anskaffelse (bruker): sender role without admin privileges
            mappedRole = "sender";
            isAdmin = false;
        } else if (userType === "leverandor" || userType === "supplier") {
            // Leverandør: receiver role without admin privileges
            mappedRole = "receiver";
            isAdmin = false;
        }

        // Use provided role if given (for backward compatibility)
        if (role) {
            mappedRole = role;
        }

        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        const firebaseUser = userCredential.user;

        // Create user profile in Firestore with UID as document ID
        // Use provided companyId, or default to user's UID as their own company
        const userProfile = {
            email: firebaseUser.email,
            name: name.trim(),
            role: mappedRole,
            companyId: companyId || firebaseUser.uid,
            companyName: companyName || name.trim(),
            isAdmin: isAdmin,
            createdAt: new Date(),
            emailVerified: firebaseUser.emailVerified || false,
        };

        // Add orgNumber if provided
        if (orgNumber && orgNumber.trim()) {
            userProfile.orgNumber = orgNumber.trim();
        }

        // Add all company information from BrREG if companyData is provided
        if (companyData) {
            userProfile.companyFormCode = companyData.companyFormCode || null;
            userProfile.companyFormDescription =
                companyData.companyFormDescription || null;
            userProfile.fullAddress = companyData.fullAddress || null;
            userProfile.address = companyData.address || null;
            userProfile.postCode = companyData.postCode || null;
            userProfile.city = companyData.city || null;
            userProfile.country = companyData.country || null;
            userProfile.postalAddress = companyData.postalAddress || null;
            userProfile.postalPostCode = companyData.postalPostCode || null;
            userProfile.postalCity = companyData.postalCity || null;
            userProfile.postalFullAddress =
                companyData.postalFullAddress || null;
            userProfile.registrationDate = companyData.registrationDate || null;
            userProfile.registrationAuthority =
                companyData.registrationAuthority || null;
            userProfile.status = companyData.status || null;
            userProfile.underLiquidation =
                companyData.underLiquidation || false;
            userProfile.underBankruptcy = companyData.underBankruptcy || false;
            userProfile.industryCodes = companyData.industryCodes || [];

            // Update companyName if companyData has a name
            if (companyData.name && companyData.name.trim()) {
                userProfile.companyName = companyData.name.trim();
            }
        }

        await createDocumentWithId("users", firebaseUser.uid, userProfile);

        let verificationEmailSent = false;
        try {
            await sendEmailVerification(
                firebaseUser,
                getVerificationSettings()
            );
            verificationEmailSent = true;
        } catch (verificationError) {
            console.error(
                "Error sending verification email:",
                verificationError
            );
        }

        // Sign out to enforce verification before using the app
        await signOut(auth);

        // Return user data
        const userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: userProfile.name,
            role: userProfile.role,
            companyId: userProfile.companyId,
            companyName: userProfile.companyName,
            isAdmin: userProfile.isAdmin,
        };

        return {
            success: true,
            requiresEmailVerification: true,
            verificationEmailSent,
            user: userData,
        };
    } catch (error) {
        console.error("Registration error:", error);

        let errorMessage = "Kunne ikke opprette bruker";
        if (error.code === "auth/email-already-in-use") {
            errorMessage =
                "En bruker med denne e-postadressen eksisterer allerede";
        } else if (error.code === "auth/invalid-email") {
            errorMessage = "Ugyldig e-postadresse";
        } else if (error.code === "auth/weak-password") {
            errorMessage = "Passordet er for svakt";
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
};

/**
 * Logout current user
 * @returns {Promise<{success: boolean}>}
 */
export const logout = async () => {
    try {
        await signOut(auth);
        return {
            success: true,
        };
    } catch (error) {
        console.error("Logout error:", error);
        return {
            success: false,
            error: "Kunne ikke logge ut",
        };
    }
};

/**
 * Get user profile from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<object|null>}
 */
export const getUserProfile = async (userId) => {
    try {
        const userProfile = await getDocument("users", userId);
        return userProfile;
    } catch (error) {
        console.error("Error getting user profile:", error);
        return null;
    }
};

/**
 * Get current authenticated user
 * Returns user profile from Firestore combined with auth data
 * @returns {Promise<object|null>}
 */
export const getCurrentUser = async () => {
    try {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
            return null;
        }

        // Require verified email before returning user
        if (!firebaseUser.emailVerified) {
            return null;
        }

        const userProfile = await getUserProfile(firebaseUser.uid);
        if (!userProfile) {
            return null;
        }

        // Return all user profile fields, including company information
        return {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: userProfile.name,
            role: userProfile.role,
            companyId: userProfile.companyId,
            companyName: userProfile.companyName,
            isAdmin: userProfile.isAdmin || false,
            // Include all company information fields
            orgNumber: userProfile.orgNumber || null,
            bio: userProfile.bio || null,
            companyFormCode: userProfile.companyFormCode || null,
            companyFormDescription: userProfile.companyFormDescription || null,
            fullAddress: userProfile.fullAddress || null,
            address: userProfile.address || null,
            postCode: userProfile.postCode || null,
            city: userProfile.city || null,
            country: userProfile.country || null,
            postalAddress: userProfile.postalAddress || null,
            postalPostCode: userProfile.postalPostCode || null,
            postalCity: userProfile.postalCity || null,
            postalFullAddress: userProfile.postalFullAddress || null,
            registrationDate: userProfile.registrationDate || null,
            registrationAuthority: userProfile.registrationAuthority || null,
            status: userProfile.status || null,
            underLiquidation: userProfile.underLiquidation || false,
            underBankruptcy: userProfile.underBankruptcy || false,
            industryCodes: userProfile.industryCodes || [],
        };
    } catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
    return !!auth.currentUser;
};

/**
 * Check if current user is an admin
 * @returns {Promise<boolean>}
 */
export const isAdmin = async () => {
    const user = await getCurrentUser();
    return user?.isAdmin === true;
};

/**
 * Set up auth state listener
 * @param {Function} callback - Callback function(user) called when auth state changes
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            // Block unverified users from being considered authenticated
            if (!firebaseUser.emailVerified) {
                callback(null);
                return;
            }
            const userProfile = await getUserProfile(firebaseUser.uid);
            if (userProfile) {
                // Return all user profile fields, including company information
                callback({
                    id: firebaseUser.uid,
                    email: firebaseUser.email,
                    name: userProfile.name,
                    role: userProfile.role,
                    companyId: userProfile.companyId,
                    companyName: userProfile.companyName,
                    isAdmin: userProfile.isAdmin || false,
                    // Include all company information fields
                    orgNumber: userProfile.orgNumber || null,
                    bio: userProfile.bio || null,
                    companyFormCode: userProfile.companyFormCode || null,
                    companyFormDescription:
                        userProfile.companyFormDescription || null,
                    fullAddress: userProfile.fullAddress || null,
                    address: userProfile.address || null,
                    postCode: userProfile.postCode || null,
                    city: userProfile.city || null,
                    country: userProfile.country || null,
                    postalAddress: userProfile.postalAddress || null,
                    postalPostCode: userProfile.postalPostCode || null,
                    postalCity: userProfile.postalCity || null,
                    postalFullAddress: userProfile.postalFullAddress || null,
                    registrationDate: userProfile.registrationDate || null,
                    registrationAuthority:
                        userProfile.registrationAuthority || null,
                    status: userProfile.status || null,
                    underLiquidation: userProfile.underLiquidation || false,
                    underBankruptcy: userProfile.underBankruptcy || false,
                    industryCodes: userProfile.industryCodes || [],
                });
            } else {
                callback(null);
            }
        } else {
            callback(null);
        }
    });
};

/**
 * Store both admin and supplier admin users for bidirectional switching
 * @param {object} adminUser - Admin user object to store
 * @param {object} supplierAdminUser - Supplier admin user object to store
 */
export const storeSwitchUsers = (adminUser, supplierAdminUser) => {
    if (typeof window !== "undefined") {
        try {
            if (adminUser) {
                localStorage.setItem(
                    "switchAdminUser",
                    JSON.stringify({
                        id: adminUser.id,
                        email: adminUser.email,
                        name: adminUser.name,
                        role: adminUser.role,
                        companyId: adminUser.companyId,
                        companyName: adminUser.companyName,
                    })
                );
            }
            if (supplierAdminUser) {
                localStorage.setItem(
                    "switchSupplierAdminUser",
                    JSON.stringify({
                        id: supplierAdminUser.id,
                        email: supplierAdminUser.email,
                        name: supplierAdminUser.name,
                        role: supplierAdminUser.role,
                        companyId: supplierAdminUser.companyId,
                        companyName: supplierAdminUser.companyName,
                    })
                );
            }
        } catch (error) {
            console.error("Error storing switch users:", error);
        }
    }
};

/**
 * Get stored admin user info
 * @returns {object|null} Admin user object or null
 */
export const getStoredAdminUser = () => {
    if (typeof window !== "undefined") {
        try {
            const stored = localStorage.getItem("switchAdminUser");
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error("Error getting stored admin user:", error);
            return null;
        }
    }
    return null;
};

/**
 * Get stored supplier admin user info
 * @returns {object|null} Supplier admin user object or null
 */
export const getStoredSupplierAdminUser = () => {
    if (typeof window !== "undefined") {
        try {
            const stored = localStorage.getItem("switchSupplierAdminUser");
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error("Error getting stored supplier admin user:", error);
            return null;
        }
    }
    return null;
};

/**
 * Clear all stored switch user info
 */
export const clearSwitchUsers = () => {
    if (typeof window !== "undefined") {
        try {
            localStorage.removeItem("switchAdminUser");
            localStorage.removeItem("switchSupplierAdminUser");
        } catch (error) {
            console.error("Error clearing switch users:", error);
        }
    }
};

/**
 * Check if currently in switch mode (has both users stored)
 * @returns {boolean}
 */
export const isInSwitchMode = () => {
    return !!(getStoredAdminUser() && getStoredSupplierAdminUser());
};

/**
 * Get the other user (opposite of current role)
 * @param {string} currentRole - Current user role ('sender' or 'receiver')
 * @returns {object|null} The other user object or null
 */
export const getOtherSwitchUser = (currentRole) => {
    if (currentRole === "sender") {
        return getStoredSupplierAdminUser();
    } else if (currentRole === "receiver") {
        return getStoredAdminUser();
    }
    return null;
};

// Legacy functions for backward compatibility
export const storeOriginalAdminUser = (user) => {
    storeSwitchUsers(user, null);
};

export const getOriginalAdminUser = () => {
    return getStoredAdminUser();
};

export const clearOriginalAdminUser = () => {
    clearSwitchUsers();
};

export const isSwitchedUser = () => {
    return isInSwitchMode();
};

/**
 * Switch to a supplier admin user
 * Stores both admin and supplier admin users for bidirectional switching
 * @param {string} supplierAdminEmail - Supplier admin email
 * @param {string} password - Supplier admin password
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const switchToSupplierAdmin = async (supplierAdminEmail, password) => {
    try {
        const currentUser = await getCurrentUser();

        // Only allow switching if current user is an admin (must have isAdmin: true)
        if (!currentUser || !currentUser.isAdmin) {
            return {
                success: false,
                error: "Kun administratorer kan bytte bruker",
            };
        }

        // Only sender admins can switch TO supplier admin
        // Receiver admins can switch back to sender admin using switchToOtherUser
        if (currentUser.role !== "sender") {
            return {
                success: false,
                error: "Kun anskaffelse administratorer kan bytte til leverandør administrator",
            };
        }

        // Login as supplier admin
        const loginResult = await login(supplierAdminEmail, password);

        if (!loginResult.success) {
            return loginResult;
        }

        // Verify the user is a receiver (supplier)
        if (loginResult.user.role !== "receiver") {
            // Logout if not a receiver
            await logout();
            return {
                success: false,
                error: "Brukeren er ikke en leverandør",
            };
        }

        // Store both users for bidirectional switching
        storeSwitchUsers(currentUser, loginResult.user);

        return {
            success: true,
        };
    } catch (error) {
        console.error("Error switching to supplier admin:", error);
        return {
            success: false,
            error: error.message || "Kunne ikke bytte bruker",
        };
    }
};

/**
 * Switch to the other user (bidirectional switching)
 * If currently admin, switches to supplier admin
 * If currently supplier admin, switches to admin
 * @param {string} password - Password for the user to switch to
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const switchToOtherUser = async (password) => {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return {
                success: false,
                error: "Ingen bruker er innlogget",
            };
        }

        // Only allow switching if current user is an admin (must have isAdmin: true)
        if (!currentUser.isAdmin) {
            return {
                success: false,
                error: "Kun administratorer kan bytte bruker",
            };
        }

        // Get the other user based on current role
        const otherUser = getOtherSwitchUser(currentUser.role);

        if (!otherUser) {
            return {
                success: false,
                error: "Ingen annen bruker funnet for bytting",
            };
        }

        // Login as the other user
        const loginResult = await login(otherUser.email, password);

        if (!loginResult.success) {
            return loginResult;
        }

        // Update stored users (keep both for bidirectional switching)
        if (currentUser.role === "sender") {
            // Currently admin, switching to supplier - store both
            storeSwitchUsers(currentUser, loginResult.user);
        } else if (currentUser.role === "receiver") {
            // Currently supplier, switching to admin - store both
            storeSwitchUsers(loginResult.user, currentUser);
        }

        return {
            success: true,
        };
    } catch (error) {
        console.error("Error switching to other user:", error);
        return {
            success: false,
            error: error.message || "Kunne ikke bytte bruker",
        };
    }
};

/**
 * Switch back to admin user (legacy function for backward compatibility)
 * @param {string} password - Admin password
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const switchBackToAdmin = async (password) => {
    return switchToOtherUser(password);
};

/**
 * Create a supplier admin user (receiver with isAdmin: true)
 * Only admins can create supplier admin users
 * @param {string} email - Supplier admin email
 * @param {string} password - Supplier admin password
 * @param {string} name - Supplier admin name/company name
 * @param {string} orgNumber - Organization number (optional)
 * @param {object} companyData - Company data from BrREG (optional)
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const createSupplierAdminUser = async (
    email,
    password,
    name,
    orgNumber = null,
    companyData = null
) => {
    try {
        // Check if current user is admin
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.isAdmin) {
            return {
                success: false,
                error: "Kun administratorer kan opprette leverandør administratorer",
            };
        }

        // Validate input
        if (!email || !password || !name) {
            return {
                success: false,
                error: "Alle felt må fylles ut",
            };
        }

        if (password.length < 6) {
            return {
                success: false,
                error: "Passordet må være minst 6 tegn",
            };
        }

        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        const firebaseUser = userCredential.user;

        // Create user profile in Firestore with role: receiver and isAdmin: true
        const userProfile = {
            email: firebaseUser.email,
            name: name.trim(),
            role: "receiver", // Supplier role
            companyId: firebaseUser.uid, // Default to user's UID as their own company
            companyName: name.trim(),
            isAdmin: true, // Admin flag
            createdAt: new Date(),
        };

        // Add orgNumber if provided
        if (orgNumber && orgNumber.trim()) {
            userProfile.orgNumber = orgNumber.trim();
        }

        // Add all company information from BrREG if companyData is provided
        if (companyData) {
            userProfile.companyFormCode = companyData.companyFormCode || null;
            userProfile.companyFormDescription =
                companyData.companyFormDescription || null;
            userProfile.fullAddress = companyData.fullAddress || null;
            userProfile.address = companyData.address || null;
            userProfile.postCode = companyData.postCode || null;
            userProfile.city = companyData.city || null;
            userProfile.country = companyData.country || null;
            userProfile.postalAddress = companyData.postalAddress || null;
            userProfile.postalPostCode = companyData.postalPostCode || null;
            userProfile.postalCity = companyData.postalCity || null;
            userProfile.postalFullAddress =
                companyData.postalFullAddress || null;
            userProfile.registrationDate = companyData.registrationDate || null;
            userProfile.registrationAuthority =
                companyData.registrationAuthority || null;
            userProfile.status = companyData.status || null;
            userProfile.underLiquidation =
                companyData.underLiquidation || false;
            userProfile.underBankruptcy = companyData.underBankruptcy || false;
            userProfile.industryCodes = companyData.industryCodes || [];

            // Update companyName if companyData has a name
            if (companyData.name && companyData.name.trim()) {
                userProfile.companyName = companyData.name.trim();
            }
        }

        await createDocumentWithId("users", firebaseUser.uid, userProfile);

        // Return user data
        const userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: userProfile.name,
            role: userProfile.role,
            companyId: userProfile.companyId,
            companyName: userProfile.companyName,
            isAdmin: userProfile.isAdmin,
        };

        return {
            success: true,
            user: userData,
        };
    } catch (error) {
        console.error("Error creating supplier admin user:", error);

        let errorMessage = "Kunne ikke opprette leverandør administrator";
        if (error.code === "auth/email-already-in-use") {
            errorMessage =
                "En bruker med denne e-postadressen eksisterer allerede";
        } else if (error.code === "auth/invalid-email") {
            errorMessage = "Ugyldig e-postadresse";
        } else if (error.code === "auth/weak-password") {
            errorMessage = "Passordet er for svakt";
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
};

/**
 * Update admin user email (admin only)
 * @param {string} userId - User ID to update
 * @param {string} newEmail - New email address
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const updateAdminUserEmail = async (userId, newEmail) => {
    try {
        // Check if current user is admin
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.isAdmin) {
            return {
                success: false,
                error: "Kun administratorer kan oppdatere brukere",
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

        // Update email in Firestore
        const { updateDocument } = await import("../services/firestore");
        await updateDocument("users", userId, { email: newEmail.trim() });

        return {
            success: true,
        };
    } catch (error) {
        console.error("Error updating admin user email:", error);
        return {
            success: false,
            error: error.message || "Kunne ikke oppdatere e-postadresse",
        };
    }
};

/**
 * Create admin user (sender or receiver with isAdmin: true)
 * Only admins can create admin users
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @param {string} name - Admin name/company name
 * @param {string} role - Role ('sender' or 'receiver')
 * @param {string} orgNumber - Organization number (optional)
 * @param {object} companyData - Company data from BrREG (optional)
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const createAdminUser = async (
    email,
    password,
    name,
    role = "sender",
    orgNumber = null,
    companyData = null
) => {
    try {
        // Check if current user is admin
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.isAdmin) {
            return {
                success: false,
                error: "Kun administratorer kan opprette administratorer",
            };
        }

        // Validate input
        if (!email || !password || !name) {
            return {
                success: false,
                error: "Alle felt må fylles ut",
            };
        }

        if (!["sender", "receiver"].includes(role)) {
            return {
                success: false,
                error: "Ugyldig rolle. Må være 'sender' eller 'receiver'",
            };
        }

        if (password.length < 6) {
            return {
                success: false,
                error: "Passordet må være minst 6 tegn",
            };
        }

        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        const firebaseUser = userCredential.user;

        // Create user profile in Firestore with isAdmin: true
        const userProfile = {
            email: firebaseUser.email,
            name: name.trim(),
            role: role,
            companyId: firebaseUser.uid,
            companyName: name.trim(),
            isAdmin: true,
            createdAt: new Date(),
        };

        // Add orgNumber if provided
        if (orgNumber && orgNumber.trim()) {
            userProfile.orgNumber = orgNumber.trim();
        }

        // Add all company information from BrREG if companyData is provided
        if (companyData) {
            userProfile.companyFormCode = companyData.companyFormCode || null;
            userProfile.companyFormDescription =
                companyData.companyFormDescription || null;
            userProfile.fullAddress = companyData.fullAddress || null;
            userProfile.address = companyData.address || null;
            userProfile.postCode = companyData.postCode || null;
            userProfile.city = companyData.city || null;
            userProfile.country = companyData.country || null;
            userProfile.postalAddress = companyData.postalAddress || null;
            userProfile.postalPostCode = companyData.postalPostCode || null;
            userProfile.postalCity = companyData.postalCity || null;
            userProfile.postalFullAddress =
                companyData.postalFullAddress || null;
            userProfile.registrationDate = companyData.registrationDate || null;
            userProfile.registrationAuthority =
                companyData.registrationAuthority || null;
            userProfile.status = companyData.status || null;
            userProfile.underLiquidation =
                companyData.underLiquidation || false;
            userProfile.underBankruptcy = companyData.underBankruptcy || false;
            userProfile.industryCodes = companyData.industryCodes || [];

            if (companyData.name && companyData.name.trim()) {
                userProfile.companyName = companyData.name.trim();
            }
        }

        await createDocumentWithId("users", firebaseUser.uid, userProfile);

        // Return user data
        const userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: userProfile.name,
            role: userProfile.role,
            companyId: userProfile.companyId,
            companyName: userProfile.companyName,
            isAdmin: userProfile.isAdmin,
        };

        return {
            success: true,
            user: userData,
        };
    } catch (error) {
        console.error("Error creating admin user:", error);

        let errorMessage = "Kunne ikke opprette administrator";
        if (error.code === "auth/email-already-in-use") {
            errorMessage =
                "En bruker med denne e-postadressen eksisterer allerede";
        } else if (error.code === "auth/invalid-email") {
            errorMessage = "Ugyldig e-postadresse";
        } else if (error.code === "auth/weak-password") {
            errorMessage = "Passordet er for svakt";
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
};
