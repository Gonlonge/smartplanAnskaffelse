// import { useState, useEffect, useCallback } from "react";
// import PropTypes from "prop-types";
// import { useNavigate } from "react-router-dom";
// import {
//     Alert,
//     Box,
//     Button,
//     Container,
//     Link,
//     Paper,
//     TextField,
//     Typography,
// } from "@mui/material";
// import { useAuth } from "../contexts/AuthContext";
// import logoBlack from "../assets/images/smartplan-logo-black.svg";

// const Login = ({ onSwitchToRegister }) => {
//     const { login, user } = useAuth();
//     const navigate = useNavigate();
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [error, setError] = useState(null);
//     const [infoMessage, setInfoMessage] = useState("");
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         if (user) {
//             navigate("/dashboard", { replace: true });
//         }
//     }, [user, navigate]);

//     useEffect(() => {
//         setError(null);
//         setInfoMessage("");
//     }, [email, password]);

//     const handleSubmit = useCallback(
//         async (event) => {
//             event.preventDefault();
//             const trimmedEmail = email.trim();
//             const trimmedPassword = password.trim();

//             if (!trimmedEmail || !trimmedPassword) {
//                 setError("E-post og passord er påkrevd");
//                 return;
//             }

//             setLoading(true);
//             setError(null);
//             setInfoMessage("");

//             try {
//                 const result = await login(trimmedEmail, trimmedPassword);
//                 if (result?.success) {
//                     navigate("/dashboard", { replace: true });
//                 } else {
//                     if (result?.requiresEmailVerification) {
//                         setError(null);
//                         setInfoMessage(
//                             result?.verificationEmailSent
//                                 ? "E-posten er ikke bekreftet. Vi har sendt deg en ny bekreftelseslenke."
//                                 : "E-posten er ikke bekreftet. Bekreft e-posten din før du logger inn."
//                         );
//                     } else {
//                         setError(result?.error || "Innlogging feilet");
//                     }
//                 }
//             } catch (err) {
//                 setError("Uventet feil ved innlogging");
//             } finally {
//                 setLoading(false);
//             }
//         },
//         [email, password, login, navigate]
//     );

//     const handleSwitchToRegister = useCallback(() => {
//         onSwitchToRegister?.();
//     }, [onSwitchToRegister]);

//     const isSubmitDisabled =
//         loading || !email.trim() || !password.trim() || Boolean(error);

//     return (
//         <Container
//             component="main"
//             maxWidth="xs"
//             sx={{ px: { xs: 2, sm: 3 }, py: { xs: 4, sm: 6 } }}
//         >
//             <Paper
//                 elevation={0}
//                 sx={{
//                     p: { xs: 3, sm: 4 },
//                     border: (theme) => `1px solid ${theme.palette.divider}`,
//                     borderRadius: 2,
//                 }}
//             >
//                 <Box
//                     sx={{
//                         display: "flex",
//                         justifyContent: "center",
//                         mb: 3,
//                     }}
//                 >
//                     <Box
//                         sx={{
//                             display: "flex",
//                             flexDirection: "column",
//                             alignItems: "flex-end",
//                             gap: 0.5,
//                         }}
//                     >
//                         <Box
//                             component="img"
//                             src={logoBlack}
//                             alt="Smartplan"
//                             sx={{
//                                 height: { xs: 32, sm: 40 },
//                                 width: "auto",
//                             }}
//                         />
//                         <Typography
//                             variant="caption"
//                             color="text.secondary"
//                             sx={{
//                                 fontSize: { xs: "0.7rem", sm: "0.75rem" },
//                                 lineHeight: 1,
//                             }}
//                         >
//                             Anbudsplattform
//                         </Typography>
//                     </Box>
//                 </Box>

//                 <Typography
//                     component="h1"
//                     variant="h4"
//                     gutterBottom
//                     sx={{
//                         fontSize: {
//                             xs: "1.6rem",
//                             sm: "1.75rem",
//                             md: "2rem",
//                         },
//                     }}
//                 >
//                     Logg inn
//                 </Typography>
//                 <Typography
//                     variant="body1"
//                     color="text.secondary"
//                     paragraph
//                     sx={{
//                         fontSize: { xs: "1rem", sm: "1rem" },
//                     }}
//                 >
//                     Logg inn på din konto
//                 </Typography>

//                 {error && (
//                     <Alert
//                         severity="error"
//                         sx={{ mt: 2, mb: 2 }}
//                         role="alert"
//                         aria-live="polite"
//                     >
//                         {error}
//                     </Alert>
//                 )}
//                 {infoMessage && (
//                     <Alert
//                         severity="info"
//                         sx={{ mt: 2, mb: 2 }}
//                         role="status"
//                         aria-live="polite"
//                     >
//                         {infoMessage}
//                     </Alert>
//                 )}

//                 <Box
//                     component="form"
//                     onSubmit={handleSubmit}
//                     noValidate
//                     sx={{ mt: 1 }}
//                 >
//                     <TextField
//                         margin="normal"
//                         required
//                         fullWidth
//                         id="email"
//                         label="E-postadresse"
//                         name="email"
//                         autoComplete="email"
//                         autoFocus
//                         value={email}
//                         onChange={(event) => setEmail(event.target.value)}
//                         disabled={loading}
//                         inputProps={{ "aria-label": "E-postadresse" }}
//                     />
//                     <TextField
//                         margin="normal"
//                         required
//                         fullWidth
//                         name="password"
//                         label="Passord"
//                         type="password"
//                         id="password"
//                         autoComplete="current-password"
//                         value={password}
//                         onChange={(event) => setPassword(event.target.value)}
//                         disabled={loading}
//                         inputProps={{ "aria-label": "Passord" }}
//                     />
//                     <Button
//                         type="submit"
//                         fullWidth
//                         variant="contained"
//                         sx={{
//                             mt: 3,
//                             mb: 2,
//                             fontSize: {
//                                 xs: "1rem",
//                                 sm: "1rem",
//                                 md: "0.875rem",
//                             },
//                             minHeight: { xs: 44, md: 36 },
//                         }}
//                         disabled={isSubmitDisabled}
//                         aria-busy={loading}
//                     >
//                         {loading ? "Logger inn..." : "Logg inn"}
//                     </Button>
//                     <Box sx={{ textAlign: "center" }}>
//                         <Link
//                             component="button"
//                             variant="body2"
//                             onClick={handleSwitchToRegister}
//                             sx={{
//                                 cursor: "pointer",
//                                 fontSize: {
//                                     xs: "1rem",
//                                     sm: "1rem",
//                                     md: "0.875rem",
//                                 },
//                             }}
//                         >
//                             Har du ikke en konto? Registrer deg
//                         </Link>
//                     </Box>
//                 </Box>
//             </Paper>
//         </Container>
//     );
// };

// export default Login;

// Login.propTypes = {
//     onSwitchToRegister: PropTypes.func,
// };
import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Container,
    Link,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import logoBlack from "../assets/images/smartplan-logo-black.svg";

const Login = ({ onSwitchToRegister }) => {
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [infoMessage, setInfoMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            navigate("/dashboard", { replace: true });
        }
    }, [user, navigate]);

    // 👇 Vis melding når vi kommer fra registrering
    useEffect(() => {
        if (location.state?.fromRegistration) {
            setInfoMessage(
                "Registrering fullført. Sjekk e-posten din og bekreft kontoen før du logger inn."
            );
        }
    }, [location.state]);

    // 👇 Ikke nullstill infoMessage her – kun error
    useEffect(() => {
        setError(null);
    }, [email, password]);

    const handleSubmit = useCallback(
        async (event) => {
            event.preventDefault();
            const trimmedEmail = email.trim();
            const trimmedPassword = password.trim();

            if (!trimmedEmail || !trimmedPassword) {
                setError("E-post og passord er påkrevd");
                return;
            }

            setLoading(true);
            setError(null);
            setInfoMessage("");

            try {
                const result = await login(trimmedEmail, trimmedPassword);
                if (result?.success) {
                    navigate("/dashboard", { replace: true });
                } else {
                    if (result?.requiresEmailVerification) {
                        setError(null);
                        setInfoMessage(
                            result?.verificationEmailSent
                                ? "E-posten er ikke bekreftet. Vi har sendt deg en ny bekreftelseslenke."
                                : "E-posten er ikke bekreftet. Bekreft e-posten din før du logger inn."
                        );
                    } else {
                        setError(result?.error || "Innlogging feilet");
                    }
                }
            } catch (err) {
                setError("Uventet feil ved innlogging");
            } finally {
                setLoading(false);
            }
        },
        [email, password, login, navigate]
    );

    const handleSwitchToRegister = useCallback(() => {
        onSwitchToRegister?.();
    }, [onSwitchToRegister]);

    const isSubmitDisabled =
        loading || !email.trim() || !password.trim() || Boolean(error);

    return (
        <Container
            component="main"
            maxWidth="xs"
            sx={{ px: { xs: 2, sm: 3 }, py: { xs: 4, sm: 6 } }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 3, sm: 4 },
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        mb: 3,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: 0.5,
                        }}
                    >
                        <Box
                            component="img"
                            src={logoBlack}
                            alt="Smartplan"
                            sx={{
                                height: { xs: 32, sm: 40 },
                                width: "auto",
                            }}
                        />
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                fontSize: { xs: "1rem", sm: "0.75rem" },
                                lineHeight: 1,
                            }}
                        >
                            Anbudsplattform
                        </Typography>
                    </Box>
                </Box>

                <Typography
                    component="h1"
                    variant="h4"
                    gutterBottom
                    sx={{
                        fontSize: {
                            xs: "1.6rem",
                            sm: "1.75rem",
                            md: "2rem",
                        },
                    }}
                >
                    Logg inn
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    paragraph
                    sx={{
                        fontSize: { xs: "1rem", sm: "1rem" },
                    }}
                >
                    Logg inn på din konto
                </Typography>

                {error && (
                    <Alert
                        severity="error"
                        sx={{ mt: 2, mb: 2 }}
                        role="alert"
                        aria-live="polite"
                    >
                        {error}
                    </Alert>
                )}
                {infoMessage && (
                    <Alert
                        severity="info"
                        sx={{ mt: 2, mb: 2 }}
                        role="status"
                        aria-live="polite"
                    >
                        {infoMessage}
                    </Alert>
                )}

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    noValidate
                    sx={{ mt: 1 }}
                >
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="E-postadresse"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        disabled={loading}
                        inputProps={{ "aria-label": "E-postadresse" }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Passord"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        disabled={loading}
                        inputProps={{ "aria-label": "Passord" }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 3,
                            mb: 2,
                            fontSize: {
                                xs: "1rem",
                                sm: "1rem",
                                md: "0.875rem",
                            },
                            minHeight: { xs: 44, md: 36 },
                        }}
                        disabled={isSubmitDisabled}
                        aria-busy={loading}
                    >
                        {loading ? "Logger inn..." : "Logg inn"}
                    </Button>
                    <Box sx={{ textAlign: "center" }}>
                        <Link
                            component="button"
                            variant="body2"
                            onClick={handleSwitchToRegister}
                            sx={{
                                cursor: "pointer",
                                fontSize: {
                                    xs: "1rem",
                                    sm: "1rem",
                                    md: "0.875rem",
                                },
                            }}
                        >
                            Har du ikke en konto? Registrer deg
                        </Link>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;

Login.propTypes = {
    onSwitchToRegister: PropTypes.func,
};
