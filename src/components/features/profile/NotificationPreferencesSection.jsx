import { useState, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle } from "react";
import {
    Box,
    Typography,
    Button,
    Switch,
    FormControlLabel,
    Card,
    CardContent,
    useTheme,
    CircularProgress,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useAuth } from "../../../contexts/AuthContext";
import {
    getNotificationPreferences,
    updateNotificationPreferences,
} from "../../../api/profileService";

const DEFAULT_PREFERENCES = {
    emailNotifications: true,
    bidNotifications: true,
    invitationNotifications: true,
    projectNotifications: true,
    questionNotifications: true,
    contractNotifications: true,
    deadlineReminderNotifications: true,
};

const NotificationPreferencesSection = forwardRef(({ isEditing = false, onSuccess, onError }, ref) => {
    const theme = useTheme();
    const { user } = useAuth();
    const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
    const [savingNotifications, setSavingNotifications] = useState(false);
    const [loadingPreferences, setLoadingPreferences] = useState(true);

    // Load preferences on mount
    useEffect(() => {
        const loadPreferences = async () => {
            if (!user?.id) {
                setLoadingPreferences(false);
                return;
            }

            try {
                const result = await getNotificationPreferences(user.id);
                if (result.success && result.preferences) {
                    setPreferences({
                        ...DEFAULT_PREFERENCES,
                        ...result.preferences,
                    });
                }
            } catch (err) {
                console.error("Error loading notification preferences:", err);
            } finally {
                setLoadingPreferences(false);
            }
        };

        loadPreferences();
    }, [user?.id]);

    const handlePreferenceChange = useCallback((key) => {
        setPreferences((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    }, []);

    const handleUpdateNotifications = useCallback(async () => {
        if (!user?.id) {
            onError("Du må være innlogget for å oppdatere innstillinger");
            return;
        }

        setSavingNotifications(true);
        try {
            const result = await updateNotificationPreferences(user.id, preferences);

            if (result.success) {
                onSuccess("Varselinnstillinger oppdatert");
            } else {
                onError(
                    result.error ||
                        "En feil oppstod ved oppdatering av varselinnstillinger"
                );
            }
        } catch (err) {
            console.error("Error updating notifications:", err);
            onError("En feil oppstod ved oppdatering av varselinnstillinger");
        } finally {
            setSavingNotifications(false);
        }
    }, [user?.id, preferences, onSuccess, onError]);

    // Promise-based save function for use by parent
    const saveNotificationsPromise = useCallback(async () => {
        if (!user?.id) {
            return { success: false, error: "Ingen bruker er innlogget" };
        }

        setSavingNotifications(true);
        try {
            const result = await updateNotificationPreferences(user.id, preferences);
            if (result.success) {
                return { success: true };
            } else {
                return { success: false, error: result.error || "Kunne ikke oppdatere varselinnstillinger" };
            }
        } catch (err) {
            console.error("Error updating notifications:", err);
            return { success: false, error: err.message || "En feil oppstod ved oppdatering av varselinnstillinger" };
        } finally {
            setSavingNotifications(false);
        }
    }, [user?.id, preferences]);

    // Expose save handler to parent via ref
    useImperativeHandle(ref, () => ({
        save: async () => {
            const result = await saveNotificationsPromise();
            return result.success ? true : result.error || false;
        },
    }), [saveNotificationsPromise]);

    const notificationLabels = useMemo(
        () => ({
            emailNotifications: "E-postvarsler",
            bidNotifications: "Varsler om tilbud",
            invitationNotifications: "Varsler om invitasjoner",
            projectNotifications: "Varsler om prosjekter",
            questionNotifications: "Varsler om spørsmål og svar",
            contractNotifications: "Varsler om kontrakter",
            deadlineReminderNotifications: "Fristpåminnelser",
        }),
        []
    );

    return (
        <Card
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <CardContent>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 3,
                    }}
                >
                    <NotificationsIcon
                        sx={{
                            mr: 1.5,
                            color: theme.palette.primary.main,
                            fontSize: 28,
                        }}
                        aria-hidden="true"
                    />
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                        Varselinnstillinger
                    </Typography>
                </Box>

                {loadingPreferences ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            py: 4,
                        }}
                    >
                        <CircularProgress size={32} aria-label="Laster innstillinger" />
                    </Box>
                ) : (
                    <Box
                        component="section"
                        aria-labelledby="notification-preferences-title"
                        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                        {Object.keys(DEFAULT_PREFERENCES).map((key) => (
                            <FormControlLabel
                                key={key}
                                control={
                                    <Switch
                                        checked={preferences[key]}
                                        onChange={() => handlePreferenceChange(key)}
                                        disabled={!isEditing || savingNotifications}
                                        aria-label={notificationLabels[key]}
                                    />
                                }
                                label={notificationLabels[key]}
                            />
                        ))}
                    </Box>
                )}

            </CardContent>
        </Card>
    );
});

NotificationPreferencesSection.displayName = "NotificationPreferencesSection";

export default NotificationPreferencesSection;
