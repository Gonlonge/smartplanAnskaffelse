# Document Versioning Implementation

## Overview

This document describes the implementation of document versioning features, including version history, version comparison, and document change tracking.

## Status: ✅ Implemented

## Features Implemented

### 1. Document Version History
- **Status**: ✅ Complete
- **Description**: Tracks all versions of documents with metadata including:
  - Version number
  - Upload date and user
  - File size and type
  - Change reason
  - Current version indicator
- **Location**: `src/services/documentVersioning.js`
- **UI Component**: `src/components/features/tender/DocumentVersionHistory.jsx`

### 2. Version Comparison
- **Status**: ✅ Complete
- **Description**: Side-by-side comparison of two document versions showing:
  - Name differences
  - Size differences
  - Type differences
  - Uploader differences
  - Change reason differences
- **Location**: `src/services/documentVersioning.js` (compareDocumentVersions function)
- **UI Component**: `src/components/features/tender/DocumentVersionCompare.jsx`

### 3. Document Change Tracking
- **Status**: ✅ Complete
- **Description**: Tracks changes between versions including:
  - Field-level changes (name, size, type)
  - File replacement detection
  - Change descriptions
  - Timestamp and user information
- **Location**: `src/services/documentVersioning.js` (calculateDocumentChanges, getDocumentChangeHistory functions)

## Implementation Details

### Service Layer

**File**: `src/services/documentVersioning.js`

Key functions:
- `createDocumentVersion()` - Creates a new version when a document is uploaded/updated
- `getDocumentVersions()` - Retrieves all versions for a document
- `getCurrentDocumentVersion()` - Gets the current version
- `getDocumentVersionByNumber()` - Gets a specific version by number
- `compareDocumentVersions()` - Compares two versions
- `getDocumentChangeHistory()` - Gets change history for a document
- `restoreDocumentVersion()` - Restores a document to a previous version

### Data Model

**Collection**: `documentVersions`

Document structure:
```javascript
{
  documentId: string,           // ID of the document
  versionNumber: number,         // Sequential version number
  name: string,                  // Document name
  url: string,                   // Download URL
  storagePath: string,          // Storage path
  size: number,                 // File size in bytes
  type: string,                 // File type/MIME type
  context: string,              // Context: 'tender', 'complaint', 'bid'
  contextId: string,            // ID of the context (tenderId, complaintId, etc.)
  uploadedBy: string,           // User ID
  uploadedByName: string,       // User name/email
  uploadedAt: Date,            // Upload timestamp
  changeReason: string,         // Optional reason for the change
  changes: Array,               // Array of change objects
  isCurrent: boolean            // Whether this is the current version
}
```

### Integration

**Document Upload**: `src/api/tenderService.js`

The `addDocumentsToTender()` function has been updated to:
1. Check if a document with the same name already exists
2. If it exists, create a new version (update scenario)
3. If it doesn't exist, create the initial version (new document)
4. Automatically track changes between versions

### UI Components

#### DocumentVersionHistory
- Displays list of all versions
- Shows version metadata (date, user, size, type)
- Allows selecting versions for comparison
- Provides restore functionality
- Shows change history timeline

#### DocumentVersionCompare
- Side-by-side comparison view
- Highlights differences between versions
- Shows before/after values for changed fields

#### TenderDocumentsSection
- Added version history button for each document
- Opens version history dialog
- Integrated with versioning system

### Security

**Firestore Rules**: Updated `firestore.rules` to include:
- Read access: Users can read versions for documents they have access to (based on context)
- Create access: Users can create versions when they have permission to modify the document
- Update access: Users can update version metadata (e.g., isCurrent flag)
- Delete access: Only admins can delete versions

The rules check access based on:
- For tender documents: User must be creator, company owner, or invited supplier
- For complaint documents: User must be submitter, company owner, or admin

## Usage

### Viewing Version History

1. Navigate to a tender with documents
2. Click the history icon (📜) next to any document
3. View all versions in the dialog
4. See change history timeline

### Comparing Versions

1. Open version history for a document
2. Click on a version to select it
3. Click on another version to compare
4. View side-by-side comparison with highlighted differences

### Restoring a Version

1. Open version history for a document
2. Click the restore icon (↩️) on any non-current version
3. Confirm the restore action
4. A new version will be created based on the selected version

## Future Enhancements

Potential improvements:
- [ ] Visual diff for text-based documents (PDF, Word)
- [ ] Version comments/notes
- [ ] Bulk version operations
- [ ] Version expiration/retention policies
- [ ] Export version history as report
- [ ] Version preview without download

## Testing

To test the versioning system:

1. **Create a new document**: Upload a document to a tender
2. **Update the document**: Upload a new file with the same name
3. **View history**: Click the history icon and verify versions are listed
4. **Compare versions**: Select two versions and compare
5. **Restore version**: Restore an older version and verify a new version is created

## Notes

- Version numbers are sequential and start at 1
- Only one version can be marked as `isCurrent` at a time
- When a new version is created, all previous versions are marked as `isCurrent: false`
- Change tracking automatically calculates differences between versions
- Version history is preserved even if the current document is deleted

