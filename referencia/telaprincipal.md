---
name: Taskflow Kinetic Workspace
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#4648d4'
  on-secondary: '#ffffff'
  secondary-container: '#6063ee'
  on-secondary-container: '#fffbff'
  tertiary: '#95002b'
  on-tertiary: '#ffffff'
  tertiary-container: '#bf0f3c'
  on-tertiary-container: '#ffd0d2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  code-sm:
    fontFamily: monospace
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 3rem
---

## Brand & Style

The design system establishes a high-performance, distraction-free environment engineered for fast execution, deep focus, and organizational clarity. Targeted at modern product engineers, designers, founders, and knowledge workers who demand velocity, the interface evokes feelings of sharp control, tactile satisfaction, and calm productivity. 

Drawing heavily from modern digital workspaces (Linear, Todoist, Notion), the aesthetic embraces a refined **Minimalist-Constructivist** style:
- High surface discipline: Content-first interfaces where chrome recedes and user tasks command attention.
- Crisp structural definition: Precision micro-borders (1px) replacing excessive heavy drop-shadows.
- Fluid efficiency: Dense typography paired with intentional white space to reduce scroll fatigue while maximizing visual scanning speed.
- Micro-interactions: Instant visual feedback, frictionless hover states, and purposeful semantic color shifts.

## Colors

The palette is engineered with meticulous functional separation between chrome, canvas, semantics, and focus cues.

### Canvas & Surface Structure
- **Canvas Base (`#FFFFFF`)**: Primary background for cards, popovers, and main work editors to optimize typographic contrast.
- **Subtle Surface (`#F8FAFC`)**: Secondary application backdrop, navigation sidebars, and empty drop zones.
- **Muted Surface (`#F1F5F9`)**: Hover states, active list selections, and badge backdrops.
- **Dividers & Outlines (`#E2E8F0`)**: Crisp 1px structural lines separating panels, columns, and rows without optical noise.

### Neutrals & Typography
- **Heading / Primary Text (`#0F172A`)**: High-contrast slate charcoal for titles, task titles, and active inputs.
- **Secondary / Body Text (`#475569`)**: Balanced slate for descriptions, table contents, and secondary metadata.
- **Muted Text (`#64748B`)**: De-emphasized labels, timestamps, shortcut badges, and subtle icons.
- **Subtle Border/Rule (`#CBD5E1`)**: Used exclusively for interactive input boundaries and active outline states.

### Accents & Semantic Priorities
- **Primary / Brand Indigo (`#4F46E5` / `#6366F1`)**: Reserved strictly for high-value affordances: "Create Task", active state toggles, focused inputs, and critical navigation items.
- **Urgent Priority / Destructive (`#F43F5E`)**: Coral rose for immediate deadlines, blocking tasks, and error messaging.
- **Medium Priority (`#F59E0B`)**: Warm amber for attention-required statuses and warning banners.
- **Low Priority / Done (`#10B981`)**: Emerald green for completed states, resolved activities, and low-friction tags.

## Typography

The typographic hierarchy is optimized for density, visual rhythm, and quick optical recognition across list matrices and kanban boards.

- **Plus Jakarta Sans** delivers structured, geometric authority to views, project headers, modal banners, and primary metric overviews. Its subtle rounded contemporary terminals lend warmth without sacrificing structural discipline.
- **Inter** handles content density, interactive controls, and nested list items. Its micro-lettering clarity and uniform metric distribution maintain pristine legibility under high-information-density scenarios.
- Numbers, dates, and shortcut tokens are paired with tabular figures (`font-variant-numeric: tabular-nums`) to ensure strict vertical alignment across lists and tables.

## Layout & Spacing

The layout embraces an adaptive multi-pane architecture common to high-velocity SaaS tooling (Sidebar Navigation + Secondary Filter View + Primary Canvas/Board).

### Layout System
- **Desktop (>= 1200px)**: Three-tier pane arrangement: collapsible 240px navigation drawer, 300px filter/list index, and fluid remaining canvas for task details or multi-column kanban boards.
- **Tablet (768px - 1199px)**: Sidebar shifts to an off-canvas drawer or icon rail (64px width); kanban transitions to a horizontally scrollable container with snap-points.
- **Mobile (< 768px)**: Single-column linear layout. Views stack with sticky bottom control strips; secondary metadata opens in a bottom sheet drawer.

