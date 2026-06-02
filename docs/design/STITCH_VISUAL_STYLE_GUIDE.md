---
name: Apex Intelligence
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#4cd7f6'
  on-tertiary: '#003640'
  tertiary-container: '#009eb9'
  on-tertiary-container: '#002f38'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-xl:
    fontFamily: Hanken Grotesk
    fontSize: 60px
    fontWeight: '800'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-margin: 24px
  gutter: 20px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Scope (StudyOps AI — web only)

**Reference only — not production code or product scope expansion.**

StudyOps AI is a **browser-based web application only**. This Stitch style guide informs **web UI** presentation in the browser. It does **not** approve native mobile apps, Android/iOS apps, phone apps, app-store products, bottom-tab native navigation, or mobile-specific navigation patterns.

Stitch mockups may show sidebar or narrow layouts — those are **visual inspiration for responsive web layout** only. Sidebar migration, native mobile work, and app-store flows require **separate explicit human approval**.

**375px / narrow width:** Breakpoints below describe **responsive web viewport** reflow in CSS — **narrow responsive browser layout**, not a separate mobile-app product.

---

## Brand & Style

The design system is engineered for a high-performance AI study command center. It targets high-achieving students who view education as a competitive pursuit, requiring a UI that feels like a visionary flight deck rather than a traditional classroom tool.

The visual style is **Modern SaaS with High-Contrast / Bold** accents. It blends the depth of glassmorphism with the intensity of neon-tinted data visualizations. The interface must feel fast, responsive, and intellectually stimulating. Every interaction should reinforce a sense of "super-powering" the user's cognitive abilities through AI.

**Key Principles:**
- **Visionary Energy:** Use vibrant gradients and glows to signify AI-driven insights.
- **Structured Power:** Maintain professional rigor with high-contrast borders and a disciplined grid.
- **Visual Richness:** Utilize translucency and backdrop blurs to create a multi-layered, immersive experience.

## Colors

The palette is anchored in a **Deep Graphite (#0F172A)** base to provide a cinematic, focused environment. 

- **Core Accents:** Electric Blue and Vibrant Violet are used primarily for AI-interactive elements, progress indicators, and primary CTAs. 
- **Surface Strategy:** Cards use a lighter Slate (#1E293B) with a 60-80% opacity and a 12px backdrop blur to achieve a premium glass effect.
- **Subject Accents:** Amber, Rose, and Emerald are reserved for high-contrast subject labeling. Use these as 2px top-borders or soft outer glows on course-specific cards to differentiate content types at a glance.
- **Neon Glows:** AI-generated content should feature a subtle "Inner Glow" or "Drop Shadow" using the Primary or Tertiary hex codes with low opacity to simulate light emission.

## Typography

This design system utilizes **Hanken Grotesk** for its sharp, contemporary geometry. The typography strategy relies on extreme weight variance to establish hierarchy.

- **Display & Headlines:** Use ExtraBold (800) or Bold (700) with tight letter spacing for a punchy, editorial feel.
- **Labels:** Small labels use a bold weight with increased letter spacing and uppercase styling to evoke a technical "instrument panel" aesthetic.
- **AI Text:** Text blocks generated by AI should be styled in `body-lg` to ensure high readability and distinction from the standard UI labels.

## Layout & Spacing

The layout follows a **Fixed Grid** model for the central dashboard, utilizing a 12-column system on desktop to manage complex data dense views.

- **Desktop (1440px+):** 12 columns, 80px width, 20px gutters, 24px side margins.
- **Tablet (768px - 1024px):** 8 columns, fluid width, 16px gutters.
- **Narrow web viewport (<768px):** 4 columns, fluid width, 12px gutters — **responsive web layout** in the browser (not native mobile app scope). Stitch token name `headline-lg-mobile` means smaller **web** headline at narrow breakpoints only.

The spacing rhythm is strictly base-8. Use `stack-lg` for separating major sections (e.g., Study Session vs. Resource Library) and `stack-sm` for internal card padding and metadata groups.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** combined with **Glassmorphism**. Shadows are used sparingly; instead, depth is created through varying border intensities and background blurs.

- **Level 0 (Base):** Deep Graphite (#0F172A).
- **Level 1 (Navigation/Sidebar):** Frosted Slate (#1E293B) with a 20px backdrop blur. 1px right-border of #334155.
- **Level 2 (Cards):** Translucent Slate (#1E293B at 70% opacity). Borders are 1px solid #334155.
- **Level 3 (Modals/Popovers):** Higher opacity Slate with a distinct 0.15 alpha white inner border to simulate a "beveled glass" edge.
- **AI Focus:** Elements with active AI focus should use a "Glow" elevation—a 15px outer spread of the Primary Blue color at 20% opacity.

## Shapes

The shape language is **Rounded**, balancing professional structure with a modern, approachable feel. 

- **Primary Cards:** Use `rounded-lg` (1rem / 16px) for the main container shapes.
- **Buttons & Chips:** Use `rounded-xl` (1.5rem / 24px) to create a softer touchpoint for interactive elements.
- **Inputs:** Use `rounded-lg` to match the card containers, providing a cohesive, architectural look.

## Components

### Buttons
- **Primary AI Button:** A vibrant gradient background (Electric Blue to Vibrant Violet) with white text. Apply a subtle 1px white inner-border (top) to give it a tactile, metallic sheen.
- **Secondary:** Ghost style with a 1px Slate border (#334155) and high-contrast white text.

### Cards
- Standard cards feature the Level 2 elevation. Course-specific cards include a 4px left-accent border using the Course Accent colors (Amber, Rose, Emerald).

### Input Fields
- Dark background (#0F172A) with a 1px border (#334155). On focus, the border transitions to Electric Blue with a soft 4px glow.

### Data Visualization
- **Progress Rings:** Use thick strokes (8px-12px). The background track is Deep Slate, and the active track is a gradient of Cyan to Electric Blue.
- **Bar Charts:** Neon-tinted bars with a 50% opacity fill and a 100% opacity 1px top cap.

### Chips
- Small, uppercase label-sm typography. Backgrounds should be low-opacity versions of the accent colors (e.g., 10% Amber) with 100% opacity text.

### Navigation
- Vertical sidebar with a frosted glass effect (**Stitch web UI reference only** — StudyOps MVP uses **top `AppShell` nav**; sidebar requires separate approved shell phase). Active states are indicated by a vertical "Light Bar" (2px wide) of Electric Blue on the far left edge and a subtle gradient shift in the item background.