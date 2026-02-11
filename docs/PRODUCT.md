# Smartplan Procurement

A digital tendering and procurement system built for the construction industry in Norway. It aligns with how Norwegian contractors, advisors, and project owners manage construction procurements, documentation requirements, and industry standards.

A digital system for managing the complete procurement and tendering process in construction projects — from planning to signed contract.

---

## Product Overview

Smartplan Procurement streamlines the entire procurement workflow, making it fully digital, transparent, and compliant with Norwegian construction industry standards.

### Core Purpose

-   Digital tendering and procurement management
-   Compliance with Norwegian contract standards (NS 8405, 8406, 8407)
-   Transparent and auditable process
-   Secure document handling and digital signatures
-   Role-based access for different user types

---

## User Roles

### Sender (Client, Buyer, Project Owner, Advisor)

Users who create and manage tenders.

**Key Responsibilities:**

-   Create and manage tenders
-   Invite suppliers
-   Review and compare bids
-   Award contracts
-   Manage documentation

### Receiver (Supplier, Contractor, Bidder)

Users who receive invitations and submit bids.

**Key Responsibilities:**

-   View tender documents
-   Ask questions
-   Submit bids
-   Track status
-   Access contracts

---

## Features

### For Senders

**Tender Management:**

-   Create new tenders within projects
-   Choose correct contract standard (NS 8405, 8406, 8407)
-   Upload technical descriptions, drawings, and attachments
-   Set deadlines and define supplier access
-   Invite suppliers and track their activity

**Communication:**

-   Manage questions and answers in shared Q&A module
-   Ensure full audit trail and transparency

**Evaluation:**

-   Lock offers automatically after deadline
-   Compare bids based on price, quality, and environmental criteria
-   Generate automatic scoring and ranking

**Contract Management:**

-   Send award letters and start standstill period
-   Manage complaints and documentation
-   Generate and sign final contract digitally
-   Archive everything securely for future follow-up

**End Result:**
A fully digital, compliant, and traceable procurement workflow with less manual work, fewer mistakes, and a more professional process.

### For Receivers

**Tender Access:**

-   Receive official invitation links
-   View tender documents, attachments, and requirements
-   Ask questions within shared Q&A module

**Bid Submission:**

-   Submit all documents digitally in correct format
-   Get confirmation when offer is received
-   Avoid missing deadlines through reminders

**Transparency:**

-   Know that all bidders are treated equally
-   See award results clearly and transparently
-   Access signed contract documents if selected

**End Result:**
A fair, structured, and modern tendering experience without email chaos, guessing, or uncertainty.

---

## Key Integrations

-   **Brønnøysund Registry** — Company lookup and verification
-   **ESPD** — European self-declaration support
-   **Smartplan Ecosystem** — Projects, documents, finance, follow-up

---

## The Value Proposition

-   ✅ Fully digital procurement workflow
-   ✅ Transparent and auditable process
-   ✅ Secure document handling and digital signatures
-   ✅ Role-based access for clients, advisors, and suppliers
-   ✅ Compliance with Norwegian construction standards
-   ✅ Reduced manual work and errors
-   ✅ Professional and modern user experience

---

## Technical Stack

### Current Stack

-   **React.js** — UI framework
-   **Vanilla JavaScript** — No TypeScript
-   **Material-UI (MUI)** — Component library
-   **Firebase** — Authentication, Firestore, and Storage

### Not Using

-   ❌ TypeScript
-   ❌ Tailwind CSS

---

## Responsive Design Requirements

The application **must be fully responsive** and optimized for all device types to ensure accessibility and usability across different screen sizes and contexts.

### Supported Devices

**Web (Desktop):**

-   Full-featured experience with all functionality available
-   Optimal for complex tasks like bid comparison, contract management, and detailed document review
-   Screen widths: 1024px and above

**Tablet (Pad):**

-   Full functionality with optimized layouts for touch interaction
-   Suitable for viewing documents, managing tenders, and submitting bids
-   Screen widths: 768px - 1023px
-   Touch-friendly UI elements and gestures

**Mobile:**

-   Core functionality available with streamlined, mobile-first design
-   Essential tasks: viewing tenders, submitting bids, Q&A, notifications
-   Screen widths: 320px - 767px
-   Optimized for one-handed use and quick actions

### Responsive Design Principles

1. **Mobile-First Approach**

    - Design and develop for mobile first, then enhance for larger screens
    - Ensure core functionality works on smallest screens
    - Progressive enhancement for desktop features

2. **Touch-Friendly Interface**

    - Minimum touch target size: 44x44px (iOS) / 48x48px (Material Design)
    - Adequate spacing between interactive elements
    - Support for swipe gestures where appropriate

3. **Adaptive Layouts**

    - Use MUI's responsive breakpoints and Grid system
    - Collapsible navigation menus on mobile/tablet
    - Stack columns vertically on smaller screens
    - Hide non-essential information on mobile (show on expand/collapse)

