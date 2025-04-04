# Backend config

class Config:
    def __init__(self):
        self.input_path = "solar-site-selector-backend/data/parcels_test.geojson"
        self.output_path = "solar-site-selector-backend/data/scored_parcels.geojson"
        self.dem_path = "solar-site-selector-backend/data/dem_1m_m.bil" 
        self.ghi = "solar-site-selector-backend/data/nsrdb.csv"

