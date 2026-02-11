# QA & Consistency Audit Report
**Date:** 2024  
**Auditor:** Senior QA & Consistency Auditor  
**System:** Smartplan Procurement Platform

---

## Executive Summary

This audit identified **6 critical issues** and **3 minor issues** across role correctness, access control, security, and consistency. The most critical issues involve data exposure to unauthorized roles and missing access controls.

---

## 1. Role Correctness

### ✅ **CORRECT Implementations**

1. **Dashboard.jsx** - Correctly shows different content for sender vs receiver roles
2. **TenderDetails.jsx** - BidComparison component correctly restricted to sender/admin only (line 773)
3. **TenderDetails.jsx** - Invited suppliers list correctly restricted to sender/admin (line 483)
4. **TenderDetails.jsx** - Supplier invitation status section correctly shown only to invited suppliers (line 651)
5. **Tenders.jsx** - Correctly filters tenders by role (sender sees all, receiver sees only invited)
6. **Navigation.jsx** - Role-based navigation items correctly implemented

### ❌ **ISSUES FOUND**

#### **CRITICAL: TenderDetails.jsx - Bid Count Visible to Suppliers**
- **Location:** `src/pages/TenderDetails.jsx`, Line 862
- **Issue:** Shows "Antall tilbud" (number of bids) to ALL users, including suppliers
- **Problem:** Suppliers should NOT see how many bids were submitted by competitors
- **Impact:** Security/privacy violation - reveals competitive information
- **Fix:** Wrap this section in `{isSender && ...}` condition

```javascript
// CURRENT (WRONG):
<Box>
    <Typography variant="body2" color="text.secondary">
        Antall tilbud
    </Typography>
    <Typography variant="body1">
        {tender.bids.length}
    </Typography>
</Box>

// SHOULD BE:
{isSender && (
    <Box>
        <Typography variant="body2" color="text.secondary">
            Antall tilbud
        </Typography>
        <Typography variant="body1">
            {tender.bids.length}
        </Typography>
    </Box>
)}
```

---

## 2. Access & Permissions

### ✅ **CORRECT Implementations**

1. **ProtectedRoute.jsx** - Correctly implements role-based route protection
2. **App.jsx** - Routes correctly protected with `requireRole` where needed:
   - `/tenders/create` - requires "sender"
   - `/projects/*` - requires "sender"
   - `/invitations` - requires "receiver"
3. **BidSubmit.jsx** - Correctly checks if user is invited before allowing bid submission

### ❌ **ISSUES FOUND**

#### **CRITICAL: TenderDetails Route Has No Access Control**
- **Location:** `src/App.jsx`, Line 79-84
- **Issue:** Route `/tenders/:id` has NO role requirement or access check
- **Problem:** Any authenticated user (including suppliers) can access ANY tender by ID if they know it
- **Impact:** Security risk - suppliers can view tenders they weren't invited to
- **Fix:** Add access check in TenderDetails component OR add route-level protection

**Recommended Fix Option 1 (Component-level):**
```javascript
// In TenderDetails.jsx, add after loading check:
if (!tender) {
    return <NotFound />;
}

// Check access
const isSender = user?.role === "sender";
const isInvited = tender?.invitedSuppliers?.some(
    (inv) => inv.supplierId === user?.id || inv.email === user?.email
);

if (!isSender && !isInvited) {
    return (
        <Box>
            <Typography variant="h5" color="error">
                Ingen tilgang
            </Typography>
            <Typography variant="body2">
                Du har ikke tilgang til dette Anskaffelsen.
            </Typography>
            <Button onClick={() => navigate("/dashboard")}>
                Tilbake til dashboard
            </Button>
        </Box>
    );
}
```

**Recommended Fix Option 2 (Route-level):**
- Keep route open but add explicit access check in component (as above)

#### **MINOR: ContractView - No Access Control**
- **Location:** `src/App.jsx`, Line 95-100
- **Issue:** Route `/tenders/:id/contract` has no role requirement
- **Problem:** Any user can access contract if they know the tender ID
- **Impact:** Medium - contracts should only be visible to sender and awarded supplier
- **Fix:** Add access check in ContractView component (similar to TenderDetails)

---

## 3. Flow Logic

### ✅ **CORRECT Implementations**

1. **TenderCreate.jsx** - Flow from create → save draft → publish is logical
2. **BidSubmit.jsx** - Correctly checks deadline before allowing submission
3. **TenderDetails.jsx** - Award flow correctly updates bid statuses

