// import { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//     Container,
//     Box,
//     Typography,
//     TextField,
//     Button,
//     Link,
//     Alert,
//     Paper,
//     FormControl,
//     InputLabel,
//     Select,
//     MenuItem,
// } from "@mui/material";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import { useAuth } from "../contexts/AuthContext";
// import { searchCompanyByOrgNumber } from "../api/brregService";
// import logoBlack from "../assets/images/smartplan-logo-black.svg";

// const ORG_NUMBER_LENGTH = 9;

// const Register = ({ onSwitchToLogin }) => {
//     const { register, user } = useAuth();
//     const navigate = useNavigate();
//     const [name, setName] = useState("");
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [confirmPassword, setConfirmPassword] = useState("");
//     const [userType, setUserType] = useState("");
//     const [orgNumber, setOrgNumber] = useState("");
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [searching, setSearching] = useState(false);
//     const [validatedCompany, setValidatedCompany] = useState(null);
//     const [orgNumberError, setOrgNumberError] = useState("");
//     const lastSearchedOrgNumberRef = useRef("");

//     // Redirect to dashboard if user is already logged in
//     useEffect(() => {
//         if (user) {
//             navigate("/dashboard", { replace: true });
//         }
//     }, [user, navigate]);

//     // Auto-validate orgNumber when it reaches 9 digits
//     useEffect(() => {
//         let isCancelled = false;

//         const validateOrgNumber = async () => {
//             if (
//                 !orgNumber ||
//                 orgNumber.length !== ORG_NUMBER_LENGTH ||
//                 orgNumber === lastSearchedOrgNumberRef.current
//             ) {
//                 return;
//             }

//             lastSearchedOrgNumberRef.current = orgNumber;
//             setSearching(true);
//             setOrgNumberError("");
//             setValidatedCompany(null);

//             try {
//                 const result = await searchCompanyByOrgNumber(orgNumber);

//                 if (isCancelled) return;

//                 if (result.success && result.company) {
//                     setValidatedCompany(result.company);
//                     setOrgNumberError("");
//                     // Optionally auto-fill company name if empty
//                     if (!name.trim() && result.company.name) {
//                         setName(result.company.name);
//                     }
//                 } else {
//                     setValidatedCompany(null);
//                     setOrgNumberError(
//                         result.error ||
//                             `Ingen bedrift funnet med organisasjonsnummer ${orgNumber}`
//                     );
//                 }
//             } catch (err) {
//                 if (!isCancelled) {
//                     console.error("Error validating org number:", err);
//                     setValidatedCompany(null);
//                     setOrgNumberError(
//                         "En feil oppstod under validering. Prøv igjen."
//                     );
//                 }
//             } finally {
//                 if (!isCancelled) {
//                     setSearching(false);
//                 }
//             }
//         };

//         validateOrgNumber();

//         return () => {
//             isCancelled = true;
//         };
//     }, [orgNumber, name]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError("");
//         setOrgNumberError("");

//         // Validation
//         if (!userType) {
//             setError("Vennligst velg brukertype");
//             return;
//         }

//         if (password !== confirmPassword) {
//             setError("Passordene stemmer ikke overens");
//             return;
//         }

//         if (password.length < 6) {
//             setError("Passordet må være minst 6 tegn");
//             return;
//         }

//         // Validate orgNumber if provided
//         if (orgNumber) {
//             if (orgNumber.length !== ORG_NUMBER_LENGTH) {
//                 setError("Organisasjonsnummer må være 9 siffer");
//                 return;
//             }
//             // If orgNumber is provided, it must be validated
//             if (searching) {
//                 setError("Vent til organisasjonsnummeret er validert");
//                 return;
//             }
//             if (!validatedCompany) {
//                 setError(
//                     "Organisasjonsnummeret må verifiseres. Sjekk at nummeret er korrekt."
//                 );
//                 return;
//             }
//         }

//         setLoading(true);

//         const result = await register(
//             email,
//             password,
//             name,
//             userType,
//             orgNumber || null,
//             validatedCompany || null
//         );
//         setLoading(false);

