export default function DateSelector({ selectedDate, onSelectDate }) {
  return (
    <div className="date-selector">
      <label htmlFor="date-select" className="field-label">
        Date
      </label>
      <input
        id="date-select"
        type="date"
        value={selectedDate}
        onChange={(e) => onSelectDate(e.target.value)}
      />
    </div>
  );
}
