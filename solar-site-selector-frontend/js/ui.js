let sidebarVisible = true;

/**
 * Connect sidebar toggle functionality
 */
import { CONFIG } from "./config.js";

export function setupUI() {
  const toggleBtn = document.getElementById("toggleSidebar");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleSidebar);
  }

  // Move toggle button outside sidebar
  const btnWrapper = document.createElement("div");
  btnWrapper.id = "toggleBtnWrapper";
  btnWrapper.style.position = "absolute";
  btnWrapper.style.top = "12px";
  btnWrapper.style.right = "0";
  btnWrapper.style.zIndex = "15";
  toggleBtn.remove();
  btnWrapper.appendChild(toggleBtn);
  document.body.appendChild(btnWrapper);

}


/**
 * Render checkboxes for toggling layer visibility
 * @param {Array} layers - Array of layer objects with id, title, and visible properties
 */
export function createLayerToggles(layers) {
  const container = document.getElementById("layerToggles");
  if (!container) return;
  container.innerHTML = "";

  layers.forEach(({ id, title, visible }) => {
    const label = document.createElement("label");
    label.className = "layer-toggle";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.layerId = id;
    checkbox.checked = visible;

    checkbox.addEventListener("change", () => {
      const layer = layers.find(l => l.id === id);
      if (layer) layer.visible = checkbox.checked;
    });

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${title || id}`));
    container.appendChild(label);
  });
}

/**
 * Show AOI area (in hectares)
 * @param {number} areaSqMeters
 */
export function updateAOIArea(areaSqMeters, ghi = null) {
  const areaSection = document.getElementById("aoiAreaSection");
  const areaText = document.getElementById("aoiAreaText");
  if (areaSection && areaText) {
    areaSection.style.display = "block";
    areaText.innerHTML = `
      Area: <strong>${(areaSqMeters / 10000).toFixed(2)} hectares</strong><br/>
      ${ghi ? `Avg GHI: <strong>${ghi} kWh/m²/day</strong>` : ''}
    `;
  }
}

/**
 * Show parcel summary (area, GHI, yield)
 */
export function updateParcelSummary({ area, kwh, grade, ghi }) {
  const summary = document.getElementById("parcelSummary");
  if (!summary) return;

  summary.style.display = "block";
  document.getElementById("summaryArea").innerHTML = `Area: <strong>${(area / 10000).toFixed(2)} ha</strong>`;
  document.getElementById("summaryKWh").innerHTML = `Yield: <strong>${Math.round(kwh).toLocaleString()} kWh/year</strong>`;
  document.getElementById("summaryGrade").innerHTML = `Grade: <strong>${grade}</strong>`;

  const summaryGHI = document.getElementById("summaryGHI");
  if (ghi && summaryGHI) {
    summaryGHI.innerHTML = `Avg GHI: <strong>${ghi} </strong> `;
  }
}

/**
 * Toggle sidebar visibility
 */
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  sidebarVisible = !sidebarVisible;
  sidebar.style.right = sidebarVisible ? "0" : "-320px";
  const toggleBtn = document.getElementById("toggleSidebar");
  if (toggleBtn) {
    toggleBtn.innerText = sidebarVisible ? "⏴" : "⏵";
  }
}

/**
 * Show/hide a loading banner
 */
export function showStatus(message = "Loading...", duration = null) {
  const el = document.getElementById("statusMessage");
  if (!el) return;
  el.innerText = message;
  el.style.display = "block";

  if (duration) {
    setTimeout(() => (el.style.display = "none"), duration);
  }
}

export function hideStatus() {
  const el = document.getElementById("statusMessage");
  if (el) el.style.display = "none";
}
