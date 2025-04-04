# backend/dem_utils.py

import rasterio
from rasterio.mask import mask  
import numpy as np
import warnings
from shapely.geometry import mapping
import geopandas as gpd

def calculate_slope_aspect(dem_path, geometry):

    try:
        with rasterio.open(dem_path) as src:
            dem_crs = src.crs

            # Reproject geometry to DEM CRS
            geom_gdf = gpd.GeoDataFrame(geometry=[geometry], crs="EPSG:4326")
            geom_gdf = geom_gdf.to_crs(dem_crs)
            geom_proj = mapping(geom_gdf.geometry.iloc[0])

            # ✅ mask is imported and used here
            out_image, _ = mask(src, [geom_proj], crop=True)
            dem_data = out_image[0].astype(np.float32)

            # Handle NoData values (common for BIL files: 1.7e+38)
            nodata = src.nodata
            if nodata is not None:
                dem_data = np.where(dem_data == nodata, np.nan, dem_data)
            dem_data[dem_data > 1e30] = np.nan  # Catch hidden NoData

            if np.isnan(dem_data).all():
                return None, None

            # Calculate gradient and slope, ignoring NaNs
            dx, dy = np.gradient(dem_data)
            slope = np.hypot(dx, dy)
            aspect = np.arctan2(-dx, dy)

            mean_slope = np.nanmean(slope)
            mean_aspect = np.nanmean(aspect)

            if not np.isfinite(mean_slope):
                return None, None

            return float(mean_slope), float(mean_aspect)

    except Exception as e:
        warnings.warn(f"DEM masking failed: {e}")
        return None, None
