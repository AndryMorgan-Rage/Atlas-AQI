import { aqiColor, aqiLabel, projectToPercent } from "../aqiScale";
import { WORLD_PATH } from "./worldMapPath";

// citiesData: [{ nom, pays, latitude, longitude, aqiMoyen }]
export default function WorldMap({ citiesData, selectedCity, onSelectCity }) {
  return (
    <div className="world-map">
      <div className="world-map__frame">
        <svg
          viewBox="0 0 100 55"
          className="world-map__svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={WORLD_PATH} className="world-map__land" />
        </svg>

        {citiesData.map((city) => {
          const { x, y } = projectToPercent(city.latitude, city.longitude);
          const color = aqiColor(city.aqiMoyen);
          const hasData = city.aqiMoyen != null;
          const level = hasData ? aqiLabel(city.aqiMoyen) : "Pas de donnée";
          const isSelected = selectedCity === city.nom;
          return (
            <button
              key={city.nom}
              className={`world-map__spot ${isSelected ? "world-map__spot--active" : ""}`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                "--spot-color": color,
              }}
              onClick={() => onSelectCity(isSelected ? null : city.nom)}
              title={`${city.nom} — AQI ${city.aqiMoyen?.toFixed(1) ?? "?"} (${level})`}
            >
              <span className="world-map__pulse" />
              <span className="world-map__dot" />
              <span className="world-map__tag">
                <span className="world-map__city">{city.nom}</span>
                <span className="world-map__level" style={{ color }}>
                  {level}
                </span>
              </span>
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
