# Tender Details Display Implementation

## Overview

This document describes the implementation of comprehensive tender data display on the `/tenders/{id}` page. All data entered during tender creation on `/tenders/create` is now fully visible on the tender details page.

## What Was Added

### 1. NS-Specific Fields Display Components

#### NS8405Display Component (`src/components/features/tender/NS8405Display.jsx`)

Displays all NS 8405 (Utførelsesentreprise) specific fields:

-   **Entreprisemodell**: Hovedentreprise, Generalentreprise, or Delentreprise
-   **Endringsordre terskelverdi**: Threshold value in NOK
-   **Dagmulkt Section**:
    -   Dagmulkt sats (NOK/day)
    -   Dagmulkt startdato
    -   Maksimal dagmulkt (%)
-   **Faktureringsplan**: Akonto, Milepæler, or Kombinert
-   **Sikkerhetsstillelse**:
    -   Type (Bankgaranti, Kontantdepositum, Forsikring)
    -   Prosent (%)
-   **Retensjon**:
    -   Prosent (%)
    -   Utløpsvilkår (text description)
-   **Garantiperiode**:
    -   Periode (years)
    -   Type (text description)

#### NS8406Display Component (`src/components/features/tender/NS8406Display.jsx`)

Displays all NS 8406 (Forenklet utførelsesentreprise) specific fields:

-   **Prisformat**: Fastpris, Timepris, or Estimat
-   **Standard betalingsplan**: Yes/No indicator
-   **Reklamasjonstid**: Number of months
-   **Sikkerhetsstillelse prosent**: Percentage
-   **Depositum**: Yes/No indicator for using deposit instead of security

#### NS8407Display Component (`src/components/features/tender/NS8407Display.jsx`)

Displays all NS 8407 (Totalentreprise) specific fields:

-   **Prosjekteringsomfang**: Percentage
-   **Prosjekteringsansvar**: Fullt, Delvis, or Koordinert
-   **Funksjonskrav**: Text description
-   **Ytelsesbeskrivelse**: Text description
-   **Prosjekterings milepæler**: List of milestones with names and dates
-   **Utførelses milepæler**: List of milestones with names and dates
-   **Ansvarlig prosjekterende**: Name
-   **Koordinerende rådgivere**: Text description
-   **Dagmulkt Section**:
    -   Dagmulkt sats (NOK/day)
    -   Dagmulkt startdato
-   **Sikkerhetsstillelse prosent**: Percentage
-   **Retensjon prosent**: Percentage
-   **Garantiperiode**: Number of years

### 2. Additional Information Display Component

#### TenderAdditionalInfo Component (`src/components/features/tender/TenderAdditionalInfo.jsx`)

Displays common tender fields:

-   **Vurderingskriterier (Evaluation Criteria)**: Displayed as chips/tags
-   **Entrepriseform**: AS, DA, Enkeltpersonforetak, Stiftelse, or Annet
-   **CPV-kode**: CPV code value
-   **Spørsmålfrist (Question Deadline)**: Formatted date

### 3. Updated Components

#### TenderDetails Page (`src/pages/TenderDetails.jsx`)

-   Added imports for all new display components
-   Integrated display components in the correct order:
    1. Description section
    2. **TenderAdditionalInfo** (new)
    3. **NS8405Display/NS8406Display/NS8407Display** (new, based on contractStandard)
    4. Documents section
    5. Q&A section
    6. Bids section
    7. Invited suppliers section

#### TenderInfoSidebar Component (`src/components/features/tender/TenderInfoSidebar.jsx`)

-   Added **Spørsmålfrist (Question Deadline)** display in the sidebar
-   Shows question deadline date if available

## How It Works

### Data Flow

1. **Tender Creation** (`/tenders/create`):

    - User fills out all form fields including:
        - Common fields (title, description, dates, etc.)
        - NS-specific fields (based on contractStandard)
        - Evaluation criteria
        - Entrepriseform and CPV
        - Question deadline
    - All data is saved to Firestore via `createTender()` function

2. **Tender Details** (`/tenders/{id}`):
    - Tender data is loaded via `useTenderDetailsPage` hook
    - Display components check if data exists before rendering
    - Components automatically format values (currency, percentages, dates)
    - Only relevant NS-specific component displays based on `contractStandard`

### Conditional Display

-   **NS-Specific Fields**: Only the component matching the tender's `contractStandard` is displayed
-   **Additional Info**: Only shows if at least one field has data
-   **Individual Fields**: Each field only displays if it has a value (no empty fields shown)

### Formatting

-   **Currency**: Formatted as Norwegian Kroner (NOK) with proper formatting
-   **Percentages**: Displayed with % symbol
-   **Dates**: Formatted using `DateDisplay` component (Norwegian format)
-   **Boolean Values**: Displayed with check/cancel icons
-   **Select Values**: Mapped to human-readable Norwegian labels

## Files Created

1. `src/components/features/tender/NS8405Display.jsx` - NS 8405 display component
2. `src/components/features/tender/NS8406Display.jsx` - NS 8406 display component
3. `src/components/features/tender/NS8407Display.jsx` - NS 8407 display component
4. `src/components/features/tender/TenderAdditionalInfo.jsx` - Additional info display component

## Files Modified

1. `src/components/features/tender/index.js` - Added exports for new components
2. `src/pages/TenderDetails.jsx` - Added imports and integrated display components
3. `src/components/features/tender/TenderInfoSidebar.jsx` - Added question deadline display

## User Experience

### For Senders (Anskaffelse)

-   Can see all tender information they created
-   All NS-specific fields are clearly displayed
-   Evaluation criteria shown as visual chips
-   Question deadline visible in sidebar

### For Suppliers (Leverandør)

-   Can see all tender information relevant to submitting a bid
-   NS-specific contract terms clearly displayed
-   Evaluation criteria visible to understand how bids will be evaluated
-   Question deadline visible to know when questions must be submitted

## Testing Checklist

-   [x] NS 8405 fields display correctly
-   [x] NS 8406 fields display correctly
-   [x] NS 8407 fields display correctly
-   [x] Evaluation criteria display as chips
-   [x] Entrepriseform displays correctly
-   [x] CPV code displays correctly
-   [x] Question deadline displays in sidebar
-   [x] Question deadline displays in additional info section
-   [x] Components only show when data exists
-   [x] Currency formatting works correctly
-   [x] Date formatting works correctly
-   [x] Percentage formatting works correctly
-   [x] No linting errors

## Summary

All tender data entered during creation is now fully visible on the tender details page. The implementation includes:

-   ✅ NS-specific fields display (NS 8405, NS 8406, NS 8407)
-   ✅ Evaluation criteria display
-   ✅ Common fields display (entrepriseform, cpv, questionDeadline)
-   ✅ Question deadline in sidebar
-   ✅ Proper formatting for all data types
-   ✅ Conditional rendering (only shows when data exists)
-   ✅ Clean, organized UI with proper spacing and typography

The implementation ensures that both senders (anskaffelse) and suppliers (leverandør) can see all relevant information when viewing a tender.

