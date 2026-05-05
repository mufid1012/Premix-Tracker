---
name: Warung Modern Production System
colors:
  surface: '#fdf9f4'
  surface-dim: '#ddd9d5'
  surface-bright: '#fdf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3ee'
  surface-container: '#f1ede8'
  surface-container-high: '#ebe8e3'
  surface-container-highest: '#e6e2dd'
  on-surface: '#1c1c19'
  on-surface-variant: '#42493e'
  inverse-surface: '#31302d'
  inverse-on-surface: '#f4f0eb'
  outline: '#72796e'
  outline-variant: '#c2c9bb'
  surface-tint: '#3b6934'
  primary: '#154212'
  on-primary: '#ffffff'
  primary-container: '#2d5a27'
  on-primary-container: '#9dd090'
  inverse-primary: '#a1d494'
  secondary: '#7c5800'
  on-secondary: '#ffffff'
  secondary-container: '#feb700'
  on-secondary-container: '#6b4b00'
  tertiary: '#602900'
  on-tertiary: '#ffffff'
  tertiary-container: '#813d0a'
  on-tertiary-container: '#ffb183'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bcf0ae'
  primary-fixed-dim: '#a1d494'
  on-primary-fixed: '#002201'
  on-primary-fixed-variant: '#23501e'
  secondary-fixed: '#ffdea8'
  secondary-fixed-dim: '#ffba20'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5e4200'
  tertiary-fixed: '#ffdbc9'
  tertiary-fixed-dim: '#ffb68c'
  on-tertiary-fixed: '#321200'
  on-tertiary-fixed-variant: '#753401'
  background: '#fdf9f4'
  on-background: '#1c1c19'
  surface-variant: '#e6e2dd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 20px
  lg: 32px
  xl: 48px
  touch-target: 56px
---

## Brand & Style

This design system blends the communal, welcoming essence of a traditional Indonesian *Warung* with the precision of a modern kitchen production environment. The personality is grounded, reliable, and "guyub" (neighborly), yet highly organized. 

The design style utilizes **Modern Tactile** principles. It avoids cold, clinical minimalism in favor of a "warm utility" aesthetic. Elements feel physical and substantial—reminiscent of thick wooden tabletops and sturdy ceramic plates—to provide clear visual affordances in high-pressure kitchen settings. The emotional response should be one of "Ketenangan di Tengah Kesibukan" (Calm amidst the hustle), ensuring kitchen staff feel supported by their tools rather than overwhelmed by them.

## Colors

The palette is rooted in the "Earthy and Appetizing" spectrum. 

- **Primary (Hijau Daun):** A deep earthy green (#2D5A27) used for primary actions and headers, symbolizing freshness and stability.
- **Secondary (Kuning Kunyit):** A vibrant warm yellow (#FFB800) used for alerts, high-priority status indicators, and call-to-actions that need to pop against steam or low light.
- **Neutrals (Kayu & Kertas):** The background uses a soft cream-white (#F9F5F0) instead of pure white to reduce eye strain. Accents use wood-toned browns to provide structure and warmth.
- **High Contrast:** All functional text must maintain a minimum 7:1 contrast ratio against backgrounds to ensure legibility through kitchen steam or on grease-smudged screens.

## Typography

The design system utilizes **Plus Jakarta Sans** for its friendly yet geometric clarity. In a kitchen environment, readability from a distance is paramount.

- **Scale:** Type sizes are oversized compared to standard SaaS apps to accommodate "at-a-glance" reading.
- **Weight:** Headlines use Extra Bold (800) to create a clear hierarchy.
- **Language:** All microcopy should be in Indonesian, using clear and direct terminology (e.g., "Selesai", "Sedang Dimasak", "Antrean").

## Layout & Spacing

This design system uses a **Fluid Grid** with generous safe zones. 

- **Touch Targets:** A strict minimum of 56px for all interactive elements to support "fat-finger" interactions in fast-paced environments.
- **Rhythm:** An 8px base unit is used, but layout margins are increased to 24px (Mobile) or 32px (Tablet) to prevent content from feeling cramped near the bezel.
- **Groupings:** Items are grouped into clear "Station" blocks with wide gutters (20px+) to ensure no accidental taps occur between different orders.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Subtle Tactility**.

- **Surfaces:** Main content lives on "Lapis Bawah" (Base Layer) in cream. Active cards or modals sit on "Lapis Atas" (Top Layer) which is pure white with a subtle 1px border in a light wood tone.
- **Shadows:** Use "Soft-Press" shadows—low-offset, highly diffused shadows with a slight brown tint (#4A321F at 10% opacity) to make cards feel like physical objects on a counter.
- **Active State:** When pressed, buttons should visually "sink" (reduce elevation and darken slightly) to provide immediate tactile feedback to the user.

## Shapes

The shape language is **Rounded and Approachable**. 

- **Corner Radius:** Standard components use a 0.5rem (8px) radius. Large containers and cards use 1rem (16px).
- **Visual Metaphor:** Avoid sharp 90-degree angles to maintain the "Warung" warmth and to signify that the app is easy to navigate. 
- **Buttons:** Primary buttons use the `rounded-lg` (16px) or full pill shape to distinguish them clearly from informational cards.

## Components

- **Tombol (Buttons):** High-profile with thick padding. Primary buttons use Hijau Daun with white text. Secondary buttons use a thick 2px border in wood-tone brown.
- **Kartu Pesanan (Order Cards):** The primary unit of the app. Features a thick color-coded top border (Kuning for 'Urgent', Hijau for 'Normal'). Large, bold order numbers in the top right.
- **Status Chips:** Small, high-contrast badges for labels like "Pedas", "Bungkus", or "Alergi". These use the Secondary Kuning Kunyit background with dark text.
- **Input Fields:** Large tap areas with 16px internal padding. Focus states use a 3px Kuning Kunyit glow to ensure the user knows exactly where they are typing.
- **Checkbox/Radio:** Oversized (24px x 24px) to ensure accuracy even if the user's hands are wet or busy.
- **Kitchen-Specific Components:** 
    - **Progress Bar:** A "Bilah Masak" that grows in Hijau Daun to show how close a dish is to completion.
    - **Quick-Action Footer:** A sticky bottom bar with large icons for "Bantuan" (Help) and "Selesaikan Semua" (Finish All).