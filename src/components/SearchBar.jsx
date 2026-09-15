function SearchBar({ query, setQuery }) {
  return (
    <label className="form-label w-100 mb-3">
      {" "}
      Search fish:{" "}
      <input
        className="form-control mt-1"
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name"
      />{" "}
    </label>
  );
}
export default SearchBar;
