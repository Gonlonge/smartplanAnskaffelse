import { createTheme } from "@mui/material/styles";

/**
 * Smartplan Anskaffelse Web Theme Configuration
 * 
 * This theme follows the guidelines from:
 * - docs/THEME.md - Theme and styling documentation
 * - docs/TYPOGRAPHY.md - Typography guidelines
 * - docs/SPACING.md - Spacing system
 * - docs/PRODUCT.md - Product specifications
 */
export const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#7f50c7", // Purple
            light: "#b794e8",
            dark: "#5d3a94",
            contrastText: "#fff",
        },
        secondary: {
            main: "#dc004e", // Pink/Red - per THEME.md specification
            light: "#ff5983",
            dark: "#9a0036",
            contrastText: "#fff",
        },
        error: {
            main: "#d32f2f",
            light: "#ef5350",
            dark: "#c62828",
        },
        warning: {
            main: "#ed6c02",
            light: "#ff9800",
            dark: "#e65100",
        },
        info: {
            main: "#0288d1",
            light: "#03a9f4",
            dark: "#01579b",
        },
        success: {
            main: "#2e7d32",
            light: "#4caf50",
            dark: "#1b5e20",
        },
        background: {
            default: "#f8f9fa", // Very light gray - iOS style
            paper: "#ffffff", // Solid white for better readability
        },
    },
    typography: {
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
        h1: {
            fontSize: "2.5rem", // 40px - Desktop default
            fontWeight: 600,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
        },
        h2: {
            fontSize: "2rem", // 32px
            fontWeight: 600,
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
        },
        h3: {
            fontSize: "1.75rem", // 28px
            fontWeight: 600,
            lineHeight: 1.4,
        },
        h4: {
            fontSize: "1.5rem", // 24px
            fontWeight: 600,
            lineHeight: 1.4,
        },
        h5: {
            fontSize: "1.25rem", // 20px
            fontWeight: 600,
            lineHeight: 1.5,
        },
        h6: {
            fontSize: "1rem", // 16px - minimum for mobile per TYPOGRAPHY.md
            fontWeight: 600,
            lineHeight: 1.5,
        },
        body1: {
            fontSize: "1rem", // 16px - minimum for mobile per TYPOGRAPHY.md
            fontWeight: 400,
            lineHeight: 1.5,
        },
        body2: {
            fontSize: "0.875rem", // 14px - will be overridden to 16px on mobile via component overrides
            fontWeight: 400,
            lineHeight: 1.43,
        },
        button: {
            fontSize: "0.875rem", // 14px - will be overridden to 16px on mobile via component overrides
            fontWeight: 500,
            lineHeight: 1.75,
            textTransform: "none", // Override default uppercase
        },
        caption: {
            fontSize: "0.75rem", // 12px - will be overridden to 16px on mobile via component overrides
            fontWeight: 400,
            lineHeight: 1.66,
        },
        subtitle1: {
            fontSize: "1rem", // 16px
            fontWeight: 400,
            lineHeight: 1.75,
        },
        subtitle2: {
            fontSize: "0.875rem", // 14px - will be overridden to 16px on mobile via component overrides
            fontWeight: 500,
            lineHeight: 1.57,
        },
    },
    spacing: 8, // Default 8px base unit per SPACING.md
    shape: {
        borderRadius: 8, // iOS-style minimal radius
    },
    // Remove all shadows for flat iOS design
    shadows: Array(25).fill('none'),
    components: {
        MuiButton: {
            styleOverrides: {
                root: ({ theme }) => ({
                    textTransform: "none", // Override default uppercase
                    minHeight: 44, // Touch target minimum per PRODUCT.md (mobile)
                    boxShadow: 'none',
                    [theme.breakpoints.up("md")]: {
                        minHeight: 36, // Smaller on desktop
                    },
                    '&:hover': {
                        boxShadow: 'none',
                    },
                }),
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: 12, // iOS-style rounded corners
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    boxShadow: 'none',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: 12,
                    backgroundColor: '#ffffff', // Solid white background for better readability
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    boxShadow: 'none',
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    boxShadow: 'none',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: 12,
                    backgroundColor: '#ffffff', // Solid white background
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: ({ theme }) => ({
                    "& .MuiInputBase-input": {
                        [theme.breakpoints.down("sm")]: {
                            fontSize: "1rem", // 16px minimum on mobile
                        },
                    },
                }),
            },
        },
        MuiTypography: {
            styleOverrides: {
                body2: ({ theme }) => ({
                    [theme.breakpoints.down("sm")]: {
                        fontSize: "1rem", // 16px minimum on mobile
                    },
                }),
                button: ({ theme }) => ({
                    [theme.breakpoints.down("sm")]: {
                        fontSize: "1rem", // 16px minimum on mobile
                    },
                }),
                caption: ({ theme }) => ({
                    [theme.breakpoints.down("sm")]: {
                        fontSize: "1rem", // 16px minimum on mobile
                    },
                }),
                subtitle2: ({ theme }) => ({
                    [theme.breakpoints.down("sm")]: {
                        fontSize: "1rem", // 16px minimum on mobile
                    },
                }),
            },
        },
    },
    breakpoints: {
        values: {
            xs: 0,      // Mobile: 0px-599px
            sm: 600,    // Small devices: 600px-899px
            md: 900,    // Tablets: 900px-1199px
            lg: 1200,   // Desktop: 1200px-1535px
            xl: 1536,   // Large desktop: 1536px+
        },
    },
});

