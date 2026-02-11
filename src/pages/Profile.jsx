import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
    Box,
    Typography,
    Alert,
    CircularProgress,
    Grid,
    Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import {
    PersonalInformationSection,
    CompanyInformationSection,
    NotificationPreferencesSection,
    AccountActivitySection,
} from "../components/features/profile";
import ProfileCompletenessIndicator from "../components/features/profile/ProfileCompletenessIndicator";

const Profile = () => {
    const { user, loading: authLoading, refreshUser } = useAuth();
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [savingAll, setSavingAll] = useState(false);
    
    // Refs to access save handlers from child components
    const personalInfoRef = useRef(null);
    const companyInfoRef = useRef(null);
    const notificationPrefsRef = useRef(null);

    // Clear messages after 5 seconds
    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess(null);
                setError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    // Handle success with optional user refresh
    const handleSuccess = useCallback(
        (message, shouldRefresh = false) => {
            setSuccess(message);
            if (shouldRefresh && refreshUser) {
                refreshUser();
            }
        },
        [refreshUser]
    );

    // Handle save all - trigger all section saves
    const handleSaveAll = useCallback(async () => {
        setSavingAll(true);
        setError(null);
        
        try {
            // Trigger saves from all sections
            const savePromises = [];
            
            if (personalInfoRef.current?.saveAll) {
                savePromises.push(personalInfoRef.current.saveAll());
            }
            if (companyInfoRef.current?.save) {
                savePromises.push(companyInfoRef.current.save());
            }
            if (notificationPrefsRef.current?.save) {
                savePromises.push(notificationPrefsRef.current.save());
            }
            
            // Wait for all saves to complete
            const results = await Promise.allSettled(savePromises);
            
            // Check if all succeeded (value is true, not false or error string)
            const allSucceeded = results.every(
                (result) => result.status === "fulfilled" && result.value === true
            );
            
            if (allSucceeded && results.length > 0) {
                handleSuccess("Alle endringer er lagret", true);
                setIsEditing(false);
            } else if (results.length === 0) {
                // No changes to save
                handleSuccess("Ingen endringer å lagre");
                setIsEditing(false);
            } else {
                // Find the first error message
                let errorMessage = "Noen endringer kunne ikke lagres";
                
                for (const result of results) {
                    if (result.status === "rejected") {
                        errorMessage = result.reason?.message || result.reason || errorMessage;
                        break;
                    } else if (result.status === "fulfilled" && result.value !== true) {
                        // result.value is an error string
                        errorMessage = result.value || errorMessage;
                        break;
                    }
                }
                
                setError(errorMessage);
            }
        } catch (err) {
            console.error("Error saving all:", err);
            setError("En feil oppstod ved lagring av endringer");
        } finally {
            setSavingAll(false);
        }
    }, [handleSuccess]);

    const handleCancelEdit = useCallback(() => {
        setIsEditing(false);
        setError(null);
        // Reset form states if needed (sections will handle this via user prop updates)
    }, []);

    if (authLoading) {
        return (
            <Box
                component="main"
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "400px",
                }}
            >
                <CircularProgress aria-label="Laster profil" />
            </Box>
        );
    }

    if (!user) {
        return (
            <Box component="main">
                <Alert severity="error" role="alert">
                    Du må være innlogget for å se profilen din
                </Alert>
            </Box>
        );
    }

    return (
        <Box component="main">
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1,
                    }}
                >
                    <Box>
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontSize: {
                                    xs: "1.75rem",
                                    sm: "2rem",
                                    md: "2.5rem",
                                },
                                fontWeight: 600,
                                mb: 0.5,
                            }}
                        >
                            Min profil
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ fontSize: { xs: "1rem", sm: "1rem" } }}
                        >
                            Administrer din profil, innstillinger og preferanser
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        {!isEditing ? (
                            <Button
                                variant="contained"
                                startIcon={<EditIcon />}
                                onClick={() => setIsEditing(true)}
                                aria-label="Rediger profil"
                            >
                                Rediger
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outlined"
                                    startIcon={<CancelIcon />}
                                    onClick={handleCancelEdit}
                                    disabled={savingAll}
                                    aria-label="Avbryt redigering"
                                >
                                    Avbryt
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSaveAll}
                                    disabled={savingAll}
                                    aria-label="Lagre alle endringer"
                                >
                                    {savingAll ? "Lagrer..." : "Lagre alle"}
                                </Button>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Success/Error Messages */}
            {success && (
                <Alert
                    severity="success"
                    sx={{ mb: 3 }}
                    onClose={() => setSuccess(null)}
                    role="alert"
                >
                    {success}
                </Alert>
            )}
            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    onClose={() => setError(null)}
                    role="alert"
                >
                    {error}
                </Alert>
            )}

            {/* Profile Completeness Indicator */}
            <ProfileCompletenessIndicator user={user} />

            <Grid container spacing={3}>
                {/* Personal Information */}
                <Grid item xs={12} md={6}>
                    <PersonalInformationSection
                        ref={personalInfoRef}
                        user={user}
                        isEditing={isEditing}
                        onSuccess={handleSuccess}
                        onError={setError}
                    />
                </Grid>

                {/* Company Information */}
                <Grid item xs={12} md={6}>
                    <CompanyInformationSection
                        ref={companyInfoRef}
                        user={user}
                        isEditing={isEditing}
                        onSuccess={handleSuccess}
                        onError={setError}
                        onRequestEdit={() => setIsEditing(true)}
                    />
                </Grid>

                {/* Notification Preferences */}
                <Grid item xs={12} md={6}>
                    <NotificationPreferencesSection
                        ref={notificationPrefsRef}
                        isEditing={isEditing}
                        onSuccess={setSuccess}
                        onError={setError}
                    />
                </Grid>

                {/* Account Activity */}
                <Grid item xs={12} md={6}>
                    <AccountActivitySection user={user} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Profile;
