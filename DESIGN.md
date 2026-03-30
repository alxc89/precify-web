# Design System Strategy: Sistema de Precificacao

This design system is a bespoke framework crafted for high-end SaaS environments in the food business sector. Moving beyond the clinical sterility of standard enterprise software, this system adopts an "Editorial Precision" aesthetic. It combines the authority of deep, botanical greens with the vibrant energy of culinary accents, utilizing layered depth and sophisticated typography to guide users through complex pricing logic with effortless clarity.

---

## 1. Creative North Star: "The Digital Sommelier"

The system is built on the concept of **The Digital Sommelier**. Just as a sommelier balances technical expertise with a refined presentation, this UI must feel both mathematically rigorous and aesthetically appetizing.

- **Intentional Asymmetry:** Break the "bootstrap" look by using offset headers and staggered grid placements (e.g., using `spacing-16` for left margins and `spacing-8` for right margins in hero sections).
- **Tonal Authority:** We do not use "gray." Every neutral is infused with a hint of the primary green (`158`) to ensure the interface feels organic and cohesive.
- **Breathing Room:** We prioritize high-contrast typography scales and generous white space over containment lines.

---

## 2. Colors & Surface Philosophy

### The Palettes

- **Primary (The Foundation):** `primary: #004f38`. A deep, forest green that evokes sustainability and growth. Use the Primary Gradient (135deg `hsl(158 64% 25%)` to `hsl(158 64% 35%)`) for high-impact CTAs to provide a "lit from within" quality.
- **Secondary/Accent (The Zest):** `secondary: #9c4400`. Used sparingly for "Carrot" highlights, conversion points, and critical data callouts.
- **Neutral/Surface:** Derived from a base of `surface: #e7fff2`. This ensures the "white" space feels fresh and culinary rather than cold and blue.

### The "No-Line" Rule

**Strict Mandate:** Designers are prohibited from using 1px solid borders for sectioning.

- **The Strategy:** Define boundaries through background color shifts. A `surface-container-low` section should sit directly against a `surface` background.
- **Nesting:** To define a card within a sidebar, use `surface-container-highest` on top of `surface-container-low`. The 12px (`md`) radius ensures these shifts feel intentional and soft.

### Glassmorphism & Texture

For floating modals or sticky headers, use:

- **Surface:** `surface_variant` at 80% opacity.
- **Backdrop Blur:** 12px to 20px.
- **Effect:** This creates a "frosted glass" look that allows the vibrant greens of the content below to bleed through, maintaining a sense of place.

---

## 3. Typography: Editorial Authority

We use a dual-typeface system to balance character with readability.

- **Display & Headlines (Manrope):** A modern geometric sans with open apertures.
  *Role:* Used for data storytelling. High-contrast sizing (e.g., `display-lg` at 3.5rem) should be used to highlight "The Big Number" (Profit Margins, Total Costs).
- **Body & Labels (Inter):** The workhorse for legibility.
  *Role:* All functional data, ingredient lists, and pricing tables must use `body-md`.

**Hierarchy Tip:** Never use "Bold" for body text when "Medium" + a higher contrast color (`on-surface` vs `on-surface-variant`) can achieve the same result. It keeps the UI feeling light.

---

## 4. Elevation & Depth: Tonal Layering

Traditional shadows are a last resort. We build hierarchy through the **Layering Principle**:

1. **Level 0 (Base):** `surface` (`#e7fff2`).
2. **Level 1 (Sections):** `surface-container-low`.
3. **Level 2 (Cards):** `surface-container-lowest` (pure white).
4. **Level 3 (Popovers):** `surface-container-highest` with an **Ambient Shadow**.

### Ambient Shadow Specification

- **Color:** `hsla(158, 60%, 6%, 0.06)` (a tinted dark green, never pure black).
- **Blur:** 24px - 40px.
- **Spread:** -4px (to keep the shadow "tucked" under the element).

### The Ghost Border

For high-density data tables where separation is mandatory, use a `1px` stroke of `outline-variant` at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons

- **Primary:** Uses the Primary Gradient. `border-radius: 12px`. No border. Text is `on-primary`.
- **Secondary:** Ghost style. No background. Border is `outline` at 20% opacity. Text is `primary`.
- **Tertiary/Action:** Pure text with `label-md` styling and an 8px icon gap.

### Cards & Lists

- **Rule:** Forbid the use of divider lines.
- **Alternative:** Use `spacing-4` (1rem) of vertical white space or a subtle shift to `surface-container-low` on hover.
- **Pricing Cards:** Use an asymmetrical layout: large `display-sm` price at the top-left, with descriptive text offset to the right using `spacing-8`.

### Input Fields

- **Style:** Minimalist. No bottom line or full box. Use a soft `surface-container-high` background with a `12px` radius.
- **Focus State:** Transition the background to `surface` and add a `2px` "Ghost Border" of the `primary` color.

### Custom Component: The "Margin Gauge"

For a food pricing app, include a custom horizontal gauge. Use the `Success` and `Destructive` tokens to show where a dish's profit margin sits. The "needle" should be a `secondary-fixed` (Orange) vertical pill.

---

## 6. Do's and Don'ts

### Do

- **Do** use `display-lg` for impactful data. Let the numbers breathe.
- **Do** use `surface-tint` to create subtle overlays on images of food/ingredients.
- **Do** utilize the `12px` (`md`) radius consistently across all containers, buttons, and inputs to maintain the "Soft Professional" vibe.

### Don't

- **Don't** use pure black (`#000`) for text. Always use `on-background` (`#002116`).
- **Don't** use a 1px border to separate the sidebar from the main content. Use a background color transition from `surface-dim` to `surface`.
- **Don't** use the `Accent` (Orange) for anything other than primary calls to action or "Warning" alerts. It is a high-energy color that loses its power if overused.
