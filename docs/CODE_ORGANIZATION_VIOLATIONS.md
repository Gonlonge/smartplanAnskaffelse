# Code Organization Violations Report

This document tracks files that violate the CODE_ORGANIZATION.md guidelines.

## Summary

- **Total Violations**: 30+ files
- **Critical Violations** (>2x limit): 12 files
- **Moderate Violations** (1.5-2x limit): 10 files
- **Minor Violations** (1-1.5x limit): 8+ files

## Critical Violations (>2x limit)

### Hooks (max 200 lines)
1. **useComplianceTests.js**: 3960 lines ❌ (19.8x limit) - **IN PROGRESS**

### Pages (max 500 lines)
2. **Compliance.jsx**: 1847 lines ❌ (3.7x limit)
3. **TenderDetails.jsx**: 1427 lines ❌ (2.9x limit)
4. **Complaints.jsx**: 1138 lines ❌ (2.3x limit)
5. **Register.jsx**: 920 lines ❌ (1.8x limit)

### Components (max 400 lines)
6. **Navigation.jsx**: 1430 lines ❌ (3.6x limit)
7. **CompanyInformationSection.jsx**: 1369 lines ❌ (3.4x limit)
8. **SupplierDetailModal.jsx**: 694 lines ❌ (1.7x limit)

### API Services (max 400 lines)
9. **authService.js**: 1075 lines ❌ (2.7x limit)
10. **tenderService.js**: 1043 lines ❌ (2.6x limit)
11. **emailService.js**: 602 lines ❌ (1.5x limit)

### Utils (max 300 lines)
12. **exportUtils.js**: 400 lines ❌ (1.3x limit)

## Moderate Violations (1.5-2x limit)

### Pages
- **Suppliers.jsx**: 706 lines ❌
- **ContractView.jsx**: 660 lines ❌
- **ProjectDetails.jsx**: 609 lines ❌
- **TenderCreate.jsx**: 591 lines ❌
- **Contacts.jsx**: 567 lines ❌
- **Login.jsx**: 532 lines ❌

### Components
- **SupplierCard.jsx**: 514 lines ❌
- **PersonalInformationSection.jsx**: 480 lines ❌
- **CommonTenderFields.jsx**: 479 lines ❌
- **NS8407SpecificFields.jsx**: 463 lines ❌
- **SupplierInvitationSection.jsx**: 460 lines ❌
- **BidComparison.jsx**: 460 lines ❌

### API Services
- **complaintService.js**: 562 lines ❌
- **userService.js**: 541 lines ❌
- **notificationService.js**: 467 lines ❌

### Hooks
- **useSupplierInvitation.js**: 338 lines ❌
- **useFirestore.js**: 248 lines ❌
- **useTendersPage.js**: 239 lines ❌

## Refactoring Plan

### Phase 1: Critical Violations (In Progress)
- [x] Create test helpers utility
- [ ] Split useComplianceTests.js into separate test modules
- [ ] Refactor main useComplianceTests hook
- [ ] Split Navigation.jsx into smaller components
- [ ] Split CompanyInformationSection.jsx
- [ ] Split Compliance.jsx page
- [ ] Split TenderDetails.jsx page

### Phase 2: API Services
- [ ] Split authService.js
- [ ] Split tenderService.js
- [ ] Split emailService.js
- [ ] Split complaintService.js
- [ ] Split userService.js

### Phase 3: Pages
- [ ] Split Complaints.jsx
- [ ] Split Register.jsx
- [ ] Split Suppliers.jsx
- [ ] Split ContractView.jsx
- [ ] Split ProjectDetails.jsx
- [ ] Split TenderCreate.jsx

### Phase 4: Components
- [ ] Split SupplierDetailModal.jsx
- [ ] Split SupplierCard.jsx
- [ ] Split PersonalInformationSection.jsx
- [ ] Split CommonTenderFields.jsx
- [ ] Split NS8407SpecificFields.jsx
- [ ] Split SupplierInvitationSection.jsx
- [ ] Split BidComparison.jsx

### Phase 5: Hooks & Utils
- [ ] Split useSupplierInvitation.js
- [ ] Split useFirestore.js
- [ ] Split useTendersPage.js
- [ ] Split exportUtils.js

## Notes

- All refactoring should maintain existing functionality
- Tests should be updated if they exist
- Documentation should be updated as needed
- Follow single responsibility principle
- Extract reusable components/hooks/utils