//         if (result.success) {
//             navigate("/login", { replace: true });
//         } else {
//             setError(result.error || "Registrering feilet");
//         }
//     };

//     return (
//         <Container component="main" maxWidth="xs" sx={{ px: { xs: 2, sm: 3 } }}>
//             <Box
//                 sx={{
//                     mt: { xs: 4, sm: 6, md: 8 },
//                     display: "flex",
//                     flexDirection: "column",
//                     alignItems: "center",
//                 }}
//             >
//                 <Paper
//                     elevation={0}
//                     sx={{
//                         p: { xs: 3, sm: 4 },
//                         width: "100%",
//                         maxWidth: "100%",
//                     }}
//                 >
//                     <Box
//                         sx={{
//                             display: "flex",
//                             justifyContent: "center",
//                             mb: 3,
//                         }}
//                     >
//                         <Box
//                             sx={{
//                                 display: "flex",
//                                 flexDirection: "column",
//                                 alignItems: "flex-end",
//                             }}
//                         >
//                             <Box
//                                 component="img"
//                                 src={logoBlack}
//                                 alt="Smartplan"
//                                 sx={{
//                                     height: { xs: 32, sm: 40 },
//                                     width: "auto",
//                                 }}
//                             />
//                             <Typography
//                                 variant="caption"
//                                 color="text.secondary"
//                                 sx={{
//                                     fontSize: {
//                                         xs: "1rem",
//                                         sm: "1rem",
//                                         md: "0.875rem",
//                                     },
//                                     fontWeight: 400,
//                                     lineHeight: 1,
//                                 }}
//                             >
//                                 Anbudsplattform
//                             </Typography>
//                         </Box>
//                     </Box>
//                     <Typography
//                         component="h1"
//                         variant="h4"
//                         gutterBottom
//                         sx={{
//                             fontSize: {
//                                 xs: "1.5rem",
//                                 sm: "1.75rem",
//                                 md: "2rem",
//                             },
//                         }}
//                     >
//                         Registrer deg
//                     </Typography>
//                     <Typography
//                         variant="body2"
//                         color="text.secondary"
//                         paragraph
//                         sx={{
//                             fontSize: {
//                                 xs: "1rem",
//                                 sm: "1rem",
//                                 md: "0.875rem",
//                             },
//                         }}
//                     >
//                         Opprett en ny konto
//                     </Typography>

//                     {error && (
//                         <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
//                             {error}
//                         </Alert>
//                     )}

