# Tender Create Improvements - NS Standards Support

## Summary of Current Implementation

### What Exists Today

**Location:** `src/pages/TenderCreate.jsx` and `src/components/features/tender/TenderFormFields.jsx`

**Current Fields:**
- Project selection (dropdown)
- Title (text field)
- Description (multiline text)
- Contract Standard (dropdown: NS 8405, NS 8406, NS 8407) - **No conditional logic**
- Estimated price (number)
- Publish date (date)
- Deadline (date)
- Status (draft/open)

**Additional Sections:**
- Supplier invitations
- Questions/Q&A
- Document upload

**Current Limitations:**
- Contract standard selection has no impact on form fields
- No NS-specific fields are present
- Missing common procurement fields (CPV, entrepriseform, evaluation criteria, etc.)
- No validation differences per standard

---

## What's Missing Per NS Standard

### Common Fields (All Standards)

**Missing:**
- **Prosjektnavn/Prosjektnr** - Project reference (partially covered by project selection)
- **Anskaffelsesnavn/Kontraktsnavn** - Procurement/contract name (title exists but could be more specific)
- **Entrepriseform** - Contract type (general, total, delentreprise, sideentreprise)
- **CPV/Fagområde** - CPV code / trade area
- **Spørsmålfrist** - Question deadline (separate from submission deadline)
- **Evalueringskriterier** - Evaluation criteria (price, quality, competence, execution capability)
- **Vedlegg** - Attachments (exists but could be more structured)

---

### NS 8405 – Utførelsesentreprise (General/Works Contract)

**Missing Specific Fields:**

1. **Entreprisemodell**
   - Hovedentreprise / Generalentreprise / Delentreprise

2. **Endringsordre-håndtering**
   - Rutiner for endringsordrer
   - Terskelverdier for endringsordrer

3. **Dagmulkt**
   - Dagmulkt-satser
   - Startdato for dagmulkt
   - Maksimal prosentandel

4. **Faktureringsplan**
   - Akonto-betalinger
   - Milepæler for fakturering

5. **Sikkerhetsstillelse**
   - Prosentandel
   - Type sikkerhetsstillelse

6. **Retensjon/Tilbakehold**
   - Prosentandel
   - Utløpsvilkår

7. **Garantiperiode**
   - Antall år
   - Type garanti

---

### NS 8406 – Forenklet Utførelsesentreprise (Simplified)

**Missing Specific Fields:**

1. **Kontraktsum/Prisformat**
   - Fastpris / Timepris / Estimat

2. **Enklere Endringsregime**
   - Forenklet prosess for endringer

3. **Kortere Reklamasjonstid**
   - Felt for reklamasjonstid

4. **Standard Betalingsplan**
   - Checkbox/valg for standard betalingsplan

5. **Enklere Sikkerhetsstillelse/Depositum**
   - Forenklet struktur

---

### NS 8407 – Totalentreprise (Design & Build)

**Missing Specific Fields:**

1. **Prosjekteringsomfang**
   - Hva entreprenøren skal prosjektere
   - Prosentandel prosjektering vs utførelse

2. **Funksjonskrav**
   - Overordnede ytelser/krav

3. **Ytelsesbeskrivelse og Kravspesifikasjon**
   - Lenke/vedlegg til ytelsesbeskrivelse

4. **Prosjekteringsansvar**
   - Felt/valg for prosjekteringsansvar

5. **Milepæler**
   - Milepæler for prosjektering
   - Milepæler for utførelse

6. **Koordinering med Rådgivere**
   - Ansvarlig prosjekterende
   - Fagområder
   - Roller

7. **Dagmulkt, Sikkerhet, Retensjon, Garantiperiode**
   - Tilpasset for totalentreprise

---

## Proposed Field Structure

### Common Fields Section

```
- Prosjekt (existing)
- Anskaffelsesnavn / Kontraktsnavn (title - existing, but rename label)
- Beskrivelse (existing)
- Kontraktsstandard (existing - dropdown)
- Entrepriseform (new - dropdown: Generalentreprise, Totalentreprise, Delentreprise, Sideentreprise)
- CPV / Fagområde (new - text/select)
- Publiseringsdato (existing)
- Spørsmålfrist (new - date)
- Tilbudsfrist (deadline - existing)
- Estimert pris (existing)
- Evalueringskriterier (new - multi-select or checkboxes: Pris, Kvalitet, Kompetanse, Gjennomføringsevne, Miljø)
```

### NS 8405 Specific Section

```
- Entreprisemodell (dropdown: Hovedentreprise, Generalentreprise, Delentreprise)
- Endringsordre terskelverdi (number - NOK)
- Dagmulkt sats (number - NOK per dag)
- Dagmulkt startdato (date)
- Dagmulkt maks prosent (number - %)
- Faktureringsplan type (select: Akonto, Milepæler, Kombinert)
- Sikkerhetsstillelse prosent (number - %)
- Sikkerhetsstillelse type (select: Bankgaranti, Kontantdepositum, etc.)
- Retensjon prosent (number - %)
- Retensjon utløpsvilkår (text)
- Garantiperiode år (number)
- Garantiperiode type (text)
```

### NS 8406 Specific Section (Simplified)

```
- Prisformat (select: Fastpris, Timepris, Estimat)
- Standard betalingsplan (checkbox)
- Reklamasjonstid måneder (number)
- Sikkerhetsstillelse prosent (number - %)
- Depositum (checkbox - yes/no)
```

### NS 8407 Specific Section (Design & Build)

```
- Prosjekteringsomfang prosent (number - %)
- Prosjekteringsansvar (select: Fullt, Delvis, etc.)
- Funksjonskrav (multiline text)
- Ytelsesbeskrivelse vedlegg (document upload reference)
- Prosjekterings milepæler (date list)
- Utførelses milepæler (date list)
- Ansvarlig prosjekterende (text)
- Koordinerende rådgivere (text/multiline)
- Dagmulkt sats (number - NOK per dag)
- Dagmulkt startdato (date)
- Sikkerhetsstillelse prosent (number - %)
- Retensjon prosent (number - %)
- Garantiperiode år (number)
```

---

## Implementation Plan

1. **Refactor TenderFormFields.jsx**
   - Extract common fields into CommonTenderFields component
   - Keep existing fields but enhance with new common fields

2. **Create NS-Specific Components**
   - `NS8405SpecificFields.jsx`
   - `NS8406SpecificFields.jsx`
   - `NS8407SpecificFields.jsx`

3. **Update TenderCreate.jsx**
   - Add conditional rendering based on `contractStandard`
   - Show relevant NS-specific section when standard is selected
   - Update form state to include all new fields

4. **Update Data Model**
   - Extend tender object structure to include NS-specific fields
   - Ensure backwards compatibility with existing tenders

5. **Update Validation**
   - Add standard-specific validation rules
   - Ensure required fields differ per standard appropriately

6. **Update API Service**
   - Modify `createTender` to handle new fields
   - Ensure existing tenders without new fields still work

---

## Backwards Compatibility Strategy

- All new fields are optional in the data model
- Existing tenders without new fields will display correctly
- Form will gracefully handle missing fields
- No breaking changes to existing API calls
- Existing tenders can be edited and will get new fields as optional

