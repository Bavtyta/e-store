---
name: Industrial Standard
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#4d4632'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#7f7660'
  outline-variant: '#d1c6ab'
  surface-tint: '#735c00'
  primary: '#735c00'
  on-primary: '#ffffff'
  primary-container: '#facc15'
  on-primary-container: '#6c5700'
  inverse-primary: '#eec200'
  secondary: '#bb0112'
  on-secondary: '#ffffff'
  secondary-container: '#e02928'
  on-secondary-container: '#fffbff'
  tertiary: '#006876'
  on-tertiary: '#ffffff'
  tertiary-container: '#33e4ff'
  on-tertiary-container: '#006270'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffe083'
  primary-fixed-dim: '#eec200'
  on-primary-fixed: '#231b00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#ffb4ab'
  on-secondary-fixed: '#410002'
  on-secondary-fixed-variant: '#93000b'
  tertiary-fixed: '#a0efff'
  tertiary-fixed-dim: '#15daf4'
  on-tertiary-fixed: '#001f25'
  on-tertiary-fixed-variant: '#004e59'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-md:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  code:
    fontFamily: jetbrainsMono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is engineered for the high-stakes environment of B2B industrial procurement. It prioritizes utility, reliability, and precision over decorative trends. The aesthetic is **Corporate / Modern** with a lean toward **Minimalism**, emphasizing clear information architecture and high data density to support rapid decision-making by manufacturers and distributors. 

The emotional response should be one of absolute stability and professional competence. By utilizing a "utility-first" visual language, the interface recedes to let product specifications and logistics data take center stage.

## Colors
The palette is rooted in industrial safety and clarity. 
- **Primary (Yellow):** Used for primary actions and brand presence. It must be paired with dark neutral text to ensure WCAG AA contrast.
- **Secondary/Danger (Red):** Reserved strictly for critical alerts, stock-outs, or destructive actions.
- **Neutrals:** A deep grayscale scale (Slate/Gray) provides the structural framework, using varying shades for borders, secondary text, and surface backgrounds.
- **Success/Info:** Standard green (#16A34A) and blue (#2563EB) are used sparingly for status indicators (e.g., "In Stock", "Shipped").

## Typography
This design system utilizes **Inter** for its exceptional legibility in data-heavy interfaces. The hierarchy is strictly enforced to manage complex information:
- **Product Titles:** Use `headline-lg` for detail pages.
- **Data Tables:** Use `body-md` for row content and `label-md` (uppercase) for headers to create clear visual separation.
- **SKUs/Part Numbers:** Use `code` (JetBrains Mono) for technical identifiers to prevent character confusion (e.g., 0 vs O).
- **Mobile Adjustments:** `display-lg` should scale down to `headline-lg` on mobile devices to preserve screen real estate.

## Layout & Spacing
The system follows a strict **8px grid** (1rem = 16px). 
- **Desktop:** A 12-column fixed grid (1280px max-width) with 24px gutters. Use the sidebars for persistent navigation and filtering.
- **Tablet:** Fluid 8-column grid with 16px margins.
- **Mobile:** Fluid 4-column grid with 16px margins.
Vertical rhythm is maintained by using `md` (16px) spacing between related elements and `lg` (24px) or `xl` (32px) between distinct sections.

## Elevation & Depth
Elevation is used functionally, not decoratively. 
- **Level 0 (Flat):** Main background surface.
- **Level 1 (Card):** White surfaces with a 1px border (#E5E7EB) and no shadow. Used for product listings and data sections.
- **Level 2 (Hover/Dropdown):** Subtle 1px border with a soft, tight shadow (0 4px 6px -1px rgb(0 0 0 / 0.1)). Used for menus and active state components.
- **Level 3 (Modals):** Pronounced shadow (0 10px 15px -3px rgb(0 0 0 / 0.1)) to isolate critical interaction layers from the background content.

## Shapes
The shape language is "Engineered." Roundedness is kept to a minimum (4px base) to convey a sense of precision and maximize the internal space for data labels. 
- **Inputs and Buttons:** 4px radius.
- **Tags/Badges:** 2px radius or sharp for a more "industrial label" look.
- **Large Containers:** 6px radius for the main content area cards.
Avoid pill-shaped buttons as they conflict with the technical nature of the marketplace.

## Components
### Buttons
- **Primary:** Yellow background with Slate-900 text. High visibility for "Add to Quote" or "Purchase."
- **Secondary:** White background, 1px Gray-300 border, Slate-900 text.
- **Ghost:** Transparent background, Gray-600 text. Used for secondary navigation or "Cancel."
- **Danger:** Solid Red background with White text.

### Form Elements
- **Inputs:** 1px Gray-300 border, 12px horizontal padding. On focus, use a 2px Yellow outline with no offset.
- **Search:** Persistent top-bar search with category dropdown integration.
- **Status Badges:** Subtle background tints (e.g., Light Green for "In Stock") with high-contrast text.

### Data Presentation
- **Tables:** Compact rows (40px height) with 1px horizontal dividers. No vertical dividers except for the frozen "Part Number" column.
- **Product Cards:** Focused on specs. Highlight the "Unit Price" and "Lead Time" in bold weight.

### Feedback & Navigation
- **Pagination:** Clear numeric steps with "Previous" and "Next" text labels.
- **Alerts:** Inline banners with solid left-border accents to denote severity.
- **Skeleton Loaders:** Used specifically for heavy data tables to reduce perceived latency.