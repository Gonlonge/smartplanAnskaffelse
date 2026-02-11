# Code Organization Guidelines

This document provides guidelines for keeping code organized, readable, and maintainable by establishing file size limits and best practices for code organization.

## File Size Guidelines

### Target File Sizes

- **Components**: 100-300 lines (ideal), maximum 400 lines
- **Pages**: 200-400 lines (ideal), maximum 500 lines
- **Hooks**: 50-150 lines (ideal), maximum 200 lines
- **Utils/Helpers**: 50-200 lines (ideal), maximum 300 lines
- **API Services**: 100-300 lines (ideal), maximum 400 lines
- **Contexts**: 50-150 lines (ideal), maximum 200 lines

### When to Split Files

Split a file when it exceeds these limits OR when you notice:

1. **Multiple Responsibilities**: File handles more than one clear responsibility
2. **Hard to Navigate**: Difficult to find specific code sections
3. **Long Functions**: Functions exceed 50 lines
4. **Repeated Patterns**: Similar code blocks that could be extracted
5. **Complex State Management**: Multiple related state variables that could be grouped
6. **Large JSX Sections**: JSX sections over 100 lines that represent distinct UI features

## Code Organization Principles

### 1. Single Responsibility Principle

Each file should have one clear purpose:

```javascript
// ❌ Bad: Component handles form, validation, API calls, and rendering
const TenderCreate = () => {
  // 500+ lines of mixed concerns
}

// ✅ Good: Separated concerns
// TenderCreate.jsx - Orchestration only
// TenderFormFields.jsx - Form fields
// useTenderForm.js - Form logic
// tenderValidation.js - Validation rules
```

### 2. Component Extraction

Extract components when:

- JSX section is 100+ lines and represents a distinct feature
- Component has its own state and logic
- Component could be reused elsewhere
- Component makes the parent file hard to read

**Example:**
```javascript
// ❌ Bad: Everything in one file
const TenderCreate = () => {
  return (
    <form>
      {/* 200 lines of supplier invitation JSX */}
      {/* 150 lines of questions JSX */}
      {/* 100 lines of form fields */}
    </form>
  )
}

// ✅ Good: Extracted components
const TenderCreate = () => {
  return (
    <form>
      <SupplierInvitationSection />
      <QuestionsSection />
      <TenderFormFields />
    </form>
  )
}
```

### 3. Hook Extraction

Extract custom hooks when:

- Logic is reusable across components
- State management is complex (3+ related state variables)
- Side effects are complex (multiple useEffect hooks)
- Business logic is mixed with UI code

**Example:**
```javascript
// ❌ Bad: Complex logic in component
const TenderCreate = () => {
  const [suppliers, setSuppliers] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchedCompany, setSearchedCompany] = useState(null)
  // ... 50+ lines of supplier management logic
}

// ✅ Good: Extracted hook
const useSupplierInvitation = () => {
  // All supplier management logic here
  return { suppliers, addSupplier, removeSupplier, ... }
}

const TenderCreate = () => {
  const { suppliers, addSupplier } = useSupplierInvitation()
}
```

### 4. Utility Function Extraction

Extract utility functions when:

- Logic is pure (no side effects)
- Function is reusable
- Logic is complex enough to warrant testing separately
- Validation or transformation logic

**Example:**
```javascript
// ❌ Bad: Validation in component
const handleSubmit = (data) => {
  if (!data.title?.trim()) {
    setError("Tittel er påkrevd")
    return
  }
  if (!data.contractStandard) {
    setError("Kontraktstandard er påkrevd")
    return
  }
  // ... more validation
}

// ✅ Good: Extracted validation
// tenderValidation.js
export const validateTenderForm = (data) => {
  const errors = []
  if (!data.title?.trim()) errors.push("Tittel er påkrevd")
  if (!data.contractStandard) errors.push("Kontraktstandard er påkrevd")
  return errors
}
```

## File Structure Guidelines

### Component Organization

