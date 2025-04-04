# backend/process_parcels.py

import geopandas as gpd
import pandas as pd
import logging
import rasterio
import os
from shapely.geometry import box

from site_model import SolarSiteModel
from dem_utils import calculate_slope_aspect


def process_all_parcels(config):
    """Processes input parcels, calculates slope/aspect, scores them using DEM and GHI raster, and saves output."""

    logging.info("Loading input parcels...")
    parcels = gpd.read_file(config.input_path)

    # Load full CSV to extract lat/lon from metadata row
    with open(config.ghi, 'r') as f:
        meta_line = f.readlines()[1]  # Line 2 = index 1

    # Extract latitude and longitude from the metadata line
    import csv
    meta_values = next(csv.reader([meta_line]))
    latitude = float(meta_values[5])
    longitude = float(meta_values[6])

    # Load the actual data (starting from 3rd line)
    nsrdb_df = pd.read_csv(config.ghi, skiprows=2)
    nsrdb_df.replace(-9999, pd.NA, inplace=True)

    # Add Latitude and Longitude columns
    nsrdb_df['Latitude'] = latitude
    nsrdb_df['Longitude'] = longitude


    logging.info("Initializing SolarSiteModel with GHI raster...")
    model = SolarSiteModel(nsrdb_df)

    logging.info("Scoring each parcel...")
    scores = []

    for idx, row in parcels.iterrows():
        try:
            slope, aspect = calculate_slope_aspect(config.dem_path, row.geometry)
            if slope is None:
                raise ValueError("Slope could not be calculated.")

            ghi_score = model.score_parcel(row.geometry, slope, aspect)
            scores.append(ghi_score)

        except Exception as e:
            logging.warning(f"Failed to score parcel ID {row.get('id', idx)}: {e}")
            scores.append(None)

    parcels["score"] = scores

    # Ensure output directory exists
    os.makedirs(os.path.dirname(config.output_path), exist_ok=True)

    # Remove old output file if it exists
    if os.path.exists(config.output_path):
        os.remove(config.output_path)

    logging.info(f"Writing results to {config.output_path} ...")
    try:
        parcels.to_file(config.output_path, driver="GeoJSON")
        logging.info("Scoring complete.")
    except Exception as e:
        logging.error(f"Failed to write GeoJSON output: {e}")

