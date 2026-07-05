# GGEMU-SHIPFAST

GGEMU-SHIPFAST is a high-quality game website template that makes it easy for anyone to launch and operate their own online gaming site.

The project is rebuilt with Tanstarter and designed for fast deployment, including one-click deployment on Cloudflare. It provides a ready-to-use foundation for building a game portal with online play, a shared game database, and monetization through advertising platforms.

## Features

- High-quality website template for launching a game portal quickly
- Built with Tanstarter, React, TanStack Start, TanStack Router, Vite, and TypeScript
- Cloudflare-ready deployment workflow
- Online play support for many retro and web game platforms
- Shared database with thousands of games
- Designed for ad monetization after joining supported advertising platforms
- Simple, practical structure for customization and further development

## Supported Game Platforms

GGEMU-SHIPFAST supports online gameplay across many platforms, including:

- Arcade
- Flash
- DOS
- HTML5
- GB
- GBC
- GBA
- FC
- SFC
- NDS
- N64
- Virtual Boy
- Sega Game Gear
- Sega Genesis
- Sega Master System
- Sega 32X
- Sega CD
- Sega Saturn
- PlayStation 1
- PSP
- PC Engine
- Neo Geo Pocket
- WonderSwan

## Monetization

After applying to and joining supported advertising platforms, site owners can place ads on their game website and earn advertising revenue from traffic.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Site Configuration

Default site settings live in `siteconfig.js`. Runtime environment variables
with the same names take priority over `siteconfig.js`:

- `SITE_THEMES`
- `SITE_EMAIL`
- `SITE_NAME`
- `SITE_SLOGAN`
- `SITE_TEMPLATE`
- `GGEMU_REFCODE`
- `GOOGLE_ADSENSE_CLIENT`
- `GOOGLE_ANALYTICS_ID`

`SITE_TEMPLATE` accepts `default`, `two-column`, `poki-like`.

On Cloudflare Workers, configure these as Worker variables or secrets. The app
reads Cloudflare runtime bindings first, then falls back to `process.env`, then
to `siteconfig.js`.

## Route Generation

This project uses TanStack Router file-based routing. After changing route files, regenerate the route tree:

```bash
npm run generate-routes
```

Do not edit `src/routeTree.gen.ts` manually.

## Deployment

GGEMU-SHIPFAST is designed to be deployed easily on Cloudflare. Choose the Cloudflare deployment flow for your environment, connect the repository, build the project, and publish the generated output.

## Tech Stack

- React 19
- TanStack Start
- TanStack Router
- Vite
- TypeScript
- npm

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](./LICENSE) for
details.

Attribution notices are provided in [NOTICE](./NOTICE). Redistributed copies or
derivative works must retain the required copyright, license, and attribution
notices as described by the license.
