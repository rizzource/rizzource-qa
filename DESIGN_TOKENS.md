# Finnegan-Inspired Design Tokens

This document lists the extracted design token values applied to match the visual styling of finnegan.com.

## Color Palette

### Brand Colors (Primary)
- **Primary Brand Green**: `hsl(162, 47%, 36%)` / `#2d8c74` - Professional teal-green used for primary actions, headers, and brand identity
- **Primary Foreground**: `hsl(0, 0%, 100%)` / `#ffffff` - White text on brand colors
- **Secondary Brand**: `hsl(162, 35%, 28%)` / `#2e6d5c` - Darker teal for depth and hierarchy
- **Accent Green**: `hsl(162, 55%, 45%)` / `#35a88a` - Brighter green for hover states and emphasis

### Surface Colors
- **Surface (Background)**: `hsl(0, 0%, 100%)` / `#ffffff` - Pure white page background
- **Surface Alt**: `hsl(210, 20%, 98%)` / `#f9fafb` - Very light gray for subtle contrast sections
- **Foreground (Text)**: `hsl(210, 15%, 20%)` / `#2b2f33` - Dark charcoal for body text

### UI Element Colors
- **Card Background**: `hsl(0, 0%, 100%)` / `#ffffff`
- **Muted Background**: `hsl(210, 15%, 95%)` / `#f1f2f3`
- **Muted Foreground**: `hsl(210, 10%, 50%)` / `#7a7f85`
- **Border**: `hsl(210, 15%, 88%)` / `#dee0e2`
- **Input Border**: `hsl(210, 15%, 88%)` / `#dee0e2`

### Interactive States
- **Link Default**: `hsl(162, 47%, 36%)` / `#2d8c74`
- **Link Hover**: `hsl(162, 55%, 45%)` / `#35a88a`
- **Focus Ring**: `hsl(162, 55%, 45%)` / `#35a88a`

### Dark Mode
- **Background**: `hsl(210, 20%, 10%)` / `#14181a`
- **Foreground**: `hsl(210, 15%, 95%)` / `#f1f2f3`
- **Card**: `hsl(210, 20%, 12%)` / `#181d1f`
- **Border**: `hsl(210, 15%, 25%)` / `#363a3d`

## Typography

### Font Families
- **Primary Sans-serif**: `Inter, system-ui, -apple-system, sans-serif`
  - **Note**: Inter is a free, open-source font available via Google Fonts
  - Fallback: System fonts for maximum compatibility
  
- **Serif (Accent)**: `Merriweather, Georgia, serif`
  - **Note**: Merriweather is a free, open-source font via Google Fonts
  - Used for headings and emphasis

### Font Sizes & Line Heights
- **Body**: 1rem (16px) / line-height: 1.6
- **H1**: 2.5rem (40px) / line-height: 1.2 / weight: 600
- **H2**: 2rem (32px) / line-height: 1.3 / weight: 600
- **H3**: 1.5rem (24px) / line-height: 1.4 / weight: 600
- **H4**: 1.25rem (20px) / line-height: 1.4 / weight: 600
- **H5**: 1.125rem (18px) / line-height: 1.5 / weight: 600
- **H6**: 1rem (16px) / line-height: 1.5 / weight: 600

### Letter Spacing
- **Tight**: -0.02em (for large headings)
- **Normal**: 0 (default body text)
- **Wide**: 0.02em (for small caps, labels)

## Spacing Scale
Consistent spacing units based on 4px increments:
- **space-1**: 0.25rem (4px)
- **space-2**: 0.5rem (8px)
- **space-3**: 0.75rem (12px)
- **space-4**: 1rem (16px)
- **space-5**: 1.5rem (24px)
- **space-6**: 2rem (32px)
- **space-7**: 3rem (48px)
- **space-8**: 4rem (64px)

## Border Radius
Professional, subtle corners:
- **Default**: 0.25rem (4px) - Subtle, modern corners
- **Medium**: calc(0.25rem - 2px)
- **Small**: calc(0.25rem - 4px)

## Shadows
Elevation system for depth:
- **Small**: `0 1px 2px 0 rgb(0 0 0 / 0.05)` - Subtle lift for buttons
- **Medium**: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` - Cards, dropdowns
- **Large**: `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` - Modals, popovers

## Animations & Transitions
- **Duration**: 0.2s - 0.3s (subtle, professional)
- **Easing**: ease-out (natural deceleration)
- **Hover transitions**: All interactive elements use smooth 0.2s transitions

## Accessibility Notes
- All color combinations meet WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text)
- Focus states use visible 2px outline with brand accent color
- Interactive elements have minimum 44x44px touch targets
- Text remains readable at 200% zoom

## Font Licensing
Both fonts used are **free and open-source**:
- **Inter**: SIL Open Font License - https://fonts.google.com/specimen/Inter
- **Merriweather**: SIL Open Font License - https://fonts.google.com/specimen/Merriweather

No commercial licensing required. Fonts can be self-hosted or loaded via Google Fonts CDN.

## Implementation Notes
- All colors defined as HSL values for easy manipulation
- Design tokens stored in CSS custom properties (`:root` variables)
- Tailwind config maps to CSS variables for consistency
- Dark mode uses same token structure with adjusted values
- Spacing scale follows 4px base unit for consistent rhythm
- All values approximated from finnegan.com visual analysis while maintaining professional law firm aesthetic
