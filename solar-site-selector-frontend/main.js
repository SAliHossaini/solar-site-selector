// File: js/main.js

import esriConfig from "https://js.arcgis.com/4.26/@arcgis/core/config.js";
import Map from "https://js.arcgis.com/4.26/@arcgis/core/Map.js";
import MapView from "https://js.arcgis.com/4.26/@arcgis/core/views/MapView.js";
import GeoJSONLayer from "https://js.arcgis.com/4.26/@arcgis/core/layers/GeoJSONLayer.js";
import GraphicsLayer from "https://js.arcgis.com/4.26/@arcgis/core/layers/GraphicsLayer.js";
import Sketch from "https://js.arcgis.com/4.26/@arcgis/core/widgets/Sketch.js";
import BasemapGallery from "https://js.arcgis.com/4.26/@arcgis/core/widgets/BasemapGallery.js";
import LayerList from "https://js.arcgis.com/4.26/@arcgis/core/widgets/LayerList.js";
import Legend from "https://js.arcgis.com/4.26/@arcgis/core/widgets/Legend.js";
import * as geometryEngine from "https://js.arcgis.com/4.26/@arcgis/core/geometry/geometryEngine.js";

import { fetchGHI, formatGHIPopup } from "./api.js"; 

esriConfig.portalUrl = "https://www.arcgis.com";

let map, view, sketch, graphicsLayer;

export function initMap() {
  view = new MapView({
    container: "viewDiv",
    map,
    center: [-93.2650, 44.9778],
    zoom: 12
  });

  view.ui.add(new LayerList({ view }), "bottom-right");
  view.ui.add(new Legend({ view }), "bottom-left");

  return { map, view };
}

/**
 * Load parcel + transmission layers with dynamic popup
 */
export function loadGeoJSONLayers(map) {
  const parcels = new GeoJSONLayer({
    url: "./data/parcels_sample.geojson",
    title: "Parcel Boundaries",
    id: "parcels",
    outFields: ["*"],
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-fill",
        color: [255, 255, 204, 0.5],
        outline: { color: "#999", width: 0.5 }
      }
    },
    popupTemplate: {
      title: "Parcel Info",
      content: async ({ graphic }) => {
        const geom = graphic.geometry;
        const lat = geom.centroid?.latitude ?? geom.latitude;
        const lon = geom.centroid?.longitude ?? geom.longitude;
        const ghi = await fetchGHI(lat, lon);
        return `
          <b>ID:</b> ${graphic.attributes.id}<br>
          <b>Owner:</b> ${graphic.attributes.owner}<br>
          ${formatGHIPopup(lat, lon, ghi)}
        `;
      }
    }
  });

  const transmission = new GeoJSONLayer({
    url: "./data/transmission_lines.geojson",
    title: "Transmission Lines",
    id: "transmission",
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-line",
        color: "#e60049",
        width: 2
      }
    }
  });

  map.addMany([parcels, transmission]);
  return { parcels, transmission };
}
