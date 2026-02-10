# Design Tokens Reference

## Color Variables

All colors use OKLCH color space for perceptual uniformity and better dark mode support.

### Light Mode (Root)

```css
--background: oklch(1 0 0);              /* Pure white */
--foreground: oklch(0.145 0 0);          /* Near black */
--primary: oklch(0.205 0 0);             /* Dark gray */
--primary-foreground: oklch(0.985 0 0);  /* Near white */
--secondary: oklch(0.97 0 0);            /* Light gray */
--secondary-foreground: oklch(0.205 0 0);/* Dark gray */
--muted: oklch(0.97 0 0);                /* Light gray */
--muted-foreground: oklch(0.556 0 0);    /* Medium gray */
--accent: oklch(0.97 0 0);               /* Light gray */
--accent-foreground: oklch(0.205 0 0);   /* Dark gray */
--destructive: oklch(0.577 0.245 27.325);/* Red */
--border: oklch(0.922 0 0);              /* Light gray border */
--input: oklch(0.922 0 0);               /* Input border */
--ring: oklch(0.708 0 0);                /* Focus ring */
```

### Dark Mode (.dark)

```css
--background: oklch(0.145 0 0);          /* Near black */
--foreground: oklch(0.985 0 0);          /* Near white */
--primary: oklch(0.922 0 0);             /* Light gray */
--primary-foreground: oklch(0.205 0 0);  /* Dark gray */
--secondary: oklch(0.269 0 0);           /* Dark gray */
--secondary-foreground: oklch(0.985 0 0);/* Near white */
--muted: oklch(0.269 0 0);               /* Dark gray */
--muted-foreground: oklch(0.708 0 0);    /* Medium gray */
--accent: oklch(0.269 0 0);              /* Dark gray */
--accent-foreground: oklch(0.985 0 0);   /* Near white */
--destructive: oklch(0.704 0.191 22.216);/* Red (adjusted) */
--border: oklch(1 0 0 / 10%);            /* White 10% */
--input: oklch(1 0 0 / 15%);             /* White 15% */
--ring: oklch(0.556 0 0);                /* Medium gray */
```

## Typography Scale

### Font Families

- **Sans**: Geist Sans (variable: `--font-geist-sans`)
- **Mono**: Geist Mono (variable: `--font-geist-mono`)

### Font Sizes

| Class | Size | Line Height | Use Case |
|-------|------|-------------|----------|
| `text-xs` | 12px | 16px | Captions, labels |
| `text-sm` | 14px | 20px | Small body text |
| `text-base` | 16px | 24px | Body text (default) |
| `text-lg` | 18px | 28px | Large body, subheadings |
| `text-xl` | 20px | 28px | Section headings |
| `text-2xl` | 24px | 32px | Page headings |
| `text-3xl` | 30px | 36px | Hero headings |
| `text-4xl` | 36px | 40px | Major headings |

### Font Weights

| Class | Weight | Use Case |
|-------|--------|----------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Emphasis, headings |
| `font-semibold` | 600 | Strong emphasis |
| `font-bold` | 700 | Very strong emphasis |

## Spacing Scale

Based on 4px base unit (Tailwind default):

| Value | Pixels | Common Use |
|-------|--------|------------|
| `0.5` | 2px | Fine adjustments |
| `1` | 4px | Minimal spacing |
| `2` | 8px | Tight spacing |
| `3` | 12px | Default gap |
| `4` | 16px | Standard spacing |
| `6` | 24px | Section spacing |
| `8` | 32px | Large gaps |
| `12` | 48px | Major sections |
| `16` | 64px | Page-level spacing |

## Border Radius

Custom radius scale based on `--radius: 0.625rem` (10px):

| Variable | Value | Tailwind Class | Use Case |
|----------|-------|----------------|----------|
| `--radius-sm` | 0.225rem (3.6px) | `rounded-sm` | Subtle rounding |
| `--radius-md` | 0.425rem (6.8px) | `rounded-md` | Standard (most common) |
| `--radius-lg` | 0.625rem (10px) | `rounded-lg` | Cards, larger elements |
| `--radius-xl` | 1.025rem (16.4px) | `rounded-xl` | Prominent elements |
| `--radius-2xl` | 1.625rem (26px) | `rounded-2xl` | Hero sections |

## Shadows

Tailwind shadows (updated in v4):

| Class | Use Case |
|-------|----------|
| `shadow-xs` | Subtle lift (1px) |
| `shadow-sm` | Small elevation (2px) |
| `shadow` | Default card shadow |
| `shadow-md` | Raised elements |
| `shadow-lg` | Prominent elevation |
| `shadow-xl` | Modals, popovers |
| `shadow-2xl` | Maximum elevation |

## Transitions

Standard transition durations:

```tsx
// Default transition (most cases)
className="transition-all duration-200"

// Quick interactions
className="transition-colors duration-150"

// Smooth animations
className="transition-all duration-300 ease-in-out"

// Hover states
className="hover:shadow-lg transition-shadow"
```

## Z-Index Scale

```tsx
// Dropdown menus
z-10

// Fixed elements (header, footer)
z-20

// Modals and overlays
z-30

// Tooltips
z-40

// Toast notifications
z-50
```

## Breakpoints

| Breakpoint | Width | Description |
|------------|-------|-------------|
| `sm` | 640px | Small tablets portrait |
| `md` | 768px | Tablets, small laptops |
| `lg` | 1024px | Desktops |
| `xl` | 1280px | Large desktops |
| `2xl` | 1536px | Extra large screens |

## Icon Sizes

| Class | Size | Use Case |
|-------|------|----------|
| `size-3` | 12px | Tiny icons (badges) |
| `size-4` | 16px | Default button icons |
| `size-5` | 20px | Medium icons |
| `size-6` | 24px | Large icons |
| `size-8` | 32px | Hero icons |
| `size-12` | 48px | Feature icons |

## Component-Specific Tokens

### Button Heights

| Size | Height | Padding |
|------|--------|---------|
| `xs` | 24px (h-6) | px-2 |
| `sm` | 32px (h-8) | px-3 |
| `default` | 36px (h-9) | px-4 |
| `lg` | 40px (h-10) | px-6 |

### Card Spacing

```tsx
// Standard card padding
<Card className="p-6">

// Compact card
<Card className="p-4">

// Spacious card
<Card className="p-8">
```

### Form Elements

```tsx
// Input height
className="h-9" // Default

// Label spacing
className="mb-2" // Between label and input

// Form group spacing
className="space-y-4" // Between form fields
```

## Usage Examples

### Color Usage

```tsx
// Text colors
<p className="text-foreground">Primary text</p>
<p className="text-muted-foreground">Secondary text</p>

// Backgrounds
<div className="bg-background">Page background</div>
<div className="bg-card">Card background</div>
<div className="bg-muted">Subtle background</div>

// Borders
<div className="border border-border">Bordered element</div>

// Interactive states
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Primary Button
</button>
```

### Spacing Usage

```tsx
// Vertical rhythm
<div className="space-y-4">
  <Section />
  <Section />
</div>

// Grid gaps
<div className="grid grid-cols-3 gap-6">
  <Card />
  <Card />
  <Card />
</div>

// Padding
<div className="px-4 py-6"> {/* Horizontal 16px, Vertical 24px */}
  Content
</div>
```

### Responsive Usage

```tsx
// Responsive spacing
<div className="px-4 md:px-6 lg:px-8">
  Responsive padding
</div>

// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Responsive heading
</h1>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  Items
</div>
```