//                     <Box
//                         component="form"
//                         onSubmit={handleSubmit}
//                         sx={{ mt: 1 }}
//                     >
//                         <TextField
//                             margin="normal"
//                             required
//                             fullWidth
//                             id="name"
//                             label="Firmanavn"
//                             name="name"
//                             autoComplete="organization"
//                             autoFocus
//                             value={name}
//                             onChange={(e) => setName(e.target.value)}
//                             disabled={loading}
//                         />
//                         <TextField
//                             margin="normal"
//                             required
//                             fullWidth
//                             id="email"
//                             label="E-postadresse"
//                             name="email"
//                             autoComplete="email"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             disabled={loading}
//                         />
//                         <TextField
//                             margin="normal"
//                             fullWidth
//                             id="orgNumber"
//                             label="Organisasjonsnummer (valgfritt)"
//                             name="orgNumber"
//                             placeholder="123456789"
//                             value={orgNumber}
//                             onChange={(e) => {
//                                 // Only allow numbers and limit to 9 digits
//                                 const value = e.target.value
//                                     .replace(/\D/g, "")
//                                     .slice(0, ORG_NUMBER_LENGTH);
//                                 setOrgNumber(value);
//                                 setOrgNumberError("");
//                                 setValidatedCompany(null);
//                                 lastSearchedOrgNumberRef.current = "";
//                             }}
//                             disabled={loading || searching}
//                             helperText={
//                                 searching
//                                     ? "Validerer organisasjonsnummer..."
//                                     : orgNumber.length > 0 &&
//                                       orgNumber.length !== ORG_NUMBER_LENGTH
//                                     ? "Må være 9 siffer"
//                                     : validatedCompany
//                                     ? `Verifisert: ${validatedCompany.name}`
//                                     : "Valgfritt - 9 siffer for automatisk validering"
//                             }
//                             error={
//                                 !!orgNumberError ||
//                                 (orgNumber.length > 0 &&
//                                     orgNumber.length !== ORG_NUMBER_LENGTH)
//                             }
//                             InputProps={{
//                                 endAdornment: validatedCompany && (
//                                     <CheckCircleIcon
//                                         sx={{
//                                             color: "success.main",
//                                             ml: 1,
//                                         }}
//                                         aria-label="Verifisert"
//                                     />
//                                 ),
//                             }}
//                             inputProps={{
//                                 maxLength: ORG_NUMBER_LENGTH,
//                                 inputMode: "numeric",
//                                 pattern: "[0-9]*",
//                             }}
//                         />
//                         {orgNumberError && (
//                             <Alert severity="error" sx={{ mt: 1 }} role="alert">
//                                 {orgNumberError}
//                             </Alert>
//                         )}
//                         {validatedCompany && (
//                             <Alert
//                                 severity="success"
//                                 sx={{ mt: 1 }}
//                                 role="alert"
//                             >
//                                 Organisasjonsnummer verifisert:{" "}
//                                 {validatedCompany.name}
//                             </Alert>
//                         )}
//                         <TextField
//                             margin="normal"
//                             required
//                             fullWidth
//                             name="password"
//                             label="Passord"
//                             type="password"
//                             id="password"
//                             autoComplete="new-password"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             disabled={loading}
//                             helperText="Må være minst 6 tegn"
//                         />
//                         <TextField
//                             margin="normal"
//                             required
//                             fullWidth
//                             name="confirmPassword"
//                             label="Bekreft passord"
//                             type="password"
//                             id="confirmPassword"
//                             value={confirmPassword}
//                             onChange={(e) => setConfirmPassword(e.target.value)}
//                             disabled={loading}
//                         />
//                         <FormControl
//                             margin="normal"
//                             required
//                             fullWidth
//                             disabled={loading}
//                         >
//                             <InputLabel id="userType-label">
//                                 Brukertype
//                             </InputLabel>
//                             <Select
//                                 labelId="userType-label"
//                                 id="userType"
//                                 value={userType}
//                                 label="Brukertype"
//                                 onChange={(e) => setUserType(e.target.value)}
//                             >
//                                 <MenuItem value="admin_anskaffelse">
//                                     Admin anskaffelse
//                                 </MenuItem>
//                                 <MenuItem value="admin_leverandor">
//                                     Admin leverandør
//                                 </MenuItem>
//                                 <MenuItem value="anskaffelse">
//                                     Anskaffelse
//                                 </MenuItem>
//                                 <MenuItem value="leverandor">
//                                     Leverandør
//                                 </MenuItem>
//                             </Select>
//                         </FormControl>
//                         <Button
//                             type="submit"
//                             fullWidth
//                             variant="contained"
//                             sx={{
//                                 mt: 3,
//                                 mb: 2,
//                                 fontSize: {
//                                     xs: "1rem",
//                                     sm: "0.875rem",
//                                 },
//                             }}
//                             disabled={
//                                 loading ||
//                                 searching ||
//                                 (orgNumber && !validatedCompany)
//                             }
//                             aria-busy={loading}
//                         >
//                             {loading ? "Oppretter konto..." : "Registrer deg"}
//                         </Button>
//                         <Box sx={{ textAlign: "center" }}>
//                             <Link
//                                 component="button"
//                                 variant="body2"
//                                 onClick={onSwitchToLogin}
//                                 sx={{
//                                     cursor: "pointer",
//                                     fontSize: {
//                                         xs: "1rem",
//                                         sm: "1rem",
//                                         md: "0.875rem",
//                                     },
//                                 }}
//                             >
//                                 Har du allerede en konto? Logg inn
//                             </Link>
//                         </Box>
//                     </Box>
//                 </Paper>
//             </Box>
//         </Container>
//     );
// };

