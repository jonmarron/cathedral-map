# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start Vite dev server (http://localhost:5173)
npm run build    # production build
npm run preview  # preview production build
```

There are no tests or linting configured.

## Architecture

Single-page React app (`src/App.jsx`) with a Leaflet map. All data and rendering live in one file — there is no routing, state management library, or component split.

**Data model** — `EPOCHS` object keyed by tab name. Each epoch has a `type` field that drives rendering:
- `type: 'routes'` (First Gothic) — draws `<Polyline>` from Paris to each destination plus a `paris` object for the Paris marker.
- `type: 'locations'` (Classic Gothic) — flat markers only, organised into `groups` by country. Each group has a `country` key that maps to `COUNTRY_COLORS` for popup accent colour.

Each location entry carries `cathedral`, `dates`, `note`, and `wiki` fields rendered directly in the Leaflet `<Popup>`.

**Leaflet icon fix** — default marker icons are broken by Vite's asset pipeline. They are patched at module level by deleting `_getIconUrl` and calling `L.Icon.Default.mergeOptions` with CDN URLs (unpkg). This must stay at the top of `App.jsx`.

**Tab switching** — `key={activeTab}` on `<MapContainer>` forces a full remount when the tab changes, resetting the map view to the epoch's `center`/`zoom`.

**Timeline filter** — each location entry has a `startYear`. The `currentYear` state (driven by a range slider + ±1/±5 step buttons) controls visibility: markers render at 50% opacity and polylines at 20% opacity when `startYear > currentYear`. `getYearRange` computes `[min, max]` from all `startYear` values in the active epoch, padded by `TIMELINE_PADDING = 25`. Switching tabs resets `currentYear` to the epoch's `maxYear` via `useEffect`.
