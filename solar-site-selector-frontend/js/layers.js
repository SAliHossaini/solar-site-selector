// File: js/layers.js

import GeoJSONLayer from "https://js.arcgis.com/4.26/@arcgis/core/layers/GeoJSONLayer.js";
import MapImageLayer from "https://js.arcgis.com/4.26/@arcgis/core/layers/MapImageLayer.js";
import FeatureLayer from "https://js.arcgis.com/4.26/@arcgis/core/layers/FeatureLayer.js";
import { CONFIG } from "./config.js";
import { fetchGHI } from "./api.js"; // Import GHI fetcher

const layerCache = {};

/**
 * Create parcel layer from local GeoJSON
 */
export function createParcelsLayer() {
  const { parcels } = CONFIG.layers;

  const layer = new GeoJSONLayer({
    url: parcels.url,
    title: parcels.title,
    id: parcels.id,
    outFields: ["*"],
    visible: parcels.visible,
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-fill",
        color: parcels.color,
        outline: {
          color: parcels.outline || "#666",
          width: 1
        }
      }
    },
    popupTemplate: {
      title: "Parcel Info",
      content: (event) => {
        const geom = event.graphic.geometry;
        const lat = geom.centroid?.latitude ?? geom.latitude;
        const lon = geom.centroid?.longitude ?? geom.longitude;
    
        return fetchGHI(lat, lon).then((ghi) => {
          return `
            <b>ID:</b> ${event.graphic.attributes.id || event.graphic.attributes.OBJECTID}<br>
            GHI: ${ghi ? ghi + " kWh/m²/day" : "N/A"}
          `;
        });
      }    
    }
  });

  layerCache[parcels.id] = layer;
  return layer;
}

/**
 * Create transmission lines layer
 */
export function createTransmissionLayer() {
  const { transmission } = CONFIG.layers;

  const layer = new GeoJSONLayer({
    url: transmission.url,
    title: transmission.title,
    id: transmission.id,
    outFields: ["*"],
    visible: transmission.visible,
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-line",
        color: transmission.color,
        width: 2
      }
    }
  });

  layerCache[transmission.id] = layer;
  return layer;
}

/**
 * Optional score layer (visual variable: color based on score)
 */
export function createScoreLayer() {
  const { scores } = CONFIG.layers;

  const layer = new GeoJSONLayer({
    url: scores.url,
    title: scores.title,
    id: scores.id,
    outFields: ["*"],
    visible: scores.visible,
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-fill",
        color: "gray",
        outline: { color: "black", width: 0.3 }
      },
      visualVariables: [
        {
          type: "color",
          field: "score",
          stops: scores.colorStops
        }
      ]
    }
  });

  layerCache[scores.id] = layer;
  return layer;
}

// /**
//  * ArcGIS MapImageLayer for raster-based solar radiation
//  */
// export function createSolarRadiationLayer() {
//   const { solarRaster } = CONFIG.layers;

//   const layer = new MapImageLayer({
//     url: solarRaster.url,
//     title: solarRaster.title,
//     id: solarRaster.id,
//     visible: solarRaster.visible,
//     opacity: solarRaster.opacity ?? 0.7
//   });

//   layerCache[solarRaster.id] = layer;
//   return layer;
// }

// /**
//  * NLCD Landcover raster
//  */
// export function createNLCDLayer() {
//   const { landcover } = CONFIG.layers;

//   const layer = new MapImageLayer({
//     url: landcover.url,
//     title: landcover.title,
//     id: landcover.id,
//     visible: landcover.visible,
//     opacity: landcover.opacity ?? 0.5
//   });

//   layerCache[landcover.id] = layer;
//   return layer;
// }

// /**
//  * Terrain Slope raster
//  */
// export function createSlopeLayer() {
//   const { slope } = CONFIG.layers;

//   const layer = new MapImageLayer({
//     url: slope.url,
//     title: slope.title,
//     id: slope.id,
//     visible: slope.visible,
//     opacity: slope.opacity ?? 0.5
//   });

//   layerCache[slope.id] = layer;
//   return layer;
// }

// /**
//  * Substation point layer (ArcGIS FeatureLayer)
//  */
// export function createSubstationLayer() {
//   const { substations } = CONFIG.layers;

//   const layer = new FeatureLayer({
//     url: substations.url,
//     title: substations.title,
//     id: substations.id,
//     visible: substations.visible,
//     outFields: ["*"],
//     renderer: {
//       type: "simple",
//       symbol: {
//         type: "simple-marker",
//         style: "triangle",
//         color: "red",
//         size: "10px",
//         outline: {
//           color: "black",
//           width: 0.5
//         }
//       }
//     }
  // });

//   layerCache[substations.id] = layer;
//   return layer;
// }

/**
 * Get a single layer by ID (from cache)
 */
export function getLayerById(id) {
  return layerCache[id] || null;
}

/**
 * Get all registered layers
 */
export function getAllLayers() {
  return Object.values(layerCache);
}
