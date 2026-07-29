import { aqiColor, aqiLabel, projectToPercent } from "../aqiScale";

// citiesData: [{ nom, pays, latitude, longitude, aqiMoyen }]
export default function WorldMap({ citiesData, selectedCity, onSelectCity }) {
  return (
    <div className="world-map">
      <div className="world-map__frame">
        <svg
          viewBox="0 0 100 55"
          className="world-map__grid"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={(i + 1) * 10}
              y1="0"
              x2={(i + 1) * 10}
              y2="55"
              className="world-map__gridline"
            />
          ))}
          {Array.from({ length: 4 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1="0"
              y1={(i + 1) * 11}
              x2="100"
              y2={(i + 1) * 11}
              className="world-map__gridline"
            />
          ))}
          <line x1="0" y1="27.5" x2="100" y2="27.5" className="world-map__equator" />
        </svg>

        {citiesData.map((city) => {
          const { x, y } = projectToPercent(city.latitude, city.longitude);
          const color = aqiColor(city.aqiMoyen);
          const isSelected = selectedCity === city.nom;
          return (
            <button
              key={city.nom}
              className={`world-map__spot ${isSelected ? "world-map__spot--active" : ""}`}
              style={{
                left: `${x}%`,
                top: `${(y / 55) * 100}%`,
                "--spot-color": color,
              }}
              onClick={() => onSelectCity(isSelected ? null : city.nom)}
              title={`${city.nom} — AQI ${city.aqiMoyen?.toFixed(1) ?? "?"} (${aqiLabel(
                city.aqiMoyen
              )})`}
            >
              <span className="world-map__pulse" />
              <span className="world-map__dot" />
              <span className="world-map__tag">{city.nom}</span>
            </button>
          );
        })}
      </div>

      <div className="world-map__legend">
        {[1, 2, 3, 4, 5].map((level) => (
          <div key={level} className="world-map__legend-item">
            <span
              className="world-map__legend-dot"
              style={{ background: aqiColor(level) }}
            />
            <span>{aqiLabel(level)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
