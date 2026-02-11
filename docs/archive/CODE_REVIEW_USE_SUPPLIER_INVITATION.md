# Code Review: `useSupplierInvitation.js`

**Review Date:** $(date)  
**Reviewer:** Senior Software Engineer  
**File:** `src/hooks/useSupplierInvitation.js`

---

## 🔴 High-Severity Issues

### 1. **Stale Closure Bug in `removeSupplier` (Line 221-228)**
⚠️ **CRITICAL BUG**

```javascript
const removeSupplier = useCallback(
    (supplierId) => {
        setInvitedSuppliers(
            invitedSuppliers.filter((s) => s.id !== supplierId)  // ❌ Uses stale closure
        );
    },
    [invitedSuppliers]
);
```

**Issue:** Uses `invitedSuppliers` directly from closure, which can be stale. If multiple removals happen quickly, this can cause race conditions.

**Fix:** Use functional update pattern:
```javascript
const removeSupplier = useCallback((supplierId) => {
    setInvitedSuppliers((prevSuppliers) =>
        prevSuppliers.filter((s) => s.id !== supplierId)
    );
}, []); // ✅ No dependencies needed
```

---

### 2. **Insecure ID Generation (Lines 141-143, 157-159, 176-178)**
🛡️ **SECURITY & RELIABILITY**

```javascript
id: `supplier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
```

**Issues:**
- `Math.random()` is not cryptographically secure
- Potential ID collisions in high-frequency scenarios
- `substr()` is deprecated (use `substring()` or `slice()`)

**Fix:** Use `crypto.randomUUID()` (browser-native) or a UUID library:
```javascript
id: crypto.randomUUID() // or `uuidv4()` from 'uuid' package
```

---

### 3. **Performance: Unnecessary Re-renders (Line 218)**
🚀 **PERFORMANCE**

```javascript
const addSupplier = useCallback(
    (mockCompanies) => {
        // ... implementation
    },
    [supplierInput, searchedCompany, invitedSuppliers] // ❌ Recreates on every supplier addition
);
```

**Issue:** `addSupplier` is recreated every time `invitedSuppliers` changes, causing unnecessary re-renders in consuming components.

**Fix:** Use functional updates and remove `invitedSuppliers` from deps:
```javascript
const addSupplier = useCallback(
    (mockCompanies) => {
        // Use functional updates for state that's read
        setInvitedSuppliers((prevSuppliers) => {
            // Check duplicates using prevSuppliers
            const isDuplicate = prevSuppliers.some(/* ... */);
            // ...
        });
    },
    [supplierInput, searchedCompany] // ✅ Only dependencies that affect logic
);
```

---

### 4. **Missing Memoization for `handleSupplierInputChange` (Line 73)**
🚀 **PERFORMANCE**

**Issue:** Function is recreated on every render, causing child components to re-render unnecessarily.

**Fix:** Wrap in `useCallback`:
```javascript
const handleSupplierInputChange = useCallback((e) => {
    // ... implementation
}, [searchedCompany, supplierValidationError]);
```

---

### 5. **Double State Update Anti-pattern (Lines 79-99)**
🚀 **PERFORMANCE**

```javascript
setSupplierInput((prev) => ({ ...prev, [name]: finalValue })); // Update 1

if (name === "orgNumber") {
    // ...
    if (finalValue.length > 0) {
        setSupplierInput((prev) => ({ ...prev, companyId: "" })); // Update 2
    }
}
```

**Issue:** Two separate state updates can cause double renders. Batch updates.

**Fix:** Combine into single update:
```javascript
setSupplierInput((prev) => {
    const updates = { [name]: finalValue };
    if (name === "orgNumber" && finalValue.length > 0) {
        updates.companyId = "";
    }
    return { ...prev, ...updates };
});
```

---

## 🟡 Medium-Severity Issues

### 6. **Error Logging in Production (Line 45)**
🛡️ **SECURITY & BEST PRACTICES**

```javascript
console.error("Search error:", err);
```

**Issue:** `console.error` exposes error details in production. Use proper error logging service.

**Fix:** Use error tracking service (e.g., Sentry, LogRocket) or at least guard:
```javascript
if (process.env.NODE_ENV === 'development') {
    console.error("Search error:", err);
}
// Log to error tracking service
```

---

### 7. **Basic Email Validation (Line 129)**
🛡️ **VALIDATION**

```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

