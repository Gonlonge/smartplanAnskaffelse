import {
    Box,
    Typography,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import BusinessIcon from "@mui/icons-material/Business";

export const SupplierInvitationSection = ({
    invitedSuppliers,
    supplierInput,
    searching,
    searchedCompany,
    supplierValidationError,
    availableSuppliers,
    onInputChange,
    onAddSupplier,
    onRemoveSupplier,
    loading,
}) => {
    return (
        <Accordion 
            defaultExpanded
            sx={{
                boxShadow: "none",
                "&:before": {
                    display: "none",
                },
                "&.Mui-expanded": {
                    margin: 0,
                },
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon color="primary" />}
                sx={{
                    backgroundColor: "background.paper",
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    px: 2,
                    py: 1.5,
                    "&:hover": {
                        backgroundColor: "action.hover",
                    },
                    "&.Mui-expanded": {
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0,
                    },
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    <PersonAddIcon color="primary" />
                    <Typography
                        variant="h6"
                        color="primary"
                        sx={{
                            fontSize: {
                                xs: "1rem",
                                sm: "1.25rem",
                            },
                            fontWeight: 600,
                        }}
                    >
                        Invitasjons
                    </Typography>
                    {invitedSuppliers.length > 0 && (
                        <Chip
                            label={invitedSuppliers.length}
                            size="small"
                            sx={{
                                ml: 1,
                                backgroundColor: "primary.main",
                                color: "primary.contrastText",
                            }}
                        />
                    )}
                </Box>
            </AccordionSummary>
            <AccordionDetails
                sx={{
                    border: 1,
                    borderTop: 0,
                    borderColor: "divider",
                    borderBottomLeftRadius: 1,
                    borderBottomRightRadius: 1,
                    backgroundColor: "background.paper",
                    px: { xs: 2, sm: 3 },
                    py: { xs: 2, sm: 3 },
                }}
            >
                <Box sx={{ mb: 3 }}>
                    {supplierValidationError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {supplierValidationError}
                        </Alert>
                    )}
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        Legg til leverandører som skal inviteres til å by på
                        denne Anskaffelsen. Du kan søke etter
                        organisasjonsnummer, velge fra listen, eller legge til
                        med kun e-postadresse. E-post er påkrevd for at leverandøren skal
                        motta invitasjonen. Du kan legge til flere leverandører.
                    </Typography>

                    {/* Registry Search Section */}
                    <Box
                        sx={{
                            mb: 3,
                            p: { xs: 2, sm: 3 },
                            backgroundColor: "background.default",
                            borderRadius: 1,
                            border: 1,
                            borderColor: "divider",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 3,
                            }}
                        >
                            <BusinessIcon color="primary" />
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontSize: {
                                        xs: "0.875rem",
                                        sm: "1rem",
                                    },
                                }}
                            >
                                Registersøk
                            </Typography>
                        </Box>

                        <Grid container spacing={{ xs: 1, sm: 2 }}>
                            {/* Organisasjonsnummer */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    id="orgNumber"
                                    name="orgNumber"
                                    label="Organisasjonsnummer"
                                    value={supplierInput.orgNumber}
                                    onChange={onInputChange}
                                    disabled={
                                        loading ||
                                        searching ||
                                        !!supplierInput.companyId
                                    }
                                    placeholder="123456789"
                                    inputProps={{
                                        maxLength: 9,
                                        pattern: "[0-9]*",
                                        inputMode: "numeric",
                                    }}
                                    helperText={
                                        searching
                                            ? "Søker..."
                                            : supplierInput.orgNumber.length ===
                                              9
                                            ? "Søker automatisk..."
                                            : "Skriv inn 9 siffer for automatisk søk"
                                    }
                                />
                            </Grid>

                            {/* Leverandør dropdown */}
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="supplier-company-label">
                                        Eller velg leverandør
                                    </InputLabel>
                                    <Select
                                        labelId="supplier-company-label"
                                        id="companyId"
                                        name="companyId"
                                        value={supplierInput.companyId}
                                        onChange={onInputChange}
                                        label="Eller velg leverandør"
                                        disabled={
                                            loading ||
                                            !!searchedCompany ||
                                            !!supplierInput.orgNumber
                                        }
                                    >
                                        <MenuItem value="">
                                            <em>Ingen valgt</em>
                                        </MenuItem>
                                        {availableSuppliers.map((company) => (
                                            <MenuItem
                                                key={company.id}
                                                value={company.id}
                                            >
                                                {company.name} (
                                                {company.orgNumber})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* E-post - Required */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    required
                                    id="email"
                                    name="email"
                                    label="E-post"
                                    type="email"
                                    value={supplierInput.email}
                                    onChange={onInputChange}
                                    disabled={loading}
                                    error={
                                        !!supplierValidationError &&
                                        (supplierValidationError.includes(
                                            "E-post"
                                        ) ||
                                            supplierValidationError.includes(
                                                "e-postadresse"
                                            ))
                                    }
                                    helperText={
                                        supplierValidationError &&
                                        (supplierValidationError.includes(
                                            "E-post"
                                        ) ||
                                            supplierValidationError.includes(
                                                "e-postadresse"
                                            ))
                                            ? supplierValidationError
                                            : "E-post er påkrevd for at leverandøren skal motta invitasjonen"
                                    }
                                    sx={{
                                        "& .MuiInputBase-input": {
                                            fontSize: {
                                                xs: "1rem", // 16px minimum on mobile per TYPOGRAPHY.md
                                                sm: "inherit",
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Manual company name if not from registry */}
                            {!searchedCompany &&
                                !supplierInput.companyId &&
                                supplierInput.orgNumber.length !== 9 && (
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            id="manualCompanyName"
                                            name="manualCompanyName"
                                            label="Bedriftsnavn (valgfritt)"
                                            value={
                                                supplierInput.manualCompanyName ||
                                                ""
                                            }
                                            onChange={onInputChange}
                                            disabled={loading}
                                            error={
                                                !!supplierValidationError &&
                                                supplierValidationError.includes(
                                                    "bedriftsnavn"
                                                )
                                            }
                                            helperText={
                                                supplierValidationError &&
                                                supplierValidationError.includes(
                                                    "bedriftsnavn"
                                                )
                                                    ? supplierValidationError
                                                    : "Skriv inn bedriftsnavn hvis du ønsker (valgfritt). Du kan også legge til leverandør med kun e-post."
                                            }
                                        />
                                    </Grid>
                                )}
                        </Grid>

                        {searchedCompany && (
                            <Box
                                sx={{
                                    mt: 2,
                                    p: 2,
                                    backgroundColor: "success.light",
                                    borderRadius: 1,
                                }}
                            >
                                <Box>
                                    <Typography
                                        variant="body1"
                                        fontWeight="bold"
                                        sx={{
                                            fontSize: {
                                                xs: "0.875rem",
                                                sm: "1rem",
                                            },
                                        }}
                                    >
                                        {searchedCompany.name}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Org.nr: {searchedCompany.orgNumber}
                                    </Typography>
                                    {searchedCompany.address && (
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mt: 0.5 }}
                                        >
                                            {searchedCompany.address}
                                            {searchedCompany.postCode &&
                                                searchedCompany.city &&
                                                `, ${searchedCompany.postCode} ${searchedCompany.city}`}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        )}
                    </Box>

                    {/* "Legg til" button */}
                    <Box sx={{ mt: 2 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={onAddSupplier}
                            disabled={loading}
                            aria-busy={loading}
                            sx={{
                                fontSize: {
                                    xs: "1rem",
                                    sm: "0.875rem",
                                },
                                minHeight: {
                                    xs: 44,
                                    sm: 56,
                                },
                                textTransform: "none",
                                fontWeight: 500,
                            }}
                        >
                            Legg til leverandør
                        </Button>
                    </Box>

                    {invitedSuppliers.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Inviterte leverandører (
                                {invitedSuppliers.length})
                            </Typography>
                            <List
                                dense
                                sx={{
                                    backgroundColor: "background.paper",
                                    borderRadius: 1,
                                    border: 1,
                                    borderColor: "divider",
                                }}
                            >
                                {invitedSuppliers.map((supplier) => (
                                    <ListItem key={supplier.id}>
                                        <ListItemText
                                            primary={
                                                supplier.companyName ||
                                                supplier.email ||
                                                "Ukjent leverandør"
                                            }
                                            secondary={
                                                <>
                                                    {supplier.orgNumber && (
                                                        <>
                                                            Org.nr:{" "}
                                                            {supplier.orgNumber}
                                                            {supplier.email &&
                                                                " • "}
                                                        </>
                                                    )}
                                                    {supplier.email &&
                                                        supplier.companyName &&
                                                        supplier.email}
                                                    {!supplier.orgNumber &&
                                                        !supplier.email &&
                                                        supplier.companyId}
                                                </>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge="end"
                                                aria-label="fjern leverandør"
                                                onClick={() =>
                                                    onRemoveSupplier(
                                                        supplier.id
                                                    )
                                                }
                                                disabled={loading}
                                                sx={{
                                                    minHeight: {
                                                        xs: 44,
                                                        md: 36,
                                                    },
                                                    minWidth: {
                                                        xs: 44,
                                                        md: 36,
                                                    },
                                                }}
                                            >
                                                <DeleteIcon aria-hidden="true" />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};
