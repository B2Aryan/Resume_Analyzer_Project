## Goal
Make the site navbar stay locked at the top of the viewport while the user scrolls up or down. It must not drift, shift, or scroll with the page.

## Findings
- `src/components/site-navbar.tsx` already uses `position: fixed; top: 0; z-[9999]`, so the navbar should not scroll. If it appears to move, the most likely cause is an ancestor element with a `transform`, `filter`, `perspective`, or `will-change: transform` style, which turns `fixed` into "fixed relative to that ancestor" (a known CSS gotcha) and lets the navbar scroll with the page.
- `src/routes/__root.tsx` currently still wraps `<Outlet />` in `pt-[80px] sm:pt-[100px] lg:pt-[120px]` from a previous turn. This affects content spacing but not navbar position.

## Changes (styles only, no component rebuild)

1. **Harden navbar pinning** in `src/components/site-navbar.tsx`
   - Keep `fixed left-0 right-0 top-0 z-[9999]`.
   - Add inline style `style={{ position: "fixed", top: 0, left: 0, right: 0 }}` on the `<header>` to override any ancestor `transform` containing-block side-effect at the style level. (Inline wins over class, and explicit `position: fixed` ensures it.)

2. **Neutralize any ancestor transform that breaks `fixed`** in `src/styles.css`
   - Audit `html, body, #root` selectors. Ensure none set `transform`, `filter`, `perspective`, `backdrop-filter`, or `will-change: transform`. Remove any such property from these top-level wrappers if found.

3. **Prevent content overlap under the fixed navbar**
   - Keep the existing top-padding wrapper around `<Outlet />` in `src/routes/__root.tsx` so page content starts below the navbar. (This was the right fix; revert was a misunderstanding.)
   - If user prefers no extra padding, switch instead to `scroll-margin-top` on sections — but default plan is to keep the padding spacer.

4. **Preserve everything else**
   - Glass background, blur, active tab styling, theme toggle, CTA button, mobile menu, links — all untouched.

## Result
Navbar remains visually locked at `top: 0` while scrolling in any direction, on every page that renders `<SiteNavbar />`, with no overlap with page content.
