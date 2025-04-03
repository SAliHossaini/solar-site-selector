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

### Backend
1. Create a Python virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
