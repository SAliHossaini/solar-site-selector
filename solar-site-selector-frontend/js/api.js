/**
 * Format a date to YYYYMMDD
 */
function formatDate(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

/**
 * Fetch GHI for a given date
 */
async function tryFetchGHI(lat, lon, dateStr) {
  const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${lon}&latitude=${lat}&start=${dateStr}&end=${dateStr}&format=JSON`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("NASA fetch failed");

    const data = await res.json();
    const value = data?.properties?.parameter?.ALLSKY_SFC_SW_DWN?.[dateStr];

    return (typeof value === "number" && value > 0 && value !== -999) ? value : null;

  } catch (err) {
    console.error(`⚠️ GHI fetch error for ${dateStr}:`, err);
    return null;
  }
}

/**
 * Fetch daily GHI with fallback (yesterday → fixed date)
 */
export async function fetchGHI(lat, lon) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  const fallbackStr = "20240621"; // Known good date

  let ghi = await tryFetchGHI(lat, lon, yesterdayStr);
  if (ghi === null) {
    console.warn("🔁 Fallback to fixed GHI date:", fallbackStr);
    ghi = await tryFetchGHI(lat, lon, fallbackStr);
  }

  return ghi;
}

/**
 * Format popup HTML with lat/lon + GHI
 */
export function formatGHIPopup(lat, lon, ghi) {
  if (!ghi) return "No GHI data available.";
  return `
    Location: ${lat.toFixed(4)}, ${lon.toFixed(4)}<br/>
    ☀️ Daily GHI: <strong>${ghi} kWh/m²/day</strong>
  `;
}