// export default Register;

import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Link,
    Alert,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useAuth } from "../contexts/AuthContext";
import { searchCompanyByOrgNumber } from "../api/brregService";
import logoBlack from "../assets/images/smartplan-logo-black.svg";

const ORG_NUMBER_LENGTH = 9;

const Register = ({ onSwitchToLogin }) => {
    const { register, user } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [userType, setUserType] = useState("");
    const [orgNumber, setOrgNumber] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [validatedCompany, setValidatedCompany] = useState(null);
    const [orgNumberError, setOrgNumberError] = useState("");
    const lastSearchedOrgNumberRef = useRef("");

    // Redirect to dashboard if user is already logged in
    useEffect(() => {
        if (user) {
            navigate("/dashboard", { replace: true });
        }
    }, [user, navigate]);

    // Auto-validate orgNumber when it reaches 9 digits
    useEffect(() => {
        let isCancelled = false;

        const validateOrgNumber = async () => {
            if (
                !orgNumber ||
                orgNumber.length !== ORG_NUMBER_LENGTH ||
                orgNumber === lastSearchedOrgNumberRef.current
            ) {
                return;
            }

            lastSearchedOrgNumberRef.current = orgNumber;
            setSearching(true);
            setOrgNumberError("");
            setValidatedCompany(null);

            try {
                const result = await searchCompanyByOrgNumber(orgNumber);

                if (isCancelled) return;

                if (result.success && result.company) {
                    setValidatedCompany(result.company);
                    setOrgNumberError("");
                    // Optionally auto-fill company name if empty
                    if (!name.trim() && result.company.name) {
                        setName(result.company.name);
                    }
                } else {
                    setValidatedCompany(null);
                    setOrgNumberError(
                        result.error ||
                            `Ingen bedrift funnet med organisasjonsnummer ${orgNumber}`
                    );
                }
            } catch (err) {
                if (!isCancelled) {
                    console.error("Error validating org number:", err);
                    setValidatedCompany(null);
                    setOrgNumberError(
                        "En feil oppstod under validering. Prøv igjen."
                    );
                }
            } finally {
                if (!isCancelled) {
                    setSearching(false);
                }
            }
        };

        validateOrgNumber();

        return () => {
            isCancelled = true;
        };
    }, [orgNumber, name]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setOrgNumberError("");

        // Validation
        if (!userType) {
            setError("Vennligst velg brukertype");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passordene stemmer ikke overens");
            return;
        }

        if (password.length < 6) {
            setError("Passordet må være minst 6 tegn");
            return;
        }

        // Validate orgNumber if provided
        if (orgNumber) {
            if (orgNumber.length !== ORG_NUMBER_LENGTH) {
                setError("Organisasjonsnummer må være 9 siffer");
                return;
            }
            // If orgNumber is provided, it must be validated
            if (searching) {
                setError("Vent til organisasjonsnummeret er validert");
                return;
            }
            if (!validatedCompany) {
                setError(
                    "Organisasjonsnummeret må verifiseres. Sjekk at nummeret er korrekt."
                );
                return;
            }
        }

        setLoading(true);

        const result = await register(
            email,
            password,
            name,
            userType,
            orgNumber || null,
            validatedCompany || null
        );
        setLoading(false);

        if (result.success) {
            // Navigate to login page with registration state
            navigate("/login", {
                replace: true,
                state: { fromRegistration: true },
            });
        } else {
            setError(result.error || "Registrering feilet");
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ px: { xs: 2, sm: 3 } }}>
            <Box
                sx={{
                    mt: { xs: 4, sm: 6, md: 8 },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, sm: 4 },
                        width: "100%",
                        maxWidth: "100%",
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
                                    fontSize: {
                                        xs: "1rem",
                                        sm: "1rem",
                                        md: "0.875rem",
                                    },
                                    fontWeight: 400,
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
                                xs: "1.5rem",
                                sm: "1.75rem",
                                md: "2rem",
                            },
                        }}
                    >
                        Registrer deg
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                        sx={{
                            fontSize: {
                                xs: "1rem",
                                sm: "1rem",
                                md: "0.875rem",
                            },
                        }}
                    >
                        Opprett en ny konto
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{ mt: 1 }}
                    >
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="name"
                            label="Firmanavn"
                            name="name"
                            autoComplete="organization"
                            autoFocus
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="E-postadresse"
                            name="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            id="orgNumber"
                            label="Organisasjonsnummer (valgfritt)"
                            name="orgNumber"
                            placeholder="123456789"
                            value={orgNumber}
                            onChange={(e) => {
                                // Only allow numbers and limit to 9 digits
                                const value = e.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, ORG_NUMBER_LENGTH);
                                setOrgNumber(value);
                                setOrgNumberError("");
                                setValidatedCompany(null);
                                lastSearchedOrgNumberRef.current = "";
                            }}
                            disabled={loading || searching}
                            helperText={
                                searching
                                    ? "Validerer organisasjonsnummer..."
                                    : orgNumber.length > 0 &&
                                      orgNumber.length !== ORG_NUMBER_LENGTH
                                    ? "Må være 9 siffer"
                                    : validatedCompany
                                    ? `Verifisert: ${validatedCompany.name}`
                                    : "Valgfritt - 9 siffer for automatisk validering"
                            }
                            error={
                                !!orgNumberError ||
                                (orgNumber.length > 0 &&
                                    orgNumber.length !== ORG_NUMBER_LENGTH)
                            }
                            InputProps={{
                                endAdornment: validatedCompany && (
                                    <CheckCircleIcon
                                        sx={{
                                            color: "success.main",
                                            ml: 1,
                                        }}
                                        aria-label="Verifisert"
                                    />
                                ),
                            }}
                            inputProps={{
                                maxLength: ORG_NUMBER_LENGTH,
                                inputMode: "numeric",
                                pattern: "[0-9]*",
                            }}
                        />
                        {orgNumberError && (
                            <Alert severity="error" sx={{ mt: 1 }} role="alert">
                                {orgNumberError}
                            </Alert>
                        )}
                        {validatedCompany && (
                            <Alert
                                severity="success"
                                sx={{ mt: 1 }}
                                role="alert"
                            >
                                Organisasjonsnummer verifisert:{" "}
                                {validatedCompany.name}
                            </Alert>
                        )}
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Passord"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            helperText="Må være minst 6 tegn"
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Bekreft passord"
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                        />
                        <FormControl
                            margin="normal"
                            required
                            fullWidth
                            disabled={loading}
                        >
                            <InputLabel id="userType-label">
                                Brukertype
                            </InputLabel>
                            <Select
                                labelId="userType-label"
                                id="userType"
                                value={userType}
                                label="Brukertype"
                                onChange={(e) => setUserType(e.target.value)}
                            >
                                <MenuItem value="admin_anskaffelse">
                                    Admin anskaffelse
                                </MenuItem>
                                <MenuItem value="admin_leverandor">
                                    Admin leverandør
                                </MenuItem>
                                <MenuItem value="anskaffelse">
                                    Anskaffelse
                                </MenuItem>
                                <MenuItem value="leverandor">
                                    Leverandør
                                </MenuItem>
                            </Select>
                        </FormControl>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                mt: 3,
                                mb: 2,
                                fontSize: {
                                    xs: "1rem",
                                    sm: "0.875rem",
                                },
                            }}
                            disabled={
                                loading ||
                                searching ||
                                (orgNumber && !validatedCompany)
                            }
                            aria-busy={loading}
                        >
                            {loading ? "Oppretter konto..." : "Registrer deg"}
                        </Button>
                        <Box sx={{ textAlign: "center" }}>
                            <Link
                                component="button"
                                variant="body2"
                                onClick={onSwitchToLogin}
                                sx={{
                                    cursor: "pointer",
                                    fontSize: {
                                        xs: "1rem",
                                        sm: "1rem",
                                        md: "0.875rem",
                                    },
                                }}
                            >
                                Har du allerede en konto? Logg inn
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

Register.propTypes = {
    onSwitchToLogin: PropTypes.func,
};

export default Register;
