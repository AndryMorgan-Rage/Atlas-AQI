export default function CitySelector({ cities, selectedCity, onSelectCity }) {
  return (
    <div className="city-selector">
      <label htmlFor="city-select" className="field-label">
        Ville
      </label>
      <select
        id="city-select"
        value={selectedCity ?? "ALL"}
        onChange={(e) =>
          onSelectCity(e.target.value === "ALL" ? null : e.target.value)
        }
      >
        <option value="ALL">Toutes les villes</option>
        {cities.map((c) => (
          <option key={c.nom} value={c.nom}>
            {c.nom} ({c.pays})
          </option>
        ))}
      </select>
    </div>
  );
}
