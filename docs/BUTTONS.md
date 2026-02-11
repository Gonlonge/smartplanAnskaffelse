# Button Documentation

## Overview

Buttons are critical interactive elements in the Smartplan Anskaffelse Web application. This document defines button sizes, spacing, variants, and UI/UX best practices following accessibility standards and Material Design guidelines.

## Button Sizes

### Height Specifications

Buttons have responsive height requirements to ensure accessibility and touch-friendliness:

| Breakpoint | Minimum Height | Target Height | Usage |
|------------|----------------|--------------|-------|
| **Mobile (xs, sm)** | 44px | 44px | Touch target minimum (iOS/Material Design) |
| **Tablet (md)** | 36px | 40px | Standard desktop size |
| **Desktop (lg, xl)** | 36px | 40px | Standard desktop size |

**Implementation:**
- Mobile: `minHeight: 44px` (enforced via theme override)
- Desktop: `minHeight: 36px` (applied at `md` breakpoint and above)

### Width Specifications

Button width should be flexible and content-driven:

- **Text buttons**: Auto-width based on content + padding
- **Icon buttons**: Minimum 44x44px on mobile, 36x36px on desktop
- **Full-width buttons**: Use `fullWidth` prop on mobile for better touch targets
- **Minimum width**: Ensure sufficient padding for readability (minimum 48px for text buttons)

### Padding Specifications

Button padding follows Material-UI defaults with responsive adjustments:

| Size | Horizontal Padding | Vertical Padding | Total Height (approx) |
|------|-------------------|------------------|---------------------|
| **Small** | 8px | 6px | ~36px (desktop) / ~44px (mobile) |
| **Medium** (default) | 16px | 8px | ~40px (desktop) / ~44px (mobile) |
| **Large** | 24px | 12px | ~48px (desktop) / ~52px (mobile) |

**Note:** Actual height is determined by `minHeight` override in theme, ensuring touch targets are met.

## Typography

### Font Size

Button text follows responsive typography rules:

| Breakpoint | Font Size | Font Weight | Line Height |
|------------|-----------|-------------|-------------|
| **Mobile (xs, sm)** | 1rem (16px) | 500 (Medium) | 1.75 |
| **Desktop (md+)** | 0.875rem (14px) | 500 (Medium) | 1.75 |

**Critical:** Minimum 16px font size on mobile prevents browser zoom on iOS devices.

### Text Transform

- **Default**: `textTransform: "none"` (normal case)
- Buttons display text in their natural case (not uppercase)
- Override default MUI uppercase behavior

## Touch Target Requirements

### Accessibility Standards

Following WCAG 2.1 and platform-specific guidelines:

- **iOS Human Interface Guidelines**: Minimum 44x44px touch target
- **Material Design Guidelines**: Minimum 48x48px touch target (we use 44px minimum)
- **WCAG 2.1**: Minimum 24x24px, but 44x44px recommended for better usability

### Implementation

```jsx
// Theme configuration ensures minimum touch targets
MuiButton: {
    styleOverrides: {
        root: ({ theme }) => ({
            minHeight: 44, // Touch target minimum (mobile)
            [theme.breakpoints.up("md")]: {
                minHeight: 36, // Smaller on desktop
            },
        }),
    },
}

// Icon buttons should also meet minimum size
<IconButton sx={{ minHeight: 44, minWidth: 44 }}> // Mobile
<IconButton sx={{ minHeight: 36, minWidth: 36 }}> // Desktop
```

## Button Spacing

### Spacing Between Buttons

Buttons should have adequate spacing to prevent accidental taps:

| Context | Spacing | Implementation |
|---------|---------|----------------|
| **Horizontal button groups** | 16px (spacing(2)) | `spacing={2}` in Stack |
| **Vertical button groups** | 16px (spacing(2)) | `spacing={2}` in Stack |
| **Minimum spacing** | 8px (spacing(1)) | Absolute minimum for touch targets |
| **Recommended spacing** | 16px (spacing(2)) | Comfortable interaction |

### Examples

```jsx
// Horizontal button group
<Stack direction="row" spacing={2}>
    <Button variant="outlined">Cancel</Button>
    <Button variant="contained">Submit</Button>
</Stack>

// Vertical button group
<Stack spacing={2}>
    <Button variant="contained">Primary Action</Button>
    <Button variant="outlined">Secondary Action</Button>
</Stack>

// Using gap property
<Box sx={{ display: "flex", gap: 2 }}>
    <Button>Action 1</Button>
    <Button>Action 2</Button>
</Box>
```

### Button Margins

When buttons are placed independently (not in groups):

