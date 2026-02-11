# Code Analysis: TenderDetails.jsx

## 1. Summary of Issues Found

### Critical Bugs (Will Cause Runtime Errors)
- **Missing `handleGenerateContract` function** - Referenced on line 538 but never defined, will cause "Cannot read property of undefined" error
- **Broken `handleDownloadDocument` function** - Creates empty blob, downloads nothing (line 314)

### State & Async Issues
- **Missing dependency in useEffect** - Contract loading effect missing `loadTender` dependency (line 126)
- **Potential race condition** - Contract loading doesn't check if tender exists before loading
- **Missing error handling** - Contract loading silently fails without user feedback

### Performance Issues
- **No memoization** - Expensive computations like `userInvitation` and `userBid` recalculate on every render
- **Inefficient re-renders** - Multiple state updates trigger unnecessary re-renders
- **Missing React.memo** - Child components re-render unnecessarily

### MUI & Styling Issues
- **Inconsistent breakpoint usage** - Mix of `xs`, `sm`, `md` without clear pattern
- **Missing key props** - Some list items may be missing keys (though most have them)
- **Accessibility** - Missing ARIA labels on some interactive elements

### Code Quality Issues
- **Large component** - 1029 lines, should be split into smaller components
- **Duplicate logic** - Similar error handling patterns repeated
- **Inconsistent naming** - Mix of camelCase and inconsistent patterns

---

## 2. Deep Explanation of Each Problem

### 2.1 Missing `handleGenerateContract` Function (CRITICAL)

**Location:** Line 538

**Problem:**
```jsx
onClick={handleGenerateContract}  // ❌ Function doesn't exist
```

**Why it happens:**
The function is referenced in the JSX but was never defined. When a user clicks the "Generer kontrakt" button, React will throw:
```
TypeError: handleGenerateContract is not a function
```

This will crash the component and potentially freeze the UI if error boundaries don't catch it.

**Impact:** 
- Complete UI freeze when clicking contract generation button
- User cannot generate contracts
- Error may not be caught by error boundary

---

### 2.2 Broken `handleDownloadDocument` Function

**Location:** Lines 313-323

**Problem:**
```jsx
const handleDownloadDocument = (doc) => {
    const blob = new Blob([], { type: doc.type || "application/octet-stream" });  // ❌ Empty array
    // ... rest of code
};
```

**Why it happens:**
The function creates an empty blob (`[]`), so the downloaded file will always be 0 bytes. The document data is never fetched from storage.

**Impact:**
- Users download empty/corrupted files
- No error feedback to user
- Wasted user time and frustration

---

### 2.3 Missing Dependency in useEffect

**Location:** Lines 118-126

**Problem:**
```jsx
useEffect(() => {
    const loadContract = async () => {
        if (tender?.id) {
            const contractData = await getContractByTenderId(tender.id);
            setContract(contractData);
        }
    };
    loadContract();
}, [tender?.id]);  // ❌ Missing loadTender dependency
```

**Why it happens:**
If `tender` changes but `tender.id` stays the same, the contract won't reload. Also, if the contract needs to be refreshed after tender updates, it won't happen automatically.

**Impact:**
- Stale contract data displayed
- Contract may not update after tender changes
- Inconsistent UI state

---

### 2.4 No Memoization for Expensive Computations

**Location:** Lines 101-112

**Problem:**
```jsx
const userEmailNormalized = user?.email?.toLowerCase().trim();
const userInvitation = tender?.invitedSuppliers?.find(
    (inv) =>
        inv.supplierId === user?.id ||
        (userEmailNormalized &&
            inv.email?.toLowerCase().trim() === userEmailNormalized)
);
const userBid = tender?.bids?.find(
    (bid) => bid.supplierId === user?.id || bid.companyId === user?.companyId
);
```

**Why it happens:**
These computations run on every render, even when `user`, `tender.invitedSuppliers`, or `tender.bids` haven't changed. For large arrays, this causes performance degradation.

**Impact:**
- Unnecessary CPU usage
- Slower renders, especially with many suppliers/bids
- Battery drain on mobile devices
- UI may feel sluggish

---

### 2.5 Potential Race Condition in Contract Loading

**Location:** Lines 118-126

**Problem:**
```jsx
useEffect(() => {
    const loadContract = async () => {
        if (tender?.id) {  // ❌ tender might be null initially
            const contractData = await getContractByTenderId(tender.id);
            setContract(contractData);
        }
    };
    loadContract();
}, [tender?.id]);
```

**Why it happens:**
If `tender` is `null` initially but then becomes available, the effect may run before `tender` is fully loaded, or multiple async calls might race.

**Impact:**
- Inconsistent contract state
- Potential memory leaks if component unmounts during async call
- Race conditions in state updates

