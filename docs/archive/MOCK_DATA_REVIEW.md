# Mock Data & Implementation Review
**Date:** 2024  
**Reviewer:** Senior Full-Stack Engineer & Firebase/Firestore Architect  
**Purpose:** Validate mock structure, relations, UI usage, and prepare for Firestore migration

---

## Executive Summary

This review examines the mock data structure, relationships, UI integration, and Firestore readiness for the Smartplan procurement/tender management system. Overall, the structure is solid but requires several critical fixes before Firebase migration.

**Top 3 Critical Issues:**
1. **Missing syntax error** in `mockData.js` line 173 (missing comma after `tenderId`)
2. **Inconsistent field usage** - `publishDate` and `awardedBidId`/`awardedAt` exist in UI/services but not in mock structure
3. **Q&A structure mismatch** - Form creates Q&A without `askedBy`/`answeredBy` fields, but mock expects them

---

## 1. Mock Structure Validation

### `src/data/mockData.js`

#### ✅ **Strengths:**
- Clear, consistent structure across entities
- Good use of camelCase naming convention
- Realistic Norwegian domain language
- Proper date handling with `Date` objects
- Well-structured nested objects (documents, bids, Q&A)

#### ⚠️ **Issues Found:**

**Line 173 - Syntax Error:**
```javascript
qa: [
  {
    id: 'qa1',
    tenderId: 'tender1'  // ⚠️ Missing comma here
    question: 'Er det mulig å levere materialer i etapper?',
```
**Fix:** Add comma after `tenderId: 'tender1',`

**Line 246 - Trailing Comma:**
```javascript
  },
];  // ⚠️ Extra comma before closing bracket
```
**Fix:** Remove trailing comma (though this is non-breaking in modern JS)

**Missing Fields in Mock Tenders:**
- `publishDate` - Used in `TenderCreate.jsx` and `tenderService.js` but not in mock structure
- `awardedBidId` - Used in `TenderDetails.jsx` for award tracking
- `awardedAt` - Used in `TenderDetails.jsx` for award timestamp
- `price` - Optional field used in form but not consistently in mocks

**Recommendation:** Add these fields to mock tenders:
```javascript
{
  // ... existing fields
  publishDate: new Date('2024-01-21'), // Optional
  price: 2500000, // Optional estimated price
  awardedBidId: null, // Set when awarded
  awardedAt: null, // Set when awarded
}
```

#### 💡 **Suggestions:**

**1. Add `createdByUserId` for Firestore queries:**
```javascript
createdBy: 'user1',  // ✅ Good
createdByUserId: 'user1',  // 💡 Add explicit userId field for Firestore queries
createdByCompanyId: 'company1',  // 💡 Add for company-level filtering
```

**2. Add `updatedAt` timestamp:**
```javascript
updatedAt: new Date('2024-01-20'),  // 💡 Track modifications
```

**3. Document structure consistency:**
All document objects should have consistent fields:
```javascript
{
  id: 'doc1',
  name: 'Teknisk beskrivelse.pdf',
  type: 'pdf',
  size: 1024000,
  uploadedAt: new Date('2024-01-20'),
  uploadedBy: 'user1',  // 💡 Add for audit trail
  storageUrl: null,  // 💡 For Firestore Storage reference
}
```

---

### `mockProjects`

#### ✅ **Good:**
- Consistent ID format (`project1`, `project2`)
- Proper foreign key references (`ownerId`, `ownerCompanyId`)
- Status field for filtering

#### ⚠️ **Issues:**

**Missing `createdAt` in project2:**
```javascript
{
  id: 'project2',
  name: 'Renovering skole',
  description: 'Renovering av eksisterende skolebygg',
  ownerId: 'user1',
  ownerCompanyId: 'company1',
  // ⚠️ Missing createdAt
  status: 'active',
}
```

**Fix:** Add `createdAt: new Date('2024-02-01'),` (matches line 103)

#### 💡 **Suggestions:**
- Add `updatedAt` field
- Consider adding `location` or `address` for Norwegian construction projects
- Add `budget` or `estimatedCost` field

---

### `mockUsers`

#### ✅ **Good:**
- Clear role separation (`sender` vs `receiver`)
- Company association via `companyId`

#### ⚠️ **Issues:**

**Inconsistent user ID in mockUsers vs usage:**
- Mock has `id: 'supplier1'` but this is actually a user, not a supplier entity
- `supplierId` in `invitedSuppliers` references user IDs, which is correct but confusing naming

