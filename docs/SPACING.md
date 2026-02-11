# Spacing Documentation

## Overview

Spacing is a critical aspect of the Smartplan Anskaffelse Web application's design system. This document defines the spacing scale, usage guidelines, and best practices for consistent spacing across components and layouts.

## Spacing Scale

### MUI Spacing System

Material-UI uses an 8px base spacing unit by default. The spacing function multiplies this base unit:

```javascript
// Default spacing unit: 8px
spacing(1) = 8px
spacing(2) = 16px
spacing(3) = 24px
spacing(4) = 32px
spacing(5) = 40px
spacing(6) = 48px
spacing(8) = 64px
spacing(10) = 80px
```

### Spacing Scale Reference

| Multiplier | Pixels | Usage |
|------------|--------|-------|
| 0.5 | 4px | Tight spacing, icon padding |
| 1 | 8px | Small gaps, compact spacing |
| 2 | 16px | Standard spacing, component padding |
| 3 | 24px | Medium spacing, section gaps |
| 4 | 32px | Large spacing, major sections |
| 5 | 40px | Extra large spacing |
| 6 | 48px | Section separators |
| 8 | 64px | Page-level spacing |
| 10 | 80px | Maximum spacing (rare) |

## Usage Guidelines

### Component Spacing

**Padding (Internal Spacing):**

- **Small components**: `padding: theme.spacing(1)` (8px)
- **Standard components**: `padding: theme.spacing(2)` (16px)
- **Large components**: `padding: theme.spacing(3)` (24px)
- **Cards/Panels**: `padding: theme.spacing(2)` to `theme.spacing(3)`

**Margin (External Spacing):**

- **Between related elements**: `marginBottom: theme.spacing(1)` (8px)
- **Between sections**: `marginBottom: theme.spacing(2)` (16px)
- **Between major sections**: `marginBottom: theme.spacing(4)` (32px)
- **Page margins**: `margin: theme.spacing(3)` to `theme.spacing(4)`

### Layout Spacing

**Grid Spacing:**

```jsx
<Grid container spacing={2}>
  {/* 16px gap between grid items */}
</Grid>

<Grid container spacing={3}>
  {/* 24px gap between grid items */}
</Grid>
```

**Stack Spacing:**

```jsx
<Stack spacing={2}>
  {/* 16px gap between stack items */}
</Stack>

<Stack spacing={3}>
  {/* 24px gap between stack items */}
</Stack>
```

### Responsive Spacing

Spacing should adapt to screen size:

**Mobile (320px - 767px):**
- Reduce spacing: Use `spacing(1)` to `spacing(2)` for most elements
- Tighter margins: `spacing(2)` for page margins
- Compact layouts: Minimize vertical spacing

**Tablet (768px - 1023px):**
- Standard spacing: Use `spacing(2)` to `spacing(3)`
- Moderate margins: `spacing(3)` for page margins

**Desktop (1024px+):**
- Generous spacing: Use `spacing(3)` to `spacing(4)`
- Comfortable margins: `spacing(4)` for page margins
- More breathing room between sections

## Common Spacing Patterns

### Form Spacing

```jsx
// Form field spacing
<Stack spacing={2}>
  <TextField label="Field 1" />
  <TextField label="Field 2" />
  <TextField label="Field 3" />
</Stack>

// Form section spacing
<Box sx={{ mb: 4 }}>
  <Typography variant="h4" sx={{ mb: 2 }}>
    Section Title
  </Typography>
  {/* Form fields */}
</Box>
```

### Card Spacing

```jsx
<Card sx={{ p: 3, mb: 2 }}>
  {/* Card content with 24px padding */}
</Card>

<Card sx={{ p: 2 }}>
  {/* Card content with 16px padding */}
</Card>
```

### List Spacing

```jsx
<List sx={{ py: 2 }}>
  <ListItem sx={{ py: 1 }}>
    {/* List item with 8px vertical padding */}
  </ListItem>
</List>
```

### Button Spacing

```jsx
// Button group spacing
<Stack direction="row" spacing={2}>
  <Button>Cancel</Button>
  <Button variant="contained">Submit</Button>
</Stack>

// Button margin
<Button sx={{ mt: 3, mb: 2 }}>
  Action Button
</Button>
```

## Spacing Utilities

### Using sx Prop

```jsx
import { Box } from "@mui/material";

// Margin
<Box sx={{ m: 2 }}>All sides: 16px</Box>
<Box sx={{ mt: 2, mb: 2 }}>Top & bottom: 16px</Box>
<Box sx={{ ml: 2, mr: 2 }}>Left & right: 16px</Box>
<Box sx={{ mx: 2 }}>Horizontal: 16px</Box>
<Box sx={{ my: 2 }}>Vertical: 16px</Box>

// Padding
<Box sx={{ p: 2 }}>All sides: 16px</Box>
<Box sx={{ pt: 2, pb: 2 }}>Top & bottom: 16px</Box>
<Box sx={{ pl: 2, pr: 2 }}>Left & right: 16px</Box>
<Box sx={{ px: 2 }}>Horizontal: 16px</Box>
<Box sx={{ py: 2 }}>Vertical: 16px</Box>
```