### ❌ **ISSUES FOUND**

#### **MINOR: Navigation - Broken Link**
- **Location:** `src/components/layout/Navigation.jsx`, Line 62
- **Issue:** "Mine tilbud" links to `/bids` which doesn't exist in routes
- **Problem:** Clicking this link will result in 404 or redirect to dashboard
- **Impact:** User experience - broken navigation
- **Fix:** Either:
  1. Remove this navigation item if feature not implemented
  2. Create the `/bids` route and page
  3. Change link to `/invitations` if that's the intended destination

---

## 4. Wording & Terminology

### ✅ **CORRECT Implementations**

1. **Consistent terminology:**
   - Sender uses: "Anskaffelse", "Prosjekter", "Inviterte leverandører"
   - Receiver uses: "Invitasjoner", "Tilbud", "Send inn tilbud"
2. **Status terminology consistent:** "open", "closed", "awarded", "draft", "submitted", "invited", "viewed"

### ❌ **ISSUES FOUND**

#### **MINOR: Grammar Error in Error Message**
- **Location:** `src/pages/BidSubmit.jsx`, Line 66
- **Issue:** "Du er ikke invitert til dette Anskaffelsen"
- **Problem:** "Anskaffelsen" is incorrect - should be "Anskaffelse" (singular, not plural genitive)
- **Fix:** Change to: `"Du er ikke invitert til dette Anskaffelse"`

---

## 5. Consistency

### ✅ **CORRECT Implementations**

1. **Button naming:** Consistent use of "Opprett", "Se detaljer", "Send inn tilbud"
2. **Page titles:** Consistent capitalization and terminology
3. **Status chips:** Consistent across all pages

### ❌ **ISSUES FOUND**

#### **MINOR: ContractView - Duplicate Code**
- **Location:** `src/pages/ContractView.jsx`, Lines 149-151
- **Issue:** `isSupplier` check has duplicate condition:
```javascript
const isSupplier =
    contract.supplier.companyId === user?.companyId ||
    contract.supplier.companyId === user?.companyId; // DUPLICATE!
```
- **Fix:** Remove duplicate line:
```javascript
const isSupplier = contract.supplier.companyId === user?.companyId;
```

---

## 6. Security & Privacy

### ✅ **CORRECT Implementations**

1. **BidComparison.jsx** - Only shown to sender/admin (correctly protected)
2. **Invited suppliers list** - Only visible to sender/admin
3. **Bid submission** - Correctly checks invitation status

### ❌ **ISSUES FOUND**

#### **CRITICAL: Bid Count Exposure (See Section 1)**
- Suppliers can see how many bids were submitted
- This reveals competitive information

#### **CRITICAL: Tender Access by ID (See Section 2)**
- Suppliers can access any tender by guessing/knowing the ID
- No verification that supplier was actually invited

#### **MEDIUM: Contract Access (See Section 2)**
- Contracts accessible without proper access control
- Should only be visible to sender and awarded supplier

---

## Summary of Required Fixes

### **CRITICAL (Must Fix Immediately)**

1. ✅ **TenderDetails.jsx Line 862** - Hide bid count from suppliers
2. ✅ **TenderDetails.jsx** - Add access control check (verify invitation or sender role)
3. ✅ **ContractView.jsx** - Add access control check

### **MINOR (Should Fix)**

4. ✅ **BidSubmit.jsx Line 66** - Fix grammar: "Anskaffelsen" → "Anskaffelse"
5. ✅ **Navigation.jsx Line 62** - Fix or remove broken "/bids" link
6. ✅ **ContractView.jsx Lines 149-151** - Remove duplicate code

---

## Recommendations

1. **Add route-level access checks** for sensitive routes like `/tenders/:id` and `/tenders/:id/contract`
2. **Consider adding a "Mine tilbud" page** if suppliers need to see their submitted bids in one place
3. **Add unit tests** for access control logic to prevent regressions
4. **Consider adding audit logging** for sensitive actions (viewing tenders, accessing contracts)

---

## Testing Checklist

After fixes are applied, verify:

- [ ] Suppliers cannot see bid counts on tender details page
- [ ] Suppliers cannot access tenders they weren't invited to (by URL manipulation)
- [ ] Suppliers cannot access contracts for tenders they weren't awarded
- [ ] Navigation links all work correctly
- [ ] Error messages use correct grammar
- [ ] No duplicate code exists

---

**End of Audit Report**

