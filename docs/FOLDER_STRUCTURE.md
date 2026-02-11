# Folder Structure

This document describes the organized folder structure for the Smartplan Anskaffelse Web application.

## 📁 Directory Overview

```
src/
├── api/                    # API services and endpoints
│   ├── authService.js     # Authentication API calls
│   ├── brregService.js    # Brønnøysund Registry API
│   ├── contractService.js # Contract management
│   ├── projectService.js  # Project CRUD operations
│   ├── tenderService.js   # Tender/procurement operations
│   └── index.js           # API exports
│
├── assets/                 # Static assets
│   ├── images/            # Image files
│   ├── icons/             # Icon files
│   └── fonts/             # Font files
│
├── components/            # React components
│   ├── common/           # Reusable UI components (StatusChip, DateDisplay, etc.)
│   ├── layout/           # Layout components (AppLayout, Navigation)
│   ├── features/         # Feature-specific components
│   │   ├── dashboard/    # Dashboard widgets (StatCard, DashboardStats, etc.)
│   │   └── tender/       # Tender components (BidComparison, QuestionsSection, etc.)
│   ├── routes/           # Route components (ProtectedRoute)
│   └── index.js          # Component exports
│
├── config/                # Application configuration
│   ├── firebase.js       # Firebase initialization
│   └── index.js          # Config exports
│
├── constants/             # Constants and configuration values
│   └── index.js          # Trade categories, status enums, routes
│
├── contexts/              # React contexts (state management)
│   └── AuthContext.jsx   # Authentication context with user state
│
├── hooks/                 # Custom React hooks
│   ├── useFirestore.js   # Reactive Firestore hooks
│   ├── useSupplierInvitation.js  # Supplier invitation logic
│   ├── useComplianceTests.js     # QA/Compliance testing
│   └── index.js          # Hooks exports
│
├── pages/                 # Page components (routes)
│   ├── Login.jsx         # Authentication page
│   ├── Register.jsx      # User registration
│   ├── Dashboard.jsx     # Main dashboard
│   ├── Tenders.jsx       # Tenders list
│   ├── TenderCreate.jsx  # Create new tender
│   ├── TenderDetails.jsx # Tender details view
│   ├── Projects.jsx      # Projects list
│   ├── Invitations.jsx   # Supplier invitations
│   ├── Compliance.jsx    # QA/Compliance testing (dev)
│   └── index.js          # Pages exports
│
├── services/              # Firebase service layer
│   ├── firestore.js      # Firestore CRUD operations
│   └── storage.js        # Firebase Storage operations
│
├── store/                 # State management (if needed)
│   └── index.js          # Store exports
│
├── styles/                # Global styles and themes
│   ├── theme.js          # MUI theme configuration
│   └── index.js          # Styles exports
│
├── utils/                 # Utility functions
│   └── index.js          # Utils exports
│
├── App.jsx                # Main App component with routing
├── main.jsx               # Application entry point
└── index.css              # Global CSS
```

## 📝 Folder Descriptions

### `/api`

API service files for making HTTP requests and handling API logic.

-   **authService.js**: Authentication-related API calls

### `/assets`

Static assets like images, icons, and fonts.

### `/components`

React components organized by purpose:

