# File Size Violations Report

**Date:** Generated automatically  
**Reference:** `docs/CODE_ORGANIZATION.md`  
**Status:** ❌ **Multiple Violations Found**

---

## File Size Limits (per CODE_ORGANIZATION.md)

- **Pages**: Maximum 500 lines
- **Components**: Maximum 400 lines
- **Hooks**: Maximum 200 lines
- **API Services**: Maximum 400 lines
- **Utils/Helpers**: Maximum 300 lines
- **Contexts**: Maximum 200 lines

---

## ❌ VIOLATIONS FOUND

### Pages (Maximum: 500 lines)

| File | Lines | Over Limit | Status |
|------|-------|------------|--------|
| `src/pages/Compliance.jsx` | **2192** | +1692 | 🔴 **CRITICAL** |
| `src/pages/TenderDetails.jsx` | **1838** | +1338 | 🔴 **CRITICAL** |
| `src/pages/Dashboard.jsx` | **692** | +192 | 🟡 **HIGH** |
| `src/pages/ContractView.jsx` | **653** | +153 | 🟡 **HIGH** |
| `src/pages/Tenders.jsx` | **639** | +139 | 🟡 **HIGH** |
| `src/pages/TenderCreate.jsx` | **507** | +7 | 🟢 **MINOR** |

**Total Pages Violating:** 6 out of 12 pages (50%)

### Components (Maximum: 400 lines)

| File | Lines | Over Limit | Status |
|------|-------|------------|--------|
| `src/components/features/tender/CommonTenderFields.jsx` | **479** | +79 | 🟡 **MEDIUM** |
| `src/components/features/tender/NS8407SpecificFields.jsx` | **463** | +63 | 🟡 **MEDIUM** |
| `src/components/features/tender/SupplierInvitationSection.jsx` | **460** | +60 | 🟡 **MEDIUM** |
| `src/components/features/tender/BidComparison.jsx` | **457** | +57 | 🟡 **MEDIUM** |

**Total Components Violating:** 4 out of 15 components (27%)

### Hooks (Maximum: 200 lines)

| File | Lines | Over Limit | Status |
|------|-------|------------|--------|
| `src/hooks/useSupplierInvitation.js` | **295** | +95 | 🟡 **MEDIUM** |

**Total Hooks Violating:** 1 out of 1 hooks (100%)

### API Services (Maximum: 400 lines)

| File | Lines | Over Limit | Status |
|------|-------|------------|--------|
| `src/api/tenderService.js` | **440** | +40 | 🟢 **MINOR** |

**Total API Services Violating:** 1 out of 3 services (33%)

---

## ✅ COMPLIANT FILES

### Pages (Within Limit)
- ✅ `src/pages/ProjectDetails.jsx` - 485 lines
- ✅ `src/pages/BidSubmit.jsx` - 461 lines
- ✅ `src/pages/Invitations.jsx` - 282 lines
- ✅ `src/pages/Projects.jsx` - 266 lines
- ✅ `src/pages/ProjectCreate.jsx` - 224 lines
- ✅ `src/pages/Login.jsx` - 194 lines
- ✅ `src/pages/Register.jsx` - 183 lines

### Components (Within Limit)
- ✅ `src/components/layout/Navigation.jsx` - 307 lines
- ✅ `src/components/features/tender/NS8405SpecificFields.jsx` - 305 lines
- ✅ `src/components/features/tender/TenderFormFields.jsx` - 239 lines
- ✅ `src/components/features/tender/QuestionsSection.jsx` - 197 lines
- ✅ `src/components/features/tender/DocumentUpload.jsx` - 196 lines
- ✅ `src/components/features/tender/NS8406SpecificFields.jsx` - 176 lines
- ✅ All other components

### API Services (Within Limit)
- ✅ `src/api/contractService.js` - 225 lines
- ✅ `src/api/authService.js` - 205 lines

---

## Priority Fix List

### 🔴 **CRITICAL (Must Fix Immediately)**

1. **`src/pages/Compliance.jsx` (2192 lines)**
   - **Exceeds by:** 1692 lines (338% over limit)
   - **Action:** Split into multiple components
   - **Recommended Structure:**
     ```
     src/pages/Compliance.jsx (~200 lines - orchestration)
     src/components/features/compliance/
       ├── ComplianceOverview.jsx
       ├── ThemeCompliance.jsx
       ├── TypographyCompliance.jsx
       ├── SpacingCompliance.jsx
       ├── ButtonCompliance.jsx
       └── CodeExamples.jsx
     ```

2. **`src/pages/TenderDetails.jsx` (1838 lines)**
   - **Exceeds by:** 1338 lines (268% over limit)
   - **Action:** Split into multiple components
   - **Recommended Structure:**
     ```
     src/pages/TenderDetails.jsx (~300 lines - orchestration)
     src/components/features/tender/
       ├── TenderHeader.jsx
       ├── TenderDocuments.jsx
       ├── TenderQASection.jsx (enhance existing)
       ├── TenderBidsSection.jsx
       ├── TenderSuppliersSection.jsx
       └── TenderDetailsSidebar.jsx
     ```

### 🟡 **HIGH PRIORITY (Should Fix Soon)**

3. **`src/pages/Dashboard.jsx` (692 lines)**
   - **Exceeds by:** 192 lines (38% over limit)
   - **Action:** Extract stat cards and recent items into components

4. **`src/pages/ContractView.jsx` (653 lines)**
   - **Exceeds by:** 153 lines (31% over limit)
   - **Action:** Extract contract sections into components

5. **`src/pages/Tenders.jsx` (639 lines)**
   - **Exceeds by:** 139 lines (28% over limit)
   - **Action:** Extract table and card views into separate components

### 🟢 **MEDIUM PRIORITY (Nice to Have)**

6. **`src/pages/TenderCreate.jsx` (507 lines)**
   - **Exceeds by:** 7 lines (1% over limit)
   - **Action:** Minor refactoring to get under limit

7. **Component Violations (4 files)**
   - Extract sub-sections or split into smaller components

8. **`src/hooks/useSupplierInvitation.js` (295 lines)**
   - **Exceeds by:** 95 lines (48% over limit)
   - **Action:** Extract validation logic and helper functions

9. **`src/api/tenderService.js` (440 lines)**
   - **Exceeds by:** 40 lines (10% over limit)
   - **Action:** Extract helper functions or split by feature

---

## Summary Statistics

- **Total Files Checked:** 30+ files
- **Files Violating Limits:** 12 files
- **Violation Rate:** 40%

### By Category:
- **Pages:** 6 violations (50% of pages)
- **Components:** 4 violations (27% of components)
- **Hooks:** 1 violation (100% of hooks)
- **API Services:** 1 violation (33% of services)

---

## Recommendations

1. **Immediate Action:** Refactor the 2 critical files (Compliance.jsx, TenderDetails.jsx)
2. **Short-term:** Address high-priority violations (Dashboard, ContractView, Tenders)
3. **Long-term:** Establish code review process to prevent future violations
4. **Consider:** Adding pre-commit hooks or CI checks to enforce file size limits

---

**End of File Size Violations Report**

