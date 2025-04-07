# Solar Site Selector – Backend

This backend processes geospatial parcel data and scores solar suitability using PVlib, DEM data, and parcel geometry.


---


```markdown
# Solar Site Selector – Backend

Python-based backend pipeline that processes parcel data and computes solar suitability using GHI (via NASA), slope (via DEM), and irradiance modeling (via PVlib).
```
---

## Key Modules

- `site_model.py` – Computes annual energy yield per parcel using GHI, slope, and aspect
- `dem_utils.py` – Extracts slope and elevation from DEM
- `process_parcels.py` – Batch processing entry point
- `post_process.py` – Copies scored GeoJSON to the frontend folder

---

## Project Structure

```bash
solar-site-selector-backend/
├── backend/
│   ├── config.py           # Site config (lat/lon, GHI defaults)
│   ├── logger.py           # Logging helper
│   ├── site_model.py       # Irradiance + energy calculation
│   ├── dem_utils.py        # Slope calculation from DEM
│   ├── process_parcels.py  # Batch processing entry
│   └── post_process.py     # GeoJSON output to frontend
├── data/
│   ├── parcels.geojson     # Raw input (geometry only)
│   └── mn_dem.tif          # DEM (GeoTIFF) for slope analysis
├── outputs/
│   ├── scored_parcels.geojson  # Final output layer
│   └── logs.txt                # Run logs
├── requirements.txt
└── README.md
```
---
## Getting Started
1. Setup your environment
bash
Copy
Edit
cd solar-site-selector-backend
python -m venv venv
source venv/bin/activate  # or .\venv\Scripts\activate on Windows
pip install -r requirements.txt
2. Run the processor
bash
Copy
Edit
python backend/process_parcels.py
3. Output
outputs/scored_parcels.geojson: Scored parcels with area, slope, GHI, kWh/year

This output is copied to solar-site-selector-demo/data/output_scores.geojson for map use.

## Notes
Uses PVlib, rasterio, GeoPandas

Requires a valid DEM in .tif format

Works offline after setup