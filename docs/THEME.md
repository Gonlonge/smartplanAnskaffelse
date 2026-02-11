# Theme Documentation

## Overview

The Smartplan Anskaffelse Web application uses Material-UI (MUI) for theming and styling. The theme configuration provides a consistent design system across all components.

## Current Theme Configuration

The theme is defined in `src/styles/theme.js` and exported through `src/styles/index.js`. It is imported and applied in `src/App.jsx` using MUI's `ThemeProvider`.

### Theme Structure

The theme configuration includes a comprehensive design system:

```javascript
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#7f50c7",
            light: "#b794e8",
            dark: "#5d3a94",
            contrastText: "#fff",
        },
        secondary: {
            main: "#dc004e",
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
            default: "#ffffff",
            paper: "#ffffff",
        },
    },
    typography: {
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
        // Complete typography scale configured (h1-h6, body1, body2, etc.)
    },
    spacing: 8, // Default 8px base unit
    shape: {
        borderRadius: 4,
    },
    components: {
        // Component-specific overrides for Button, TextField, Typography
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1536,
        },
    },
});
```

## Color Palette

### Primary Color

-   **Main**: `#7f50c7` (Purple)
-   **Light**: `#b794e8`
-   **Dark**: `#5d3a94`
-   **Contrast Text**: `#fff`
-   Used for primary actions, links, and important UI elements

### Secondary Color

-   **Main**: `#dc004e` (Pink/Red)
-   **Light**: `#ff5983`
-   **Dark**: `#9a0036`
-   **Contrast Text**: `#fff`
-   Used for secondary actions, accents, and admin badges

### Semantic Colors

The theme includes complete semantic color palette:

-   **Error**: `#d32f2f` (with light/dark variants)
-   **Warning**: `#ed6c02` (with light/dark variants)
-   **Info**: `#0288d1` (with light/dark variants)
-   **Success**: `#2e7d32` (with light/dark variants)

### Mode

-   **Current**: `light`
-   The application currently uses light mode
-   Dark mode support is planned for future enhancement

## Theme Provider

The theme is applied globally using MUI's `ThemeProvider`:

```jsx
<ThemeProvider theme={theme}>
    <CssBaseline />
    {/* App content */}
</ThemeProvider>
```

The `CssBaseline` component provides consistent baseline CSS across browsers.

## Usage in Components

Components can access the theme using:

1. **sx prop** (recommended):

```jsx
<Box sx={{ color: "primary.main", bgcolor: "background.paper" }}>Content</Box>
```

2. **useTheme hook**:

```jsx
import { useTheme } from "@mui/material/styles";

const theme = useTheme();
const primaryColor = theme.palette.primary.main;
```

3. **styled components**:

```jsx
import { styled } from "@mui/material/styles";

const StyledComponent = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
}));
```

## Current Implementation Status

### ✅ Completed Features

1. **Theme Extracted to Separate File**
    - ✅ Theme configuration in `src/styles/theme.js`
    - ✅ Exported from `src/styles/index.js`
    - ✅ Imported in `App.jsx`

2. **Expanded Color Palette**
    - ✅ Error, warning, info, and success colors defined
    - ✅ Light/dark variants for all primary colors
    - ✅ Complete contrast text definitions

3. **Typography Customization**
    - ✅ Font family: `"Inter, system-ui, Avenir, Helvetica, Arial, sans-serif"`
    - ✅ Complete typography scale (h1-h6, body1, body2, button, caption, subtitle1, subtitle2)
    - ✅ Responsive font sizes with 16px minimum on mobile
    - ✅ Proper font weights and line heights

4. **Spacing and Breakpoints**
    - ✅ Spacing scale: 8px base unit
    - ✅ Responsive breakpoints defined (xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536)

5. **Component Overrides**
    - ✅ Button: `textTransform: "none"`, responsive `minHeight` (44px mobile, 36px desktop)
    - ✅ TextField: 16px minimum font size on mobile
    - ✅ Typography: Responsive font sizes for smaller variants (16px minimum on mobile)

## Future Enhancements

### Planned Improvements

1. **Dark mode support**
    - Add theme toggle functionality
    - Create dark mode palette
    - Persist user preference in localStorage
    - Support system preference detection

## Component Overrides

The theme includes component-specific overrides to ensure consistency and accessibility:

### Button Component
- `textTransform: "none"` - Prevents automatic uppercase
- Responsive `minHeight`: 44px on mobile, 36px on desktop (touch target compliance)

### TextField Component
- 16px minimum font size on mobile devices (accessibility compliance)

### Typography Component
- Responsive font sizes for `body2`, `button`, `caption`, and `subtitle2` variants
- Ensures 16px minimum on mobile devices for readability

See `src/styles/theme.js` for the complete implementation.

## Related Files

-   `src/styles/theme.js` - Complete theme configuration
-   `src/styles/index.js` - Styles exports (exports theme)
-   `src/App.jsx` - ThemeProvider setup and theme import
-   `src/index.css` - Global CSS styles
-   `FOLDER_STRUCTURE.md` - Project organization (see `/styles` folder)

## Related Documentation

-   `docs/TYPOGRAPHY.md` — Typography guidelines and font system
-   `docs/SPACING.md` — Spacing system and layout guidelines
-   `docs/BUTTONS.md` — Button sizes and component guidelines

## Resources

-   [MUI Theming Documentation](https://mui.com/material-ui/customization/theming/)
-   [MUI Color Palette](https://mui.com/material-ui/customization/palette/)
-   [MUI Theme Customization](https://mui.com/material-ui/customization/how-to-customize/)