**Recommendation:** Clarify that "supplier" in this context means "supplier user" (receiver role). Consider renaming for clarity:
```javascript
// Current (confusing):
invitedSuppliers: [{ supplierId: 'supplier1', ... }]

// Better (clearer):
invitedSuppliers: [{ userId: 'supplier1', userRole: 'receiver', ... }]
```

#### 💡 **Suggestions:**
- Add `createdAt` timestamp
- Add `lastLoginAt` for analytics
- Consider adding `phone` field for Norwegian business context

---

### `mockCompanies`

#### ✅ **Good:**
- Clear type distinction (`sender` vs `receiver`)
- Trade categories for suppliers

#### ⚠️ **Issues:**

**Missing fields used in UI:**
- `email` - Referenced in `TenderCreate.jsx` line 166
- `orgNumber` - Referenced in `TenderDetails.jsx` line 619

**Current mock:**
```javascript
{
  id: 'company2',
  name: 'Leverandør AS',
  orgNumber: '987654321',  // ✅ Has this
  type: 'receiver',
  trades: ['elektro', 'vvs'],
}
```

**But `invitedSuppliers` expects:**
```javascript
{
  supplierId: 'supplier1',
  companyId: 'company2',
  companyName: 'Leverandør AS',
  orgNumber: '',  // ⚠️ Empty string in form, should come from company
  email: s.email,  // ⚠️ Referenced but not in company mock
}
```

**Fix:** Add `email` to company mock or ensure it's populated from user when creating invitation.

---

## 2. Relations & References

### ✅ **Valid Relations:**

1. **Tenders → Projects:** ✅ All `projectId` references exist (`project1`, `project2`)
2. **Tenders → Users:** ✅ All `createdBy` references exist (`user1`)
3. **Bids → Tenders:** ✅ All `tenderId` references exist (`tender1`, `tender3`)
4. **Bids → Suppliers:** ✅ All `supplierId` references exist (`supplier1`)
5. **Invited Suppliers → Companies:** ✅ All `companyId` references exist (`company2`)

### ⚠️ **Broken/Inconsistent References:**

**1. Q&A `askedBy` field:**
- Mock has `askedBy: 'supplier1'` (user ID) ✅
- But form creates Q&A without `askedBy` field (line 170-175 in `TenderCreate.jsx`)
- UI expects `askedByCompany` but form doesn't set it

**Fix in `TenderCreate.jsx`:**
```javascript
qa: questions.map((q) => ({
  id: q.id,
  tenderId: tenderData.projectId,  // ⚠️ Should be tender ID, not project ID
  question: q.question,
  answer: q.answer || "",
  askedBy: user.id,  // 💡 Add
  askedByCompany: user.companyName,  // 💡 Add
  askedAt: q.addedAt,
  answeredBy: null,  // 💡 Add
  answeredAt: null,  // 💡 Add
})),
```

**2. Bid `notes` field:**
- `BidSubmit.jsx` creates bids with `notes` field (line 141)
- Mock bids don't have `notes` field
- Should be consistent

**3. Document references:**
- Documents are embedded in tenders/bids ✅
- But no way to reference documents from Q&A (e.g., "See document X, section Y")
- Consider adding `documentId` or `sectionReference` to Q&A objects

---

## 3. UI Usage Matching

### `TenderCreate.jsx` → Mock Structure

#### ✅ **Matches:**
- `projectId`, `title`, `description`, `contractStandard`, `deadline`, `status` ✅
- `documents` array structure ✅
- `invitedSuppliers` structure ✅

#### ⚠️ **Mismatches:**

**1. Q&A Structure:**
**Form creates (line 170-175):**
```javascript
qa: questions.map((q) => ({
  id: q.id,
  question: q.question,
  answer: q.answer || "",
  askedAt: q.addedAt,
}))
```

**Mock expects (line 170-181):**
```javascript
qa: [{
  id: 'qa1',
  tenderId: 'tender1',  // ⚠️ Missing in form
  question: '...',
  askedBy: 'supplier1',  // ⚠️ Missing in form
  askedByCompany: 'Leverandør AS',  // ⚠️ Missing in form
  askedAt: new Date('2024-02-01'),
  answer: '...',
  answeredBy: 'user1',  // ⚠️ Missing in form
  answeredAt: new Date('2024-02-02'),  // ⚠️ Missing in form
}]
```

