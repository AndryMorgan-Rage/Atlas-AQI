import { useMemo } from "react";
import { aqiColor } from "../aqiScale";

const POLLUTANTS = [
  { key: "pm2_5", label: "PM2.5" },
  { key: "pm10", label: "PM10" },
  { key: "no2", label: "NO₂" },
  { key: "o3", label: "O₃" },
  { key: "so2", label: "SO₂" },
  { key: "co", label: "CO" },
];

const BW = 340;
const BH = 160;
const BM = { top: 18, right: 10, bottom: 32, left: 42 };
const BPW = BW - BM.left - BM.right;
const BPH = BH - BM.top - BM.bottom;

function niceCeil(v) {
  if (v <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = Math.ceil(v / pow);
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

function buildData(rows) {
  const byCity = {};
  for (const r of rows) {
    const city = r.dim_ville?.nom;
    if (!city) continue;
    byCity[city] ??= { sums: {}, counts: {} };
    for (const p of POLLUTANTS) {
      const v = r[p.key];
      if (v == null) continue;
      byCity[city].sums[p.key] = (byCity[city].sums[p.key] ?? 0) + v;
      byCity[city].counts[p.key] = (byCity[city].counts[p.key] ?? 0) + 1;
    }
    if (r.aqi != null) {
      byCity[city].aqiSum = (byCity[city].aqiSum ?? 0) + r.aqi;
      byCity[city].aqiCount = (byCity[city].aqiCount ?? 0) + 1;
    }
  }
  return Object.entries(byCity)
    .map(([name, d]) => ({
      name,
      means: Object.fromEntries(
        POLLUTANTS.map((p) => [
          p.key,
          d.counts[p.key] ? d.sums[p.key] / d.counts[p.key] : null,
        ])
      ),
      aqiMean: d.aqiCount ? d.aqiSum / d.aqiCount : null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default function PollutantBars({ rows }) {
  const cities = useMemo(() => buildData(rows), [rows]);

  if (!cities.length) {
    return <div className="data-table__state">Aucune mesure pour cette date.</div>;
  }

  return (
    <div className="chart">
      <div className="chart__heading">
        <h3 className="chart__title">Polluants moyens par ville</h3>
        <span className="chart__unit">µg/m³</span>
      </div>

      <div className="pollutant-grid">
        {POLLUTANTS.map((pollutant) => {
          const values = cities
            .map((c) => ({ city: c, value: c.means[pollutant.key] }))
            .filter((v) => v.value != null);
          if (!values.length) return null;

          const max = niceCeil(Math.max(...values.map((v) => v.value)));
          const slot = BPW / values.length;
          const barW = Math.min(slot * 0.55, 46);

          return (
            <div key={pollutant.key} className="pollutant-chart">
              <div className="pollutant-chart__label">{pollutant.label}</div>
              <svg viewBox={`0 0 ${BW} ${BH}`} className="chart__svg">
                {[0, 1].map((f) => (
                  <g key={f}>
                    <line
                      x1={BM.left}
                      y1={BM.top + BPH - f * BPH}
                      x2={BW - BM.right}
                      y2={BM.top + BPH - f * BPH}
                      className="chart__gridline"
                    />
                    <text
                      x={BM.left - 8}
                      y={BM.top + BPH - f * BPH + 3}
                      textAnchor="end"
                      className="chart__axis-label"
                    >
                      {f ? max : 0}
                    </text>
                  </g>
                ))}

                {values.map(({ city, value }, i) => {
                  const cx = BM.left + slot * (i + 0.5);
                  const h = (value / max) * BPH;
                  return (
                    <g key={city.name}>
                      <rect
                        x={cx - barW / 2}
                        y={BM.top + BPH - h}
                        width={barW}
                        height={h}
                        rx="2"
                        fill={aqiColor(city.aqiMean)}
                      >
                        <title>{`${city.name} · ${pollutant.label} ${value.toFixed(1)} µg/m³`}</title>
                      </rect>
                      <text
                        x={cx}
                        y={BM.top + BPH - h - 4}
                        textAnchor="middle"
                        className="chart__bar-value"
                      >
                        {value >= 100 ? value.toFixed(0) : value.toFixed(1)}
                      </text>
                      <text
                        x={cx}
                        y={BH - 8}
                        textAnchor="middle"
                        className="chart__axis-label"
                      >
                        {city.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}
