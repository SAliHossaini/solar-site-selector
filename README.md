# Solar Site Selector

A full-stack solar parcel analysis tool that enables users to interactively select areas of interest (AOIs), view parcel-level suitability, and export ranked results.

## Project Structure

- `solar-site-selector-demo/` – Frontend web app using ArcGIS Maps SDK for JavaScript.
- `solar-site-selector-backend/` – Python backend for scoring parcels using solar irradiance, slope, and aspect.
- `.vscode/` – VS Code settings, tasks, and debug configs.

## Getting Started

### Frontend
1. Open `solar-site-selector-demo/index.html` in your browser.
2. Requires internet access to load ArcGIS JavaScript API.

# Solar Site Selector – Frontend

An interactive web app for identifying top parcels suitable for solar development. Built with the ArcGIS Maps SDK for JavaScript, the tool lets users draw Areas of Interest (AOIs), view parcel-level solar potential, and export results.

![App Screenshot](./assets/screenshot.png)

## Features

- Draw AOIs directly on the map
- View parcels and transmission lines
- Fetch GHI (Global Horizontal Irradiance) via NASA API
- Rank and highlight Top 3 parcels by potential yield
- Export AOI and Top 3 results to GeoJSON
- Toggle layers and analyze solar potential

---

## Directory Structure

```bash
solar-site-selector-frontend/
├── index.html                  # Main HTML layout with map + sidebar
├── style.css                   # Responsive sidebar + UI styling
├── js/
│   ├── main.js                 # Entry point (init + view)
│   ├── config.js               # Map config (center, zoom, IDs)
│   ├── api.js                  # GHI data fetch from NASA
│   ├── layers.js               # GeoJSON layers: parcels, transmission
│   └── ui.js                   # Sidebar toggle, status banner, layer toggles
├── data/
│   ├── parcels.geojson
│   ├── transmission_lines.geojson
│   └── output_scores.geojson   # Result from backend processing
├── assets/
│   └── screenshot.png          # Visual for GitHub or docs
└── README.md
```

