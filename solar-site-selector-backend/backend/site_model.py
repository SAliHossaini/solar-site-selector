# backend/site_model.py

import numpy as np
from shapely.geometry import Point

class SolarSiteModel:
    def __init__(self, nsrdb_df):
        self.nsrdb_df = nsrdb_df
        self.point_stats = self.prepare_points()

    def prepare_points(self):
        points = self.nsrdb_df[['Longitude', 'Latitude', 'GHI']].dropna()
        return points.groupby(['Longitude', 'Latitude'])['GHI'].mean().reset_index()

    def get_mean_irradiance_from_points(self, geometry):
        total = 0
        count = 0
        for _, row in self.point_stats.iterrows():
            print(row)
            point = Point(row['Longitude'], row['Latitude'])
            if geometry.buffer(5000).contains(point):
                total += row['GHI']
                count += 1
        return total / count if count > 0 else None

    def score_parcel(self, geometry, slope, aspect):
        if slope is None or np.isnan(slope):
            raise ValueError("Invalid slope value for scoring.")

        ghi = self.get_mean_irradiance_from_points(geometry)
        if ghi is None:
            raise ValueError("No NSRDB point data intersects this parcel.")
        return ghi * (1 - slope / 90)
