// File: js/app.js

import Map from "https://js.arcgis.com/4.26/@arcgis/core/Map.js";
import MapView from "https://js.arcgis.com/4.26/@arcgis/core/views/MapView.js";
import BasemapGallery from "https://js.arcgis.com/4.26/@arcgis/core/widgets/BasemapGallery.js";
import Legend from "https://js.arcgis.com/4.26/@arcgis/core/widgets/Legend.js";
import Expand from "https://js.arcgis.com/4.26/@arcgis/core/widgets/Expand.js";
import SketchViewModel from "https://js.arcgis.com/4.26/@arcgis/core/widgets/Sketch/SketchViewModel.js";
import GraphicsLayer from "https://js.arcgis.com/4.26/@arcgis/core/layers/GraphicsLayer.js";
import * as geometryEngine from "https://js.arcgis.com/4.26/@arcgis/core/geometry/geometryEngine.js";
import Graphic from "https://js.arcgis.com/4.26/@arcgis/core/Graphic.js";
import SimpleFillSymbol from "https://js.arcgis.com/4.26/@arcgis/core/symbols/SimpleFillSymbol.js";

import { CONFIG } from "./config.js";
import { updateAOIArea, updateParcelSummary } from "./ui.js";
import { fetchGHI } from "./api.js";

import {
  createParcelsLayer,
  createTransmissionLayer,
  createScoreLayer,
  getAllLayers
} from "./layers.js";

let map, view, sketchLayer, topParcelLayer, sketchVM;
let top3Results = [];

const USABLE_AREA_RATIO = 0.7;
const PANEL_EFFICIENCY = 0.18;