```
src/
├── components/
│   ├── common/              # Reusable UI components (Button, Input, etc.)
│   ├── layout/             # Layout components (Header, Navigation, etc.)
│   └── features/           # Feature-specific components
│       └── tender/         # Tender-related components
│           ├── SupplierInvitationSection.jsx
│           ├── QuestionsSection.jsx
│           └── TenderFormFields.jsx
├── hooks/
│   └── useSupplierInvitation.js
├── utils/
│   └── tenderValidation.js
└── pages/
    └── TenderCreate.jsx     # Main page (orchestration only)
```

### Naming Conventions

- **Components**: PascalCase (e.g., `SupplierInvitationSection.jsx`)
- **Hooks**: camelCase starting with "use" (e.g., `useSupplierInvitation.js`)
- **Utils**: camelCase (e.g., `tenderValidation.js`)
- **Pages**: PascalCase (e.g., `TenderCreate.jsx`)

## Refactoring Checklist

When refactoring a large file:

1. **Identify Sections**: Find distinct logical sections (form fields, lists, modals, etc.)
2. **Extract Components**: Move JSX sections to separate component files
3. **Extract Hooks**: Move state management and side effects to custom hooks
4. **Extract Utils**: Move pure functions to utility files
5. **Update Imports**: Ensure all imports are correct
6. **Test**: Verify functionality still works after refactoring
7. **Update Documentation**: Update any relevant docs

## Examples

### Example 1: Large Page Component

**Before (1343 lines):**
```javascript
// TenderCreate.jsx - Everything in one file
const TenderCreate = () => {
  // 50+ lines of state
  // 100+ lines of handlers
  // 1000+ lines of JSX
}
```

**After (Refactored):**
```javascript
// TenderCreate.jsx - ~200 lines (orchestration)
import { SupplierInvitationSection } from '../components/features/tender/SupplierInvitationSection'
import { QuestionsSection } from '../components/features/tender/QuestionsSection'
import { TenderFormFields } from '../components/features/tender/TenderFormFields'
import { useSupplierInvitation } from '../hooks/useSupplierInvitation'
import { useTenderForm } from '../hooks/useTenderForm'

const TenderCreate = () => {
  const { suppliers, addSupplier, removeSupplier } = useSupplierInvitation()
  const { formData, handleChange, handleSubmit } = useTenderForm()
  
  return (
    <form onSubmit={handleSubmit}>
      <TenderFormFields formData={formData} onChange={handleChange} />
      <SupplierInvitationSection 
        suppliers={suppliers}
        onAdd={addSupplier}
        onRemove={removeSupplier}
      />
      <QuestionsSection />
    </form>
  )
}
```

### Example 2: Complex State Management

**Before:**
```javascript
const Component = () => {
  const [suppliers, setSuppliers] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchedCompany, setSearchedCompany] = useState(null)
  const [supplierInput, setSupplierInput] = useState({...})
  // ... 100+ lines of related logic
}
```

**After:**
```javascript
// useSupplierInvitation.js
const useSupplierInvitation = () => {
  const [suppliers, setSuppliers] = useState([])
  const [searching, setSearching] = useState(false)
  // ... all related logic
  
  return { suppliers, addSupplier, removeSupplier, ... }
}

// Component.jsx
const Component = () => {
  const { suppliers, addSupplier } = useSupplierInvitation()
}
```

## Benefits of Good Code Organization

1. **Readability**: Easier to understand and navigate code
2. **Maintainability**: Changes are isolated to specific files
3. **Reusability**: Components and hooks can be reused
4. **Testability**: Smaller units are easier to test
5. **Collaboration**: Multiple developers can work on different files
6. **Performance**: Easier to identify optimization opportunities

## When NOT to Split

Don't split files unnecessarily:

- File is already small (< 200 lines) and readable
- Splitting would create artificial boundaries
- Components are tightly coupled and splitting would complicate things
- Premature optimization - wait until you actually need to split

## Related Documentation

- `FOLDER_STRUCTURE.md` - Project folder organization
- `docs/PRODUCT.md` - Product requirements and features
- `docs/THEME.md` - Styling guidelines

## Summary

**Key Rules:**

1. Keep files under 400-500 lines maximum
2. Extract components when JSX sections exceed 100 lines
3. Extract hooks when state management becomes complex
4. Extract utils for reusable pure functions
5. One responsibility per file
6. When in doubt, split it out - you can always refactor later

**Remember:** Code organization is an ongoing process. Refactor as you go, not all at once.

