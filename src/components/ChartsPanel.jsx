import AqiTrendChart from "./AqiTrendChart";
import PollutantBars from "./PollutantBars";

export default function ChartsPanel({ rows }) {
  if (!rows.length) {
    return <div className="data-table__state">Aucune mesure pour cette date.</div>;
  }

  return (
    <div className="charts">
      <AqiTrendChart rows={rows} />
      <PollutantBars rows={rows} />
    </div>
  );
}
