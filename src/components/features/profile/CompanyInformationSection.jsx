import {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
    forwardRef,
    useImperativeHandle,
} from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    useTheme,
    Alert,
    Grid,
    Chip,
    Paper,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CategoryIcon from "@mui/icons-material/Category";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import InfoIcon from "@mui/icons-material/Info";
import { updateProfile } from "../../../api/profileService";
import { searchCompanyByOrgNumber } from "../../../api/brregService";

const ORG_NUMBER_LENGTH = 9;

const CompanyInformationSection = forwardRef(
    ({ user, isEditing = false, onSuccess, onError, onRequestEdit }, ref) => {
        const theme = useTheme();
        const [companyName, setCompanyName] = useState(user?.companyName || "");
        const [orgNumber, setOrgNumber] = useState(user?.orgNumber || "");
        const [savingCompany, setSavingCompany] = useState(false);
        const [searching, setSearching] = useState(false);
        const [searchedCompany, setSearchedCompany] = useState(null);
        const [savedCompany, setSavedCompany] = useState(null);
        const [orgNumberError, setOrgNumberError] = useState("");
        const lastSearchedOrgNumberRef = useRef("");

        // Address fields
        const [address, setAddress] = useState(user?.address || "");
        const [city, setCity] = useState(user?.city || "");
        const [postCode, setPostCode] = useState(user?.postCode || "");
        const [fullAddress, setFullAddress] = useState(user?.fullAddress || "");

        // Postal address fields
        const [postalAddress, setPostalAddress] = useState(
            user?.postalAddress || ""
        );
        const [postalCity, setPostalCity] = useState(user?.postalCity || "");
        const [postalPostCode, setPostalPostCode] = useState(
            user?.postalPostCode || ""
        );
        const [postalFullAddress, setPostalFullAddress] = useState(
            user?.postalFullAddress || ""
        );

        // Bio field
        const [bio, setBio] = useState(user?.bio || "");

        // Load saved company information when component mounts or user changes
        useEffect(() => {
            if (
                user?.orgNumber &&
                user.orgNumber.length === ORG_NUMBER_LENGTH
            ) {
                // Build saved company object from user data
                const companyData = {
                    name: user.companyName || "",
                    orgNumber: user.orgNumber,
                    companyFormCode: user.companyFormCode || "",
                    companyFormDescription: user.companyFormDescription || "",
                    fullAddress: user.fullAddress || "",
                    address: user.address || "",
                    postCode: user.postCode || "",
                    city: user.city || "",
                    country: user.country || "",
                    postalAddress: user.postalAddress || "",
                    postalPostCode: user.postalPostCode || "",
                    postalCity: user.postalCity || "",
                    postalFullAddress: user.postalFullAddress || "",
                    registrationDate: user.registrationDate || "",
                    registrationAuthority: user.registrationAuthority || "",
                    status: user.status || "",
                    underLiquidation: user.underLiquidation || false,
                    underBankruptcy: user.underBankruptcy || false,
                    industryCodes: user.industryCodes || [],
                };
                setSavedCompany(companyData);
            } else {
                setSavedCompany(null);
            }
        }, [user]);

        // Update local state when user changes
        useEffect(() => {
            if (user?.companyName) {
                setCompanyName(user.companyName);
            }
            if (user?.orgNumber) {
                setOrgNumber(user.orgNumber);
            }
            if (user?.address !== undefined) {
                setAddress(user.address || "");
            }
            if (user?.city !== undefined) {
                setCity(user.city || "");
            }
            if (user?.postCode !== undefined) {
                setPostCode(user.postCode || "");
            }
            if (user?.fullAddress !== undefined) {
                setFullAddress(user.fullAddress || "");
            }
            if (user?.postalAddress !== undefined) {
                setPostalAddress(user.postalAddress || "");
            }
            if (user?.postalCity !== undefined) {
                setPostalCity(user.postalCity || "");
            }
            if (user?.postalPostCode !== undefined) {
                setPostalPostCode(user.postalPostCode || "");
            }
            if (user?.postalFullAddress !== undefined) {
                setPostalFullAddress(user.postalFullAddress || "");
            }
            if (user?.bio !== undefined) {
                setBio(user.bio || "");
            }
        }, [
            user?.companyName,
            user?.orgNumber,
            user?.address,
            user?.city,
            user?.postCode,
            user?.fullAddress,
            user?.postalAddress,
            user?.postalCity,
            user?.postalPostCode,
            user?.postalFullAddress,
            user?.bio,
        ]);

        const handleOrgNumberChange = useCallback((e) => {
            // Only allow numbers and limit to 9 digits
            const value = e.target.value
                .replace(/\D/g, "")
                .slice(0, ORG_NUMBER_LENGTH);
            setOrgNumber(value);
            setOrgNumberError("");
            setSearchedCompany(null);
        }, []);

        // Auto-search when orgNumber reaches 9 digits
        useEffect(() => {
            let isCancelled = false;

            const searchOrgNumber = async () => {
                if (
                    !orgNumber ||
                    orgNumber.length !== ORG_NUMBER_LENGTH ||
                    orgNumber === lastSearchedOrgNumberRef.current
                ) {
                    return;
                }

                // If the org number matches the user's saved org number, use saved data
                if (
                    user?.orgNumber === orgNumber &&
                    savedCompany &&
                    savedCompany.orgNumber === orgNumber
                ) {
                    if (!isCancelled) {
                        setSearchedCompany(savedCompany);
                        lastSearchedOrgNumberRef.current = orgNumber;
                    }
                    return;
                }

                lastSearchedOrgNumberRef.current = orgNumber;
                setSearching(true);
                setOrgNumberError("");

                try {
                    const result = await searchCompanyByOrgNumber(orgNumber);

                    if (isCancelled) return;

                    if (result.success && result.company) {
                        setSearchedCompany(result.company);
                        // Auto-fill company name if it's empty or matches the original user company name
                        setCompanyName((prevName) => {
                            const currentCompanyName = prevName || "";
                            const originalCompanyName = user?.companyName || "";
                            if (
                                !currentCompanyName ||
                                currentCompanyName === originalCompanyName
                            ) {
                                return result.company.name;
                            }
                            return prevName;
                        });
                        // Auto-fill address fields if they're empty or match original user values
                        const originalAddress = user?.address || "";
                        const originalCity = user?.city || "";
                        const originalPostCode = user?.postCode || "";
                        const originalFullAddress = user?.fullAddress || "";
                        const originalPostalAddress = user?.postalAddress || "";
                        const originalPostalCity = user?.postalCity || "";
                        const originalPostalPostCode =
                            user?.postalPostCode || "";
                        const originalPostalFullAddress =
                            user?.postalFullAddress || "";

                        setAddress((prev) =>
                            !prev || prev === originalAddress
                                ? result.company.address || ""
                                : prev
                        );
                        setCity((prev) =>
                            !prev || prev === originalCity
                                ? result.company.city || ""
                                : prev
                        );
                        setPostCode((prev) =>
                            !prev || prev === originalPostCode
                                ? result.company.postCode || ""
                                : prev
                        );
                        setFullAddress((prev) =>
                            !prev || prev === originalFullAddress
                                ? result.company.fullAddress || ""
                                : prev
                        );
                        setPostalAddress((prev) =>
                            !prev || prev === originalPostalAddress
                                ? result.company.postalAddress || ""
                                : prev
                        );
                        setPostalCity((prev) =>
                            !prev || prev === originalPostalCity
                                ? result.company.postalCity || ""
                                : prev
                        );
                        setPostalPostCode((prev) =>
                            !prev || prev === originalPostalPostCode
                                ? result.company.postalPostCode || ""
                                : prev
                        );
                        setPostalFullAddress((prev) =>
                            !prev || prev === originalPostalFullAddress
                                ? result.company.postalFullAddress || ""
                                : prev
                        );
                    } else {
                        setSearchedCompany(null);
                        setOrgNumberError(
                            result.error ||
                                `Ingen bedrift funnet med organisasjonsnummer ${orgNumber}`
                        );
                    }
                } catch (err) {
                    if (!isCancelled) {
                        console.error("Error searching company:", err);
                        setSearchedCompany(null);
                        setOrgNumberError(
                            "En feil oppstod under søk. Prøv igjen."
                        );
                    }
                } finally {
                    if (!isCancelled) {
                        setSearching(false);
                    }
                }
            };

            searchOrgNumber();

            return () => {
                isCancelled = true;
            };
            // Note: savedCompany is intentionally excluded from dependencies to prevent infinite loop.
            // savedCompany is only used inside the effect for comparison, not as a trigger.
            // Including it would cause the effect to re-run every time user data refreshes.
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [orgNumber, user?.orgNumber, user?.companyName]);

        const handleUpdateCompany = useCallback(async () => {
            if (!user) return;
            setSavingCompany(true);
            try {
                // Validate org number if provided
                if (orgNumber) {
                    if (orgNumber.length !== ORG_NUMBER_LENGTH) {
                        onError("Organisasjonsnummer må være 9 siffer");
                        setSavingCompany(false);
                        return;
                    }
                    // If org number is provided, it must be validated (found in BrREG)
                    if (!searchedCompany) {
                        onError(
                            "Organisasjonsnummeret må verifiseres. Vent til søket er fullført."
                        );
                        setSavingCompany(false);
                        return;
                    }
                }

                // Prepare update object with all company information
                const updates = {
                    companyName,
                    orgNumber: orgNumber || null,
                    bio: bio || null,
                };

                // Include manually edited address fields
                updates.address = address || null;
                updates.city = city || null;
                updates.postCode = postCode || null;
                updates.fullAddress = fullAddress || null;
                updates.postalAddress = postalAddress || null;
                updates.postalCity = postalCity || null;
                updates.postalPostCode = postalPostCode || null;
                updates.postalFullAddress = postalFullAddress || null;

                // If we have searched company data, include all company information
                // (but don't override manually edited address fields if they exist)
                if (searchedCompany) {
                    updates.companyFormCode =
                        searchedCompany.companyFormCode || null;
                    updates.companyFormDescription =
                        searchedCompany.companyFormDescription || null;
                    updates.country = searchedCompany.country || null;
                    updates.registrationDate =
                        searchedCompany.registrationDate || null;
                    updates.registrationAuthority =
                        searchedCompany.registrationAuthority || null;
                    updates.status = searchedCompany.status || null;
                    updates.underLiquidation =
                        searchedCompany.underLiquidation || false;
                    updates.underBankruptcy =
                        searchedCompany.underBankruptcy || false;
                    updates.industryCodes = searchedCompany.industryCodes || [];

                    // Only use BrREG address data if user hasn't manually edited the fields
                    if (!address && searchedCompany.address) {
                        updates.address = searchedCompany.address;
                    }
                    if (!city && searchedCompany.city) {
                        updates.city = searchedCompany.city;
                    }
                    if (!postCode && searchedCompany.postCode) {
                        updates.postCode = searchedCompany.postCode;
                    }
                    if (!fullAddress && searchedCompany.fullAddress) {
                        updates.fullAddress = searchedCompany.fullAddress;
                    }
                    if (!postalAddress && searchedCompany.postalAddress) {
                        updates.postalAddress = searchedCompany.postalAddress;
                    }
                    if (!postalCity && searchedCompany.postalCity) {
                        updates.postalCity = searchedCompany.postalCity;
                    }
                    if (!postalPostCode && searchedCompany.postalPostCode) {
                        updates.postalPostCode = searchedCompany.postalPostCode;
                    }
                    if (
                        !postalFullAddress &&
                        searchedCompany.postalFullAddress
                    ) {
                        updates.postalFullAddress =
                            searchedCompany.postalFullAddress;
                    }
                }

                const result = await updateProfile(user.id, updates);
                if (result.success) {
                    onSuccess("Firmainformasjon oppdatert", true); // Refresh user data
                } else {
                    onError(
                        result.error || "Kunne ikke oppdatere firmainformasjon"
                    );
                }
            } catch (err) {
                console.error("Error updating company:", err);
                onError("En feil oppstod ved oppdatering av firmainformasjon");
            } finally {
                setSavingCompany(false);
            }
        }, [
            user,
            orgNumber,
            searchedCompany,
            companyName,
            address,
            city,
            postCode,
            fullAddress,
            postalAddress,
            postalCity,
            postalPostCode,
            postalFullAddress,
            bio,
            onSuccess,
            onError,
        ]);

        // Helper function to render company information
        const renderCompanyInfo = useCallback((company) => {
            if (!company) return null;

            return (
                <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography
                            variant="h6"
                            sx={{ mb: 2, fontWeight: 600 }}
                        >
                            {company.name}
                        </Typography>

                        <Grid container spacing={2}>
                            {/* Organisasjonsnummer */}
                            <Grid item xs={12}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ minWidth: 140 }}
                                    >
                                        Organisasjonsnummer:
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 500 }}
                                    >
                                        {company.orgNumber}
                                    </Typography>
                                </Box>
                            </Grid>

                            {/* Organisasjonsform */}
                            {company.companyFormDescription && (
                                <Grid item xs={12}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        }}
                                    >
                                        <CategoryIcon
                                            fontSize="small"
                                            color="action"
                                        />
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ minWidth: 140 }}
                                        >
                                            Organisasjonsform:
                                        </Typography>
                                        <Typography variant="body2">
                                            {company.companyFormDescription}
                                            {company.companyFormCode &&
                                                ` (${company.companyFormCode})`}
                                        </Typography>
                                    </Box>
                                </Grid>
                            )}

                            {/* Forretningsadresse */}
                            {company.fullAddress && (
                                <Grid item xs={12}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: 1,
                                        }}
                                    >
                                        <LocationOnIcon
                                            fontSize="small"
                                            color="action"
                                            sx={{ mt: 0.5 }}
                                        />
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mb: 0.5 }}
                                            >
                                                Forretningsadresse:
                                            </Typography>
                                            <Typography variant="body2">
                                                {company.fullAddress}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            )}

                            {/* Postadresse (if different) */}
                            {company.postalFullAddress &&
                                company.postalFullAddress !==
                                    company.fullAddress && (
                                    <Grid item xs={12}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                gap: 1,
                                            }}
                                        >
                                            <LocationOnIcon
                                                fontSize="small"
                                                color="action"
                                                sx={{ mt: 0.5 }}
                                            />
                                            <Box>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ mb: 0.5 }}
                                                >
                                                    Postadresse:
                                                </Typography>
                                                <Typography variant="body2">
                                                    {company.postalFullAddress}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                )}

                            {/* Stiftelsesdato */}
                            {company.registrationDate && (
                                <Grid item xs={12}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        }}
                                    >
                                        <CalendarTodayIcon
                                            fontSize="small"
                                            color="action"
                                        />
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ minWidth: 140 }}
                                        >
                                            Stiftelsesdato:
                                        </Typography>
                                        <Typography variant="body2">
                                            {new Date(
                                                company.registrationDate
                                            ).toLocaleDateString("no-NO", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </Typography>
                                    </Box>
                                </Grid>
                            )}

                            {/* Næringskoder */}
                            {company.industryCodes &&
                                company.industryCodes.length > 0 && (
                                    <Grid item xs={12}>
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mb: 1 }}
                                            >
                                                Næringskoder:
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: 1,
                                                }}
                                            >
                                                {company.industryCodes.map(
                                                    (code) => (
                                                        <Chip
                                                            key={`${code.code}-${code.description}`}
                                                            label={`${code.code} - ${code.description}`}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    )
                                                )}
                                            </Box>
                                        </Box>
                                    </Grid>
                                )}

                            {/* Status */}
                            {(company.underLiquidation ||
                                company.underBankruptcy) && (
                                <Grid item xs={12}>
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mb: 1 }}
                                        >
                                            Status:
                                        </Typography>
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            {company.underLiquidation && (
                                                <Chip
                                                    label="Under avvikling"
                                                    color="warning"
                                                    size="small"
                                                />
                                            )}
                                            {company.underBankruptcy && (
                                                <Chip
                                                    label="Under tvangsavvikling"
                                                    color="error"
                                                    size="small"
                                                />
                                            )}
                                        </Box>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </CardContent>
                </Card>
            );
        }, []);

        const isFormValid = useMemo(() => {
            if (orgNumber && orgNumber.length !== ORG_NUMBER_LENGTH) {
                return false;
            }
            if (orgNumber && !searchedCompany) {
                return false;
            }
            return true;
        }, [orgNumber, searchedCompany]);

        // Check if business address section should be shown
        const showBusinessAddress = useMemo(() => {
            if (isEditing) return true;
            // Hide if address is already shown from BrREG
            const hasBrregAddress =
                (searchedCompany && searchedCompany.fullAddress) ||
                (savedCompany && savedCompany.fullAddress);
            if (hasBrregAddress) return false;
            // Show if user has manually entered address
            return !!(address || city || postCode || fullAddress);
        }, [
            isEditing,
            searchedCompany,
            savedCompany,
            address,
            city,
            postCode,
            fullAddress,
        ]);

        // Check if postal address section should be shown
        const showPostalAddress = useMemo(() => {
            if (isEditing) return true;
            return !!(
                postalAddress ||
                postalCity ||
                postalPostCode ||
                postalFullAddress
            );
        }, [
            isEditing,
            postalAddress,
            postalCity,
            postalPostCode,
            postalFullAddress,
        ]);

        // Check if bio section should be shown
        const showBio = useMemo(() => {
            if (isEditing) return true;
            return !!bio;
        }, [isEditing, bio]);

        // Promise-based save function for use by parent
        const saveCompanyPromise = useCallback(async () => {
            if (!user) {
                return { success: false, error: "Ingen bruker er innlogget" };
            }

            // Only validate orgNumber if it's being changed (not empty and different from current)
            const isOrgNumberChanged =
                orgNumber && orgNumber !== user.orgNumber;
            if (isOrgNumberChanged) {
                if (orgNumber.length !== ORG_NUMBER_LENGTH) {
                    return {
                        success: false,
                        error: "Organisasjonsnummer må være 9 siffer",
                    };
                }
                if (!searchedCompany) {
                    return {
                        success: false,
                        error: "Organisasjonsnummeret må verifiseres. Vent til søket er fullført.",
                    };
                }
            }

            // Allow saving even if orgNumber validation fails, as long as we're not changing it
            // This allows users to update bio, companyName, addresses without orgNumber validation

            setSavingCompany(true);
            try {
                const updates = {
                    companyName,
                    orgNumber: orgNumber || null,
                    bio: bio || null,
                };

                updates.address = address || null;
                updates.city = city || null;
                updates.postCode = postCode || null;
                updates.fullAddress = fullAddress || null;
                updates.postalAddress = postalAddress || null;
                updates.postalCity = postalCity || null;
                updates.postalPostCode = postalPostCode || null;
                updates.postalFullAddress = postalFullAddress || null;

                if (searchedCompany) {
                    updates.companyFormCode =
                        searchedCompany.companyFormCode || null;
                    updates.companyFormDescription =
                        searchedCompany.companyFormDescription || null;
                    updates.country = searchedCompany.country || null;
                    updates.registrationDate =
                        searchedCompany.registrationDate || null;
                    updates.registrationAuthority =
                        searchedCompany.registrationAuthority || null;
                    updates.status = searchedCompany.status || null;
                    updates.underLiquidation =
                        searchedCompany.underLiquidation || false;
                    updates.underBankruptcy =
                        searchedCompany.underBankruptcy || false;
                    updates.industryCodes = searchedCompany.industryCodes || [];

                    if (!address && searchedCompany.address) {
                        updates.address = searchedCompany.address;
                    }
                    if (!city && searchedCompany.city) {
                        updates.city = searchedCompany.city;
                    }
                    if (!postCode && searchedCompany.postCode) {
                        updates.postCode = searchedCompany.postCode;
                    }
                    if (!fullAddress && searchedCompany.fullAddress) {
                        updates.fullAddress = searchedCompany.fullAddress;
                    }
                    if (!postalAddress && searchedCompany.postalAddress) {
                        updates.postalAddress = searchedCompany.postalAddress;
                    }
                    if (!postalCity && searchedCompany.postalCity) {
                        updates.postalCity = searchedCompany.postalCity;
                    }
                    if (!postalPostCode && searchedCompany.postalPostCode) {
                        updates.postalPostCode = searchedCompany.postalPostCode;
                    }
                    if (
                        !postalFullAddress &&
                        searchedCompany.postalFullAddress
                    ) {
                        updates.postalFullAddress =
                            searchedCompany.postalFullAddress;
                    }
                }

                const result = await updateProfile(user.id, updates);
                if (result.success) {
                    return { success: true };
                } else {
                    return {
                        success: false,
                        error:
                            result.error ||
                            "Kunne ikke oppdatere firmainformasjon",
                    };
                }
            } catch (err) {
                console.error("Error updating company:", err);
                return {
                    success: false,
                    error:
                        err.message ||
                        "En feil oppstod ved oppdatering av firmainformasjon",
                };
            } finally {
                setSavingCompany(false);
            }
        }, [
            user,
            orgNumber,
            searchedCompany,
            companyName,
            address,
            city,
            postCode,
            fullAddress,
            postalAddress,
            postalCity,
            postalPostCode,
            postalFullAddress,
            bio,
        ]);

        // Expose save handler to parent via ref
        useImperativeHandle(
            ref,
            () => ({
                save: async () => {
                    const result = await saveCompanyPromise();
                    return result.success ? true : result.error || false;
                },
            }),
            [saveCompanyPromise]
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
                        <BusinessIcon
                            sx={{
                                mr: 1.5,
                                color: theme.palette.primary.main,
                                fontSize: 28,
                            }}
                            aria-hidden="true"
                        />
                        <Typography
                            variant="h6"
                            component="h2"
                            sx={{ fontWeight: 600 }}
                        >
                            Firmainformasjon
                        </Typography>
                    </Box>

                    <TextField
                        fullWidth
                        label="Firmanavn"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        margin="normal"
                        disabled={!isEditing}
                        sx={{
                            "& .MuiInputBase-input": {
                                fontSize: { xs: "1rem", md: "0.875rem" },
                            },
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Organisasjonsnummer"
                        value={orgNumber}
                        onChange={handleOrgNumberChange}
                        margin="normal"
                        placeholder="123456789"
                        disabled={!isEditing || searching}
                        helperText={
                            searching
                                ? "Søker..."
                                : orgNumber.length === ORG_NUMBER_LENGTH
                                ? "Søker automatisk..."
                                : orgNumber.length > 0
                                ? "Må være 9 siffer"
                                : "Skriv inn 9 siffer for automatisk søk"
                        }
                        error={
                            !!orgNumberError ||
                            (orgNumber.length > 0 &&
                                orgNumber.length !== ORG_NUMBER_LENGTH)
                        }
                        InputProps={{
                            endAdornment: (searchedCompany || savedCompany) && (
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
                        sx={{
                            "& .MuiInputBase-input": {
                                fontSize: { xs: "1rem", md: "0.875rem" },
                            },
                        }}
                    />
                    {orgNumberError && (
                        <Alert severity="error" sx={{ mt: 1 }} role="alert">
                            {orgNumberError}
                        </Alert>
                    )}

                    {/* Address Fields Section */}
                    {showBusinessAddress && (
                        <Box sx={{ mt: 3 }}>
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontWeight: 600,
                                    mb: 2,
                                    color: "text.secondary",
                                }}
                            >
                                Forretningsadresse
                            </Typography>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                <Typography variant="body2">
                                    Forretningsadressen hentes automatisk fra
                                    Brønnøysundregistrene og kan ikke endres
                                    manuelt. Hvis du trenger en annen adresse,
                                    bruk Postadresse-feltet nedenfor.
                                </Typography>
                            </Alert>
                            <TextField
                                fullWidth
                                label="Gateadresse"
                                value={address}
                                margin="normal"
                                disabled={true}
                                sx={{
                                    "& .MuiInputBase-input": {
                                        fontSize: {
                                            xs: "1rem",
                                            md: "0.875rem",
                                        },
                                    },
                                }}
                            />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        label="Postnummer"
                                        value={postCode}
                                        margin="normal"
                                        disabled={true}
                                        sx={{
                                            "& .MuiInputBase-input": {
                                                fontSize: {
                                                    xs: "1rem",
                                                    md: "0.875rem",
                                                },
                                            },
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={8}>
                                    <TextField
                                        fullWidth
                                        label="Poststed"
                                        value={city}
                                        margin="normal"
                                        disabled={true}
                                        sx={{
                                            "& .MuiInputBase-input": {
                                                fontSize: {
                                                    xs: "1rem",
                                                    md: "0.875rem",
                                                },
                                            },
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <TextField
                                fullWidth
                                label="Full adresse"
                                value={fullAddress}
                                margin="normal"
                                disabled={true}
                                helperText="Hentet fra Brønnøysundregistrene"
                                sx={{
                                    "& .MuiInputBase-input": {
                                        fontSize: {
                                            xs: "1rem",
                                            md: "0.875rem",
                                        },
                                    },
                                }}
                            />
                        </Box>
                    )}

                    {/* Postal Address Fields Section */}
                    {showPostalAddress && (
                        <Box sx={{ mt: 3 }}>
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontWeight: 600,
                                    mb: 2,
                                    color: "text.secondary",
                                }}
                            >
                                Postadresse (hvis forskjellig fra
                                forretningsadresse)
                            </Typography>
                            <TextField
                                fullWidth
                                label="Postadresse"
                                value={postalAddress}
                                onChange={(e) =>
                                    setPostalAddress(e.target.value)
                                }
                                margin="normal"
                                disabled={!isEditing}
                                sx={{
                                    "& .MuiInputBase-input": {
                                        fontSize: {
                                            xs: "1rem",
                                            md: "0.875rem",
                                        },
                                    },
                                }}
                            />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        label="Postnummer"
                                        value={postalPostCode}
                                        onChange={(e) =>
                                            setPostalPostCode(e.target.value)
                                        }
                                        margin="normal"
                                        disabled={!isEditing}
                                        sx={{
                                            "& .MuiInputBase-input": {
                                                fontSize: {
                                                    xs: "1rem",
                                                    md: "0.875rem",
                                                },
                                            },
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={8}>
                                    <TextField
                                        fullWidth
                                        label="Poststed"
                                        value={postalCity}
                                        onChange={(e) =>
                                            setPostalCity(e.target.value)
                                        }
                                        margin="normal"
                                        disabled={!isEditing}
                                        sx={{
                                            "& .MuiInputBase-input": {
                                                fontSize: {
                                                    xs: "1rem",
                                                    md: "0.875rem",
                                                },
                                            },
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <TextField
                                fullWidth
                                label="Full postadresse (valgfritt)"
                                value={postalFullAddress}
                                onChange={(e) =>
                                    setPostalFullAddress(e.target.value)
                                }
                                margin="normal"
                                disabled={!isEditing}
                                helperText="Hvis postadressen er forskjellig fra postadresse + postnummer + poststed"
                                sx={{
                                    "& .MuiInputBase-input": {
                                        fontSize: {
                                            xs: "1rem",
                                            md: "0.875rem",
                                        },
                                    },
                                }}
                            />
                        </Box>
                    )}

                    {/* Bio Section */}
                    {showBio && (
                        <Box sx={{ mt: 3 }}>
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontWeight: 600,
                                    mb: 2,
                                    color: "text.secondary",
                                }}
                            >
                                Om oss / Bio
                            </Typography>
                            <TextField
                                fullWidth
                                label="Beskrivelse av virksomheten"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                margin="normal"
                                multiline
                                rows={4}
                                disabled={!isEditing}
                                helperText="Beskriv din virksomhet. Dette vil vises på leverandørprofilen din."
                                sx={{
                                    "& .MuiInputBase-input": {
                                        fontSize: {
                                            xs: "1rem",
                                            md: "0.875rem",
                                        },
                                    },
                                }}
                            />
                        </Box>
                    )}

                    {/* Empty State Prompts for Missing Fields */}
                    {!isEditing && (
                        <>
                            {/* Bio Empty State */}
                            {!bio && (
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        mt: 3,
                                        p: 2,
                                        backgroundColor: theme.palette.grey[50],
                                        borderColor: theme.palette.info.light,
                                        borderWidth: 1,
                                        borderStyle: "dashed",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: 1.5,
                                        }}
                                    >
                                        <InfoIcon
                                            sx={{
                                                color: theme.palette.info.main,
                                                mt: 0.5,
                                            }}
                                        />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    fontWeight: 600,
                                                    mb: 0.5,
                                                    color: "text.primary",
                                                }}
                                            >
                                                Legg til beskrivelse av
                                                virksomheten
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mb: 1.5 }}
                                            >
                                                En beskrivelse hjelper
                                                anskaffere å forstå hva du
                                                tilbyr og gjør deg lettere å
                                                finne i søk.
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={
                                                    <AddCircleOutlineIcon />
                                                }
                                                onClick={() => {
                                                    if (onRequestEdit) {
                                                        onRequestEdit();
                                                    }
                                                }}
                                            >
                                                Legg til beskrivelse
                                            </Button>
                                        </Box>
                                    </Box>
                                </Paper>
                            )}

                            {/* Address Empty State - only show if orgNumber exists but no city */}
                            {orgNumber &&
                                orgNumber.length === ORG_NUMBER_LENGTH &&
                                !city &&
                                !showBusinessAddress && (
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            mt: 3,
                                            p: 2,
                                            backgroundColor:
                                                theme.palette.grey[50],
                                            borderColor:
                                                theme.palette.info.light,
                                            borderWidth: 1,
                                            borderStyle: "dashed",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                gap: 1.5,
                                            }}
                                        >
                                            <LocationOnIcon
                                                sx={{
                                                    color: theme.palette.info
                                                        .main,
                                                    mt: 0.5,
                                                }}
                                            />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        mb: 0.5,
                                                        color: "text.primary",
                                                    }}
                                                >
                                                    Legg til adresseinformasjon
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ mb: 1.5 }}
                                                >
                                                    Adresseinformasjon gjør at
                                                    anskaffere kan filtrere og
                                                    finne deg basert på
                                                    geografisk plassering.
                                                </Typography>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={
                                                        <AddCircleOutlineIcon />
                                                    }
                                                    onClick={() => {
                                                        if (onRequestEdit) {
                                                            onRequestEdit();
                                                        }
                                                    }}
                                                >
                                                    Legg til adresse
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Paper>
                                )}
                        </>
                    )}

                    {searchedCompany && (
                        <Box sx={{ mt: 2 }}>
                            <Alert
                                severity="success"
                                sx={{ mb: 2 }}
                                role="alert"
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        mb: 1,
                                    }}
                                >
                                    <CheckCircleIcon />
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ fontWeight: 600 }}
                                    >
                                        Virksomhet funnet i
                                        Brønnøysundregistrene
                                    </Typography>
                                </Box>
                            </Alert>
                            {renderCompanyInfo(searchedCompany)}
                        </Box>
                    )}
                    {/* Display saved company information when user has orgNumber but no active search */}
                    {!searchedCompany && savedCompany && savedCompany.name && (
                        <Box sx={{ mt: 2 }}>
                            <Alert severity="info" sx={{ mb: 2 }} role="alert">
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                >
                                    <CheckCircleIcon />
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ fontWeight: 600 }}
                                    >
                                        Registrert firmainformasjon
                                    </Typography>
                                </Box>
                            </Alert>
                            {renderCompanyInfo(savedCompany)}
                        </Box>
                    )}
                </CardContent>
            </Card>
        );
    }
);

CompanyInformationSection.displayName = "CompanyInformationSection";

export default CompanyInformationSection;
