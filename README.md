# Skybound Flight Search

A responsive flight search experience built with Next.js App Router, TypeScript, Tailwind CSS, TanStack Query, Zod, and Recharts. It uses Amadeus Self-Service Test for live flight offers and derives a price trend series from current results.

## Links

- GitHub Repo: <ADD_REPO_LINK>
- Live Demo: <ADD_LIVE_LINK>

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file based on `.env.example` and add your Amadeus credentials.

3. Run the app:

```bash
npm run dev
```

## Environment Variables

```
AMADEUS_CLIENT_ID=
AMADEUS_CLIENT_SECRET=
AMADEUS_HOST=https://test.api.amadeus.com
```

## Data Strategy

- Flight offers come from the Amadeus Flight Offers Search endpoint via server routes.
- The price trend chart is derived from the current filtered offers, not historical pricing.
- For each leg, it builds a +/- 3 day window around the selected date and uses the lowest offer price as a baseline with a deterministic variance so the line feels realistic and updates instantly as filters change.

## Filtering

Filters are applied client-side and update results and the chart simultaneously:

- Stops: nonstop, 1 stop, 2+ stops
- Price range: derived from current results
- Airlines: multi-select from carriers present in the results

Filters are persisted in the URL, so searches and refinements can be shared.

## Scripts

```bash
npm run lint
npm run test
npm run build
```

## Deployment (Vercel)

- Add the environment variables in your Vercel project settings.
- Deploy from the main branch.

## Loom Walkthrough Script (3 to 4 minutes)

- 0:00 - 0:30: Intro, problem statement, and stack overview
- 0:30 - 1:10: Search form with typeahead and URL-driven state
- 1:10 - 2:00: Results list, sorting, and loading/empty states
- 2:00 - 2:45: Filters in action and how the chart updates live
- 2:45 - 3:20: Responsive behavior (drawer filters, sticky search)
- 3:20 - 3:50: Key implementation notes (server proxy, mapping, derived trend)
