<div align="center">

# Trackora

**What's due this week, visible from Monday.**

A personal, Trello-style work board that places every card on its due day,
so you can read the week instead of re-reading long lists.

[**Live demo**](https://www.trackora.web.id) ·
[Backend API](https://github.com/Ciptaaaa/Project-Management) ·
[Architecture notes](docs/ARCHITECTURE.md)

Available in **Bahasa Indonesia** · **English** · **中文**

</div>

---

## Preview

<!--
  Add real screenshots to docs/images/ and uncomment:

  <p align="center">
    <img src="docs/images/landing-light.png" width="48%" alt="Landing page, light theme" />
    <img src="docs/images/board-dark.png" width="48%" alt="Board view, dark theme" />
  </p>
-->

The **week spine** is Trackora's signature element: seven days, each showing its workload as a stack of ticks that grows with the number of cards due. Click a day to highlight the cards due on it.

Example workload for one week:

| Day        | Mon | Tue | Wed | Thu | Fri | Sat | Sun |
| ---------- | --- | --- | --- | --- | --- | --- | --- |
| Cards due  | 1   | 2   | 1   | 0   | 3   | 1   | 0   |

The same cards on the board. The due chip carries urgency: overdue, due soon, or comfortably far away.

| To do                        | In progress                                                    | Done                |
| ---------------------------- | -------------------------------------------------------------- | ------------------- |
| Revise client brief (2 days late) | Send invoice (tomorrow)<br>Competitor research (Saturday) | Tidy up the board   |

## Features

- **Boards and columns.** Drag and drop cards between columns; rename, reorder, and delete columns inline.
- **Due dates that change color.** Neutral when far away, saffron when close, berry once overdue.
- **Three views of one board.** Full workflow, due today only, or overdue only.
- **Labels, assignees, comments, and attachments** live on the card where decisions are made.
- **Search** across titles, descriptions, and labels. Press `/` to focus and `Esc` to clear.
- **Account menu and settings.** Update the display name, switch theme and language, or sign out. The email address is shown read-only.
- **Light and dark themes**, with no flash of white on load.
- **Fully responsive.** Drawer and floating island on phones, an icon rail on tablets, and a full sidebar on desktop.
- **Three languages**, with missing translations caught at compile time.

> Trackora is intentionally calm: no feed and no nagging reminders. You open the board, look at the next seven days, and decide what to work on.

## Tech Stack

| Area       | Technology                                                   |
| ---------- | ------------------------------------------------------------ |
| Framework  | Astro 7, static output                                       |
| UI         | React 19 (islands, `client:load`)                            |
| Language   | TypeScript strict, no `any`                                  |
| Styling    | Tailwind CSS 4 (`@tailwindcss/vite`)                         |
| Fonts      | Noto Sans Variable · Playfair Display                        |
| i18n       | Custom, type-checked dictionaries (id, en, zh)               |
| SEO        | `@astrojs/sitemap`, canonical + hreflang, JSON-LD            |
| Backend    | Go · Fiber v3 · GORM · PostgreSQL ([repo](https://github.com/Ciptaaaa/Project-Management)) |

## Getting Started

**Prerequisites:** Node.js, npm, and a running instance of the [backend API](https://github.com/Ciptaaaa/Project-Management).

```bash
npm install
cp .env.example .env     # Windows: Copy-Item .env.example .env
npm run dev              # http://localhost:4321
```

| Script          | Description                         |
| --------------- | ----------------------------------- |
| `npm run dev`   | Start the dev server                |
| `npm run build` | Type-check with `astro check`, then build to `dist/` |

### Environment variables

| Variable          | Default                       | Description                                            |
| ----------------- | ----------------------------- | ------------------------------------------------------ |
| `PUBLIC_API_URL`  | `http://localhost:3030`       | Base URL of the backend API                            |
| `PUBLIC_SITE_URL` | `https://www.trackora.web.id` | Optional override for canonical, hreflang, and `og:url` |

> **CORS:** the backend only allows `http://localhost:4321` by default. If you use another port or domain, add it to `AllowOrigins` in the backend's `main.go`.

> **Native binaries:** if `node_modules` was installed on Windows, run `dev` and `build` on the host, not in a Linux container. Type-checking works anywhere:
> `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json`

## Project Structure

Components follow **atomic design**.

```
src/
├── components/
│   ├── atoms/        Button, Icon, Avatar, TextField, Logo, Spinner, ...
│   ├── molecules/    BoardSwitcher, LocaleSegmented, DueBadge, DayCell,
│   │                 AddCardForm, Modal, ...
│   ├── organisms/    Sidebar, Topbar, WeekSpine, TaskCard, BoardColumn,
│   │                 CardDetail, AccountMenu, SettingsDialog, MobileIsland,
│   │                 Landing*, ...
│   ├── templates/    TrackoraApp, AppShell, AuthScreen, LandingPage
│   └── ui/           animated-theme-toggler.tsx
├── i18n/             dictionaries.ts · index.ts · landing.ts · LocaleContext.tsx
├── layouts/          Layout.astro (app, noindex) · LandingLayout.astro (SEO)
├── lib/              api.ts · config.ts · router.ts · session.ts · date.ts
│                     completion.ts · view.ts · theme.ts · errors.ts
│                     scrollLock.ts · useDismissable.ts
├── pages/            index.astro · [lang].astro · [...slug].astro · 404.astro
├── styles/           global.css (@theme tokens + .dark overrides)
└── types/            domain.ts (domain types mirroring the API)
```

All HTTP calls live in `src/lib/api.ts`, the single place where the backend's JSON shape is translated into frontend domain types.

## Routes

| URL                                                | Content              |
| -------------------------------------------------- | -------------------- |
| `/`, `/en/`, `/zh/`                                | Landing (id, en, zh) |
| `/login`, `/register`                              | Authentication       |
| `/boards`, `/boards/:id`, `/boards/:id/cards/:cid` | Board app (`noindex`) |
| `/404`                                             | Not found            |

Board URLs are created client-side with the History API, so refreshing a deep link needs a [scoped rewrite](docs/ARCHITECTURE.md#build--deployment).

## Documentation

Design decisions, backend workarounds, and implementation details are in **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**:

[Design system](docs/ARCHITECTURE.md#design-system) ·
[API integration](docs/ARCHITECTURE.md#api-integration) ·
[Backend constraints](docs/ARCHITECTURE.md#backend-constraints) ·
[Responsive layout](docs/ARCHITECTURE.md#responsive-layout) ·
[Theming](docs/ARCHITECTURE.md#theming) ·
[i18n](docs/ARCHITECTURE.md#internationalization) ·
[SEO](docs/ARCHITECTURE.md#seo) ·
[Deployment](docs/ARCHITECTURE.md#build--deployment)

## Deployment

Static `dist/` output, hosted on Vercel. `vercel.json` sets security headers (CSP, X-Content-Type-Options, X-Frame-Options, Permissions-Policy, Referrer-Policy) and caching for `/boards`. There are no rewrites in the current configuration.

---

<p align="center">
  A personal project, built with Astro, React, and TypeScript on the front, and Go and PostgreSQL on the back.
</p>
