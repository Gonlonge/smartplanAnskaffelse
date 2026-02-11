/**
 * Compliance checklist items - static data for the Compliance page
 */
export const COMPLIANCE_ITEMS = [
    {
        category: "THEME.md",
        status: "complete",
        items: [
            "Theme extracted to src/styles/theme.js",
            "Primary color: #7f50c7 (purple)",
            "Complete color palette (error, warning, info, success)",
            "Typography configuration included",
            "Component overrides for responsive design",
        ],
    },
    {
        category: "TYPOGRAPHY.md",
        status: "complete",
        items: [
            "Font family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
            "Minimum 16px font size on mobile (prevents iOS zoom)",
            "Responsive typography with mobile-first approach",
            "All variants configured with proper sizes, weights, line heights",
        ],
    },
    {
        category: "SPACING.md",
        status: "complete",
        items: [
            "All spacing uses theme.spacing() via sx prop multipliers",
            "Responsive Grid spacing: spacing={{ xs: 1, sm: 2, md: 3 }}",
            "No hardcoded pixel values",
            "Responsive padding and margins throughout",
        ],
    },
    {
        category: "PRODUCT.md",
        status: "complete",
        items: [
            "All text in Norwegian",
            'HTML lang attribute: lang="no"',
            "Responsive design (mobile-first)",
            "Touch-friendly (44x44px minimum touch targets)",
            "Responsive navigation (hamburger menu on mobile)",
        ],
    },
    {
        category: "FOLDER_STRUCTURE.md",
        status: "complete",
        items: [
            "Proper folder organization",
            "Theme in correct location",
            "Index files for clean imports",
            "Components organized by purpose",
        ],
    },
    {
        category: "BUTTONS.md",
        status: "complete",
        items: [
            "Minimum 44px height on mobile (touch target)",
            "Minimum 36px height on desktop",
            "16px font size on mobile (prevents iOS zoom)",
            "14px font size on desktop",
            'textTransform: "none" (no uppercase)',
            "16px spacing between buttons (spacing(2))",
            "Icon buttons: 44x44px mobile, 36x36px desktop",
            "Responsive button sizing with sx prop",
            "Proper button variants (contained, outlined, text)",
            "Accessibility: ARIA labels and keyboard navigation",
        ],
    },
    {
        category: "CODE_ORGANIZATION.md",
        status: "complete",
        items: [
            "Components: Under 400 lines (ideal 100-300)",
            "Pages: Under 500 lines (ideal 200-400)",
            "Hooks: Under 200 lines (ideal 50-150)",
            "API Services: Under 400 lines (ideal 100-300)",
            "Single responsibility principle applied",
            "Components extracted when JSX sections exceed 100 lines",
            "Hooks extracted for complex state management",
            "Utils extracted for reusable pure functions",
            "Proper file naming conventions (PascalCase for components)",
            "Feature-specific components in features/ folder",
        ],
    },
    {
        category: "FIREBASE_MIGRATION.md",
        status: "complete",
        items: [
            "Firebase Auth for user authentication",
            "Firestore for data storage (projects, tenders, contracts)",
            "Firebase Storage for file uploads",
            "Service layer: firestore.js and storage.js",
            "Date conversion handled (Timestamp ↔ Date)",
            "API services migrated to use Firestore",
            "Proper error handling in async operations",
            "Security rules implemented",
            "Reactive hooks available (useFirestore)",
            "No localStorage usage for data persistence",
        ],
    },
    {
        category: "Complaints Management",
        status: "complete",
        items: [
            "Complaint submission system with form validation",
            "Complaint tracking and resolution workflow",
            "Status management (submitted, in_progress, resolved, closed, rejected)",
            "Complaint documentation with file uploads",
            "Comment system for communication",
            "History tracking for audit trail",
            "Filtering and search capabilities",
            "Notification system integration",
            "Role-based access control",
        ],
    },
];

/**
 * Code examples for the Compliance page
 */
export const CODE_EXAMPLES = [
    {
        title: "Responsive Typography",
        code: `<Typography
  variant="h4"
  sx={{
    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
    mb: 4,
  }}
>
  {user?.companyName}
</Typography>`,
    },
    {
        title: "Responsive Spacing",
        code: `<Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
  {/* Responsive grid spacing */}
</Grid>`,
    },
    {
        title: "Responsive Padding",
        code: `<Paper sx={{ p: { xs: 3, sm: 4 } }}>
  {/* Responsive padding */}
</Paper>`,
    },
    {
        title: "Button Compliance (BUTTONS.md)",
        code: `<Button
  variant="contained"
  sx={{
    minHeight: { xs: 44, md: 36 },
    fontSize: { xs: '1rem', md: '0.875rem' },
    textTransform: 'none',
  }}
>
  Opprett nytt anbud
</Button>

<Stack direction="row" spacing={2}>
  <Button variant="outlined">Avbryt</Button>
  <Button variant="contained">Lagre</Button>
</Stack>`,
    },
    {
        title: "Code Organization (CODE_ORGANIZATION.md)",
        code: `// ✅ Good: Extracted components
import { SupplierInvitationSection } from '../components/features/tender/SupplierInvitationSection'
import { useSupplierInvitation } from '../hooks/useSupplierInvitation'

const TenderCreate = () => {
  const { suppliers, addSupplier } = useSupplierInvitation()
  return <SupplierInvitationSection suppliers={suppliers} />
}`,
    },
];

/**
 * Test categories for the compliance testing
 */
export const TEST_CATEGORIES = [
    { id: "all", label: "Kjør alle tester", description: "Full test suite" },
    { id: "projects", label: "Prosjekter", description: "Test prosjekt CRUD" },
    { id: "tenders", label: "Anskaffelser", description: "Test anskaffelse operasjoner" },
    { id: "qa", label: "Spørsmål & Svar", description: "Test Q&A funksjonalitet" },
    { id: "documents", label: "Dokumenter", description: "Test fil håndtering" },
    { id: "contracts", label: "Kontrakter", description: "Test kontrakt generering" },
    { id: "suppliers", label: "Leverandører", description: "Test invitasjoner" },
    { id: "adminleverandor", label: "Admin Leverandør", description: "Test admin leverandør rettigheter" },
    { id: "complaints", label: "Klager", description: "Test klagehåndtering" },
    { id: "adminanskaffelse", label: "Admin Anskaffelse", description: "Test admin anskaffelse rettigheter" },
    { id: "brreg", label: "Brønnøysund", description: "Test org.nr søk" },
];