**2. Invited Suppliers:**
**Form creates (line 161-169):**
```javascript
invitedSuppliers: invitedSuppliers.map((s) => ({
  supplierId: s.id,
  companyId: s.companyId,
  companyName: s.companyName,
  orgNumber: s.orgNumber || "",
  email: s.email,
  invitedAt: s.addedAt,
  status: "invited",
}))
```

**Mock has:**
```javascript
invitedSuppliers: [{
  supplierId: 'supplier1',
  companyId: 'company2',
  companyName: 'Leverandør AS',
  invitedAt: new Date('2024-01-22'),
  status: 'invited',
  viewedAt: new Date('2024-01-23'),  // ⚠️ Missing in form (optional)
}]
```

**Note:** Form includes `orgNumber` and `email` which are good additions, but `viewedAt` is missing (optional field).

**3. Publish Date:**
- Form collects `publishDate` (line 46, 82-84)
- `tenderService.js` stores it (line 82-84)
- But mock tenders don't have this field
- UI displays it in `TenderDetails.jsx` (line 926-938)

**Fix:** Add `publishDate` to mock tenders or ensure it's optional everywhere.

---

### `TenderDetails.jsx` → Mock Structure

#### ✅ **Matches:**
- Reads `tender.title`, `tender.description`, `tender.status` ✅
- Reads `tender.documents`, `tender.bids`, `tender.qa` ✅
- Reads `tender.invitedSuppliers` ✅

#### ⚠️ **Mismatches:**

**1. Award Fields:**
**Code uses (line 117-118):**
```javascript
storedTenders[tenderIndex].awardedBidId = bidId;
storedTenders[tenderIndex].awardedAt = new Date().toISOString();
```

**Mock doesn't have these fields** - but this is fine since they're added dynamically. Should be added to mock structure for consistency.

**2. Q&A Display:**
**Code reads (line 467-536):**
- `qa.question` ✅
- `qa.askedByCompany` ✅
- `qa.answer` ✅
- `qa.answeredBy` ✅

**But form doesn't create `askedByCompany` or `answeredBy`** - this will cause display issues for newly created tenders.

---

### `BidSubmit.jsx` → Mock Structure

#### ✅ **Matches:**
- Creates bid with `id`, `tenderId`, `supplierId`, `companyId`, `companyName` ✅
- Creates bid with `submittedAt`, `price`, `priceStructure` ✅
- Creates bid with `documents` array ✅
- Creates bid with `status: "submitted"` ✅

#### ⚠️ **Mismatches:**

**1. Notes Field:**
**Form creates (line 141):**
```javascript
notes: bidData.notes.trim(),
```

**Mock bids don't have `notes` field** - but this is a good addition. Should add to mock structure.

**2. Hourly Rate & Estimated Hours:**
- Form creates these for `timepris` structure ✅
- Mock has them as `null` for `fastpris` ✅
- This is correct, but ensure mock has examples of `timepris` bids

---

## 4. Firestore Migration Preparation

### Suggested Firestore Collections Structure

#### **Top-Level Collections:**

```
/projects
  - id (doc ID)
  - name
  - description
  - ownerId
  - ownerCompanyId
  - createdAt (Timestamp)
  - updatedAt (Timestamp)
  - status

/tenders (anskaffelser)
  - id (doc ID)
  - projectId (reference to /projects)
  - title
  - description
  - contractStandard
  - createdBy (userId)
  - createdByCompanyId
  - createdAt (Timestamp)
  - updatedAt (Timestamp)
  - deadline (Timestamp)
  - publishDate (Timestamp, optional)
  - price (number, optional)
  - status
  - awardedBidId (reference, optional)
  - awardedAt (Timestamp, optional)
  - documents (subcollection or array)
  - invitedSupplierIds (array of userIds)
  - bidIds (array, references to /bids)

/bids
  - id (doc ID)
  - tenderId (reference to /tenders)
  - supplierId (userId)
  - companyId (reference to /companies)
  - companyName (denormalized for performance)
  - submittedAt (Timestamp)
  - price (number)
  - priceStructure
  - hourlyRate (number, optional)
  - estimatedHours (number, optional)
  - notes (string, optional)
  - documents (subcollection or array)
  - status
  - score (number, optional)
  - evaluatedAt (Timestamp, optional)
  - evaluatedBy (userId, optional)

/questions (Q&A)
  - id (doc ID)
  - tenderId (reference to /tenders)
  - question (string)
  - askedBy (userId)
  - askedByCompany (string, denormalized)
  - askedAt (Timestamp)
  - answer (string, optional)
  - answeredBy (userId, optional)
  - answeredAt (Timestamp, optional)
  - documentId (reference, optional) - if question relates to specific document

/companies
  - id (doc ID)
  - name
  - orgNumber
  - email (optional)
  - type ('sender' | 'receiver')
  - trades (array, for suppliers)

/users
  - id (doc ID)
  - email
  - name
  - role ('sender' | 'receiver')
  - companyId (reference to /companies)
  - companyName (denormalized)
  - isAdmin (boolean)
  - createdAt (Timestamp)
  - lastLoginAt (Timestamp, optional)

/contracts
  - id (doc ID)
  - tenderId (reference to /tenders)
  - bidId (reference to /bids)
  - projectId (reference to /projects)
  - contractStandard
  - status
  - createdAt (Timestamp)
  - signedAt (Timestamp, optional)
  - signedBy (object, optional)
  - version (number)
  - changes (subcollection)
```