### Using theme.spacing()

```jsx
import { useTheme } from "@mui/material/styles";

const theme = useTheme();

<Box sx={{ margin: theme.spacing(2) }}>
  Content with 16px margin
</Box>
```

### Using styled Components

```jsx
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

const SpacedBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
}));
```

## Grid System Spacing

### MUI Grid Spacing

```jsx
import { Grid } from "@mui/material";

// Standard grid with spacing
<Grid container spacing={2}>
  <Grid item xs={12} sm={6} md={4}>
    {/* Content */}
  </Grid>
  <Grid item xs={12} sm={6} md={4}>
    {/* Content */}
  </Grid>
</Grid>

// Responsive grid spacing
<Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
  {/* Different spacing for different breakpoints */}
</Grid>
```

### Grid Spacing Values

- **xs (mobile)**: `spacing={1}` (8px) - Compact
- **sm (tablet)**: `spacing={2}` (16px) - Standard
- **md+ (desktop)**: `spacing={3}` (24px) - Generous

## Container and Page Spacing

### Page Container

```jsx
<Container maxWidth="lg" sx={{ py: 4 }}>
  {/* Page content with 32px vertical padding */}
</Container>
```

### Section Spacing

```jsx
<Box component="section" sx={{ mb: 6 }}>
  {/* Major section with 48px bottom margin */}
</Box>

<Box component="section" sx={{ mb: 4 }}>
  {/* Standard section with 32px bottom margin */}
</Box>
```

## Negative Spacing

### When to Use

Negative spacing should be used sparingly and only when necessary:

- Overlapping elements (rare)
- Pulling elements closer together
- Breaking out of container constraints

### Example

```jsx
<Box sx={{ mt: -2, mb: 2 }}>
  {/* Pulled up 16px */}
</Box>
```

## Theme Configuration

### Custom Spacing Unit

To change the base spacing unit:

```javascript
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  spacing: 8, // Default: 8px base unit
  // Or use a function:
  spacing: (factor) => `${0.5 * factor}rem`, // 0.5rem base unit
});
```

### Recommended Configuration

```javascript
const theme = createTheme({
  spacing: 8, // Keep default 8px base unit
  // This provides good granularity and is widely used
});
```

## Spacing Best Practices

1. **Consistency**: Use the spacing scale consistently throughout the application
2. **Visual Hierarchy**: Use larger spacing to separate major sections
3. **Grouping**: Use smaller spacing for related elements
4. **Responsive**: Adjust spacing for different screen sizes
5. **Whitespace**: Don't be afraid of whitespace - it improves readability
6. **Alignment**: Use consistent spacing to maintain visual alignment
7. **Accessibility**: Ensure sufficient spacing for touch targets (minimum 44x44px on mobile)

## Touch Target Spacing

### Mobile Considerations

- **Minimum touch target**: 44x44px (iOS) / 48x48px (Material Design)
- **Spacing between touch targets**: Minimum 8px (spacing(1))
- **Recommended spacing**: 16px (spacing(2)) for comfortable interaction

```jsx
// Touch-friendly button spacing
<Stack direction="row" spacing={2}>
  <Button sx={{ minHeight: 44, minWidth: 44 }}>
    Action
  </Button>
</Stack>
```

## Common Spacing Mistakes to Avoid

1. **Inconsistent spacing**: Mixing different spacing values without reason
2. **Too tight**: Insufficient spacing causing cramped layouts
3. **Too loose**: Excessive spacing breaking visual relationships
4. **Hardcoded values**: Using pixel values instead of theme.spacing()
5. **Ignoring responsive**: Same spacing on all screen sizes
6. **No spacing scale**: Random spacing values throughout

## Examples

### Complete Component Example

```jsx
import { Box, Card, Typography, Stack, Button } from "@mui/material";

function ExampleComponent() {
  return (
    <Box sx={{ p: 3 }}>
      {/* Page padding: 24px */}
      <Typography variant="h4" sx={{ mb: 3 }}>
        {/* Heading with 24px bottom margin */}
        Section Title
      </Typography>

      <Stack spacing={2} sx={{ mb: 4 }}>
        {/* Stack with 16px spacing, 32px bottom margin */}
        <Card sx={{ p: 2 }}>
          {/* Card with 16px padding */}
          Content
        </Card>
        <Card sx={{ p: 2 }}>
          Content
        </Card>
      </Stack>

      <Stack direction="row" spacing={2}>
        {/* Button group with 16px spacing */}
        <Button variant="outlined">Cancel</Button>
        <Button variant="contained">Submit</Button>
      </Stack>
    </Box>
  );
}
```

## Related Documentation

- `docs/THEME.md` — Theme and styling documentation
- `docs/TYPOGRAPHY.md` — Typography documentation
- `docs/BUTTONS.md` — Button sizes and spacing guidelines
- `docs/PRODUCT.md` — Product specifications (responsive design section)
- `FOLDER_STRUCTURE.md` — Project organization
- [MUI Spacing Documentation](https://mui.com/material-ui/customization/spacing/)
- [MUI Grid System](https://mui.com/material-ui/react-grid/)

