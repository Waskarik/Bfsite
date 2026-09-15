const FILTERS = ["All", "Tracked", "Caught", "Missing"];

function FilterBar({ filter, setFilter }) {
  return (
    <div className="d-flex flex-wrap gap-2 mb-4">
      {FILTERS.map((option) => (
        <button
          className="btn btn-sm btn-outline-secondary"
          key={option}
          type="button"
          onClick={() => setFilter(option)}
          disabled={filter === option}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default FilterBar;
