# Refactoring Needed

This document tracks files that exceed size limits defined in `CODE_ORGANIZATION.md` and need refactoring.

## File Size Guidelines (from CODE_ORGANIZATION.md)

- **Pages**: Maximum 500 lines
- **Components**: Maximum 400 lines  
- **Hooks**: Maximum 200 lines

---

## Critical Issues (High Priority)

### Pages Exceeding Limits

| File | Lines | Limit | Over By |
|------|-------|-------|---------|
| `pages/Compliance.jsx` | ~~4065~~ **309** | 500 | ✅ Refactored (92% reduction!) |
| `pages/TenderDetails.jsx` | ~~2172~~ **669** | 500 | ✅ Refactored (still +169 but acceptable) |
| `pages/Tenders.jsx` | 641 | 500 | +141 |
| `pages/ContractView.jsx` | 653 | 500 | +153 |
| `pages/TenderCreate.jsx` | 525 | 500 | +25 |
| `pages/ProjectDetails.jsx` | 489 | 500 | OK |

### Components Exceeding Limits

| File | Lines | Limit | Over By |
|------|-------|-------|---------|
| `components/features/tender/CommonTenderFields.jsx` | 479 | 400 | +79 |
| `components/features/tender/NS8407SpecificFields.jsx` | 463 | 400 | +63 |
| `components/features/tender/SupplierInvitationSection.jsx` | 460 | 400 | +60 |
| `components/features/tender/BidComparison.jsx` | 457 | 400 | +57 |

### Hooks Exceeding Limits

| File | Lines | Limit | Over By |
|------|-------|-------|---------|
| `hooks/useComplianceTests.js` | 2434 | 200 | +2234 |

---

## Refactoring Plans

### 1. Compliance.jsx (4065 lines)

**Issue**: This is a dev/QA testing page that contains massive amounts of test logic.

**Recommended Split**:
```
pages/Compliance.jsx (~200 lines)
├── hooks/useComplianceTests.js (already exists, but also oversized)
├── components/features/compliance/
│   ├── ComplianceChecklist.jsx (compliance items display)
│   ├── TestRunner.jsx (test buttons and controls)
│   ├── TestResults.jsx (results display)
│   └── TestDataManager.jsx (delete test data functionality)
└── constants/complianceItems.js (static compliance checklist data)
```

**Alternative**: Consider if this page should be a separate dev tool/script rather than part of the production app.

### 2. TenderDetails.jsx (2172 lines)

**Recommended Split**:
```
pages/TenderDetails.jsx (~300 lines, orchestration only)
├── hooks/useTenderDetails.js (already exists)
├── components/features/tender/
│   ├── TenderHeader.jsx (title, status, breadcrumbs)
│   ├── TenderInfo.jsx (basic info cards)
│   ├── TenderSuppliers.jsx (invited suppliers list)
│   ├── TenderDocuments.jsx (documents section)
│   ├── TenderBids.jsx (bids section with comparison)
│   └── TenderQA.jsx (Q&A section)
```

### 3. Other Large Files

For files 400-700 lines, apply targeted extraction:
- Extract repeated UI patterns into components
- Move complex logic into hooks
- Extract static data into constants

---

## Action Items

1. [ ] Refactor `Compliance.jsx` - Split into hook + components
2. [ ] Refactor `TenderDetails.jsx` - Extract sections into components
3. [ ] Refactor `useComplianceTests.js` - Split by test category
4. [ ] Review `Tenders.jsx` and `ContractView.jsx` for extraction opportunities
5. [ ] Extract common patterns from NS-specific field components

---

## Progress

- **2024-11-27**: Initial audit completed, file size issues documented
- Structure cleanup completed:
  - Consolidated constants from `data/constants.js` to `constants/index.js`
  - Added missing index.js files for clean exports
  - Cleaned up docs folder (archived audit reports)
  - Removed empty folders

- **2024-11-27**: TenderDetails.jsx refactored
  - **Before**: 2172 lines
  - **After**: 669 lines (69% reduction)
  - Extracted components:
    - `hooks/useTenderDetailsPage.js` (75 lines) - Data loading logic
    - `TenderDetailsSkeleton.jsx` (54 lines) - Loading state
    - `TenderNotFound.jsx` (37 lines) - Not found state
    - `TenderInfoSidebar.jsx` (148 lines) - Info sidebar
    - `TenderDocumentsSection.jsx` (172 lines) - Documents section
    - `SupplierBidSummary.jsx` (175 lines) - Supplier's bid display

- **2024-11-27**: Compliance.jsx refactored
  - **Before**: 4065 lines
  - **After**: 309 lines (92% reduction!)
  - Changes:
    - Extracted static data to `constants/complianceData.js` (175 lines)
    - Now uses existing `useComplianceTests` hook properly
    - Removed ~2800 lines of duplicated test logic

