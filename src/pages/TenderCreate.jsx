import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Paper,
    Button,
    Grid,
    Alert,
    Divider,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { createTender } from "../api/tenderService";
import {
    getProjectsByCompany,
    getProjectsByOwner,
} from "../api/projectService";
import { useSupplierInvitation } from "../hooks";
import {
    SupplierInvitationSection,
    QuestionsSection,
    CommonTenderFields,
    NS8405SpecificFields,
    NS8406SpecificFields,
    NS8407SpecificFields,
    DocumentUpload,
} from "../components/features";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";

const TenderCreate = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    // Form state
    const [formData, setFormData] = useState({
        projectId: searchParams.get("projectId") || "",
        title: "",
        description: "",
        contractStandard: "",
        deadline: "",
        publishDate: "",
        price: "",
        status: "draft", // 'draft' | 'open'
        // Common fields
        entrepriseform: "",
        cpv: "",
        questionDeadline: "",
        evaluationCriteria: [],
        // NS-specific fields (nested objects)
        ns8405: {},
        ns8406: {},
        ns8407: {},
    });

    // User projects state
    const [userProjects, setUserProjects] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(true);

    // Load user's projects
    useEffect(() => {
        const loadProjects = async () => {
            setLoadingProjects(true);
            try {
                if (!user?.id) {
                    setUserProjects([]);
                    setLoadingProjects(false);
                    return;
                }

                // Query projects by both companyId and ownerId to catch all cases
                const promises = [];

                // Query by companyId if available
                if (user.companyId) {
                    promises.push(
                        getProjectsByCompany(user.companyId, "active")
                    );
                }

                // Always query by ownerId as well
                promises.push(getProjectsByOwner(user.id, "active"));

                // Wait for all queries and combine results
                const results = await Promise.all(promises);
                const allProjects = results.flat();

                // Remove duplicates (same project might be returned from both queries)
                const uniqueProjects = allProjects.filter(
                    (project, index, self) =>
                        index === self.findIndex((p) => p.id === project.id)
                );

                // Sort by createdAt descending
                uniqueProjects.sort((a, b) => {
                    const dateA =
                        a.createdAt?.getTime?.() ||
                        new Date(a.createdAt).getTime() ||
                        0;
                    const dateB =
                        b.createdAt?.getTime?.() ||
                        new Date(b.createdAt).getTime() ||
                        0;
                    return dateB - dateA;
                });

                setUserProjects(uniqueProjects);
            } catch (error) {
                console.error("Error loading projects:", error);
                setUserProjects([]);
            }
            setLoadingProjects(false);
        };
        loadProjects();
    }, [user?.companyId, user?.id]);

    // Supplier invitation hook
    const {
        invitedSuppliers,
        supplierInput,
        searching,
        searchedCompany,
        supplierValidationError,
        handleSupplierInputChange,
        addSupplier,
        addSupplierDirectly,
        removeSupplier,
    } = useSupplierInvitation();

    // Handle quick invite from Suppliers page
    useEffect(() => {
        const quickInviteData = sessionStorage.getItem("quickInviteSupplier");
        if (quickInviteData) {
            try {
                const supplierData = JSON.parse(quickInviteData);
                // Add supplier directly
                const result = addSupplierDirectly(supplierData);
                if (result.success) {
                    // Clear sessionStorage after successful add
                    sessionStorage.removeItem("quickInviteSupplier");
                }
            } catch (error) {
                console.error("Error processing quick invite:", error);
                sessionStorage.removeItem("quickInviteSupplier");
            }
        }
    }, [addSupplierDirectly]);

    // Questions state
    const [questions, setQuestions] = useState([]);
    const [questionInput, setQuestionInput] = useState("");

    // Documents state
    const [documents, setDocuments] = useState([]);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;

        // Handle nested NS-specific fields (e.g., ns8405.dagmulktSats)
        if (name.includes(".")) {
            const [parentKey, childKey] = name.split(".");
            setFormData((prev) => ({
                ...prev,
                [parentKey]: {
                    ...(prev[parentKey] || {}),
                    [childKey]: value,
                },
            }));
        }
        // Handle evaluation criteria (already handled as array in CommonTenderFields)
        else if (name === "evaluationCriteria" && Array.isArray(value)) {
            setFormData((prev) => ({
                ...prev,
                evaluationCriteria: value,
            }));
        }
        // Handle regular fields
        else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }));
        }

        // Clear errors when user starts typing
        if (error) setError("");
        // Clear field-specific error
        if (fieldErrors[name]) {
            setFieldErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleAddSupplierClick = () => {
        const result = addSupplier();
        if (!result.success && result.error) {
            setError(result.error);
        }
    };

    const handleAddQuestion = () => {
        if (!questionInput.trim()) {
            setError("Vennligst skriv inn et spørsmål");
            return;
        }

        const newQuestion = {
            id: `question_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`,
            question: questionInput.trim(),
            answer: "",
            addedAt: new Date(),
        };

        setQuestions([...questions, newQuestion]);
        setQuestionInput("");
        if (error) setError("");
    };

    const handleRemoveQuestion = (questionId) => {
        setQuestions(questions.filter((q) => q.id !== questionId));
    };

    const handleSubmit = async (e, statusOverride = null) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        const finalStatus = statusOverride || formData.status;

        // Field-level validation
        const errors = {};
        let hasErrors = false;

        if (!formData.projectId) {
            errors.projectId = "Vennligst velg et prosjekt";
            hasErrors = true;
        }
        if (!formData.title.trim()) {
            errors.title = "Tittel er påkrevd";
            hasErrors = true;
        }
        if (!formData.contractStandard) {
            errors.contractStandard = "Kontraktstandard er påkrevd";
            hasErrors = true;
        }
        if (!formData.deadline) {
            errors.deadline = "Frist er påkrevd";
            hasErrors = true;
        } else if (new Date(formData.deadline) <= new Date()) {
            errors.deadline = "Frist må være i fremtiden";
            hasErrors = true;
        }
        if (
            formData.publishDate &&
            new Date(formData.publishDate) < new Date()
        ) {
            errors.publishDate = "Publiseringsdato kan ikke være i fortiden";
            hasErrors = true;
        }
        if (
            formData.publishDate &&
            formData.deadline &&
            new Date(formData.publishDate) >= new Date(formData.deadline)
        ) {
            errors.publishDate = "Publiseringsdato må være før frist";
            hasErrors = true;
        }
        if (
            formData.questionDeadline &&
            formData.deadline &&
            new Date(formData.questionDeadline) >= new Date(formData.deadline)
        ) {
            errors.questionDeadline = "Spørsmålfrist må være før tilbudsfrist";
            hasErrors = true;
        }
        if (
            formData.questionDeadline &&
            formData.publishDate &&
            new Date(formData.questionDeadline) < new Date(formData.publishDate)
        ) {
            errors.questionDeadline =
                "Spørsmålfrist kan ikke være før publiseringsdato";
            hasErrors = true;
        }

        if (hasErrors) {
            setFieldErrors(errors);
            // Scroll to first error field
            const firstErrorField = Object.keys(errors)[0];
            const errorElement = document.getElementById(firstErrorField);
            if (errorElement) {
                errorElement.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
                errorElement.focus();
            }
            return;
        }

        setFieldErrors({});

        setLoading(true);

        // Prepare tender data with suppliers and questions
        // Ensure invitedSuppliers is properly formatted
        const formattedInvitedSuppliers =
            Array.isArray(invitedSuppliers) && invitedSuppliers.length > 0
                ? invitedSuppliers.map((s) => ({
                      supplierId: s.id || null,
                      companyId: s.companyId || null,
                      companyName: s.companyName || "",
                      orgNumber: s.orgNumber || "",
                      email: s.email || "",
                      invitedAt:
                          s.addedAt instanceof Date
                              ? s.addedAt
                              : s.addedAt
                              ? new Date(s.addedAt)
                              : new Date(),
                      status: "invited",
                  }))
                : [];

        const tenderDataWithExtras = {
            ...formData,
            status: finalStatus,
            invitedSuppliers: formattedInvitedSuppliers,
            qa: questions.map((q) => ({
                id: q.id,
                // tenderId will be set in tenderService after tender creation
                question: q.question,
                answer: q.answer || "",
                askedBy: user.id,
                askedByCompany: user.companyName || "",
                askedAt: q.addedAt,
                answeredBy: null,
                answeredAt: null,
            })),
            documents: documents.map((doc) => ({
                id: doc.id,
                name: doc.name,
                type: doc.type,
                size: doc.size,
                uploadedAt: doc.uploadedAt,
            })),
        };

        // Create the tender
        const result = await createTender(tenderDataWithExtras, user);

        setLoading(false);

        if (!result.success) {
            setError(result.error || "Kunne ikke opprette Anskaffelse");
            return;
        }

        setSuccess(true);

        // Navigate to the newly created tender details page
        setTimeout(() => {
            navigate(`/tenders/${result.tender.id}`);
        }, 1500);
    };

    // Available suppliers are now searched via BRREG API in the SupplierInvitationSection
    const availableSuppliers = [];

    return (
        <Box>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/tenders")}
                sx={{ mb: 3 }}
            >
                Tilbake
            </Button>

            <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                    fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
                    mb: 4,
                }}
            >
                Opprett nytt Anskaffelse
            </Typography>

            <Paper sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        Anskaffelse opprettet! Du blir omdirigert...
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
                        {/* Common Fields */}
                        <CommonTenderFields
                            formData={formData}
                            userProjects={userProjects}
                            onChange={handleChange}
                            loading={loading}
                            errors={fieldErrors}
                        />

                        {/* NS 8405 Specific Fields */}
                        {formData.contractStandard === "NS 8405" && (
                            <NS8405SpecificFields
                                formData={formData}
                                onChange={handleChange}
                                loading={loading}
                                errors={fieldErrors}
                            />
                        )}

                        {/* NS 8406 Specific Fields */}
                        {formData.contractStandard === "NS 8406" && (
                            <NS8406SpecificFields
                                formData={formData}
                                onChange={handleChange}
                                loading={loading}
                                errors={fieldErrors}
                            />
                        )}

                        {/* NS 8407 Specific Fields */}
                        {formData.contractStandard === "NS 8407" && (
                            <NS8407SpecificFields
                                formData={formData}
                                onChange={handleChange}
                                loading={loading}
                                errors={fieldErrors}
                            />
                        )}

                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                        </Grid>

                        {/* Invitasjons Section */}
                        <Grid item xs={12}>
                            <SupplierInvitationSection
                                invitedSuppliers={invitedSuppliers}
                                supplierInput={supplierInput}
                                searching={searching}
                                searchedCompany={searchedCompany}
                                supplierValidationError={
                                    supplierValidationError
                                }
                                availableSuppliers={availableSuppliers}
                                onInputChange={handleSupplierInputChange}
                                onAddSupplier={handleAddSupplierClick}
                                onRemoveSupplier={removeSupplier}
                                loading={loading}
                            />
                        </Grid>

                        {/* Questions Section */}
                        <Grid item xs={12}>
                            <QuestionsSection
                                questions={questions}
                                questionInput={questionInput}
                                onQuestionInputChange={(e) =>
                                    setQuestionInput(e.target.value)
                                }
                                onAddQuestion={handleAddQuestion}
                                onRemoveQuestion={handleRemoveQuestion}
                                loading={loading}
                            />
                        </Grid>

                        {/* Document Upload Section */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <DocumentUpload
                                documents={documents}
                                onDocumentsChange={setDocuments}
                                disabled={loading}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                        </Grid>

                        {/* Action Buttons */}
                        <Grid item xs={12}>
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 2,
                                    justifyContent: {
                                        xs: "stretch",
                                        sm: "flex-end",
                                    },
                                    flexDirection: {
                                        xs: "column",
                                        sm: "row",
                                    },
                                }}
                            >
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate("/tenders")}
                                    disabled={loading}
                                    fullWidth={isMobile}
                                    sx={{
                                        fontSize: {
                                            xs: "1rem",
                                            sm: "0.875rem",
                                        },
                                    }}
                                >
                                    Avbryt
                                </Button>
                                <Button
                                    type="button"
                                    variant="outlined"
                                    startIcon={<SaveIcon />}
                                    disabled={loading}
                                    onClick={(e) => {
                                        handleSubmit(e, "draft");
                                    }}
                                    fullWidth={isMobile}
                                    aria-busy={loading}
                                    sx={{
                                        fontSize: {
                                            xs: "1rem",
                                            sm: "0.875rem",
                                        },
                                    }}
                                >
                                    {loading ? "Lagrer..." : "Lagre som utkast"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="primary"
                                    startIcon={<SendIcon />}
                                    disabled={loading}
                                    onClick={(e) => {
                                        handleSubmit(e, "open");
                                    }}
                                    fullWidth={isMobile}
                                    aria-busy={loading}
                                    sx={{
                                        fontSize: {
                                            xs: "1rem",
                                            sm: "0.875rem",
                                        },
                                    }}
                                >
                                    {loading
                                        ? "Publiserer..."
                                        : "Publiser Anskaffelse"}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Box>
    );
};

export default TenderCreate;
