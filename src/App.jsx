import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import WorldMap from "./components/WorldMap";
import CitySelector from "./components/CitySelector";
import DateSelector from "./components/DateSelector";
import DataTable from "./components/DataTable";
import ChartsPanel from "./components/ChartsPanel";
import { aqiLabel, aqiColor } from "./aqiScale";
import "./App.css";

function todayISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

export default function App() {
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [selectedCity, setSelectedCity] = useState(null);
  const [rows, setRows] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charge la liste des villes une seule fois
  useEffect(() => {
    async function loadCities() {
      const { data, error } = await supabase
        .from("dim_ville")
        .select("nom, pays, latitude, longitude")
        .order("nom");
      if (error) {
        setError(error.message);
        return;
      }
      setCities(data ?? []);
    }
    loadCities();
  }, []);

  // Charge les mesures pour la date (et ville) selectionnee
  useEffect(() => {
    async function loadRows() {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("fact_aqi")
        .select(
          "fact_id, aqi, co, no, no2, o3, so2, pm2_5, pm10, nh3, dim_ville(nom,pays,latitude,longitude), dim_temps!inner(date,heure,jour_semaine,est_weekend)"
        )
        .eq("dim_temps.date", selectedDate)
        .order("heure", { referencedTable: "dim_temps", ascending: true });

      if (selectedCity) {
        query = query.eq("dim_ville.nom", selectedCity);
      }

      const { data, error } = await query;

      if (error) {
        setError(error.message);
        setRows([]);
      } else {
        // Filtre defensif : embedded filter sur dim_ville peut ne pas exclure
        // les lignes cote serveur selon la version de PostgREST
        const filtered = selectedCity
          ? (data ?? []).filter((r) => r.dim_ville?.nom === selectedCity)
          : data ?? [];
        setRows(filtered);
      }
      setLoading(false);
    }
    loadRows();
  }, [selectedDate, selectedCity]);

  // Calcule l'AQI moyen par ville pour le jour selectionne (alimente la carte)
  const citiesWithAqi = useMemo(() => {
    return cities.map((city) => {
      const cityRows = rows.filter((r) => r.dim_ville?.nom === city.nom);
      const aqiMoyen = cityRows.length
        ? cityRows.reduce((sum, r) => sum + r.aqi, 0) / cityRows.length
        : null;
      return { ...city, aqiMoyen };
    });
  }, [cities, rows]);

  const globalAverage = useMemo(() => {
    const withValue = citiesWithAqi.filter((c) => c.aqiMoyen != null);
    if (!withValue.length) return null;
    return (
      withValue.reduce((sum, c) => sum + c.aqiMoyen, 0) / withValue.length
    );
  }, [citiesWithAqi]);

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__title-block">
          <span className="app__eyebrow">Observatoire atmosphérique</span>
          <h1 className="app__title">Atlas AQI</h1>
          <p className="app__subtitle">
            Qualité de l'air en direct sur 5 villes du monde
          </p>
        </div>
        {globalAverage != null && (
          <div
            className="app__global-badge"
            style={{ "--badge-color": aqiColor(globalAverage) }}
          >
            <span className="app__global-value">
              {globalAverage.toFixed(1)}
            </span>
            <span className="app__global-label">
              AQI moyen · {aqiLabel(globalAverage)}
            </span>
          </div>
        )}
      </header>

      <section className="controls">
        <DateSelector selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        <CitySelector
          cities={cities}
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
        />
      </section>

      {error && <div className="app__error">Erreur : {error}</div>}

      <section className="panel">
        <h2 className="panel__title">Carte de la qualité de l'air</h2>
        <WorldMap
          citiesData={citiesWithAqi}
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
        />
      </section>

      <section className="panel">
        <h2 className="panel__title">Graphiques de la qualité de l'air</h2>
        <ChartsPanel rows={rows} />
      </section>

      <section className="panel">
        <h2 className="panel__title">
          Mesures détaillées
          {selectedCity ? ` — ${selectedCity}` : " — toutes les villes"}
        </h2>
        <DataTable rows={rows} loading={loading} />
      </section>

      <footer className="app__footer">
        Données collectées via OpenWeatherMap Air Pollution API · Pipeline
        automatisé, entrepôt PostgreSQL (Supabase) , Andry Morgan
      </footer>
    </div>
  );
}