#### **Subcollections (Consider):**

```
/tenders/{tenderId}/documents
  - id (doc ID)
  - name
  - type
  - size
  - storageUrl (Firestore Storage path)
  - uploadedAt (Timestamp)
  - uploadedBy (userId)

/tenders/{tenderId}/invitations
  - id (doc ID)
  - userId (reference to /users)
  - companyId (reference to /companies)
  - invitedAt (Timestamp)
  - status
  - viewedAt (Timestamp, optional)

/bids/{bidId}/documents
  - (same structure as tender documents)
```

### Normalization vs Embedding Strategy

#### **Normalize (Separate Collections):**
- ✅ **Bids** - Can have many per tender, need independent queries
- ✅ **Q&A** - Can have many per tender, need independent queries/filtering
- ✅ **Contracts** - Independent entities with their own lifecycle
- ✅ **Users** - Shared across system, need user management queries
- ✅ **Companies** - Shared across system, need company management

#### **Embed (Arrays/Subobjects):**
- ✅ **Documents** - Small arrays, rarely queried independently
- ✅ **Invited Suppliers** - Small arrays, always accessed with tender
- ⚠️ **Consider:** If documents grow large (>100 per tender), move to subcollection

### Firestore Query Considerations

**Indexes needed:**
1. `tenders` collection:
   - `projectId` + `status` (compound)
   - `createdByCompanyId` + `status`
   - `deadline` (for filtering by date)
   - `status` + `createdAt` (for sorting)

2. `bids` collection:
   - `tenderId` + `status`
   - `supplierId` + `status`
   - `tenderId` + `submittedAt` (for sorting)

3. `questions` collection:
   - `tenderId` + `askedAt`
   - `tenderId` + `answeredAt` (for unanswered questions)

### Firestore Rules Considerations

**Security Rules Structure:**
```javascript
// Users can read their own company's tenders
match /tenders/{tenderId} {
  allow read: if request.auth != null && 
    (resource.data.createdByCompanyId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.companyId
     || request.auth.uid in resource.data.invitedSupplierIds);
  
  allow create: if request.auth != null;
  allow update: if request.auth != null && 
    request.resource.data.createdByCompanyId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.companyId;
}

// Suppliers can create bids for tenders they're invited to
match /bids/{bidId} {
  allow create: if request.auth != null && 
    request.resource.data.supplierId == request.auth.uid &&
    exists(/databases/$(database)/documents/tenders/$(request.resource.data.tenderId)) &&
    request.auth.uid in get(/databases/$(database)/documents/tenders/$(request.resource.data.tenderId)).data.invitedSupplierIds;
}
```

---

## 5. Quality & Maintainability

### ✅ **Strengths:**
- Consistent camelCase naming
- English field names (good for internationalization)
- Clear domain language (Norwegian UI, English data)
- Centralized mock data file
- Helper functions for common queries

### ⚠️ **Issues:**

**1. Centralization:**
- ✅ Mock data is centralized in `src/data/mockData.js`
- ⚠️ But services (`tenderService.js`, `projectService.js`) have their own data transformation logic
- 💡 Consider creating a `mockDataService.js` that handles all mock data operations

**2. Type Consistency:**
- ⚠️ Some fields are optional but not consistently marked (e.g., `publishDate`, `price`)
- 💡 Consider using JSDoc or TypeScript for type safety