-   **common/**: Reusable UI components (Button, Input, Card, etc.)
-   **layout/**: Layout components (Header, Footer, Sidebar, Navigation, etc.)
-   **features/**: Feature-specific components that are not reusable across features

### `/config`

Application-wide configuration settings.

### `/constants`

Constant values used throughout the application (API URLs, route paths, etc.).

### `/contexts`

React Context providers for global state management.

### `/hooks`

Custom React hooks for reusable logic.

### `/pages`

Page-level components that represent routes in your application.

### `/store`

State management store (Redux, Zustand, Jotai, etc.) if needed.

### `/styles`

Global styles, theme configuration, and CSS-in-JS setups.

### `/types`

TypeScript type definitions (if using TypeScript).

### `/utils`

Utility functions and helpers (formatters, validators, etc.).

## 🎯 Best Practices

1. **Components**: Place reusable components in `common/`, layout-specific in `layout/`, and feature-specific in `features/`
2. **Pages**: Each route should have its own page component in `/pages`
3. **API**: Keep all API calls organized by feature or resource in `/api`
4. **Hooks**: Extract reusable logic into custom hooks in `/hooks`
5. **Utils**: Keep utility functions pure and testable in `/utils`
6. **Index Files**: Use index.js files for cleaner imports
7. **File Size**: Keep files under 400-500 lines maximum. See [Code Organization Guidelines](./docs/CODE_ORGANIZATION.md) for details

## 📦 Import Examples

```javascript
// Pages
import { Login, Register } from "./pages";

// API
import { login, register } from "./api";

// Components
import { Button } from "./components/common";
import { Header } from "./components/layout";

// Hooks
import { useLocalStorage } from "./hooks";

// Utils
import { formatDate, validateEmail } from "./utils";
```

## 📄 Documentation Structure

Documentation files follow a simpler structure than code, but should still be organized logically.

### Documentation Organization

```
.
├── README.md                 # Project overview and getting started (root level)
├── FOLDER_STRUCTURE.md      # This file - project structure documentation (root level)
└── docs/                    # Detailed documentation directory
    ├── PRODUCT.md           # Product specifications and features
    ├── THEME.md            # Theme and styling documentation
    ├── TYPOGRAPHY.md       # Typography guidelines and font system
    ├── SPACING.md          # Spacing system and layout guidelines
    └── CODE_ORGANIZATION.md # Code organization, file size limits, and refactoring guidelines
```

### Documentation Best Practices

1. **Root Level Files**: Keep essential project documentation at root

    - `README.md` - Required for GitHub/GitLab visibility
    - `FOLDER_STRUCTURE.md` - Project organization guide

2. **`/docs` Directory**: Place detailed, topic-specific documentation here

    - One markdown file per major topic/feature
    - Use descriptive, clear filenames (PascalCase or UPPERCASE)
    - Group related documentation in subfolders if needed (e.g., `docs/api/`, `docs/guides/`)

3. **File Naming**: Use consistent naming conventions

    - PascalCase for feature docs: `PRODUCT.md`, `THEME.md`
    - UPPERCASE for important docs: `README.md`, `CONTRIBUTING.md`
    - kebab-case for guides: `getting-started.md`, `deployment.md`

4. **Organization**: Don't create folders for single files

    - If you have multiple related docs, group them in a subfolder
    - Example: `docs/api/authentication.md`, `docs/api/endpoints.md` → `docs/api/` folder

5. **Cross-References**: Link between related documentation files
    - Use relative paths: `[Theme Documentation](./docs/THEME.md)`
    - Keep documentation discoverable

### Current Documentation Files

-   **`README.md`** (root): Project overview, setup instructions, tech stack
-   **`FOLDER_STRUCTURE.md`** (root): Code organization and folder structure guide

**Core Documentation (`docs/`):**
-   **`docs/PRODUCT.md`**: Product specifications, user roles, features, development guide
-   **`docs/THEME.md`**: Theme configuration, styling guidelines, MUI usage
-   **`docs/TYPOGRAPHY.md`**: Typography guidelines, font families, sizes, weights
-   **`docs/SPACING.md`**: Spacing system, margins, padding, grid system
-   **`docs/BUTTONS.md`**: Button component guidelines, sizes, accessibility
-   **`docs/CODE_ORGANIZATION.md`**: File size limits, when to split files, code organization best practices
-   **`docs/REFACTORING_NEEDED.md`**: Tracks files that need refactoring (size violations)

**Reference Documentation (`docs/`):**
-   **`docs/FIREBASE_MIGRATION.md`**: Firebase migration notes
-   **`docs/MIGRATION_SUMMARY.md`**: Migration summary

**Archived Documentation (`docs/archive/`):**
-   Historical audit reports, compliance checks, and review documents kept for reference

### When to Create Documentation Folders

Create subfolders in `docs/` when you have:

-   **Multiple related files**: `docs/api/authentication.md`, `docs/api/endpoints.md`
-   **Different documentation types**: `docs/guides/`, `docs/api/`, `docs/architecture/`
-   **Version-specific docs**: `docs/v1/`, `docs/v2/` (if needed)

**Don't create folders for:**

-   Single standalone documentation files
-   Files that don't share a clear category with others
