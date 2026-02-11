# Typography Documentation

## Overview

Typography is a fundamental aspect of the Smartplan Anskaffelse Web application's design system. This document defines the typography standards, font families, sizes, weights, and usage guidelines for consistent text styling across the application.

## Font Family

### Primary Font Stack

The application uses Material-UI's default typography system, which can be customized in the theme configuration.

**Recommended Font Stack:**

```javascript
fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif"
```

- **Inter**: Modern, clean sans-serif font (primary choice)
- **system-ui**: Uses the system's default UI font
- **Avenir, Helvetica, Arial**: Fallback fonts for compatibility
- **sans-serif**: Generic fallback

### Font Loading

Fonts should be loaded efficiently:

- Use web fonts (e.g., Google Fonts) with `font-display: swap`
- Prefer system fonts when possible for performance
- Consider font subsetting for smaller file sizes

## Typography Scale

> **⚠️ IMPORTANT**: Per PRODUCT.md requirements, **minimum 16px font size is mandatory on mobile** (320px-767px) to prevent browser zoom on iOS. Always ensure body text and interactive elements meet this requirement.

### MUI Typography Variants

Material-UI provides predefined typography variants that should be used consistently:

| Variant | Font Size | Font Weight | Line Height | Usage |
|---------|-----------|-------------|-------------|-------|
| `h1` | 2.5rem (40px) | 600 | 1.2 | Main page titles |
| `h2` | 2rem (32px) | 600 | 1.3 | Section headings |
| `h3` | 1.75rem (28px) | 600 | 1.4 | Subsection headings |
| `h4` | 1.5rem (24px) | 600 | 1.4 | Card titles, form sections |
| `h5` | 1.25rem (20px) | 600 | 1.5 | Small headings |
| `h6` | 1rem (16px) | 600 | 1.5 | Smallest headings |
| `subtitle1` | 1rem (16px) | 400 | 1.75 | Subtitles, descriptions |
| `subtitle2` | 0.875rem (14px) | 500 | 1.57 | Secondary subtitles |
| `body1` | 1rem (16px) | 400 | 1.5 | Body text (default) |
| `body2` | 0.875rem (14px) | 400 | 1.43 | Secondary body text |
| `button` | 0.875rem (14px) | 500 | 1.75 | Button text |
| `caption` | 0.75rem (12px) | 400 | 1.66 | Captions, labels |
| `overline` | 0.75rem (12px) | 400 | 2.66 | Uppercase labels |

### Responsive Typography

Typography should scale appropriately across different screen sizes. The application uses both custom breakpoints (for device categories) and MUI breakpoints (for implementation).

#### Device Categories (from PRODUCT.md)

**Mobile (320px - 767px):**
- Minimum font size: **16px** (prevents browser zoom on iOS) - **MANDATORY**
- Use smaller heading sizes: `h1` → `h2`, `h2` → `h3`, etc.
- Maintain readability with adequate line height
- Core functionality with streamlined, mobile-first design

**Tablet (768px - 1023px):**
- Use standard typography scale
- Slightly reduce heading sizes if needed
- Full functionality with optimized layouts for touch interaction

**Desktop (1024px+):**
- Use full typography scale
- Larger headings for emphasis
- Full-featured experience with all functionality available

#### MUI Breakpoints (for Implementation)

When using MUI's responsive system, use these breakpoints:

```javascript
xs: 0px      // Extra small devices (phones) - Mobile
sm: 600px    // Small devices (landscape phones) - Mobile/Tablet transition
md: 900px    // Medium devices (tablets) - Tablet
lg: 1200px   // Large devices (desktops) - Desktop
xl: 1536px   // Extra large devices (large desktops) - Large Desktop
```

**Breakpoint Mapping:**
- **Mobile**: Primarily `xs` (0px-599px), some `sm` (600px-767px)
- **Tablet**: `sm` (600px-899px) and `md` (900px-1023px)
- **Desktop**: `lg` (1200px+) and `xl` (1536px+)

#### Responsive Typography Examples

**Using MUI breakpoints in sx prop:**

```jsx
<Typography
  variant="h1"
  sx={{
    fontSize: {
      xs: "2rem",    // Mobile: 32px (h2 size)
      sm: "2.25rem", // Small tablets: 36px
      md: "2.5rem",  // Tablets: 40px
      lg: "2.5rem",  // Desktop: 40px (h1 size)
    },
  }}
>
  Responsive Heading
</Typography>
```

**Using theme breakpoints:**

```jsx
import { useTheme, useMediaQuery } from "@mui/material";

const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // < 600px
const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md")); // 600px - 899px
const isDesktop = useMediaQuery(theme.breakpoints.up("lg")); // >= 1200px

<Typography variant={isMobile ? "h3" : "h1"}>
  Adaptive Heading
</Typography>
```

## Font Weights

### Available Weights

