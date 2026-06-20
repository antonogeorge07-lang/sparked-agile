# Apple Mindset: Whole App Shell

Bring the entire authenticated shell to macOS Sonoma fidelity with cinematic motion. No feature changes, no schema changes — purely design system + shell + motion.

## 1. Redefine the design tokens (`src/index.css`)

Replace the current blue/purple system with a Sonoma palette:

- `--background` Light `0 0% 96%` (#F5F5F7), Dark `0 0% 0%` warmed to `220 14% 4%`
- `--foreground` Light `0 0% 11%` (#1D1D1F), Dark `0 0% 96%`
- `--primary` `211 100% 47%` (#0A84FF — system blue)
- `--muted-foreground` `240 2% 53%` (#86868B — system gray)
- New: `--vibrancy`, `--separator`, `--material-thick`, `--material-thin`, `--material-chrome` for macOS-style materials
- New shadows: `--shadow-window` (deep, soft, layered like a macOS window), `--shadow-popover`
- Gradients become subtle: remove blue→purple, use single-hue depth gradients only
- Border radius bumps: `--radius: 0.875rem` (Sonoma-like 14px)

Glass system rewrite: `.glass-card` uses `backdrop-filter: blur(40px) saturate(180%)` with `bg-card/55` and a 1px hairline `border-white/10` (dark) / `border-black/5` (light) — true vibrancy.

## 2. App shell chrome

- **`AppSidebar.tsx`**: translucent material background, hairline right border, 12px icon + label rows, hover = `bg-foreground/5`, active = `bg-foreground/10` + 2px accent dot (no full-row fill). Section labels become uppercase 10px tracked gray. Collapsed state animates width with spring-free 280ms ease.
- **`DashboardLayout.tsx`**: header becomes a floating `sticky` traffic-light-style bar — translucent material, hairline bottom border, 56px tall, page title in SF-style heavy weight, right side holds `ThemeToggle`, `NotificationBell`, `ProfileMenu` with 8px gaps.
- **Page container**: max-width 1280px, 32px gutters mobile / 64px desktop, sections separated by 96px on desktop.

## 3. Cinematic motion (Tailwind + CSS only — no new deps)

Add keyframes to `tailwind.config.ts`:
- `apple-rise` — `translateY(24px) + opacity 0 → 0` over 600ms `cubic-bezier(0.22, 1, 0.36, 1)`
- `apple-scale-in` — `scale(0.96) opacity 0 → 1` 500ms
- `parallax-slow` / `parallax-fast` — scroll-driven via CSS `animation-timeline: view()` with `@supports` fallback
- `aurora-drift` — slow 20s background gradient drift for hero surfaces
- `material-reveal` — staggered children via `animation-delay` utilities

New utilities:
- `.scroll-stage` — sticky scroll section (100vh)
- `.cinematic-fade` — opacity tied to `view()` timeline
- `.hover-lift` — `translateY(-2px)` + shadow grow on hover, 200ms

## 4. Touch points (files edited, no logic changes)

- `src/index.css` — tokens, glass system, motion utilities, scrollbar restyle to thin Sonoma-style
- `tailwind.config.ts` — keyframes + animations + radius scale
- `src/components/AppSidebar.tsx` — chrome restyle
- `src/components/layouts/DashboardLayout.tsx` — header + page container
- `src/components/NotificationBell.tsx`, `ThemeToggle.tsx`, `ProfileMenu.tsx` — match new chrome (icon weight, hover state)
- `src/components/ScrollReveal.tsx` — switch to `apple-rise` curve

## 5. Out of scope (intentionally)

- No changes to landing (already on plan), Auth, Connect, Briefing, Velocity Truth bodies — they inherit tokens automatically.
- No font swap yet — system font stack already maps to SF on Apple devices. (If you want SF Pro forced on non-Apple, say the word and I'll add `@fontsource/inter` as the closest legal substitute.)
- No new dependencies, no migrations, no edge functions.

## Success criteria

- Sidebar + header read as macOS Sonoma at a glance — translucent materials, hairlines, restrained accent dots.
- Dark mode looks like a macOS dark window, not a dashboard.
- Scrolling any long page feels choreographed: content rises into view on a 600ms ease, never a hard pop.
- Semantic tokens only — zero `text-white` / `bg-[#...]` regressions.
- Lighthouse a11y stays 100; contrast on `--primary` over `--background` ≥ 4.5:1 in both modes.
