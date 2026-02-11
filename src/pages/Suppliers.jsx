import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    InputAdornment,
    Skeleton,
    useTheme,
    alpha,
    IconButton,
    Tooltip,
    Snackbar,
    Alert,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import BusinessIcon from "@mui/icons-material/Business";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import { useAuth } from "../contexts/AuthContext";
import { getAllSuppliers } from "../api/userService";
import {
    SupplierCard,
    SupplierDetailModal,
} from "../components/features/suppliers";

const Suppliers = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();

    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [cityFilter, setCityFilter] = useState("");
    const [industryFilter, setIndustryFilter] = useState("");
    const [companyFormFilter, setCompanyFormFilter] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);

    // Load suppliers on mount
    useEffect(() => {
        const loadSuppliers = async () => {
            setLoading(true);
            try {
                const allSuppliers = await getAllSuppliers();
                setSuppliers(allSuppliers);
            } catch (error) {
                console.error("Error loading suppliers:", error);
                setErrorMessage("Kunne ikke laste leverandører. Prøv igjen.");
                setShowErrorSnackbar(true);
                setSuppliers([]);
            } finally {
                setLoading(false);
            }
        };

        loadSuppliers();
    }, []);

    // Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const allSuppliers = await getAllSuppliers();
            setSuppliers(allSuppliers);
            setSuccessMessage("Leverandører oppdatert");
            setShowSuccessSnackbar(true);
        } catch (error) {
            console.error("Error refreshing suppliers:", error);
            setErrorMessage("Kunne ikke oppdatere leverandører. Prøv igjen.");
            setShowErrorSnackbar(true);
        } finally {
            setRefreshing(false);
        }
    };

    // Get unique filter options from suppliers
    const filterOptions = useMemo(() => {
        const cities = new Set();
        const industries = new Set();
        const companyForms = new Set();

        suppliers.forEach((supplier) => {
            if (supplier.city) cities.add(supplier.city);
            if (supplier.companyFormDescription)
                companyForms.add(supplier.companyFormDescription);
            if (supplier.industryCodes && supplier.industryCodes.length > 0) {
                supplier.industryCodes.forEach((code) => {
                    const industryText =
                        typeof code === "object"
                            ? `${code.code || ""} - ${code.description || ""}`
                            : code;
                    industries.add(industryText);
                });
            }
        });

        return {
            cities: Array.from(cities).sort(),
            industries: Array.from(industries).sort(),
            companyForms: Array.from(companyForms).sort(),
        };
    }, [suppliers]);

    // Filter and sort suppliers
    const filteredAndSortedSuppliers = useMemo(() => {
        let filtered = suppliers;

        // Text search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter((supplier) => {
                const companyName = (supplier.companyName || "").toLowerCase();
                const name = (supplier.name || "").toLowerCase();
                const email = (supplier.email || "").toLowerCase();
                const orgNumber = (supplier.orgNumber || "").toLowerCase();
                const city = (supplier.city || "").toLowerCase();
                const companyForm = (
                    supplier.companyFormDescription || ""
                ).toLowerCase();

                return (
                    companyName.includes(query) ||
                    name.includes(query) ||
                    email.includes(query) ||
                    orgNumber.includes(query) ||
                    city.includes(query) ||
                    companyForm.includes(query)
                );
            });
        }

        // City filter
        if (cityFilter) {
            filtered = filtered.filter(
                (supplier) => supplier.city === cityFilter
            );
        }

        // Industry filter
        if (industryFilter) {
            filtered = filtered.filter((supplier) => {
                if (
                    !supplier.industryCodes ||
                    supplier.industryCodes.length === 0
                )
                    return false;
                return supplier.industryCodes.some((code) => {
                    const industryText =
                        typeof code === "object"
                            ? `${code.code || ""} - ${code.description || ""}`
                            : code;
                    return industryText === industryFilter;
                });
            });
        }

        // Company form filter
        if (companyFormFilter) {
            filtered = filtered.filter(
                (supplier) =>
                    supplier.companyFormDescription === companyFormFilter
            );
        }

        // Sort
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case "name":
                    const nameA = (a.companyName || a.name || "").toLowerCase();
                    const nameB = (b.companyName || b.name || "").toLowerCase();
                    return nameA.localeCompare(nameB, "no");
                case "city":
                    const cityA = (a.city || "").toLowerCase();
                    const cityB = (b.city || "").toLowerCase();
                    if (cityA === cityB) {
                        const nameA = (
                            a.companyName ||
                            a.name ||
                            ""
                        ).toLowerCase();
                        const nameB = (
                            b.companyName ||
                            b.name ||
                            ""
                        ).toLowerCase();
                        return nameA.localeCompare(nameB, "no");
                    }
                    return cityA.localeCompare(cityB, "no");
                case "orgNumber":
                    const orgA = (a.orgNumber || "").toLowerCase();
                    const orgB = (b.orgNumber || "").toLowerCase();
                    return orgA.localeCompare(orgB, "no");
                default:
                    return 0;
            }
        });

        return sorted;
    }, [
        suppliers,
        searchQuery,
        cityFilter,
        industryFilter,
        companyFormFilter,
        sortBy,
    ]);

    // Check if any filters are active
    const hasActiveFilters = cityFilter || industryFilter || companyFormFilter;

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery("");
        setCityFilter("");
        setIndustryFilter("");
        setCompanyFormFilter("");
    };

    // Handle quick invite - navigate to tender create with supplier pre-selected
    const handleQuickInvite = (supplier) => {
        // Store supplier info in sessionStorage for tender creation page
        const supplierData = {
            id: supplier.id,
            companyId: supplier.companyId,
            companyName: supplier.companyName || supplier.name,
            orgNumber: supplier.orgNumber || "",
            email: supplier.email || "",
        };
        sessionStorage.setItem(
            "quickInviteSupplier",
            JSON.stringify(supplierData)
        );
        navigate("/tenders/create");
    };

    // Handle view details
    const handleViewDetails = (supplier) => {
        setSelectedSupplier(supplier);
        setDetailModalOpen(true);
    };

    return (
        <Box>
            {/* Header */}
            <Box
                sx={{
                    mb: 4,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: 2,
                }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontSize: { xs: "1.75rem", sm: "2rem" },
                            fontWeight: 600,
                            mb: 1,
                        }}
                    >
                        Leverandører
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            fontSize: { xs: "1rem", sm: "1rem" },
                        }}
                    >
                        Finn og inviter leverandører til dine anskaffelser
                    </Typography>
                </Box>
                <Tooltip title="Oppdater liste">
                    <IconButton
                        onClick={handleRefresh}
                        disabled={refreshing || loading}
                        sx={{
                            backgroundColor: "background.paper",
                            border: 1,
                            borderColor: "divider",
                            minHeight: { xs: 44, md: 36 },
                            minWidth: { xs: 44, md: 36 },
                            "&:hover": {
                                backgroundColor: alpha(
                                    theme.palette.primary.main,
                                    0.08
                                ),
                            },
                        }}
                    >
                        <RefreshIcon
                            sx={{
                                animation: refreshing
                                    ? "spin 1s linear infinite"
                                    : "none",
                                "@keyframes spin": {
                                    "0%": { transform: "rotate(0deg)" },
                                    "100%": { transform: "rotate(360deg)" },
                                },
                            }}
                        />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Search and Filters */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 3 },
                    mb: 4,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                }}
            >
                {/* Search Bar */}
                <TextField
                    fullWidth
                    placeholder="Søk etter leverandør (navn, e-post, org.nr, by)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                        endAdornment: searchQuery && (
                            <InputAdornment position="end">
                                <IconButton
                                    size="small"
                                    onClick={() => setSearchQuery("")}
                                    edge="end"
                                    sx={{
                                        minHeight: { xs: 44, md: 36 },
                                        minWidth: { xs: 44, md: 36 },
                                    }}
                                >
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        mb: 2,
                        "& .MuiInputBase-input": {
                            fontSize: {
                                xs: "1rem",
                                sm: "1rem",
                                md: "0.875rem",
                            },
                        },
                    }}
                />

                {/* Filters Section */}
                <Box sx={{ mt: 2 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 2,
                        }}
                    >
                        <FilterListIcon color="primary" />
                        <Typography variant="body2" fontWeight={500}>
                            Filtre
                        </Typography>
                        {hasActiveFilters && (
                            <Chip
                                label="Aktiv"
                                size="small"
                                color="primary"
                                sx={{
                                    height: 20,
                                    fontSize: { xs: "1rem", md: "0.875rem" },
                                }}
                            />
                        )}
                    </Box>
                    <Grid container spacing={2}>
                        {/* City Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="city-filter-label">
                                    By
                                </InputLabel>
                                <Select
                                    labelId="city-filter-label"
                                    id="city-filter"
                                    value={cityFilter}
                                    label="By"
                                    onChange={(e) =>
                                        setCityFilter(e.target.value)
                                    }
                                >
                                    <MenuItem value="">
                                        <em>Alle byer</em>
                                    </MenuItem>
                                    {filterOptions.cities.map((city) => (
                                        <MenuItem key={city} value={city}>
                                            {city}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Industry Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="industry-filter-label">
                                    Næringskode
                                </InputLabel>
                                <Select
                                    labelId="industry-filter-label"
                                    id="industry-filter"
                                    value={industryFilter}
                                    label="Næringskode"
                                    onChange={(e) =>
                                        setIndustryFilter(e.target.value)
                                    }
                                >
                                    <MenuItem value="">
                                        <em>Alle næringer</em>
                                    </MenuItem>
                                    {filterOptions.industries.map(
                                        (industry) => (
                                            <MenuItem
                                                key={industry}
                                                value={industry}
                                            >
                                                {industry}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Company Form Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="company-form-filter-label">
                                    Organisasjonsform
                                </InputLabel>
                                <Select
                                    labelId="company-form-filter-label"
                                    id="company-form-filter"
                                    value={companyFormFilter}
                                    label="Organisasjonsform"
                                    onChange={(e) =>
                                        setCompanyFormFilter(e.target.value)
                                    }
                                >
                                    <MenuItem value="">
                                        <em>Alle former</em>
                                    </MenuItem>
                                    {filterOptions.companyForms.map((form) => (
                                        <MenuItem key={form} value={form}>
                                            {form}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Sort */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="sort-label">
                                    Sorter etter
                                </InputLabel>
                                <Select
                                    labelId="sort-label"
                                    id="sort"
                                    value={sortBy}
                                    label="Sorter etter"
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <MenuItem value="name">Navn</MenuItem>
                                    <MenuItem value="city">By</MenuItem>
                                    <MenuItem value="orgNumber">
                                        Org.nr
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* Clear Filters Button */}
                    {hasActiveFilters && (
                        <Box sx={{ mt: 2 }}>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<ClearIcon />}
                                onClick={clearFilters}
                                sx={{ textTransform: "none" }}
                            >
                                Nullstill filtre
                            </Button>
                        </Box>
                    )}
                </Box>
            </Paper>

            {/* Results Count */}
            {!loading && (
                <Box sx={{ mb: 3 }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            fontSize: { xs: "1rem", sm: "1rem" },
                        }}
                    >
                        {filteredAndSortedSuppliers.length === 0
                            ? "Ingen leverandører funnet"
                            : filteredAndSortedSuppliers.length === 1
                            ? "1 leverandør funnet"
                            : `${filteredAndSortedSuppliers.length} leverandører funnet`}
                        {hasActiveFilters && (
                            <Chip
                                label={`${suppliers.length} totalt`}
                                size="small"
                                variant="outlined"
                                sx={{ ml: 1, height: 20 }}
                            />
                        )}
                    </Typography>
                </Box>
            )}

            {/* Suppliers Grid */}
            {loading ? (
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    border: 1,
                                    borderColor: "divider",
                                    borderRadius: 2,
                                }}
                            >
                                <Skeleton
                                    variant="text"
                                    width="60%"
                                    height={32}
                                    sx={{ mb: 2 }}
                                />
                                <Skeleton
                                    variant="text"
                                    width="100%"
                                    height={20}
                                    sx={{ mb: 1 }}
                                />
                                <Skeleton
                                    variant="text"
                                    width="80%"
                                    height={20}
                                />
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            ) : filteredAndSortedSuppliers.length === 0 ? (
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 4, sm: 6 },
                        textAlign: "center",
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 2,
                    }}
                >
                    <BusinessIcon
                        sx={{
                            fontSize: 64,
                            color: "text.secondary",
                            mb: 2,
                        }}
                    />
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        gutterBottom
                    >
                        {searchQuery
                            ? "Ingen leverandører funnet"
                            : "Ingen leverandører registrert"}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                    >
                        {searchQuery
                            ? "Prøv å søke med andre ord"
                            : "Leverandører vil vises her når de registrerer seg"}
                    </Typography>
                    {(searchQuery || hasActiveFilters) && (
                        <Button
                            variant="outlined"
                            onClick={clearFilters}
                            sx={{ textTransform: "none" }}
                        >
                            Nullstill filtre
                        </Button>
                    )}
                </Paper>
            ) : (
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                    {filteredAndSortedSuppliers.map((supplier) => (
                        <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            lg={3}
                            key={supplier.id}
                        >
                            <SupplierCard
                                supplier={supplier}
                                onQuickInvite={handleQuickInvite}
                                onViewDetails={handleViewDetails}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Supplier Detail Modal */}
            <SupplierDetailModal
                supplier={selectedSupplier}
                open={detailModalOpen}
                onClose={() => {
                    setDetailModalOpen(false);
                    setSelectedSupplier(null);
                }}
                onQuickInvite={handleQuickInvite}
            />

            {/* Success Snackbar */}
            <Snackbar
                open={showSuccessSnackbar}
                autoHideDuration={4000}
                onClose={() => setShowSuccessSnackbar(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setShowSuccessSnackbar(false)}
                    severity="success"
                    sx={{ width: "100%" }}
                >
                    {successMessage}
                </Alert>
            </Snackbar>

            {/* Error Snackbar */}
            <Snackbar
                open={showErrorSnackbar}
                autoHideDuration={6000}
                onClose={() => setShowErrorSnackbar(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setShowErrorSnackbar(false)}
                    severity="error"
                    sx={{ width: "100%" }}
                >
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Suppliers;
