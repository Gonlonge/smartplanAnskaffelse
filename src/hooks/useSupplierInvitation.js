import { useState, useCallback, useEffect, useRef } from "react";
import { searchCompanyByOrgNumber } from "../api/brregService";

const ORG_NUMBER_LENGTH = 9;

/**
 * Generates a unique supplier ID using crypto.randomUUID() if available,
 * with fallback for older browsers
 */
const generateSupplierId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older browsers (less secure but better than Math.random())
    return `supplier_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
};

/**
 * Improved email validation regex
 * Validates email format including international characters (Unicode)
 * Supports Norwegian characters (ø, å, æ) and other international characters
 */
const EMAIL_REGEX =
    /^[^\s@]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const useSupplierInvitation = () => {
    const [invitedSuppliers, setInvitedSuppliers] = useState([]);
    const [supplierInput, setSupplierInput] = useState({
        companyId: "",
        email: "",
        orgNumber: "",
        manualCompanyName: "",
    });
    const [searching, setSearching] = useState(false);
    const [searchedCompany, setSearchedCompany] = useState(null);
    const [lastSearchedOrgNumber, setLastSearchedOrgNumber] = useState("");
    const [supplierValidationError, setSupplierValidationError] = useState("");

    // Ref to track current suppliers for synchronous duplicate checking
    const suppliersRef = useRef([]);

    // Keep ref in sync with state
    useEffect(() => {
        suppliersRef.current = invitedSuppliers;
    }, [invitedSuppliers]);

    const handleSearchCompany = useCallback(async (orgNumberToSearch) => {
        if (
            !orgNumberToSearch ||
            orgNumberToSearch.length !== ORG_NUMBER_LENGTH
        ) {
            return {
                success: false,
                error: `Vennligst oppgi et gyldig organisasjonsnummer (${ORG_NUMBER_LENGTH} siffer)`,
            };
        }

        setSearching(true);

        try {
            const result = await searchCompanyByOrgNumber(orgNumberToSearch);

            if (result.success && result.company) {
                setSearchedCompany(result.company);
                setSupplierInput((prev) => ({
                    ...prev,
                    companyId: result.company.id,
                }));
                return { success: true, company: result.company };
            } else {
                const errorMsg =
                    result.error ||
                    `Ingen bedrift funnet med organisasjonsnummer ${orgNumberToSearch}`;
                setSearchedCompany(null);
                return { success: false, error: errorMsg };
            }
        } catch (err) {
            // Only log errors in development mode
            // eslint-disable-next-line no-undef
            if (process.env.NODE_ENV === "development") {
                console.error("Search error:", err);
            }
            // TODO: Log to error tracking service (e.g., Sentry, LogRocket)
            const errorMsg = "En feil oppstod under søk. Prøv igjen.";
            setSearchedCompany(null);
            return { success: false, error: errorMsg };
        } finally {
            setSearching(false);
        }
    }, []);

    // Auto-search when orgNumber reaches 9 digits
    useEffect(() => {
        const orgNumber = supplierInput.orgNumber;
        if (
            orgNumber &&
            orgNumber.length === ORG_NUMBER_LENGTH &&
            !searching &&
            orgNumber !== lastSearchedOrgNumber
        ) {
            setLastSearchedOrgNumber(orgNumber);
            handleSearchCompany(orgNumber).catch((err) => {
                // Error is already handled in handleSearchCompany, but log if needed
                // eslint-disable-next-line no-undef
                if (process.env.NODE_ENV === "development") {
                    console.error("Auto-search failed:", err);
                }
            });
        }
    }, [
        supplierInput.orgNumber,
        searching,
        lastSearchedOrgNumber,
        handleSearchCompany,
    ]);

    const handleSupplierInputChange = useCallback(
        (e) => {
            const { name, value } = e.target;
            // Only allow numbers for orgNumber
            const finalValue =
                name === "orgNumber"
                    ? value.replace(/\D/g, "").slice(0, ORG_NUMBER_LENGTH)
                    : value;

            // Batch state updates to prevent double renders
            setSupplierInput((prev) => {
                const updates = { [name]: finalValue };

                // Clear companyId when orgNumber is entered
                if (name === "orgNumber" && finalValue.length > 0) {
                    updates.companyId = "";
                }
                // Clear orgNumber when companyId is selected
                if (name === "companyId" && value) {
                    updates.orgNumber = "";
                }

                return { ...prev, ...updates };
            });

            // Handle side effects that require separate state updates
            if (name === "orgNumber") {
                if (searchedCompany) {
                    setSearchedCompany(null);
                }
                // Reset last searched if user is changing the number
                if (finalValue.length < ORG_NUMBER_LENGTH) {
                    setLastSearchedOrgNumber("");
                }
            } else if (name === "companyId" && value) {
                setSearchedCompany(null);
                setLastSearchedOrgNumber("");
            }

            // Clear supplier validation error when user starts typing
            if (supplierValidationError) setSupplierValidationError("");
        },
        [searchedCompany, supplierValidationError]
    );

    const addSupplier = useCallback(
        () => {
            // Clear previous validation errors
            setSupplierValidationError("");
            let errorMsg = "";

            // Email is required
            if (!supplierInput.email || !supplierInput.email.trim()) {
                errorMsg =
                    "E-post er påkrevd for at leverandøren skal motta invitasjonen";
                setSupplierValidationError(errorMsg);
                return { success: false, error: errorMsg };
            }

            // Validate email format using improved regex
            if (!EMAIL_REGEX.test(supplierInput.email.trim())) {
                errorMsg = "Vennligst oppgi en gyldig e-postadresse";
                setSupplierValidationError(errorMsg);
                return { success: false, error: errorMsg };
            }

            let newSupplier;

            // If we have a searched company (from BRREG API), use that
            if (searchedCompany) {
                newSupplier = {
                    id: generateSupplierId(),
                    companyId: searchedCompany.id,
                    companyName: searchedCompany.name,
                    orgNumber: searchedCompany.orgNumber,
                    email: supplierInput.email.trim(),
                    addedAt: new Date(),
                };
            }
            // Manual entry (email + company name)
            else {
                if (!supplierInput.manualCompanyName?.trim()) {
                    errorMsg =
                        "Vennligst søk etter organisasjonsnummer eller oppgi bedriftsnavn manuelt";
                    setSupplierValidationError(errorMsg);
                    return { success: false, error: errorMsg };
                }
                newSupplier = {
                    id: generateSupplierId(),
                    companyId: "",
                    companyName: supplierInput.manualCompanyName.trim(),
                    orgNumber: supplierInput.orgNumber || "",
                    email: supplierInput.email.trim(),
                    addedAt: new Date(),
                };
            }

            // Check for duplicates synchronously using ref
            const isDuplicate = suppliersRef.current.some(
                (s) =>
                    s.email === newSupplier.email ||
                    (newSupplier.orgNumber &&
                        s.orgNumber === newSupplier.orgNumber &&
                        newSupplier.orgNumber.length === ORG_NUMBER_LENGTH)
            );

            if (isDuplicate) {
                const duplicateErrorMsg =
                    "Denne leverandøren er allerede lagt til";
                setSupplierValidationError(duplicateErrorMsg);
                return { success: false, error: duplicateErrorMsg };
            }

            // Use functional update to add supplier atomically
            // This prevents race conditions and removes need for invitedSuppliers in deps
            setInvitedSuppliers((prevSuppliers) => [
                ...prevSuppliers,
                newSupplier,
            ]);
            setSupplierInput({
                companyId: "",
                email: "",
                orgNumber: "",
                manualCompanyName: "",
            });
            setSearchedCompany(null);
            setLastSearchedOrgNumber("");
            setSupplierValidationError("");

            return { success: true };
        },
        [supplierInput, searchedCompany] // Removed invitedSuppliers - using functional updates instead
    );

    const removeSupplier = useCallback((supplierId) => {
        // Use functional update to avoid stale closure issues
        setInvitedSuppliers((prevSuppliers) =>
            prevSuppliers.filter((s) => s.id !== supplierId)
        );
    }, []); // No dependencies needed - using functional update

    const resetSupplierInput = useCallback(() => {
        setSupplierInput({
            companyId: "",
            email: "",
            orgNumber: "",
            manualCompanyName: "",
        });
        setSearchedCompany(null);
        setLastSearchedOrgNumber("");
        setSupplierValidationError("");
    }, []);

    /**
     * Add a supplier directly from supplier data (for quick invite)
     * @param {Object} supplierData - Supplier data object {id, companyId, companyName, orgNumber, email}
     * @returns {Object} {success: boolean, error?: string}
     */
    const addSupplierDirectly = useCallback((supplierData) => {
        // Clear previous validation errors
        setSupplierValidationError("");

        // Validate required fields
        if (!supplierData.email || !supplierData.email.trim()) {
            const errorMsg =
                "E-post er påkrevd for at leverandøren skal motta invitasjonen";
            setSupplierValidationError(errorMsg);
            return { success: false, error: errorMsg };
        }

        // Validate email format
        if (!EMAIL_REGEX.test(supplierData.email.trim())) {
            const errorMsg = "Vennligst oppgi en gyldig e-postadresse";
            setSupplierValidationError(errorMsg);
            return { success: false, error: errorMsg };
        }

        const newSupplier = {
            id: supplierData.id || generateSupplierId(),
            companyId: supplierData.companyId || "",
            companyName: supplierData.companyName || "",
            orgNumber: supplierData.orgNumber || "",
            email: supplierData.email.trim(),
            addedAt: new Date(),
        };

        // Check for duplicates
        const isDuplicate = suppliersRef.current.some(
            (s) =>
                s.email === newSupplier.email ||
                (newSupplier.orgNumber &&
                    s.orgNumber === newSupplier.orgNumber &&
                    newSupplier.orgNumber.length === ORG_NUMBER_LENGTH)
        );

        if (isDuplicate) {
            const duplicateErrorMsg = "Denne leverandøren er allerede lagt til";
            setSupplierValidationError(duplicateErrorMsg);
            return { success: false, error: duplicateErrorMsg };
        }

        // Add supplier
        setInvitedSuppliers((prevSuppliers) => [...prevSuppliers, newSupplier]);
        setSupplierValidationError("");

        return { success: true };
    }, []);

    return {
        invitedSuppliers,
        supplierInput,
        searching,
        searchedCompany,
        supplierValidationError,
        handleSupplierInputChange,
        addSupplier,
        addSupplierDirectly,
        removeSupplier,
        resetSupplierInput,
        handleSearchCompany,
    };
};