---

### 2.6 Missing Error Handling

**Location:** Lines 118-126

**Problem:**
```jsx
useEffect(() => {
    const loadContract = async () => {
        if (tender?.id) {
            const contractData = await getContractByTenderId(tender.id);
            setContract(contractData);  // ❌ No error handling
        }
    };
    loadContract();
}, [tender?.id]);
```

**Why it happens:**
If `getContractByTenderId` throws an error or returns null unexpectedly, the user gets no feedback and the UI may show incorrect state.

**Impact:**
- Silent failures
- Poor user experience
- Difficult to debug issues

---

### 2.7 Large Component Size

**Location:** Entire file (1029 lines)

**Problem:**
The component handles too many responsibilities:
- Data loading
- Multiple dialogs
- Form handling
- Document management
- Q&A management
- Bid comparison
- Contract generation

**Why it happens:**
Feature creep without refactoring. Each new feature was added to the same component.

**Impact:**
- Difficult to maintain
- Hard to test
- High cognitive load
- More prone to bugs
- Slower development

---

## 3. Fixed & Improved Code (Full File)

```jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
    Box,
    Typography,
    Paper,
    Button,
    Grid,
    Chip,
    Alert,
    alpha,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Snackbar,
    Breadcrumbs,
    Link,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";
import {
    addQuestionToTender,
    answerQuestion,
    addDocumentsToTender,
    removeDocumentFromTender,
    awardTender,
    closeTender,
    openTender,
    deleteTender,
} from "../api/tenderService";
import { generateContract, getContractByTenderId } from "../api/contractService";
import { isStandstillPeriodEnded } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { useTenderDetailsPage } from "../hooks";
import { StatusChip, DateDisplay } from "../components/common";
import {
    BidComparison,
    AskQuestionForm,
    AnswerQuestionForm,
    TenderDetailsSkeleton,
    TenderNotFound,
    TenderInfoSidebar,
    TenderDocumentsSection,
    SupplierBidSummary,
    StandstillPeriod,
} from "../components/features/tender";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import BusinessIcon from "@mui/icons-material/Business";
import SendIcon from "@mui/icons-material/Send";
import DescriptionIcon from "@mui/icons-material/Description";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeIcon from "@mui/icons-material/Home";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { exportBidComparisonToPDF, exportBidComparisonToExcel } from "../utils";

const TenderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const theme = useTheme();

    // Use custom hook for data loading
    const { tender, project, createdByUser, loading, loadTender } =
        useTenderDetailsPage(id);

    // Local state for UI interactions
    const [awarding, setAwarding] = useState(false);
    const [awardError, setAwardError] = useState("");
    const [qaError, setQaError] = useState("");
    const [showAwardDialog, setShowAwardDialog] = useState(false);
    const [awardBidId, setAwardBidId] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
    const [documentError, setDocumentError] = useState("");
    const [uploadingDocuments, setUploadingDocuments] = useState(false);
    const [showDeleteDocDialog, setShowDeleteDocDialog] = useState(false);
    const [docToDelete, setDocToDelete] = useState(null);
    const [showCloseDialog, setShowCloseDialog] = useState(false);
    const [showReopenDialog, setShowReopenDialog] = useState(false);
    const [changingStatus, setChangingStatus] = useState(false);
    const [statusError, setStatusError] = useState("");
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletingTender, setDeletingTender] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [generatingContract, setGeneratingContract] = useState(false);
    const [contractError, setContractError] = useState("");

    // Contract state
    const [contract, setContract] = useState(null);
    const [contractLoading, setContractLoading] = useState(false);

    // User role checks - memoized
    const isSender = useMemo(() => user?.role === "sender", [user?.role]);
    const isAdmin = useMemo(() => user?.isAdmin === true, [user?.isAdmin]);

    // Memoized user invitation check - expensive computation
    const userInvitation = useMemo(() => {
        if (!tender?.invitedSuppliers || !user) return null;
        
        const userEmailNormalized = user.email?.toLowerCase().trim();
        return tender.invitedSuppliers.find(
            (inv) =>
                inv.supplierId === user.id ||
                (userEmailNormalized &&
                    inv.email?.toLowerCase().trim() === userEmailNormalized)
        ) || null;
    }, [tender?.invitedSuppliers, user?.id, user?.email]);

    // Memoized user bid check
    const userBid = useMemo(() => {
        if (!tender?.bids || !user) return null;
        return tender.bids.find(
            (bid) => bid.supplierId === user.id || bid.companyId === user.companyId
        ) || null;
    }, [tender?.bids, user?.id, user?.companyId]);

    // Load contract when tender is available - FIXED: Added proper error handling and dependency
    useEffect(() => {
        let isMounted = true;

        const loadContract = async () => {
            if (!tender?.id) {
                setContract(null);
                return;
            }

            setContractLoading(true);
            setContractError("");

            try {
                const contractData = await getContractByTenderId(tender.id);
                if (isMounted) {
                    setContract(contractData);
                }
            } catch (error) {
                console.error("Error loading contract:", error);
                if (isMounted) {
                    setContractError("Kunne ikke laste kontrakt. Prøv å oppdatere siden.");
                    setContract(null);
                }
            } finally {
                if (isMounted) {
                    setContractLoading(false);
                }
            }
        };

        loadContract();

        return () => {
            isMounted = false;
        };
    }, [tender?.id, loadTender]);

    // Handlers - memoized with useCallback to prevent unnecessary re-renders
    const handleAwardClick = useCallback((bidId) => {
        setAwardBidId(bidId);
        setShowAwardDialog(true);
    }, []);

    const handleAwardConfirm = useCallback(async () => {
        if (!awardBidId || !tender) return;

        setShowAwardDialog(false);
        setAwarding(true);
        setAwardError("");

        try {
            const result = await awardTender(tender.id, awardBidId, project);

            if (!result.success) {
                setAwardError(result.error || "Kunne ikke tildele kontrakt. Prøv igjen.");
                return;
            }

            await loadTender();
            setSuccessMessage("Kontrakt tildelt!");
            setShowSuccessSnackbar(true);
            setAwardBidId(null);
        } catch (error) {
            console.error("Error awarding tender:", error);
            setAwardError("Kunne ikke tildele kontrakt. Prøv igjen.");
        } finally {
            setAwarding(false);
        }
    }, [awardBidId, tender, project, loadTender]);

    const handleCloseClick = useCallback(() => {
        setShowCloseDialog(true);
    }, []);

    const handleCloseConfirm = useCallback(async () => {
        if (!tender) return;

        setShowCloseDialog(false);
        setChangingStatus(true);
        setStatusError("");

        try {
            const result = await closeTender(tender.id);

            if (!result.success) {
                setStatusError(result.error || "Kunne ikke lukke Anskaffelse. Prøv igjen.");
                return;
            }

            await loadTender();
            setSuccessMessage("Anskaffelse er lukket!");
            setShowSuccessSnackbar(true);
        } catch (error) {
            console.error("Error closing tender:", error);
            setStatusError("Kunne ikke lukke Anskaffelse. Prøv igjen.");
        } finally {
            setChangingStatus(false);
        }
    }, [tender, loadTender]);

    const handlePublishClick = useCallback(async () => {
        if (!tender) return;

        setChangingStatus(true);
        setStatusError("");

        try {
            const result = await openTender(tender.id);

            if (!result.success) {
                setStatusError(result.error || "Kunne ikke publisere Anskaffelse. Prøv igjen.");
                return;
            }

            await loadTender();
            setSuccessMessage("Anskaffelse er publisert!");
            setShowSuccessSnackbar(true);
        } catch (error) {
            console.error("Error publishing tender:", error);
            setStatusError("Kunne ikke publisere Anskaffelse. Prøv igjen.");
        } finally {
            setChangingStatus(false);
        }
    }, [tender, loadTender]);

    const handleReopenClick = useCallback(() => {
        setShowReopenDialog(true);
    }, []);

    const handleReopenConfirm = useCallback(async () => {
        if (!tender) return;

        setShowReopenDialog(false);
        setChangingStatus(true);
        setStatusError("");

        try {
            const result = await openTender(tender.id);

            if (!result.success) {
                setStatusError(result.error || "Kunne ikke gjenåpne Anskaffelse. Prøv igjen.");
                return;
            }

            await loadTender();
            setSuccessMessage("Anskaffelse er gjenåpnet!");
            setShowSuccessSnackbar(true);
        } catch (error) {
            console.error("Error reopening tender:", error);
            setStatusError("Kunne ikke gjenåpne Anskaffelse. Prøv igjen.");
        } finally {
            setChangingStatus(false);
        }
    }, [tender, loadTender]);

    const handleDeleteClick = useCallback(() => {
        setShowDeleteDialog(true);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!tender) return;

        setShowDeleteDialog(false);
        setDeletingTender(true);
        setDeleteError("");

        try {
            const result = await deleteTender(tender.id);

            if (!result.success) {
                setDeleteError(result.error || "Kunne ikke slette Anskaffelse. Prøv igjen.");
                return;
            }

            setSuccessMessage("Anskaffelse slettet!");
            setShowSuccessSnackbar(true);
            // Navigate back to tenders list after a short delay
            setTimeout(() => {
                navigate("/tenders");
            }, 1500);
        } catch (error) {
            console.error("Error deleting tender:", error);
            setDeleteError("Kunne ikke slette Anskaffelse. Prøv igjen.");
        } finally {
            setDeletingTender(false);
        }
    }, [tender, navigate]);

    const handleDeleteCancel = useCallback(() => {
        setShowDeleteDialog(false);
    }, []);

    const handleAddQuestion = useCallback(async (questionText) => {
        if (!user || !tender) return;

        setQaError("");
        try {
            const result = await addQuestionToTender(tender.id, questionText, user);

            if (!result.success) {
                setQaError(result.error || "Kunne ikke legge til spørsmål");
                throw new Error(result.error);
            }

            await loadTender();
            setSuccessMessage("Spørsmål sendt!");
            setShowSuccessSnackbar(true);
        } catch (error) {
            console.error("Error adding question:", error);
            setQaError(error.message || "Kunne ikke legge til spørsmål");
        }
    }, [user, tender, loadTender]);

    const handleAnswerQuestion = useCallback(async (questionId, answerText) => {
        if (!user || !tender) return;

        setQaError("");
        try {
            const result = await answerQuestion(tender.id, questionId, answerText, user);

            if (!result.success) {
                setQaError(result.error || "Kunne ikke besvare spørsmål");
                throw new Error(result.error);
            }

            await loadTender();
            setSuccessMessage("Svar sendt!");
            setShowSuccessSnackbar(true);
        } catch (error) {
            console.error("Error answering question:", error);
            setQaError(error.message || "Kunne ikke besvare spørsmål");
        }
    }, [user, tender, loadTender]);

    // FIXED: Proper document download implementation
    const handleDownloadDocument = useCallback(async (doc) => {
        if (!doc || !doc.url) {
            setDocumentError("Dokument URL mangler. Kan ikke laste ned.");
            return;
        }

        try {
            // Fetch the document from the URL
            const response = await fetch(doc.url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = doc.name || "document";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the object URL after a delay
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 100);
        } catch (error) {
            console.error("Error downloading document:", error);
            setDocumentError("Kunne ikke laste ned dokument. Prøv igjen.");
        }
    }, []);

    const handleAddDocuments = useCallback(async (newDocuments) => {
        if (!tender || !user) return;

        setDocumentError("");
        setUploadingDocuments(true);

        try {
            const result = await addDocumentsToTender(tender.id, newDocuments, user);

            if (!result.success) {
                setDocumentError(result.error || "Kunne ikke legge til dokumenter");
                return;
            }

            await loadTender();
            setSuccessMessage("Dokumenter lagt til!");
            setShowSuccessSnackbar(true);
        } catch (error) {
            console.error("Error adding documents:", error);
            setDocumentError("Kunne ikke legge til dokumenter. Prøv igjen.");
        } finally {
            setUploadingDocuments(false);
        }
    }, [tender, user, loadTender]);

    const handleRemoveDocumentClick = useCallback((doc) => {
        setDocToDelete(doc);
        setShowDeleteDocDialog(true);
    }, []);

    const handleRemoveDocumentConfirm = useCallback(async () => {
        if (!tender || !docToDelete) return;

        setShowDeleteDocDialog(false);
        setDocumentError("");

        try {
            const result = await removeDocumentFromTender(tender.id, docToDelete.id);

            if (!result.success) {
                setDocumentError(result.error || "Kunne ikke fjerne dokument");
                return;
            }

            await loadTender();
            setSuccessMessage("Dokument fjernet!");
            setShowSuccessSnackbar(true);
            setDocToDelete(null);
        } catch (error) {
            console.error("Error removing document:", error);
            setDocumentError("Kunne ikke fjerne dokument. Prøv igjen.");
        }
    }, [tender, docToDelete, loadTender]);

    // FIXED: Added missing handleGenerateContract function
    const handleGenerateContract = useCallback(async () => {
        if (!tender || !project || !tender.awardedBidId) {
            setContractError("Mangler informasjon for å generere kontrakt.");
            return;
        }

        const awardedBid = tender.bids?.find((bid) => bid.id === tender.awardedBidId);
        if (!awardedBid) {
            setContractError("Tildelt tilbud ikke funnet.");
            return;
        }

        setGeneratingContract(true);
        setContractError("");

        try {
            const result = await generateContract(tender, awardedBid, project);

            if (!result.success) {
                setContractError(result.error || "Kunne ikke generere kontrakt. Prøv igjen.");
                return;
            }

            // Reload contract and tender to get updated state
            await loadTender();
            const contractData = await getContractByTenderId(tender.id);
            setContract(contractData);

            setSuccessMessage("Kontrakt generert!");
            setShowSuccessSnackbar(true);
        } catch (error) {
            console.error("Error generating contract:", error);
            setContractError("Kunne ikke generere kontrakt. Prøv igjen.");
        } finally {
            setGeneratingContract(false);
        }
    }, [tender, project, loadTender]);

    // Loading state
    if (loading) {
        return <TenderDetailsSkeleton />;
    }

    // Not found state
    if (!tender) {
        return <TenderNotFound />;
    }

    // Memoized unanswered questions count
    const unansweredQuestionsCount = useMemo(() => {
        return tender.qa?.filter((q) => !q.answer).length || 0;
    }, [tender.qa]);

    // Memoized sorted Q&A
    const sortedQA = useMemo(() => {
        if (!tender.qa) return [];
        return [...tender.qa].sort(
            (a, b) => new Date(b.askedAt) - new Date(a.askedAt)
        );
    }, [tender.qa]);

    return (
        <Box component="main" role="main" aria-label="Anskaffelse detaljer">
            {/* Breadcrumbs */}
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                aria-label="Navigasjonssti"
                sx={{ mb: 3 }}
            >
                <Link
                    component="button"
                    variant="body2"
                    onClick={() => navigate("/dashboard")}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        textDecoration: "none",
                        color: "text.secondary",
                        cursor: "pointer",
                        "&:hover": { textDecoration: "underline", color: "primary.main" },
                    }}
                >
                    <HomeIcon fontSize="small" />
                    Dashboard
                </Link>
                <Link
                    component="button"
                    variant="body2"
                    onClick={() => navigate("/tenders")}
                    sx={{
                        textDecoration: "none",
                        color: "text.secondary",
                        cursor: "pointer",
                        "&:hover": { textDecoration: "underline", color: "primary.main" },
                    }}
                >
                    Anskaffelser
                </Link>
                <Typography variant="body2" color="text.primary">
                    {tender.title}
                </Typography>
            </Breadcrumbs>

            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 4,
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                }}
            >
                <Box sx={{ flex: 1 }}>
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        sx={{
                            fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
                            fontWeight: 600,
                            mb: 1,
                        }}
                    >
                        {tender.title}
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                        <StatusChip status={tender.status} size="medium" />
                        {isSender && tender.status === "draft" && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handlePublishClick}
                                disabled={changingStatus}
                                sx={{ mt: { xs: 1, sm: 0 } }}
                            >
                                Publiser Anskaffelse
                            </Button>
                        )}
                        {isSender && tender.status === "open" && (
                            <Button
                                variant="outlined"
                                color="warning"
                                onClick={handleCloseClick}
                                disabled={changingStatus}
                                sx={{ mt: { xs: 1, sm: 0 } }}
                            >
                                Lukk Anskaffelse
                            </Button>
                        )}
                        {isSender && tender.status === "closed" && (
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={handleReopenClick}
                                disabled={changingStatus}
                                sx={{ mt: { xs: 1, sm: 0 } }}
                            >
                                Gjenåpne
                            </Button>
                        )}
                        {(isSender || isAdmin) && (
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={handleDeleteClick}
                                disabled={deletingTender}
                                sx={{ mt: { xs: 1, sm: 0 } }}
                            >
                                Slett Anskaffelse
                            </Button>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Error Alerts */}
            {awardError && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setAwardError("")}>
                    {awardError}
                </Alert>
            )}

            {statusError && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setStatusError("")}>
                    {statusError}
                </Alert>
            )}

            {deleteError && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setDeleteError("")}>
                    {deleteError}
                </Alert>
            )}

            {contractError && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setContractError("")}>
                    {contractError}
                </Alert>
            )}

            {/* Standstill Period Alert */}
            {tender.status === "awarded" && <StandstillPeriod tender={tender} />}

            {/* Contract Generation Button - Show after standstill period ends */}
            {tender.status === "awarded" && 
             isSender && 
             !contract && 
             tender.standstillEndDate && 
             isStandstillPeriodEnded(tender.standstillEndDate) && (
                <Alert 
                    severity="info" 
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={handleGenerateContract}
                            disabled={generatingContract || contractLoading}
                        >
                            {generatingContract ? "Genererer..." : "Generer kontrakt"}
                        </Button>
                    }
                    sx={{ mb: 3 }}
                >
                    Ventetiden er utløpt. Du kan nå generere kontrakten.
                </Alert>
            )}

            <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
                <Grid item xs={12} md={8}>
                    {/* Description */}
                    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                            <DescriptionIcon sx={{ color: "primary.main" }} />
                            <Typography component="h2" variant="h6" sx={{ fontWeight: 600 }}>
                                Beskrivelse
                            </Typography>
                        </Box>
                        <Typography variant="body1" color="text.secondary">
                            {tender.description || "Ingen beskrivelse tilgjengelig"}
                        </Typography>
                    </Paper>

                    {/* Documents */}
                    <TenderDocumentsSection
                        tender={tender}
                        isSender={isSender}
                        userInvitation={userInvitation}
                        documentError={documentError}
                        uploadingDocuments={uploadingDocuments}
                        loading={loading}
                        onAddDocuments={handleAddDocuments}
                        onRemoveDocument={handleRemoveDocumentClick}
                        onDownloadDocument={handleDownloadDocument}
                    />

                    {/* Ask Question Form - Only visible to invited suppliers when tender is open */}
                    {!isSender && userInvitation && tender.status === "open" && (
                        <AskQuestionForm
                            tenderId={tender.id}
                            onQuestionAdded={handleAddQuestion}
                            loading={loading}
                        />
                    )}
                    {!isSender && userInvitation && tender.status === "draft" && (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Anskaffelsen er ikke publisert ennå. Du kan stille spørsmål når den er publisert.
                        </Alert>
                    )}

                    {/* Q&A Section */}
                    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                            <DescriptionIcon sx={{ color: "primary.main" }} />
                            <Typography component="h2" variant="h6" sx={{ fontWeight: 600 }}>
                                Spørsmål og svar
                            </Typography>
                            {sortedQA.length > 0 && (
                                <Chip label={sortedQA.length} size="small" color="primary" />
                            )}
                        </Box>

                        {qaError && (
                            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setQaError("")}>
                                {qaError}
                            </Alert>
                        )}

                        {/* Unanswered questions for senders - Only when tender is open */}
                        {isSender && tender.status === "open" && unansweredQuestionsCount > 0 && (
                            <Box
                                sx={{
                                    mb: 3,
                                    p: 2,
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                    <Chip
                                        label={unansweredQuestionsCount}
                                        size="small"
                                        color="info"
                                    />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        Ubesvarte spørsmål
                                    </Typography>
                                </Box>
                                {sortedQA
                                    .filter((q) => !q.answer)
                                    .map((question) => (
                                        <AnswerQuestionForm
                                            key={question.id}
                                            question={question}
                                            onAnswerSubmitted={handleAnswerQuestion}
                                            loading={loading}
                                        />
                                    ))}
                            </Box>
                        )}
                        {isSender && tender.status === "draft" && unansweredQuestionsCount > 0 && (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Du kan ikke besvare spørsmål før Anskaffelsen er publisert. Publiser Anskaffelsen først.
                            </Alert>
                        )}

                        {/* All Q&A */}
                        {sortedQA.length > 0 ? (
                            <List>
                                {sortedQA.map((qa) => (
                                    <ListItem key={qa.id}>
                                        <ListItemText
                                            primary={qa.question}
                                            primaryTypographyProps={{ variant: 'body1', sx: { fontWeight: 500, mb: 1 } }}
                                            secondary={
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'block' }}>
                                                        <strong>Spurt av:</strong> {qa.askedByCompany || "Ukjent"}
                                                    </Typography>
                                                    {qa.askedAt && (
                                                        <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block' }}>
                                                            Spurt: <DateDisplay date={qa.askedAt} />
                                                        </Typography>
                                                    )}
                                                    {qa.answer && (
                                                        <Typography
                                                            variant="body2"
                                                            component="div"
                                                            sx={{
                                                                mt: 1,
                                                                p: 1.5,
                                                                backgroundColor: alpha(theme.palette.success.main, 0.1),
                                                                borderRadius: 1,
                                                                border: 1,
                                                                borderColor: alpha(theme.palette.success.main, 0.3),
                                                            }}
                                                        >
                                                            <strong>Svar:</strong> {qa.answer}
                                                        </Typography>
                                                    )}
                                                    {!qa.answer && (
                                                        <Chip
                                                            label="Venter på svar"
                                                            size="small"
                                                            color="warning"
                                                            sx={{ mt: 1 }}
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            secondaryTypographyProps={{ component: 'div' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                                Ingen spørsmål ennå
                            </Typography>
                        )}
                    </Paper>

                    {/* Bids Section - Only for senders */}
                    {isSender && tender.bids?.length > 0 && (
                        <Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 2,
                                    flexWrap: "wrap",
                                    gap: 2,
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Tilbudssammenligning
                                </Typography>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<FileDownloadIcon />}
                                        onClick={() => exportBidComparisonToPDF(tender, tender.bids, project)}
                                        sx={{
                                            textTransform: "none",
                                            fontSize: {
                                                xs: "1rem",
                                                sm: "0.875rem",
                                            },
                                        }}
                                    >
                                        PDF
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<FileDownloadIcon />}
                                        onClick={() => exportBidComparisonToExcel(tender, tender.bids, project)}
                                        sx={{
                                            textTransform: "none",
                                            fontSize: {
                                                xs: "1rem",
                                                sm: "0.875rem",
                                            },
                                        }}
                                    >
                                        Excel
                                    </Button>
                                </Box>
                            </Box>
                            <BidComparison
                                bids={tender.bids}
                                onAward={handleAwardClick}
                                awardedBidId={tender.awardedBidId}
                                awarding={awarding}
                            />
                        </Box>
                    )}

                    {/* Supplier's own bid summary */}
                    {userBid && !isSender && (
                        <SupplierBidSummary bid={userBid} tender={tender} />
                    )}

                    {/* Supplier invitation status */}
                    {userInvitation && !isSender && (
                        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 2 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    mb: 2,
                                    flexWrap: "wrap",
                                    gap: 2,
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <PersonIcon color="primary" />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Din invitasjon
                                    </Typography>
                                </Box>
                                {!userBid && new Date(tender.deadline) >= new Date() && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<SendIcon />}
                                        onClick={() => navigate(`/tenders/${id}/bid`)}
                                    >
                                        Send inn tilbud
                                    </Button>
                                )}
                                {userBid && <Chip label="Tilbud sendt inn" color="success" />}
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Status
                                    </Typography>
                                    <Chip
                                        label={userInvitation.status || "invited"}
                                        size="small"
                                        color={
                                            userInvitation.status === "submitted"
                                                ? "success"
                                                : userInvitation.status === "viewed"
                                                ? "info"
                                                : "default"
                                        }
                                        sx={{ mt: 0.5 }}
                                    />
                                </Box>
                                {userInvitation.invitedAt && (
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Invitert
                                        </Typography>
                                        <DateDisplay date={userInvitation.invitedAt} variant="body1" />
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    )}

                    {/* Invited Suppliers - For senders */}
                    {isSender && tender.invitedSuppliers?.length > 0 && (
                        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                <BusinessIcon sx={{ color: "primary.main" }} />
                                <Typography component="h2" variant="h6" sx={{ fontWeight: 600 }}>
                                    Inviterte leverandører
                                </Typography>
                                <Chip
                                    label={tender.invitedSuppliers.length}
                                    size="small"
                                    color="primary"
                                />
                            </Box>
                            <List>
                                {tender.invitedSuppliers.map((supplier) => (
                                    <ListItem key={supplier.email || supplier.supplierId || `supplier-${supplier.id}`}>
                                        <ListItemText
                                            primary={supplier.companyName}
                                            secondary={
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                    <EmailIcon fontSize="small" />
                                                    {supplier.email}
                                                </Box>
                                            }
                                        />
                                        <Chip
                                            label={supplier.status || "invited"}
                                            size="small"
                                            color={
                                                supplier.status === "submitted"
                                                    ? "success"
                                                    : supplier.status === "viewed"
                                                    ? "info"
                                                    : "default"
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    )}
                </Grid>

                {/* Sidebar */}
                <Grid item xs={12} md={4}>
                    <TenderInfoSidebar
                        tender={tender}
                        project={project}
                        createdByUser={createdByUser}
                        contract={contract}
                        isSender={isSender}
                        isAdmin={isAdmin}
                    />
                </Grid>
            </Grid>

            {/* Award Confirmation Dialog */}
            <Dialog open={showAwardDialog} onClose={() => setShowAwardDialog(false)}>
                <DialogTitle>Tildele kontrakt</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Er du sikker på at du vil tildele kontrakten til denne leverandøren?
                        Denne handlingen kan ikke angres.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setShowAwardDialog(false); setAwardBidId(null); }}>
                        Avbryt
                    </Button>
                    <Button
                        onClick={handleAwardConfirm}
                        variant="contained"
                        color="primary"
                        disabled={awarding}
                    >
                        {awarding ? "Tildeler..." : "Tildele"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Document Dialog */}
            <Dialog
                open={showDeleteDocDialog}
                onClose={() => { setShowDeleteDocDialog(false); setDocToDelete(null); }}
            >
                <DialogTitle>Slett dokument</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Er du sikker på at du vil slette &quot;{docToDelete?.name}&quot;?
                        Denne handlingen kan ikke angres.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setShowDeleteDocDialog(false); setDocToDelete(null); }}>
                        Avbryt
                    </Button>
                    <Button
                        onClick={handleRemoveDocumentConfirm}
                        variant="contained"
                        color="error"
                        disabled={uploadingDocuments}
                    >
                        {uploadingDocuments ? "Sletter..." : "Slett"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Close Tender Confirmation Dialog */}
            <Dialog open={showCloseDialog} onClose={() => setShowCloseDialog(false)}>
                <DialogTitle>Lukk Anskaffelse</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Er du sikker på at du vil lukke denne anskaffelsen? Leverandører vil ikke lenger kunne sende inn tilbud.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowCloseDialog(false)}>
                        Avbryt
                    </Button>
                    <Button
                        onClick={handleCloseConfirm}
                        variant="contained"
                        color="warning"
                        disabled={changingStatus}
                    >
                        {changingStatus ? "Lukker..." : "Lukk"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reopen Tender Confirmation Dialog */}
            <Dialog open={showReopenDialog} onClose={() => setShowReopenDialog(false)}>
                <DialogTitle>Gjenåpne Anskaffelse</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Er du sikker på at du vil gjenåpne denne anskaffelsen? Leverandører vil igjen kunne sende inn tilbud.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowReopenDialog(false)}>
                        Avbryt
                    </Button>
                    <Button
                        onClick={handleReopenConfirm}
                        variant="contained"
                        color="primary"
                        disabled={changingStatus}
                    >
                        {changingStatus ? "Gjenåpner..." : "Gjenåpne"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Tender Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onClose={handleDeleteCancel}>
                <DialogTitle>Slett Anskaffelse</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Er du sikker på at du vil slette &quot;{tender?.title}&quot;?
                        Denne handlingen kan ikke angres.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} disabled={deletingTender}>
                        Avbryt
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        color="error"
                        disabled={deletingTender}
                    >
                        {deletingTender ? "Sletter..." : "Slett"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success Snackbar */}
            <Snackbar
                open={showSuccessSnackbar}
                autoHideDuration={4000}
                onClose={() => setShowSuccessSnackbar(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert onClose={() => setShowSuccessSnackbar(false)} severity="success">
                    {successMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TenderDetails;
```