- **400 (Regular)**: Default body text
- **500 (Medium)**: Emphasis, buttons, labels
- **600 (Semibold)**: Headings, important text
- **700 (Bold)**: Strong emphasis (use sparingly)

### Usage Guidelines

- Use regular (400) for body text and paragraphs
- Use medium (500) for buttons, labels, and subtle emphasis
- Use semibold (600) for headings and important information
- Avoid using bold (700) except for critical alerts or warnings

## Line Height

### Guidelines

- **Headings**: 1.2 - 1.4 (tighter for visual hierarchy)
- **Body text**: 1.5 - 1.75 (comfortable reading)
- **Captions/Labels**: 1.43 - 1.66 (compact but readable)

### Minimum Line Height

- Never use line height less than 1.2
- Ensure sufficient spacing for readability
- Consider accessibility standards (WCAG 2.1)

## Letter Spacing

### Default Values

- **Headings**: Slightly negative (-0.02em to -0.01em) for tighter appearance
- **Body text**: Default (0em)
- **Uppercase text**: Increased (0.05em - 0.1em) for better readability
- **Buttons**: Default or slightly increased

## Text Alignment

### Guidelines

- **Left align**: Default for most content (especially Norwegian text)
- **Center align**: Use sparingly for headings or call-to-action text
- **Right align**: Avoid except for specific cases (numbers in tables, etc.)
- **Justify**: Avoid for body text (poor readability on web)

## Color and Contrast

### Text Colors

Use theme colors for text:

- **Primary text**: `theme.palette.text.primary` (default)
- **Secondary text**: `theme.palette.text.secondary` (muted)
- **Disabled text**: `theme.palette.text.disabled`
- **Primary color**: `theme.palette.primary.main` (links, emphasis)
- **Error text**: `theme.palette.error.main` (errors, warnings)

### Contrast Requirements

- **WCAG AA**: Minimum 4.5:1 for normal text, 3:1 for large text
- **WCAG AAA**: Minimum 7:1 for normal text, 4.5:1 for large text
- Test contrast ratios using accessibility tools

## Usage Examples

### In Components

**Using MUI Typography component:**

```jsx
import { Typography } from "@mui/material";

// Heading
<Typography variant="h1">Page Title</Typography>

// Body text
<Typography variant="body1">
  This is the main body text content.
</Typography>

// With color
<Typography variant="body2" color="text.secondary">
  Secondary information text.
</Typography>
```

**Using sx prop:**

```jsx
import { Box } from "@mui/material";

<Box
  sx={{
    typography: "h4",
    fontWeight: 600,
    color: "text.primary",
  }}
>
  Custom styled text
</Box>
```

**Using theme in styled components:**

```jsx
import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";

const StyledHeading = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.h3.fontSize,
  fontWeight: 600,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
}));
```

## Theme Configuration

### Typography Theme Setup

```javascript
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    h1: {
      fontSize: "2.5rem",
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: 1.43,
    },
    button: {
      fontSize: "0.875rem",
      fontWeight: 500,
      textTransform: "none", // Override default uppercase
    },
    caption: {
      fontSize: "0.75rem",
      fontWeight: 400,
      lineHeight: 1.66,
    },
  },
});
```

## Norwegian Language Considerations

### Special Characters

- Ensure font supports Norwegian characters (æ, ø, å, Æ, Ø, Å)
- Test with Norwegian text content
- Verify proper rendering of special characters

### Text Length

- Norwegian text may be longer than English equivalents
- Design components to accommodate longer text
- Use truncation with ellipsis when necessary
- Consider responsive text wrapping

## Best Practices

1. **Consistency**: Use predefined typography variants consistently
2. **Hierarchy**: Establish clear visual hierarchy with heading sizes
3. **Readability**: Ensure sufficient contrast and line height
4. **Performance**: Optimize font loading and use system fonts when possible
5. **Accessibility**: Meet WCAG contrast requirements
6. **Responsive**: Scale typography appropriately for different screen sizes
   - **CRITICAL**: Minimum 16px font size on mobile (prevents iOS zoom)
   - Use MUI breakpoints (`xs`, `sm`, `md`, `lg`, `xl`) for responsive typography
   - Follow mobile-first approach (design for mobile, enhance for desktop)
7. **Semantic HTML**: Use appropriate HTML elements (`h1`, `h2`, `p`, etc.)
8. **Norwegian Language**: Ensure fonts support Norwegian characters (æ, ø, å)
9. **Touch-Friendly**: Consider touch targets and readability on mobile devices

## Related Documentation

- `docs/PRODUCT.md` — Product specifications (see Responsive Design Requirements section)
- `docs/THEME.md` — Theme and styling documentation
- `docs/SPACING.md` — Spacing system documentation
- `docs/BUTTONS.md` — Button typography and sizing guidelines
- `FOLDER_STRUCTURE.md` — Project organization
- [MUI Typography Documentation](https://mui.com/material-ui/react-typography/)
- [MUI Breakpoints Documentation](https://mui.com/material-ui/customization/breakpoints/)

