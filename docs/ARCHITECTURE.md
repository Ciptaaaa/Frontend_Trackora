# Trackora: Architecture and Design Notes

Deep-dive documentation for the Trackora frontend. For setup and a project overview, see the [README](../README.md).

## Contents

- [Design System](#design-system)
- [Features](#features)
- [API Integration](#api-integration)
- [Authentication](#authentication)
- [Backend Constraints](#backend-constraints)
- [Responsive Layout](#responsive-layout)
- [Theming](#theming)
- [Internationalization](#internationalization)
- [Accessibility](#accessibility)
- [SEO](#seo)
- [Build & Deployment](#build--deployment)

---

## Design System

**Direction: paper and petrol.** Warm neutral `paper-*` tokens for surfaces, `ink-*` for text, and a single blue accent, `petrol-*`, for actions. Status colors carry meaning: saffron for due soon, berry for overdue, mint for done. The `petrol` token name is kept even though its value is blue, so existing classes do not need renaming.

**Typography.** Noto Sans Variable is used across the whole UI, including numerals (`tabular-nums`). Playfair Display is available for headings through `font-heading`. Hierarchy comes from size, weight, and negative tracking rather than from many font families.

**Semantic tokens.** Surface and text tokens are semantic ramps, not literal colors. In dark mode the same variables are redefined, so `bg-paper-50` automatically becomes a dark surface without extra `dark:` variants on every element.

### Signature element: the week spine

A strip below the top bar showing the next seven days. Each day displays its **workload** as a stack of ticks that grows taller with more work.

- **Click a day** to highlight the cards due that day. Click again to clear.
- **Highlight, do not filter.** Matching cards get a petrol ring and the rest are dimmed, but nothing disappears from the board. A filtered kanban column is indistinguishable from an empty one and reads as data loss.
- Each column header shows a badge with the number of cards in that column due on the highlighted day.
- While a highlight is active, a banner below the strip shows the selected date, the number of highlighted cards (or that the day is empty), and a **Clear highlight** button.

Urgency is communicated by the **due chip** (`DueBadge`): berry for overdue, saffron for today or soon, neutral for later.

## Features

**Boards.** Create boards and edit their title, description, and due date. Add members through user search. The `+` button is available in the sidebar (rail and full) and the top bar; the pencil icon in the top bar edits the active board.

**Columns.** Add via the dotted slot at the end of the board. Rename inline, move left or right, or delete from the `⋯` menu in the column header.

**Cards.**

- Inline creation: title first, then an optional "Description and due date" link reveals two more fields.
- Drag and drop between columns.
- Editable detail panel: title, description, due date, labels, assignees, attachments, and comments.

**Labels.** Global management (create, rename, recolor, delete) through the tag icon in the top bar. Attach or detach per card from the detail panel.

**Search and filters.**

- Search across titles, descriptions, and label names. Press `/` to focus and `Esc` to clear.
- **Due** and **Overdue** filters from the sidebar or the mobile island. Selecting the active item again restores the full board.
- Per-day highlight via the week spine.

**Account and preferences.**

- Account menu with identity, a settings shortcut, theme, language, and sign out.
- Settings dialog to update the display name. Email is shown read-only because it identifies the account.
- Light and dark theme plus ID, EN, and 中文, all persisted in `localStorage`.
- The language control is shared between the account menu and settings through `LocaleSegmented`. The top bar and login page keep the compact dropdown in `LocaleSwitcher`.

**Responsive navigation.** Drawer and bottom island on phones, a collapsible icon rail on tablets, and a full sidebar on desktop.

### Landing page

Assembled in `LandingPage.astro` from `LandingHeader`, `LandingHero` (with a week spine demo), `LandingCapabilities`, `LandingViews`, `LandingPrinciples`, and `LandingFooter`. All copy lives in `src/i18n/landing.ts`, one object per language, with no text scattered through the markup.

- **Header.** Sticky and full-width on phones; from `sm` it floats as a rounded pill. Controls appear progressively: theme toggle and sign-in from `sm`, section links from `lg`, and the "This week" chip from `xl`. Theme, locale, nav, and CTA buttons are 44px tall.
- **Headline.** `TypingHeadline` keeps the full text in the HTML for crawlers, runs a looping typing animation (per-language `speed`, `hold`, `loop`), and falls back to static text under `prefers-reduced-motion` or without JavaScript. The `h1` height is locked by the real text, so there is no layout shift.
- **Theme toggle.** `AnimatedThemeToggler` is a two-state (light/dark) button using View Transitions. The preference is stored under `trackora.v1.theme`, so the landing page and app share it.

## API Integration

Endpoint configuration lives in `src/lib/config.ts`:

```ts
export const API_BASE_URL = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3030';
```

<details>
<summary><strong>Endpoints used</strong></summary>

| UI action              | Endpoint                                                     |
| ---------------------- | ------------------------------------------------------------ |
| Log in                 | `POST /v1/auth/login`                                        |
| Register               | `POST /v1/auth/register`                                     |
| Update profile         | `PUT /v1/users/:id`                                          |
| Load boards            | `GET /api/v1/boards/my`                                      |
| Create board           | `POST /api/v1/boards`                                        |
| Update board           | `PUT /api/v1/boards/:id`                                     |
| Add board member       | `POST /api/v1/boards/:id/members`                            |
| Load columns           | `GET /api/v1/boards/:board_id/lists`                         |
| Create column          | `POST /api/v1/lists`                                         |
| Rename column          | `PUT /api/v1/lists/:id`                                      |
| Delete column          | `DELETE /api/v1/lists/:id`                                   |
| Reorder columns        | `PUT /api/v1/boards/:board_id/position`                      |
| Load cards             | `GET /api/v1/lists/:list_id/cards`                           |
| Create card            | `POST /api/v1/cards`                                         |
| Update card            | `PUT /api/v1/cards/:id`                                      |
| Delete card            | `DELETE /api/v1/cards/:id`                                   |
| Move card (drop)       | `PUT /api/v1/cards/:id`, then `PUT /api/v1/lists/:list_id/positions` |
| Attach label           | `POST /api/v1/cards/:id/labels`                              |
| Detach label           | `DELETE /api/v1/cards/:id/labels`                            |
| Add assignee           | `POST /api/v1/cards/:id/assignees`                           |
| Remove assignee        | `DELETE /api/v1/cards/:id/assignees`                         |
| Upload attachment      | `POST /api/v1/cards/:id/attachments`                         |
| Delete attachment      | `DELETE /api/v1/cards/:card_id/attachments/:attachment_id`   |
| Load comments          | `GET /api/v1/cards/:id/comments`                             |
| Add comment            | `POST /api/v1/cards/:id/comments`                            |
| Delete comment         | `DELETE /api/v1/cards/:card_id/comments/:comment_id`         |
| Load labels            | `GET /api/v1/labels`                                         |
| Create label           | `POST /api/v1/labels`                                        |
| Update label           | `PUT /api/v1/labels/:id`                                     |
| Delete label           | `DELETE /api/v1/labels/:id`                                  |
| Search users           | `GET /api/v1/users/page?filter=...`                          |

</details>

**Data contract.** `src/types/domain.ts` follows the API as-is: `snake_case` fields, resources identified by `public_id` (UUID), and the `ApiSuccess<T>` / `ApiError` / `PaginationMeta` envelopes. Components consume those domain types directly. `api.ts` is the only place where the backend's JSON shape is translated.

**Optimistic updates.** Card and column moves update local state first and call the API afterward. If the API rejects the change, the UI reverts to the previous position.

**CORS.** The backend (`main.go`) allows the origin `http://localhost:4321`. If you run the dev server on another port, or deploy the frontend to a new domain, add that origin to `AllowOrigins` on the backend. `AllowMethods` does not include `PATCH`, so all updates use `PUT`, and **`PUT` in this API is a full replace**: always send unchanged fields too, or they will be reset.

## Authentication

The session is stored in `localStorage` under `trackora.v1.session`. `src/lib/api.ts` injects `Authorization: Bearer <token>` into every request that requires authentication.

## Backend Constraints

These are limitations of the current API that the frontend works around deliberately.

| Constraint | Frontend handling |
| --- | --- |
| **No endpoint to read board members** (only add and remove). | The member list in the board dialog shows only members added in that session. A hint (`board.membersHint`) states this explicitly so an empty list is not read as "no members". |
| **Comments cannot be updated.** | Comments can only be added or deleted. Edit-by-recreate is not offered because it would move the comment to the bottom of the thread. |
| **`GET /boards/:id/lists` returns 404** for boards whose `list_positions` row was never written (every new board). | `getListsOnBoard` treats this as an empty list instead of an error, so new boards do not open with an error banner. |
| **Pivot tables `card_labels` / `card_assignees` use composite primary keys**, so attaching an already-attached item fails with a duplicate-key error. | Every label and assignee change is lifted into board state via `onUpdate`. Otherwise a reopened panel would read stale data and send a second `POST`. |
| **`due_date` is a non-pointer `time.Time`**, so cards without a date come back as `0001-01-01T00:00:00Z`. | `nullableDate()` in `api.ts` folds that value to `null`. Without it, such cards would read as roughly 2,000 years overdue. |
| **`due_date` is an instant, but a calendar date is intended.** | `toApiDate()` sends **noon UTC** (`T12:00:00Z`). Midnight UTC can shift the date back by one day when the backend or database returns the value in a zone behind UTC. Noon leaves eleven hours of margin in both directions, covering UTC-11 to UTC+12. Day extraction is centralized in `dueDay()` so filters, the spine, and badges always agree. |
| **No `status` / `completed` field on cards.** | Completion is inferred from **column position**: a column titled `Selesai`, `Sudah selesai`, `Beres`, `Done`, `Complete`, `Completed`, `Finished`, `完成`, or `已完成` counts as a done pile (Trello convention). Matching happens in `lib/completion.ts` after normalizing the title (lowercase, punctuation, and emoji removed), so `✅ Done` matches but negations like `Not done` do not. |
| **No archive field or endpoint.** | The Archive item was removed from the UI rather than promising a destination that does not exist. Cards are completed by moving them to a done column. |

**Effect of the done column.** Cards in a done column are dimmed with a struck-through title, use a calm urgency bar, and swap the due badge for a "Done" chip. They are excluded from overdue counts and from the week spine, so the overdue number can return to zero.

**Profile updates send only `name` and `email`.** The endpoint binds the entire user model, so sending everything would let the form write `role` as well. The UI only lets you edit the display name; email is read-only. The saved result is lifted to `TrackoraApp`, which owns the session, so the avatar updates immediately rather than after a reload.

## Responsive Layout

| Width          | Navigation                           | Board                              |
| -------------- | ------------------------------------ | ---------------------------------- |
| `< 768px`      | Drawer and **bottom island**         | One full-width column, snap scroll |
| `768px` to `1023px` | **Icon rail, always visible**   | About 2 columns                    |
| `1024px` and up | Full sidebar with labels and account | 3 or more columns                |

- **Tablet rail.** The rail stays visible because tablets have room for a 64px rail, keeping board switching one tap away. The logo acts as an expand button; the expanded rail opens as an **overlay** rather than resizing in place, since widening it at 768px would crush the board columns. Close it with an outside click, the close button, `Esc`, or by selecting a board.
- **Mobile island.** `MobileIsland` places Board, Due, Overdue, and Profile as a floating pill at the bottom, within thumb reach. It floats rather than docking so board columns remain visible behind it. Counts appear as icon badges, and labels show only on the active segment (three labels do not fit at 360px). Inactive segments keep `sr-only` labels. The column row gets `pb-20` below `md` so the last card is never covered.
- **Card detail** is a bottom sheet on phones and a side panel from `sm`.
- **Week spine** scrolls horizontally on narrow screens instead of compressing, since the workload ticks would disappear if squeezed.

**Required properties on the board's column row.** If any is missing, columns overlap once they no longer fit. This is only visible on small screens, because on desktop the content still fits and nothing shrinks.

- `w-max` on the column row. A flex container defaults to `width: auto`, which resolves to the *container* width rather than the content width, so the row ends up narrower than its own children.
- `shrink-0` on each column wrapper. Flex items may shrink by default; the wrapper would shrink while the inner `<section>` keeps a fixed width, causing columns to overlap.
- `overflow-y-hidden` on `<main>`. Each column already scrolls its own cards, so the board must not grow a second vertical scrollbar.

Horizontal padding is applied on the row, not on `<main>`, because Chrome and Safari ignore `padding-right` on scroll containers; without this, the last column touches the edge.

## Theming

`paper-*` and `ink-*` are **semantic ramps**: `paper` is surface (50 = raised card, 200 = app background) and `ink` is text (400 = muted, 900 = strongest). In dark mode the same variables are redefined under `.dark`, so contrast direction is preserved without additional `dark:` variants.

The `nav-*` tokens follow the page theme as well: the sidebar is a light surface in light mode and a dark surface in dark mode. `--color-onaccent` flips with the fill beneath it, so no text is hard-coded to white. The modal scrim uses a theme-specific alpha.

A small inline script in `Layout.astro` and `LandingLayout.astro` runs **before first paint**, preventing a white flash for dark-mode users. A legacy `system` value in `localStorage` is still honored by that script, then replaced by an explicit choice once the user presses the toggle.

Contrast is checked for WCAG AA (4.5:1) in both themes whenever text tokens or component states change.

## Internationalization

Three languages: Indonesian (default), English, and 中文. The switcher is in the top bar and on the login page, the choice persists in `localStorage`, and `<html lang>` is updated accordingly.

The `id` dictionary is the source of truth, and `TranslationKey` is derived from it:

```ts
export type TranslationKey = keyof typeof id;
export type Dictionary = Record<TranslationKey, string>;
```

Because `en` and `zh` are typed as `Dictionary`, **a missing translation is a compile error**, not an empty string discovered on screen. The dictionaries are complete in all three languages.

Dates are not hard-coded. Day and month names come from `Intl` (`id-ID` / `en-GB` / `zh-CN`), so the week spine changes language too. The font stack lists `Noto Sans SC`, `PingFang SC`, and `Microsoft YaHei` as system fallbacks so Chinese text does not fall back to a mismatched font; these fonts are not downloaded.

## Accessibility

- Visible keyboard focus on all controls.
- `aria-label` on icon-only buttons.
- Text equivalents for the spine's tick stacks for screen readers.
- `prefers-reduced-motion` is respected.
- Layouts verified down to about 360px width.
- **Dismissable popovers.** Board, language, and account dropdowns share `lib/useDismissable.ts` ("close on outside click or `Esc`"). It listens to `mousedown` rather than `click`, so a gesture that starts inside and ends outside (text selection, a slipping finger) is not treated as an outside click.
- **Account menu.** The profile picture opens a labelled popover, not a direct logout. It shows the signed-in identity, a settings shortcut, theme, language, and sign out at the bottom. No confirmation dialog is needed: opening the menu and choosing the last row is already a deliberate action.
- **Settings.** Sections are labelled, the email field is read-only with an explanation, and save feedback is announced in text rather than color alone.

## SEO

`astro.config.mjs` sets `site: https://www.trackora.web.id` (the apex `trackora.web.id` redirects with a 308 to `www`). The same domain is used by `src/i18n/landing.ts` for canonical, hreflang, and `og:url`, with `PUBLIC_SITE_URL` as an optional override.

- `@astrojs/sitemap` generates `sitemap-index.xml` and `sitemap-0.xml` with the three landing pages (`/`, `/en/`, `/zh/`) and hreflang `id` / `en` / `zh-CN`. `/login`, `/register`, and `/boards` are excluded via a filter.
- `public/robots.txt` allows the landing pages, blocks private pages, and points to the sitemap.
- `LandingLayout.astro` emits a self-referencing canonical per language, hreflang including `x-default` to `/`, basic Open Graph tags, and JSON-LD for `WebSite` and `Organization`.
- `Layout.astro` (app pages) emits `noindex`.

After deploying, submit `https://www.trackora.web.id/sitemap-index.xml` in Google Search Console. Indexing is not ranking: a sitemap speeds up discovery, it does not improve position.

## Build & Deployment

The build outputs a static `dist/` directory, deployed on Vercel.

`vercel.json` configures security headers (CSP, X-Content-Type-Options, X-Frame-Options, Permissions-Policy, Referrer-Policy) and caching for `/boards`. There are no rewrites.

**Deep links under `/boards/:id`.** If these need to survive a refresh, add a scoped rewrite from `/boards/:path*` to `/boards/index.html`. Do **not** use a catch-all to `/index.html`: it would swallow `/sitemap-index.xml`, `robots.txt`, and the `/_astro` assets, and there is no `/app` route in this project.

**Native binaries.** `node_modules` in this repository is installed from Windows, so the native binaries (`@tailwindcss/oxide`, `@rollup/rollup-*`) only match Windows. Run `npm run dev` and `npm run build` on the host, not in a Linux container. Type-checking works anywhere because `tsc` is pure JavaScript:

```bash
node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json
```

`tsconfig.json` enables `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noUnusedLocals`, and `noUnusedParameters` on top of Astro's strict preset.
