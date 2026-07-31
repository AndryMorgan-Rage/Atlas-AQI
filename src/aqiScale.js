// Echelle AQI OpenWeatherMap : 1 (Bon) a 5 (Tres mauvais)
export const AQI_SCALE = {
  1: { label: "Bon", color: "#4ADE80" },
  2: { label: "Correct", color: "#A3E635" },
  3: { label: "Modéré", color: "#FACC15" },
  4: { label: "Mauvais", color: "#FB7185" },
  5: { label: "Très mauvais", color: "#C084FC" },
};

export function aqiColor(aqi) {
  const rounded = Math.round(aqi);
  return AQI_SCALE[rounded]?.color ?? "#8B93A7";
}

export function aqiLabel(aqi) {
  const rounded = Math.round(aqi);
  return AQI_SCALE[rounded]?.label ?? "Inconnu";
}

// Projection equirectangulaire simple : lat/lon -> position en % dans un cadre
export function projectToPercent(lat, lon) {
  const x = ((lon + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return { x, y };
}
