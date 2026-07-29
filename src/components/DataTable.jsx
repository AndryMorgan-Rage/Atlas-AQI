import { aqiColor, aqiLabel } from "../aqiScale";

export default function DataTable({ rows, loading }) {
  if (loading) {
    return <div className="data-table__state">Chargement des mesures…</div>;
  }

  if (!rows.length) {
    return (
      <div className="data-table__state">
        Aucune mesure pour cette date. Essaie une autre date ou "Toutes les
        villes".
      </div>
    );
  }

  return (
    <div className="data-table__wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Ville</th>
            <th>Pays</th>
            <th>Heure (UTC)</th>
            <th>AQI</th>
            <th>PM2.5</th>
            <th>PM10</th>
            <th>O₃</th>
            <th>NO₂</th>
            <th>SO₂</th>
            <th>CO</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.fact_id}>
              <td className="data-table__city">{r.dim_ville?.nom}</td>
              <td>{r.dim_ville?.pays}</td>
              <td className="mono">
                {String(r.dim_temps?.heure ?? "").padStart(2, "0")}:00
              </td>
              <td>
                <span
                  className="aqi-chip"
                  style={{ "--chip-color": aqiColor(r.aqi) }}
                >
                  {r.aqi} · {aqiLabel(r.aqi)}
                </span>
              </td>
              <td className="mono">{r.pm2_5?.toFixed(2)}</td>
              <td className="mono">{r.pm10?.toFixed(2)}</td>
              <td className="mono">{r.o3?.toFixed(2)}</td>
              <td className="mono">{r.no2?.toFixed(2)}</td>
              <td className="mono">{r.so2?.toFixed(2)}</td>
              <td className="mono">{r.co?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