export async function init() {
  map = new Map({
    basemap: CONFIG.map.basemap,
    ground: "world-elevation"
  });

  map.addMany([
    createParcelsLayer(),       
    createScoreLayer(),
    createTransmissionLayer()
  ]);

  sketchLayer = new GraphicsLayer({ id: CONFIG.aoiLayerId });
  topParcelLayer = new GraphicsLayer({ id: "top-parcels" });
  map.addMany([sketchLayer, topParcelLayer]);

  await createView();

  document.getElementById("drawAOI").addEventListener("click", () => {
    sketchVM.create("polygon");
  });

  document.getElementById("clearAOI").addEventListener("click", () => {
    sketchLayer.removeAll();
    topParcelLayer.removeAll();
    top3Results = [];
  });

  document.getElementById("exportAOI").addEventListener("click", () => {
    const graphics = sketchLayer.graphics.toArray();
    if (!graphics.length) return alert("Draw an AOI first.");

    const features = graphics.map(g => {
      const geom = g.geometry.toJSON();
      return {
        type: "Feature",
        properties: {
          note: "User drawn AOI"
        },
        geometry: {
          type: "Polygon",
          coordinates: geom.rings
        }
      };
    });

    const geojson = {
      type: "FeatureCollection",
      features
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], {
      type: "application/geo+json"
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "AOI.geojson";
    a.click();
  });

  document.getElementById("top3Btn").addEventListener("click", async () => {
    const aoi = sketchLayer.graphics.at(0)?.geometry;
    if (!aoi) return alert("Please draw an AOI first.");

    const parcelLayer = map.findLayerById("parcels");
    if (!parcelLayer) return alert("Parcel layer missing.");

    console.log("Running parcel scoring...");
    const top3 = await scoreParcelsInAOI(aoi, parcelLayer);
    top3Results = top3;
    const avgGHI = (top3.reduce((sum, p) => sum + p.ghi, 0) / top3.length).toFixed(2);
    const totalKWh = top3.reduce((sum, p) => sum + p.kwh, 0);
    const grades = top3.map(p => p.grade).join(", ");
    
    document.getElementById("top3Summary").innerHTML = `
      <strong>Top 3 Parcels Summary:</strong><br/>
      Total Yield: <strong>${Math.round(totalKWh).toLocaleString()} kWh/year</strong><br/>
      Avg GHI: <strong>${avgGHI} kWh/m²/day</strong><br/>
      Grades: <strong>${grades}</strong>
    `;
    document.getElementById("top3Summary").style.display = "block";
    
    if (!top3.length) {
      alert("All parcels returned invalid GHI or scoring.");
      return;
    }

    highlightTopParcels(top3);

    const top = top3[0];
    updateParcelSummary({
      area: top.area,
      kwh: top.kwh,
      grade: top.grade,
      ghi: top.ghi
    });

    exportTop3GeoJSON(top3);

    view.goTo({ target: top3.map(p => p.geometry), zoom: 15 });
  });
}

async function createView() {
  view = new MapView({
    container: CONFIG.map.container,
    map,
    center: CONFIG.map.center,
    zoom: CONFIG.map.zoom
  });

  sketchVM = new SketchViewModel({
    view,
    layer: sketchLayer,
    defaultUpdateOptions: { tool: "reshape" }
  });

  sketchVM.on("create", async event => {
    if (event.state === "complete") {
      const geom = event.graphic.geometry;
      const area = geometryEngine.planarArea(geom, "square-meters");
      const centroid = geom.centroid;
      const ghi = await fetchGHI(centroid.latitude, centroid.longitude);
      updateAOIArea(area, ghi);

      view.goTo(geom.extent.expand(1.5));
      sketchVM.cancel();

      console.log(`AOI area: ${(area / 10000).toFixed(2)} ha — GHI: ${ghi ?? "N/A"}`);
    }
  });

  const legend = new Legend({ view, layerInfos: getAllLayers().map(l => ({ layer: l })) });
  view.ui.add(new Expand({ view, content: legend, expanded: true }), "bottom-left");

  const basemapGallery = new BasemapGallery({ view });
  view.ui.add(new Expand({ view, content: basemapGallery }), "top-left");
}

async function scoreParcelsInAOI(aoi, parcelsLayer) {
  const query = parcelsLayer.createQuery();
  query.geometry = aoi;
  query.returnGeometry = true;
  query.outFields = ["*"];

  const { features } = await parcelsLayer.queryFeatures(query);
  console.log("📬 Parcel features found:", features.length);

  const topParcels = [];

  for (const f of features) {
    if (!f.geometry) continue;

    const area = geometryEngine.planarArea(f.geometry, "square-meters");
    if (area < 1) continue;

    const centroid = f.geometry.centroid;

    let ghi = null;
    try {
      ghi = await fetchGHI(centroid.latitude, centroid.longitude);
    } catch (err) {
      console.warn("Failed to fetch GHI for parcel:", f.attributes, err);
      continue;
    }

    if (!ghi || ghi < 1) continue;

    const usableArea = area * USABLE_AREA_RATIO;
    const kwh = ghi * 365 * usableArea * PANEL_EFFICIENCY;
    const kwhPerM2 = kwh / area;

    const grade =
      kwhPerM2 > 250 ? "A" :
      kwhPerM2 > 200 ? "B" :
      kwhPerM2 > 150 ? "C" :
      kwhPerM2 > 100 ? "D" :
      kwhPerM2 > 50 ? "E" : "F";

    topParcels.push({
      id: f.attributes.id || f.attributes.OBJECTID || `unk-${Math.random()}`,
      area,
      ghi,
      kwh,
      grade,
      geometry: f.geometry
    });
  }

  topParcels.sort((a, b) => b.kwh - a.kwh);
  console.log("Scored parcels:", topParcels);

  return topParcels.slice(0, 3);
}


function highlightTopParcels(top3) {
  topParcelLayer.removeAll();

  for (const p of top3) {
    const graphic = new Graphic({
      geometry: p.geometry,
      symbol: new SimpleFillSymbol({
        color: [0, 255, 0, 0.2],
        outline: { color: [0, 255, 0, 1], width: 2 }
      }),
      attributes: p,
      popupTemplate: {
        title: "Top Parcel",
        content: `
          ID: ${p.id}<br>
          Area: ${(p.area / 10000).toFixed(2)} ha<br>
          GHI: ${p.ghi} kWh/m²/day<br>
          Yield: ${Math.round(p.kwh)} kWh/year<br>
          Grade: ${p.grade}`
      }
    });
    topParcelLayer.add(graphic);
  }
}

function exportTop3GeoJSON(parcels) {
  const features = parcels.map(p => ({
    type: "Feature",
    properties: {
      id: p.id,
      area: p.area,
      ghi: p.ghi,
      kwh: p.kwh,
      grade: p.grade
    },
    geometry: p.geometry.toJSON()
  }));

  const geojson = {
    type: "FeatureCollection",
    features
  };

  const blob = new Blob([JSON.stringify(geojson, null, 2)], {
    type: "application/geo+json"
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "Top3_Parcels.geojson";
  a.click();
}
