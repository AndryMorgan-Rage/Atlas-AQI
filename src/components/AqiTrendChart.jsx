import { useMemo } from "react";
import { aqiColor } from "../aqiScale";

const CITY_COLORS = ["#5FD0C0", "#93C5FD", "#F472B6", "#FBBF24", "#A78BFA"];

const W = 760;
const H = 300;
const M = { top: 20, right: 20, bottom: 36, left: 44 };
const PW = W - M.left - M.right;
const PH = H - M.top - M.bottom;
const Y_MIN = 0.5;
const Y_MAX = 5.5;

const sx = (hour) => M.left + (hour / 23) * PW;
const sy = (aqi) => M.top + ((Y_MAX - aqi) / (Y_MAX - Y_MIN)) * PH;

function buildSeries(rows) {
  const byCity = {};
  for (const r of rows) {
    const city = r.dim_ville?.nom;
    const hour = r.dim_temps?.heure;
    if (city == null || hour == null) continue;
    byCity[city] ??= {};
    byCity[city][hour] ??= { sum: 0, count: 0 };
    byCity[city][hour].sum += r.aqi;
    byCity[city][hour].count += 1;
  }
  return Object.entries(byCity)
    .map(([city, hours]) => ({
      city,
      points: Object.entries(hours)
        .map(([hour, v]) => ({ hour: Number(hour), aqi: v.sum / v.count }))
        .sort((a, b) => a.hour - b.hour),
    }))
    .sort((a, b) => a.city.localeCompare(b.city));
}

export default function AqiTrendChart({ rows }) {
  const series = useMemo(() => buildSeries(rows), [rows]);

  if (!series.length) {
    return <div className="data-table__state">Aucune mesure pour cette date.</div>;
  }

  const linePath = (points) =>
    points
      .map(
        (p, i) =>
          `${i ? "L" : "M"}${sx(p.hour).toFixed(1)},${sy(p.aqi).toFixed(1)}`
      )
      .join("");

  return (
    <div className="chart">
      <div className="chart__heading">
        <h3 className="chart__title">Évolution de l'AQI au fil des heures</h3>
        <span className="chart__unit">Indice AQI · 1 Bon → 5 Très mauvais</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="chart__svg">
        {[1, 2, 3, 4, 5].map((level) => (
          <rect
            key={level}
            x={M.left}
            y={sy(level - 0.5)}
            width={PW}
            height={sy(level - 0.5) - sy(level + 0.5)}
            fill={aqiColor(level)}
            opacity="0.09"
          />
        ))}

        {[1, 2, 3, 4, 5].map((level) => (
          <g key={level}>
            <line
              x1={M.left}
              y1={sy(level)}
              x2={W - M.right}
              y2={sy(level)}
              className="chart__gridline"
            />
            <text
              x={M.left - 8}
              y={sy(level) + 3}
              textAnchor="end"
              className="chart__axis-label"
            >
              {level}
            </text>
          </g>
        ))}

        {series.map((s, i) => (
          <path
            key={s.city}
            d={linePath(s.points)}
            fill="none"
            stroke={CITY_COLORS[i % CITY_COLORS.length]}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {series.map((s, i) =>
          s.points.map((p) => (
            <circle
              key={`${s.city}-${p.hour}`}
              cx={sx(p.hour)}
              cy={sy(p.aqi)}
              r="3.2"
              fill={CITY_COLORS[i % CITY_COLORS.length]}
            >
              <title>{`${s.city} · ${String(p.hour).padStart(2, "0")}:00 · AQI ${p.aqi.toFixed(1)}`}</title>
            </circle>
          ))
        )}

        {Array.from({ length: 24 }).map((_, h) =>
          h % 3 === 0 ? (
            <text
              key={h}
              x={sx(h)}
              y={H - 10}
              textAnchor="middle"
              className="chart__axis-label"
            >
              {String(h).padStart(2, "0")}h
            </text>
          ) : null
        )}
      </svg>

      <div className="chart__legend">
        {series.map((s, i) => (
          <span key={s.city} className="chart__legend-item">
            <span
              className="chart__legend-line"
              style={{ background: CITY_COLORS[i % CITY_COLORS.length] }}
            />
            {s.city}
          </span>
        ))}
      </div>
    </div>
  );
}