---

## 4. Optional Improvements / Best Practices

### 4.1 Component Splitting

**Recommendation:** Split into smaller components:
- `TenderDetailsHeader.jsx` - Header with title and action buttons
- `TenderQASection.jsx` - Q&A section
- `TenderBidsSection.jsx` - Bids comparison section
- `TenderDialogs.jsx` - All dialog components
- `TenderActions.jsx` - Action buttons and handlers

**Benefits:**
- Easier to test
- Better code organization
- Reusability
- Smaller bundle size per component

### 4.2 Custom Hooks

**Recommendation:** Extract logic into custom hooks:
- `useTenderActions.js` - Award, close, reopen, delete handlers
- `useTenderDocuments.js` - Document upload/download logic
- `useTenderQA.js` - Q&A management
- `useTenderContract.js` - Contract generation logic

**Benefits:**
- Separation of concerns
- Reusability
- Easier testing
- Better performance (hooks can be memoized)

### 4.3 Error Boundary

**Recommendation:** Wrap component in error boundary:
```jsx
<ErrorBoundary fallback={<TenderDetailsError />}>
    <TenderDetails />
</ErrorBoundary>
```

**Benefits:**
- Prevents entire app crash
- Better error recovery
- User-friendly error messages

### 4.4 Loading States

**Recommendation:** Add skeleton loaders for individual sections:
- Contract loading skeleton
- Documents loading skeleton
- Bids loading skeleton