**Issue:** Very basic regex. Doesn't catch all invalid emails (e.g., `test@.com`, `test@com`).

**Fix:** Use more robust validation or a library:
```javascript
// Better regex or use a library like 'validator' or 'yup'
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
```

---

### 8. **Missing Error Handling in `useEffect` (Line 64)**
⚠️ **RELIABILITY**

```javascript
useEffect(() => {
    // ...
    handleSearchCompany(orgNumber); // ❌ Unhandled promise
}, [/* deps */]);
```

**Issue:** `handleSearchCompany` is async but not awaited. Errors are silently swallowed.

**Fix:** Handle promise properly:
```javascript
useEffect(() => {
    // ...
    handleSearchCompany(orgNumber).catch((err) => {
        // Error already handled in handleSearchCompany, but log if needed
        console.error("Auto-search failed:", err);
    });
}, [/* deps */]);
```

---

### 9. **Potential Race Condition in Auto-Search (Lines 55-71)**
⚠️ **RELIABILITY**

**Issue:** If user types quickly, multiple searches could be triggered. The `searching` flag helps but doesn't prevent all race conditions.

**Suggestion:** Consider debouncing or using AbortController for request cancellation.

---

### 10. **Code Duplication: ID Generation (Lines 141-143, 157-159, 176-178)**
🎨 **MAINTAINABILITY**

**Issue:** Same ID generation logic repeated 3 times.

**Fix:** Extract to helper function:
```javascript
const generateSupplierId = () => crypto.randomUUID(); // or your preferred method
```

---

### 11. **Magic Numbers (Line 18, 59, 90, 193)**
🎨 **MAINTAINABILITY**

**Issue:** Hardcoded `9` for org number length appears multiple times.

**Fix:** Extract to constant:
```javascript
const ORG_NUMBER_LENGTH = 9;
```

---

## 🟢 Low-Severity / Suggestions

### 12. **Extract Duplicate Check Logic (Lines 188-194)**
🎨 **MAINTAINABILITY**

**Suggestion:** Extract duplicate check to separate function for better testability:
```javascript
const isDuplicateSupplier = (newSupplier, existingSuppliers) => {
    return existingSuppliers.some(
        (s) =>
            s.email === newSupplier.email ||
            (newSupplier.orgNumber &&
                s.orgNumber === newSupplier.orgNumber &&
                newSupplier.orgNumber.length === ORG_NUMBER_LENGTH)
    );
};
```

---

### 13. **TypeScript Migration**
💡 **FUTURE IMPROVEMENT**

**Suggestion:** Consider migrating to TypeScript for better type safety, especially for the complex state objects and function parameters.

---

### 14. **JSDoc Comments**
📝 **DOCUMENTATION**

**Suggestion:** Add JSDoc comments for exported hook and functions:
```javascript
/**
 * Custom hook for managing supplier invitations
 * @returns {Object} Hook state and handlers
 */
export const useSupplierInvitation = () => {
    // ...
}
```

---

## ✨ Positive Aspects

- ✅ **Excellent separation of concerns** - Complex logic extracted into reusable hook
- ✅ **Good use of `useCallback`** - Most functions are properly memoized
- ✅ **Comprehensive validation** - Email and required fields are validated
- ✅ **User-friendly error messages** - Clear Norwegian error messages
- ✅ **Auto-search feature** - Nice UX with automatic search on 9 digits
- ✅ **Duplicate prevention** - Checks for duplicates before adding
- ✅ **State cleanup** - Properly resets state after operations
- ✅ **Functional updates** - Uses functional updates where appropriate (line 202)
- ✅ **Input sanitization** - Strips non-numeric characters from org number

---

## 📊 Summary

### Overall Assessment
The hook is **well-structured** and demonstrates good React patterns, but has several **critical issues** that need immediate attention, particularly around state management and ID generation.

### Priority Actions

1. **🔴 CRITICAL (Fix Immediately):**
   - Fix stale closure in `removeSupplier` (use functional update)
   - Replace insecure ID generation with `crypto.randomUUID()`
   - Optimize `addSupplier` dependencies to prevent unnecessary re-renders