### Grid & Spacing Rhythm
- Layout values are strictly multiples of 4px and 8px.
- Dense task lists utilize 36px–40px row heights with `space-sm` inline gaps, maximizing visible screen real estate without feeling constrained.
- Canvas outer margins employ `margin-desktop` (2rem) for breathability, keeping content aligned within a max-width container of 1440px for desktop overview screens.

## Elevation & Depth

Visual hierarchy uses crisp 1px borders as the primary delimiter, reinforced by feather-light ambient shadows only when components float or interact.

### Level 0: Flat / Canvas Surface
- `background-color: #FFFFFF` or `#F8FAFC`.
- No shadow. Delimited from surrounding containers strictly by `1px solid #E2E8F0`. Used for standard page backgrounds, sidebar backgrounds, and inline table rows.

### Level 1: Resting Cards & Lists
- `box-shadow: 0 1px 2px 0 rgba(15, 23, 42, 0.04);`
- Outlined with `1px solid #E2E8F0`.
- Used for board cards, inline task panels, and workspace modules.

### Level 2: Interactive Hover & Focused Items
- `box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04);`
- Border subtly brightens or shifts to `1px solid #CBD5E1`.
- Used when dragging cards, hovering task rows, or activating segmented controls.

### Level 3: Overlays, Menus & Command Bars
- `box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03);`
- Border: `1px solid #E2E8F0`.
- Used for quick-switcher palettes (Cmd+K), context menus, user dropdowns, and date picker popovers.

## Shapes

The shape system utilizes controlled, ergonomic curvature. Elements never appear overly bulbous, maintaining the architectural rigor of a professional tool while softening touchpoints.

- **Base Radius (0.5rem / 8px)**: Inputs, buttons, task chips, dropdown menus, and standard task card components.
- **Large Radius (1rem / 16px)**: Modals, side drawers, project overview panels, and elevated floating containers.
- **Pill Radius (9999px)**: Status badges, counter tags, avatar wrappers, and keyboard shortcut chips (`kbd`).

## Components

### Buttons
- **Primary**: Solid background `#4F46E5`, text `#FFFFFF`, radius 8px, font weight 500, padding `8px 14px`. Hover: `#4338CA`. Active: scale 0.98. Focus: `outline: 2px solid #6366F1; outline-offset: 2px;`.
- **Secondary / Ghost**: Background transparent, border `1px solid #E2E8F0`, text `#0F172A`. Hover: background `#F8FAFC`, border `#CBD5E1`.
- **Icon Button**: Aspect ratio 1:1, size 32px or 36px, centered SVG, color `#64748B`. Hover: `#0F172A` with background `#F1F5F9`.

### Chips & Priority Badges
- **Status Tags**: Pill shape (9999px), padding `2px 8px`, typography `label-sm`.
- **Priority - Urgent**: Background `#FFF1F2`, text `#E11D48`, dot accent `#F43F5E`.
- **Priority - Medium**: Background `#FFFBEB`, text `#D97706`, dot accent `#F59E0B`.
- **Priority - Low**: Background `#ECFDF5`, text `#059669`, dot accent `#10B981`.

### Task Lists & Kanban Cards
- **Task Row**: Height 40px, display flex, align items center, border-bottom `1px solid #F1F5F9`. Background transition on hover to `#F8FAFC`.
- **Card (Board)**: Background `#FFFFFF`, border `1px solid #E2E8F0`, border-radius 8px, padding 12px. Contains task title (`body-md`), priority tag, assignee avatar (24px circle), and subtask progress indicator.

### Input Fields & Controls
- **Text Inputs**: Height 36px, background `#FFFFFF`, border `1px solid #E2E8F0`, border-radius 8px, padding `0 12px`, typography `body-md`. Focus: border `#4F46E5`, box-shadow `0 0 0 3px rgba(79, 70, 229, 0.12)`.
- **Checkboxes**: 18px x 18px, border `1.5px solid #CBD5E1`, border-radius 4px. On checked: background `#4F46E5`, border `#4F46E5`, with crisp white SVG check icon. Checking triggers a subtle line-through transition across the task label with color fading to `#94A3B8`.
- **Radio Buttons**: 18px x 18px, border `1.5px solid #CBD5E1`, border-radius 50%. On selected: inner inset dot 6px `#4F46E5`.

### Command Palette (Linear/Notion-Style Modal)
- Centered overlay, width 580px, max-height 420px, backdrop filter blur 4px with background `rgba(15, 23, 42, 0.3)`.
- Input field at top borderless with large search prompt (16px), followed by grouped menu items highlighted with keyboard navigation keys (`Kbd` tags with `#F1F5F9` background and `#64748B` typography).