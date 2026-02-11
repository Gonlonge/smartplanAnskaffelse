# Firebase Migration Guide

This document describes the migration from mock data/localStorage to Firebase (Firestore, Auth, Storage).

## Overview

The application has been migrated from using:
- Mock data in `src/data/mockData.js`
- localStorage for persistence
- Mock authentication

To using:
- **Firebase Authentication** for user management
- **Cloud Firestore** for data storage
- **Firebase Storage** for file uploads

## Architecture

### Firebase Configuration

**File:** `src/config/firebase.js`

Contains Firebase initialization and exports:
- `auth` - Firebase Auth instance
- `db` - Firestore database instance
- `storage` - Firebase Storage instance

**Setup Required:**
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password provider)
3. Enable Firestore Database
4. Enable Storage
5. Copy your Firebase config values to environment variables:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

### Service Layer

**File:** `src/services/firestore.js`

Provides clean, reusable functions for Firestore CRUD operations:
- `getDocument(collectionName, docId)` - Get a single document
- `getCollection(collectionName, constraints)` - Get multiple documents with query constraints
- `createDocument(collectionName, data)` - Create a new document
- `updateDocument(collectionName, docId, data)` - Update a document
- `deleteDocument(collectionName, docId)` - Delete a document
- `objectToFirestore(obj)` - Convert JavaScript objects with Dates to Firestore format
- `docToObject(docSnapshot)` - Convert Firestore documents to JavaScript objects with Dates

**File:** `src/services/storage.js`

Handles file uploads and downloads:
- `uploadFile(file, path)` - Upload a file to Storage
- `deleteFile(path)` - Delete a file from Storage
- `getFileURL(path)` - Get download URL for a file

### Custom Hooks

**File:** `src/hooks/useFirestore.js`

React hooks for reactive data fetching:
- `useDocument(collectionName, docId)` - Listen to a single document (reactive)
- `useCollection(collectionName, constraints)` - Listen to a collection (reactive)
- `useDocumentOnce(collectionName, docId)` - Fetch a document once (non-reactive)
- `useCollectionOnce(collectionName, constraints)` - Fetch a collection once (non-reactive)

**Example:**
```javascript
import { useDocument } from '../hooks/useFirestore';

const MyComponent = () => {
  const { data: tender, loading, error } = useDocument('tenders', tenderId);
  
  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (!tender) return <Alert>Anskaffelse ikke funnet</Alert>;
  
  return <div>{tender.title}</div>;
};
```

### API Services

All API services have been migrated to use Firestore:

#### Authentication (`src/api/authService.js`)
- `login(email, password)` - Sign in with Firebase Auth
- `register(email, password, name, role, companyId, companyName)` - Create new user
- `logout()` - Sign out
- `getCurrentUser()` - Get current authenticated user
- `onAuthStateChange(callback)` - Listen to auth state changes

#### Projects (`src/api/projectService.js`)
- `createProject(projectData, user)` - Create a new project
- `getAllProjects(companyId, status)` - Get all projects (with optional filters)
- `getProjectById(projectId)` - Get a single project
- `getProjectsByCompany(companyId, status)` - Get projects for a company
- `updateProject(projectId, updates)` - Update a project
- `deleteProject(projectId)` - Soft delete a project (sets status to 'archived')

#### Tenders (`src/api/tenderService.js`)
- `createTender(tenderData, user)` - Create a new tender
- `getAllTenders(filters)` - Get all tenders (with optional filters)
- `getTenderById(tenderId)` - Get a single tender
- `getTendersByProject(projectId)` - Get tenders for a project
- `getInvitationsForSupplier(supplierId, supplierEmail)` - Get tenders a supplier is invited to
- `addQuestionToTender(tenderId, question, user)` - Add a Q&A question
- `answerQuestion(tenderId, questionId, answer, user)` - Answer a question
- `addDocumentsToTender(tenderId, files, user)` - Upload documents
- `removeDocumentFromTender(tenderId, documentId)` - Delete a document
- `submitBid(tenderId, bidData, user)` - Submit a bid
- `awardTender(tenderId, bidId)` - Award a tender to a bid

#### Contracts (`src/api/contractService.js`)
- `generateContract(tender, bid, project)` - Generate a contract
- `getContractById(contractId)` - Get a contract
- `getContractByTenderId(tenderId)` - Get contract for a tender
- `saveContract(contract)` - Save/update a contract
- `signContract(contractId, user)` - Sign a contract
- `addContractChange(contractId, change, user)` - Add an amendment

## Firestore Data Model

### Collections

#### `users`
User profiles (linked to Firebase Auth users)
```javascript
{
  id: string,              // Firebase Auth UID
  email: string,
  name: string,
  role: 'sender' | 'receiver',
  companyId: string,
  companyName: string,
  isAdmin: boolean,
  createdAt: Timestamp
}
```

#### `projects`
Construction projects
```javascript
{
  id: string,
  name: string,
  description: string,
  ownerId: string,         // User ID
  ownerCompanyId: string,
  createdAt: Timestamp,
  status: 'active' | 'archived'
}
```