4. **Content Optimization**

    - Readable font sizes (minimum 16px on mobile to prevent zoom)
    - Optimized images and documents for different screen sizes
    - Truncate long text with "read more" options
    - Tables should scroll horizontally or convert to cards on mobile

5. **Performance**
    - Fast loading times on mobile networks
    - Optimized assets for different screen densities
    - Lazy loading for images and heavy content

### Key Responsive Considerations by Feature

**Dashboard:**

-   Web: Multi-column grid layout
-   Tablet: 2-column grid
-   Mobile: Single column, card-based layout

**Document Viewer:**

-   Web: Side-by-side document and metadata
-   Tablet: Stacked layout with full-width document
-   Mobile: Full-screen document view with overlay controls

**Forms (Tender Creation, Bid Submission):**

-   Web: Multi-column forms where appropriate
-   Tablet: 2-column forms
-   Mobile: Single column, step-by-step wizard approach

**Bid Comparison Tables:**

-   Web: Full table with all columns visible
-   Tablet: Horizontal scroll with sticky first column
-   Mobile: Card-based layout or accordion view

**Navigation:**

-   Web: Horizontal navigation bar
-   Tablet/Mobile: Hamburger menu with drawer/sidebar

**Data Tables:**

-   Web: Full table view
-   Tablet/Mobile: Card-based layout or horizontal scroll

### MUI Breakpoints Reference

Use MUI's default breakpoints for consistency:

```javascript
xs: 0px      // Extra small devices (phones)
sm: 600px    // Small devices (landscape phones)
md: 900px    // Medium devices (tablets)
lg: 1200px   // Large devices (desktops)
xl: 1536px   // Extra large devices (large desktops)
```

### Testing Requirements

-   Test on real devices (iOS, Android) and browsers
-   Test in portrait and landscape orientations
-   Verify touch interactions work correctly
-   Ensure forms are usable on mobile keyboards
-   Test with different network speeds (3G, 4G, WiFi)

---

## Development Guide

This documentation can be used to:

-   Generate UI components
-   Scaffold pages and routes
-   Create user flows and steps
-   Define application states
-   Structure mock data

### Key Pages to Build

**For Senders:**

-   Dashboard (tender overview)
-   Create Tender
-   Tender Details (with Q&A, attachments)
-   Supplier Management (invite, track)
-   Bid Comparison & Evaluation
-   Award Management
-   Contract Generation

**For Receivers:**

-   Invitation Inbox
-   Tender View (documents, requirements)
-   Q&A Module
-   Bid Submission Form
-   Bid Status & Confirmation
-   Award Results View
-   Contract Access

**Shared:**

-   Login/Register
-   Profile Settings
-   Document Viewer
-   Notification Center

### Key User Flows

**Tender Creation Flow:**

1. Select project
2. Create new tender
3. Choose contract standard
4. Upload documents
5. Set deadlines
6. Invite suppliers
7. Manage Q&A
8. Evaluate bids
9. Award contract
10. Generate and sign contract

**Bid Submission Flow:**

1. Receive invitation
2. View tender details
3. Review documents
4. Ask questions (if needed)
5. Prepare bid documents
6. Submit bid before deadline
7. Receive confirmation
8. View award results
9. Access contract (if awarded)

### Mock Data Structure Suggestions

**Tender Object:**

```javascript
{
  id: string,
  projectId: string,
  title: string,
  contractStandard: 'NS 8405' | 'NS 8406' | 'NS 8407',
  createdBy: userId,
  createdAt: date,
  deadline: date,
  status: 'draft' | 'open' | 'closed' | 'awarded',
  documents: [...],
  invitedSuppliers: [...],
  bids: [...],
  qa: [...]
}
```

**Bid Object:**

```javascript
{
  id: string,
  tenderId: string,
  supplierId: string,
  submittedAt: date,
  price: number,
  documents: [...],
  status: 'submitted' | 'evaluated' | 'awarded' | 'rejected'
}
```

**User Object:**

```javascript
{
  id: string,
  name: string,
  email: string,
  role: 'sender' | 'receiver',
  companyId: string,
  isAdmin: boolean
}
```

---

## Notes for Development

-   Keep it simple — avoid over-engineering
-   Use MUI components consistently
-   Mock data should reflect real-world structure
-   Focus on core flows first
-   **Responsive design is mandatory** — See [Responsive Design Requirements](#responsive-design-requirements) section above
-   Website have to be in Norwegian language

---

## Related Documentation

-   `FOLDER_STRUCTURE.md` — Project organization
-   `docs/THEME.md` — Theme and styling documentation
-   `docs/TYPOGRAPHY.md` — Typography guidelines and font system
-   `docs/SPACING.md` — Spacing system and layout guidelines
-   `src/App.jsx` — Main application entry point