- **Top margin**: `mt: 2` (16px) or `mt: 3` (24px) for separation from content above
- **Bottom margin**: `mb: 2` (16px) or `mb: 3` (24px) for separation from content below
- **Side margins**: Use `mx: 2` (16px) for horizontal centering or spacing

## Button Variants

### Available Variants

Material-UI provides several button variants:

| Variant | Usage | Visual Style |
|---------|-------|--------------|
| **contained** | Primary actions | Solid background, high emphasis |
| **outlined** | Secondary actions | Border only, medium emphasis |
| **text** | Tertiary actions | Text only, low emphasis |

### Size Variants

| Size | Usage | Height | Padding |
|------|-------|--------|---------|
| **small** | Dense layouts, tables | ~32px | 4px 8px |
| **medium** (default) | Standard use | ~40px (desktop) / ~44px (mobile) | 8px 16px |
| **large** | Prominent CTAs | ~48px | 12px 24px |

**Note:** `minHeight` override ensures mobile buttons meet 44px minimum regardless of size variant.

## Responsive Behavior

### Mobile-First Approach

Buttons should adapt to screen size:

**Mobile (320px - 767px):**
- Full-width buttons for primary actions (`fullWidth` prop)
- Minimum 44px height (enforced)
- 16px font size (prevents iOS zoom)
- 16px spacing between buttons
- Adequate padding for touch targets

**Tablet (768px - 1023px):**
- Auto-width buttons (unless full-width needed)
- 36px minimum height
- 14px font size
- 16px spacing between buttons

**Desktop (1024px+):**
- Auto-width buttons
- 36px minimum height
- 14px font size
- 16px-24px spacing between buttons

### Responsive Examples

```jsx
// Responsive button sizing
<Button
    variant="contained"
    fullWidth={isMobile} // Full width on mobile only
    sx={{
        fontSize: {
            xs: "1rem",    // 16px on mobile
            sm: "0.875rem", // 14px on tablet+
        },
        minHeight: {
            xs: 44,  // 44px on mobile
            md: 36,  // 36px on desktop
        },
    }}
>
    Submit
</Button>

// Responsive button groups
<Stack
    direction={{ xs: "column", sm: "row" }}
    spacing={2}
>
    <Button variant="outlined">Cancel</Button>
    <Button variant="contained">Submit</Button>
</Stack>
```

## Border Radius

### Standard Border Radius

- **Default**: 4px (per theme `shape.borderRadius`)
- **Consistent**: All buttons use the same border radius
- **No customization needed**: Theme handles this automatically

## Button States

### Interactive States

Buttons should clearly indicate their state:

| State | Visual Indicator | Usage |
|-------|-----------------|-------|
| **Default** | Normal styling | Ready for interaction |
| **Hover** | Elevated shadow, color change | Mouse over |
| **Focus** | Focus ring/outline | Keyboard navigation |
| **Active** | Pressed state | During click/tap |
| **Disabled** | Reduced opacity, no interaction | Unavailable action |
| **Loading** | Spinner + disabled state | Async operation in progress |

### Disabled State

- **Opacity**: 0.38 (MUI default)
- **Cursor**: `not-allowed`
- **Interaction**: No hover/focus effects
- **Accessibility**: `aria-disabled="true"` or `disabled` prop

## Color Usage

### Button Colors

Buttons use theme colors:

| Color | Variant | Usage |
|-------|---------|-------|
| **primary** | contained, outlined, text | Primary actions |
| **secondary** | contained, outlined, text | Secondary actions |
| **error** | contained, outlined, text | Destructive actions |
| **success** | contained, outlined, text | Success/confirmation actions |
| **warning** | contained, outlined, text | Warning actions |
| **info** | contained, outlined, text | Informational actions |

### Color Guidelines

- **Primary actions**: Use `color="primary"` with `variant="contained"`
- **Secondary actions**: Use `color="primary"` with `variant="outlined"` or `variant="text"`
- **Destructive actions**: Use `color="error"` with `variant="contained"` or `variant="outlined"`
- **Consistency**: Use the same color scheme throughout the application

## Icon Buttons

### Icon Button Sizes

Icon buttons follow the same touch target requirements:

| Breakpoint | Size | Minimum |
|------------|------|---------|
| **Mobile** | 44x44px | 44x44px |
| **Desktop** | 36x36px | 36x36px |

### Icon Size

- **Small icon button**: 20px icon
- **Medium icon button** (default): 24px icon
- **Large icon button**: 28px icon

### Examples

```jsx
// Standard icon button
<IconButton sx={{ minHeight: 44, minWidth: 44 }}>
    <DeleteIcon />
</IconButton>

// Responsive icon button
<IconButton
    sx={{
        minHeight: { xs: 44, md: 36 },
        minWidth: { xs: 44, md: 36 },
    }}
>
    <EditIcon />
</IconButton>
```

