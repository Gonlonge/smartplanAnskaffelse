import { useState, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    IconButton,
    InputAdornment,
    useTheme,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SaveIcon from "@mui/icons-material/Save";
import PersonIcon from "@mui/icons-material/Person";
import {
    updateUserEmail,
    updateUserPassword,
} from "../../../api/profileService";

const PersonalInformationSection = forwardRef(({ user, isEditing = false, onSuccess, onError }, ref) => {
    const theme = useTheme();

    // Email update state
    const [email, setEmail] = useState(user?.email || "");
    const [emailPassword, setEmailPassword] = useState("");
    const [showEmailPassword, setShowEmailPassword] = useState(false);
    const [savingEmail, setSavingEmail] = useState(false);

    // Password update state (separate from email password)
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    // Email validation
    const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

    // Update email when user changes
    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user?.email]);

    const handleUpdateEmail = useCallback(async () => {
        if (!user) return;

        // Validation
        if (!email.trim()) {
            onError("E-postadresse er påkrevd");
            return;
        }

        if (!emailRegex.test(email)) {
            onError("Ugyldig e-postadresse");
            return;
        }

        if (!emailPassword) {
            onError("Du må oppgi nåværende passord");
            return;
        }

        if (email === user.email) {
            onError("Ny e-postadresse må være forskjellig fra nåværende");
            return;
        }

        setSavingEmail(true);
        try {
            const result = await updateUserEmail(emailPassword, email);
            if (result.success) {
                onSuccess("E-postadresse oppdatert", true); // Refresh user data
                setEmailPassword("");
            } else {
                onError(result.error || "Kunne ikke oppdatere e-postadresse");
            }
        } catch (err) {
            console.error("Error updating email:", err);
            onError("En feil oppstod ved oppdatering av e-postadresse");
        } finally {
            setSavingEmail(false);
        }
    }, [email, emailPassword, user, emailRegex, onSuccess, onError]);

    const handleUpdatePassword = useCallback(async () => {
        if (!user) return;

        // Validation
        if (!currentPassword) {
            onError("Du må oppgi nåværende passord");
            return;
        }

        if (!newPassword || newPassword.length < 6) {
            onError("Nytt passord må være minst 6 tegn");
            return;
        }

        if (newPassword !== confirmPassword) {
            onError("Passordene stemmer ikke overens");
            return;
        }

        setSavingPassword(true);
        try {
            const result = await updateUserPassword(currentPassword, newPassword);
            if (result.success) {
                onSuccess("Passord oppdatert");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                onError(result.error || "Kunne ikke oppdatere passord");
            }
        } catch (err) {
            console.error("Error updating password:", err);
            onError("En feil oppstod ved oppdatering av passord");
        } finally {
            setSavingPassword(false);
        }
    }, [currentPassword, newPassword, confirmPassword, user, onSuccess, onError]);

    const isEmailFormValid = useMemo(() => {
        return (
            email.trim() &&
            emailRegex.test(email) &&
            email !== user?.email &&
            emailPassword.length > 0
        );
    }, [email, emailPassword, user?.email, emailRegex]);

    const isPasswordFormValid = useMemo(() => {
        return (
            currentPassword.length > 0 &&
            newPassword.length >= 6 &&
            newPassword === confirmPassword
        );
    }, [currentPassword, newPassword, confirmPassword]);

    // Promise-based save functions for use by parent
    const saveEmailPromise = useCallback(async () => {
        if (!user || !isEmailFormValid || email === user.email) {
            return { success: true }; // Nothing to save
        }

        if (!email.trim() || !emailRegex.test(email) || !emailPassword) {
            return { success: false, error: "Ugyldig e-postadresse eller manglende passord" };
        }

        setSavingEmail(true);
        try {
            const result = await updateUserEmail(emailPassword, email);
            if (result.success) {
                setEmailPassword("");
                return { success: true };
            }
            return { success: false, error: result.error || "Kunne ikke oppdatere e-postadresse" };
        } catch (err) {
            console.error("Error updating email:", err);
            return { success: false, error: err.message || "En feil oppstod ved oppdatering av e-postadresse" };
        } finally {
            setSavingEmail(false);
        }
    }, [user, email, emailPassword, emailRegex, isEmailFormValid]);

    const savePasswordPromise = useCallback(async () => {
        if (!user || !isPasswordFormValid) {
            return { success: true }; // Nothing to save
        }

        if (!currentPassword || !newPassword || newPassword.length < 6 || newPassword !== confirmPassword) {
            return { success: false, error: "Ugyldig passord eller passordene stemmer ikke overens" };
        }

        setSavingPassword(true);
        try {
            const result = await updateUserPassword(currentPassword, newPassword);
            if (result.success) {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                return { success: true };
            }
            return { success: false, error: result.error || "Kunne ikke oppdatere passord" };
        } catch (err) {
            console.error("Error updating password:", err);
            return { success: false, error: err.message || "En feil oppstod ved oppdatering av passord" };
        } finally {
            setSavingPassword(false);
        }
    }, [user, currentPassword, newPassword, confirmPassword, isPasswordFormValid]);

    // Expose save handlers to parent via ref
    useImperativeHandle(ref, () => ({
        saveAll: async () => {
            const results = await Promise.all([
                saveEmailPromise(),
                savePasswordPromise(),
            ]);
            
            // Check if all succeeded
            const allSucceeded = results.every(r => r.success === true);
            if (allSucceeded) {
                return true;
            }
            
            // Return the first error message
            const firstError = results.find(r => !r.success);
            return firstError?.error || false;
        },
    }), [saveEmailPromise, savePasswordPromise]);

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
                    <PersonIcon
                        sx={{
                            mr: 1.5,
                            color: theme.palette.primary.main,
                            fontSize: 28,
                        }}
                        aria-hidden="true"
                    />
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                        Kontoinnstillinger
                    </Typography>
                </Box>

                {/* Email Update Section */}
                <Box 
                    component="section" 
                    aria-labelledby="email-section-title"
                    sx={{ mt: 3 }}
                >
                    <Typography
                        id="email-section-title"
                        variant="subtitle2"
                        sx={{ mb: 2, fontWeight: 600 }}
                    >
                        Endre e-postadresse
                    </Typography>
                    <TextField
                        fullWidth
                        label="Ny e-postadresse"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="normal"
                        required
                        autoComplete="email"
                        disabled={!isEditing}
                        error={email.trim() !== "" && !emailRegex.test(email)}
                        helperText={
                            email.trim() !== "" && !emailRegex.test(email)
                                ? "Ugyldig e-postadresse"
                                : ""
                        }
                        sx={{
                            "& .MuiInputBase-input": {
                                fontSize: { xs: "1rem", md: "0.875rem" },
                            },
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Nåværende passord"
                        type={showEmailPassword ? "text" : "password"}
                        value={emailPassword}
                        onChange={(e) => setEmailPassword(e.target.value)}
                        margin="normal"
                        required
                        autoComplete="current-password"
                        disabled={!isEditing}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() =>
                                            setShowEmailPassword(!showEmailPassword)
                                        }
                                        edge="end"
                                        aria-label={
                                            showEmailPassword
                                                ? "Skjul passord"
                                                : "Vis passord"
                                        }
                                        tabIndex={-1}
                                    >
                                        {showEmailPassword ? (
                                            <VisibilityOffIcon />
                                        ) : (
                                            <VisibilityIcon />
                                        )}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            "& .MuiInputBase-input": {
                                fontSize: { xs: "1rem", md: "0.875rem" },
                            },
                        }}
                    />
                </Box>

                {/* Password Update Section */}
                <Box 
                    component="section" 
                    aria-labelledby="password-section-title"
                    sx={{ mt: 4 }}
                >
                    <Typography
                        id="password-section-title"
                        variant="subtitle2"
                        sx={{ mb: 2, fontWeight: 600 }}
                    >
                        Endre passord
                    </Typography>
                    <TextField
                        fullWidth
                        label="Nåværende passord"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        margin="normal"
                        required
                        autoComplete="current-password"
                        disabled={!isEditing}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() =>
                                            setShowCurrentPassword(!showCurrentPassword)
                                        }
                                        edge="end"
                                        aria-label={
                                            showCurrentPassword
                                                ? "Skjul passord"
                                                : "Vis passord"
                                        }
                                        tabIndex={-1}
                                    >
                                        {showCurrentPassword ? (
                                            <VisibilityOffIcon />
                                        ) : (
                                            <VisibilityIcon />
                                        )}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            "& .MuiInputBase-input": {
                                fontSize: { xs: "1rem", md: "0.875rem" },
                            },
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Nytt passord"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        margin="normal"
                        required
                        autoComplete="new-password"
                        disabled={!isEditing}
                        error={newPassword.length > 0 && newPassword.length < 6}
                        helperText={
                            newPassword.length > 0 && newPassword.length < 6
                                ? "Passordet må være minst 6 tegn"
                                : ""
                        }
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        edge="end"
                                        aria-label={
                                            showNewPassword
                                                ? "Skjul passord"
                                                : "Vis passord"
                                        }
                                        tabIndex={-1}
                                    >
                                        {showNewPassword ? (
                                            <VisibilityOffIcon />
                                        ) : (
                                            <VisibilityIcon />
                                        )}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            "& .MuiInputBase-input": {
                                fontSize: { xs: "1rem", md: "0.875rem" },
                            },
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Bekreft nytt passord"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        margin="normal"
                        required
                        autoComplete="new-password"
                        disabled={!isEditing}
                        error={
                            confirmPassword.length > 0 &&
                            newPassword !== confirmPassword
                        }
                        helperText={
                            confirmPassword.length > 0 &&
                            newPassword !== confirmPassword
                                ? "Passordene stemmer ikke overens"
                                : ""
                        }
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() =>
                                            setShowConfirmPassword(!showConfirmPassword)
                                        }
                                        edge="end"
                                        aria-label={
                                            showConfirmPassword
                                                ? "Skjul passord"
                                                : "Vis passord"
                                        }
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? (
                                            <VisibilityOffIcon />
                                        ) : (
                                            <VisibilityIcon />
                                        )}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            "& .MuiInputBase-input": {
                                fontSize: { xs: "1rem", md: "0.875rem" },
                            },
                        }}
                    />
                </Box>
            </CardContent>
        </Card>
    );
});

PersonalInformationSection.displayName = "PersonalInformationSection";

export default PersonalInformationSection;
