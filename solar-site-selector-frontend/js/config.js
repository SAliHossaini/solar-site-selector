export const CONFIG = {
  map: {
    container: "viewDiv",
    center: [-93.445385, 44.858962], // Eden Prairie
    zoom: 13,
    basemap: "topo-vector"
  },

  aoiLayerId: "user-aoi",

  layers: {
    parcels: {
      id: "parcels",
      title: "Parcel Boundaries",
      url: "./data/parcels.geojson",
      color: "#ffcc66",
      outline: "#666666",
      opacity: 0.5,
      visible: true
    },

    transmission: {
      id: "transmission",
      title: "Transmission Lines",
      url: "./data/transmission_lines.geojson",
      color: "#ff0000",
      visible: true
    },

    scores: {
      id: "scores",
      title: "Solar Suitability Scores",
      url: "./data/output_scores.geojson",
      visible: true,
      colorStops: [
        { value: 0, color: "#ffffcc" },
        { value: 50, color: "#a1dab4" },
        { value: 100, color: "#41b6c4" },
        { value: 150, color: "#2c7fb8" },
        { value: 200, color: "#253494" }
      ]
    },

  }
};