## Button Groups

### Horizontal Button Groups

```jsx
// Standard horizontal group
<Stack direction="row" spacing={2}>
    <Button variant="outlined">Cancel</Button>
    <Button variant="contained">Submit</Button>
</Stack>

// With responsive direction
<Stack
    direction={{ xs: "column", sm: "row" }}
    spacing={2}
>
    <Button variant="outlined" fullWidth={isMobile}>
        Cancel
    </Button>
    <Button variant="contained" fullWidth={isMobile}>
        Submit
    </Button>
</Stack>
```

### Vertical Button Groups

```jsx
<Stack spacing={2}>
    <Button variant="contained" fullWidth>
        Primary Action
    </Button>
    <Button variant="outlined" fullWidth>
        Secondary Action
    </Button>
</Stack>
```

## Best Practices

### UI/UX Guidelines

1. **Touch Targets**: Always ensure minimum 44x44px on mobile
2. **Spacing**: Use 16px spacing between buttons (spacing(2))
3. **Font Size**: Minimum 16px on mobile to prevent iOS zoom
4. **Full Width**: Use `fullWidth` on mobile for primary actions
5. **Visual Hierarchy**: Use contained variant for primary, outlined for secondary
6. **Consistency**: Use the same button styles throughout the application
7. **Accessibility**: Include proper ARIA labels and keyboard navigation support
8. **Loading States**: Show loading indicators for async operations
9. **Disabled States**: Clearly indicate when actions are unavailable
10. **Responsive**: Adapt button layout and sizing for different screen sizes

### Common Patterns

**Form Actions:**
```jsx
<Stack direction="row" spacing={2} sx={{ mt: 3 }}>
    <Button variant="outlined" onClick={handleCancel}>
        Avbryt
    </Button>
    <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
    >
        {loading ? "Lagrer..." : "Lagre"}
    </Button>
</Stack>
```

**Card Actions:**
```jsx
<CardActions sx={{ px: 2, pb: 2 }}>
    <Button size="small" variant="text">
        Learn More
    </Button>
    <Button size="small" variant="contained">
        Action
    </Button>
</CardActions>
```

**Floating Action Button (FAB):**
```jsx
<Fab
    color="primary"
    sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        minHeight: 56, // FAB standard size
        minWidth: 56,
    }}
>
    <AddIcon />
</Fab>
```

## Accessibility

### Keyboard Navigation

- **Tab**: Navigate to button
- **Enter/Space**: Activate button
- **Focus indicator**: Visible focus ring/outline
- **Focus order**: Logical tab order

### Screen Readers

- **Labels**: Use descriptive button text
- **ARIA**: Use `aria-label` for icon-only buttons
- **State**: Use `aria-disabled` for disabled buttons
- **Loading**: Use `aria-busy="true"` for loading states

### Examples

```jsx
// Accessible icon button
<IconButton
    aria-label="Delete item"
    onClick={handleDelete}
>
    <DeleteIcon />
</IconButton>

// Accessible loading button
<Button
    variant="contained"
    disabled={loading}
    aria-busy={loading}
    aria-label={loading ? "Saving..." : "Save changes"}
>
    {loading ? "Lagrer..." : "Lagre"}
</Button>
```

## Theme Configuration

### Current Theme Overrides

The button configuration is defined in `src/styles/theme.js`:

```javascript
components: {
    MuiButton: {
        styleOverrides: {
            root: ({ theme }) => ({
                textTransform: "none", // Override default uppercase
                minHeight: 44, // Touch target minimum (mobile)
                [theme.breakpoints.up("md")]: {
                    minHeight: 36, // Smaller on desktop
                },
            }),
        },
    },
}
```

### Typography Configuration

Button typography is defined in the theme:

```javascript
typography: {
    button: {
        fontSize: "0.875rem", // 14px - overridden to 16px on mobile
        fontWeight: 500,
        lineHeight: 1.75,
        textTransform: "none",
    },
}
```

## Related Documentation

- `docs/THEME.md` — Theme and styling documentation
- `docs/TYPOGRAPHY.md` — Typography guidelines (button font sizes)
- `docs/SPACING.md` — Spacing system (button spacing guidelines)
- `docs/PRODUCT.md` — Product specifications (responsive design requirements)

## Resources

- [MUI Button Documentation](https://mui.com/material-ui/react-button/)
- [MUI IconButton Documentation](https://mui.com/material-ui/react-icon-button/)
- [Material Design Button Guidelines](https://m2.material.io/components/buttons)
- [WCAG 2.1 Touch Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [iOS Human Interface Guidelines - Touch Targets](https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/adaptivity-and-layout/)