#### `tenders`
Tender/Anskaffelse documents
```javascript
{
  id: string,
  projectId: string,
  title: string,
  description: string,
  contractStandard: 'NS 8405' | 'NS 8406' | 'NS 8407',
  createdBy: string,       // User ID
  createdAt: Timestamp,
  deadline: Timestamp,
  publishDate: Timestamp | null,
  questionDeadline: Timestamp | null,
  price: number | null,
  status: 'draft' | 'open' | 'closed' | 'awarded',
  awardedBidId: string | null,
  awardedAt: Timestamp | null,
  
  // Nested arrays
  documents: Array<{
    id: string,
    name: string,
    type: string,
    size: number,
    url: string,
    storagePath: string,
    uploadedAt: Timestamp,
    uploadedBy: string
  }>,
  
  invitedSuppliers: Array<{
    supplierId: string,
    companyId: string,
    companyName: string,
    orgNumber: string,
    email: string,
    invitedAt: Timestamp,
    status: 'invited' | 'viewed' | 'submitted',
    viewedAt: Timestamp | null
  }>,
  
  bids: Array<{
    id: string,
    tenderId: string,
    supplierId: string,
    companyId: string,
    companyName: string,
    submittedAt: Timestamp,
    price: number,
    priceStructure: 'fastpris' | 'timepris' | 'estimat',
    documents: Array<{...}>,
    status: 'submitted' | 'evaluated' | 'awarded' | 'rejected',
    score: number | null
  }>,
  
  qa: Array<{
    id: string,
    tenderId: string,
    question: string,
    askedBy: string,
    askedByCompany: string,
    askedAt: Timestamp,
    answer: string,
    answeredBy: string | null,
    answeredAt: Timestamp | null
  }>,
  
  // NS-specific fields
  ns8405: object | null,
  ns8406: object | null,
  ns8407: object | null
}
```

#### `contracts`
Contract documents
```javascript
{
  id: string,
  tenderId: string,
  bidId: string,
  projectId: string,
  contractStandard: string,
  status: 'draft' | 'pending_signature' | 'signed' | 'amended',
  createdAt: Timestamp,
  signedAt: Timestamp | null,
  signedBy: object | null,
  version: number,
  changes: Array<{...}>,
  customer: { companyId, companyName },
  supplier: { companyId, companyName },
  // ... contract terms
}
```

## Security Rules

### Firestore Rules (`firestore.rules`)

Rules enforce:
- Users can only read/write their own data
- Senders can manage projects and tenders from their company
- Receivers can only access tenders they're invited to
- Contracts are accessible to both customer and supplier

### Storage Rules (`storage.rules`)

Rules enforce:
- Authenticated users can read/write files
- Files are organized by tender/bid structure

**Note:** Deploy rules using Firebase CLI:
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## Migration Steps for Components

### Before (using mock data):
```javascript
import { mockTenders } from '../data/mockData';
import { getAllTenders } from '../api/tenderService';

const MyComponent = () => {
  const [tenders, setTenders] = useState([]);
  
  useEffect(() => {
    const tenders = getAllTenders(mockTenders);
    setTenders(tenders);
  }, []);
  
  // ...
};
```

### After (using Firestore):
```javascript
import { getAllTenders } from '../api/tenderService';

const MyComponent = () => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadTenders = async () => {
      try {
        setLoading(true);
        const data = await getAllTenders();
        setTenders(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    loadTenders();
  }, []);
  
  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">Feil ved lasting</Alert>;
  
  // ...
};
```

### Using Reactive Hooks (Recommended):
```javascript
import { useCollection, queryHelpers } from '../hooks/useFirestore';

const MyComponent = () => {
  const { data: tenders, loading, error } = useCollection('tenders', [
    queryHelpers.where('status', '==', 'open'),
    queryHelpers.orderBy('createdAt', 'desc')
  ]);
  
  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error.message}</Alert>;
  
  // ...
};
```

## Required Firestore Indexes

Some queries require composite indexes. Firebase will prompt you to create them when needed, or you can create them manually:

1. **Tenders by status and createdAt:**
   - Collection: `tenders`
   - Fields: `status` (Ascending), `createdAt` (Descending)

2. **Tenders by projectId and createdAt:**
   - Collection: `tenders`
   - Fields: `projectId` (Ascending), `createdAt` (Descending)

3. **Contracts by tenderId and createdAt:**
   - Collection: `contracts`
   - Fields: `tenderId` (Ascending), `createdAt` (Descending)

## Testing

1. **Set up Firebase project** with test data
2. **Test authentication** flow (login, register, logout)
3. **Test CRUD operations** for each collection
4. **Test file uploads** to Storage
5. **Verify security rules** by testing unauthorized access attempts

## Rollback Plan

If you need to rollback:
1. The old mock data files are still in `src/data/mockData.js`
2. Old service files can be restored from git history
3. Components can be reverted to use mock data

## Next Steps

1. Update all components to use new Firebase services
2. Add proper error handling and loading states
3. Test thoroughly with real Firebase project
4. Deploy security rules
5. Set up Firestore indexes
6. Migrate any remaining mock data usage