**Benefits:**
- Better perceived performance
- Clear loading feedback
- Professional UX

### 4.5 Accessibility Improvements

**Recommendation:**
- Add `aria-live` regions for dynamic content
- Add `aria-busy` to loading states
- Improve keyboard navigation
- Add focus management for dialogs

**Benefits:**
- WCAG compliance
- Better screen reader support
- Improved usability

### 4.6 Performance Optimizations

**Recommendation:**
- Use `React.memo` for child components
- Implement virtual scrolling for long lists
- Lazy load heavy components
- Debounce search/filter inputs

**Benefits:**
- Faster renders
- Better mobile performance
- Reduced memory usage

### 4.7 TypeScript Migration

**Recommendation:** Migrate to TypeScript for:
- Type safety
- Better IDE support
- Catch errors at compile time
- Better documentation

**Benefits:**
- Fewer runtime errors
- Better developer experience
- Self-documenting code

---

## Summary

The main issues were:
1. **Critical:** Missing `handleGenerateContract` function causing runtime errors
2. **Critical:** Broken document download creating empty files
3. **Performance:** Missing memoization causing unnecessary re-renders
4. **State Management:** Missing dependencies and error handling in useEffect
5. **Code Quality:** Component too large, needs refactoring

All critical bugs have been fixed in the provided code. The improvements focus on performance, maintainability, and user experience.