2. **🟡 HIGH (Fix Soon):**
   - Memoize `handleSupplierInputChange`
   - Batch state updates in `handleSupplierInputChange`
   - Improve email validation regex
   - Handle async errors in `useEffect`

3. **🟢 MEDIUM (Nice to Have):**
   - Extract duplicate code (ID generation, duplicate check)
   - Add constants for magic numbers
   - Add JSDoc documentation
   - Consider debouncing auto-search

### Code Quality Score: **7.5/10**

**Strengths:** Clean architecture, good separation of concerns, comprehensive validation  
**Weaknesses:** Performance optimizations needed, security concerns with ID generation, some state management issues

---

## 🔧 Recommended Refactored Version (Key Changes)

```javascript
import { useState, useCallback, useEffect, useRef } from "react";
import { searchCompanyByOrgNumber } from "../api/brregService";

const ORG_NUMBER_LENGTH = 9;

const generateSupplierId = () => {
    // Use crypto.randomUUID() if available, fallback for older browsers
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback (less secure but better than current)
    return `supplier_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
};

export const useSupplierInvitation = () => {
    // ... state declarations ...

    const handleSearchCompany = useCallback(async (orgNumberToSearch) => {
        if (!orgNumberToSearch || orgNumberToSearch.length !== ORG_NUMBER_LENGTH) {
            return {
                success: false,
                error: `Vennligst oppgi et gyldig organisasjonsnummer (${ORG_NUMBER_LENGTH} siffer)`,
            };
        }

        setSearching(true);
        try {
            const result = await searchCompanyByOrgNumber(orgNumberToSearch);
            // ... rest of implementation ...
        } catch (err) {
            if (process.env.NODE_ENV === 'development') {
                console.error("Search error:", err);
            }
            // Log to error tracking service
            return { success: false, error: "En feil oppstod under søk. Prøv igjen." };
        } finally {
            setSearching(false);
        }
    }, []);

    const handleSupplierInputChange = useCallback((e) => {
        const { name, value } = e.target;
        const finalValue =
            name === "orgNumber" ? value.replace(/\D/g, "").slice(0, ORG_NUMBER_LENGTH) : value;

        setSupplierInput((prev) => {
            const updates = { [name]: finalValue };
            
            if (name === "orgNumber") {
                if (finalValue.length > 0) {
                    updates.companyId = "";
                }
            } else if (name === "companyId" && value) {
                updates.orgNumber = "";
            }
            
            return { ...prev, ...updates };
        });

        // Handle side effects
        if (name === "orgNumber") {
            if (searchedCompany) setSearchedCompany(null);
            if (finalValue.length < ORG_NUMBER_LENGTH) {
                setLastSearchedOrgNumber("");
            }
        } else if (name === "companyId" && value) {
            setSearchedCompany(null);
            setLastSearchedOrgNumber("");
        }
        
        if (supplierValidationError) setSupplierValidationError("");
    }, [searchedCompany, supplierValidationError]);

    const addSupplier = useCallback(
        (mockCompanies) => {
            setSupplierValidationError("");
            
            // Validation logic...
            
            const newSupplier = {
                id: generateSupplierId(),
                // ... supplier data ...
            };

            setInvitedSuppliers((prevSuppliers) => {
                // Check duplicates using prevSuppliers
                const isDuplicate = prevSuppliers.some(
                    (s) =>
                        s.email === newSupplier.email ||
                        (newSupplier.orgNumber &&
                            s.orgNumber === newSupplier.orgNumber &&
                            newSupplier.orgNumber.length === ORG_NUMBER_LENGTH)
                );

                if (isDuplicate) {
                    setSupplierValidationError("Denne leverandøren er allerede lagt til");
                    return prevSuppliers; // Don't add
                }

                return [...prevSuppliers, newSupplier];
            });

            // Reset form...
            return { success: true };
        },
        [supplierInput, searchedCompany] // ✅ Removed invitedSuppliers
    );

    const removeSupplier = useCallback((supplierId) => {
        setInvitedSuppliers((prevSuppliers) =>
            prevSuppliers.filter((s) => s.id !== supplierId)
        );
    }, []); // ✅ No dependencies needed

    // ... rest of implementation ...
};
```

---

**End of Review**