**3. Date Handling:**
- ✅ Dates are stored as `Date` objects in mocks
- ⚠️ But localStorage serialization converts to strings
- ✅ Services handle conversion back to Date objects
- 💡 Consider using Firestore Timestamps early to avoid migration issues

**4. ID Generation:**
- ✅ Consistent ID format: `tender_${Date.now()}_${random}`
- ✅ Uses timestamp + random for uniqueness
- 💡 Consider using Firestore's auto-generated IDs early (`doc.id`)

### 💡 **Recommendations:**

**1. Create Mock Data Service:**
```javascript
// src/services/mockDataService.js
export const mockDataService = {
  getTenders: (filters) => { /* ... */ },
  getTenderById: (id) => { /* ... */ },
  createTender: (data) => { /* ... */ },
  // Centralized mock operations
};
```

**2. Add Validation:**
```javascript
// src/utils/validation.js
export const validateTender = (tender) => {
  const errors = [];
  if (!tender.projectId) errors.push('projectId required');
  if (!tender.title) errors.push('title required');
  // ...
  return errors;
};
```

**3. Add Mock Data Factory:**
```javascript
// src/data/factories/tenderFactory.js
export const createMockTender = (overrides = {}) => ({
  id: `tender_${Date.now()}`,
  projectId: 'project1',
  title: 'Test Tender',
  status: 'draft',
  createdAt: new Date(),
  // ... defaults
  ...overrides,
});
```

---

## Summary

### Top 3 Issues to Fix Before Firebase:

1. **🔴 CRITICAL: Syntax Error in mockData.js**
   - Line 173: Missing comma after `tenderId: 'tender1'`
   - **Impact:** Will cause runtime error
   - **Fix:** Add comma

2. **🟡 HIGH: Q&A Structure Mismatch**
   - Form creates Q&A without `askedBy`, `askedByCompany`, `answeredBy`, `answeredAt`
   - Mock expects these fields
   - **Impact:** New Q&A entries won't display correctly in UI
   - **Fix:** Update `TenderCreate.jsx` to include all required fields

3. **🟡 HIGH: Missing Fields in Mock Structure**
   - `publishDate`, `awardedBidId`, `awardedAt` used in UI/services but not in mocks
   - `notes` field in bids used in form but not in mocks
   - **Impact:** Inconsistent data structure, potential display issues
   - **Fix:** Add these fields to mock structure (can be `null` for existing mocks)

### Suggested Firestore Collections Overview:

```
Collections (7):
├── projects
├── tenders (anskaffelser)
├── bids
├── questions (Q&A)
├── companies
├── users
└── contracts

Subcollections (3):
├── tenders/{id}/documents (if >100 docs per tender)
├── tenders/{id}/invitations (if complex invitation logic)
└── bids/{id}/documents (if >10 docs per bid)
```

### Missing Mock Types to Add:

1. **Evaluations** - Currently `score` is in bids, but no dedicated evaluation object
   - Consider: `/evaluations` collection with `bidId`, `evaluatedBy`, `criteria`, `scores`, `notes`

2. **Notifications** - Referenced in PRODUCT.md but no mock structure
   - Consider: `/notifications` collection for tender updates, bid submissions, Q&A answers

3. **Audit Log** - No tracking of who changed what and when
   - Consider: `/auditLogs` collection or embedded `changes` array in documents

4. **Document Versions** - Documents are replaced, not versioned
   - Consider: `/documentVersions` subcollection or `version` field in documents

---

## Action Items

### Immediate (Before Firebase Migration):
- [ ] Fix syntax error in `mockData.js` line 173
- [ ] Add missing fields to mock tenders (`publishDate`, `awardedBidId`, `awardedAt`)
- [ ] Fix Q&A creation in `TenderCreate.jsx` to include all required fields
- [ ] Add `notes` field to mock bid structure
- [ ] Ensure all date fields use consistent format (Date objects → Firestore Timestamps)

### Short-term (During Migration):
- [ ] Create Firestore collection structure matching recommendations
- [ ] Set up Firestore indexes for common queries
- [ ] Implement Firestore security rules
- [ ] Add data migration scripts for localStorage → Firestore

### Long-term (Post-Migration):
- [ ] Add evaluation mock type and UI
- [ ] Add notification system
- [ ] Add audit logging
- [ ] Consider document versioning

---

**Review Complete** ✅

