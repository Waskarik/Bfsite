import { useState, useEffect } from "react";
import { addTrackerEntry } from "../service/trackerService";
import { getMarketPrice } from "../service/universalisService.js";

function FishDetailsModal({
  fish,
  setSelectedFish,
  isTracked,
  onTrackerEntryAdded,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [marketPrice, setMarketPrice] = useState(null);
  const [isPriceLoading, setIsPriceLoading] = useState(true);
  const [priceError, setPriceError] = useState("");
  const [trackerError, setTrackerError] = useState("");

  useEffect(() => {
    getMarketPrice(fish.id)
      .then((data) => {
        setMarketPrice(data.minPrice);
      })
      .catch((err) => {
        setPriceError(err.message || "Could not load the market price.");
      })
      .finally(() => {
        setIsPriceLoading(false);
      });
  }, [fish.id]);

  function handleAddToTracker() {
    if (isTracked || isAdding) {
      return;
    }

    const trackerEntry = {
      fishId: fish.id,
      caught: false,
      favorite: false,
      notes: "",
    };

    setIsAdding(true);
    setTrackerError("");

    addTrackerEntry(trackerEntry)
      .then((newEntry) => {
        onTrackerEntryAdded(newEntry);
      })
      .catch((error) => {
        setTrackerError(error.message || "Could not add fish to your tracker.");
      })
      .finally(() => {
        setIsAdding(false);
      });
  }

  const primarySpot = fish.fishingSpot || fish.fishingSpots?.[0];
  const baitText = fish.baitPath?.length
    ? fish.baitPath.join(" → ")
    : fish.baits?.join(", ");

  const isAllDay = fish.startHour === 0 && fish.endHour === 24;
  const hasTime =
    Number.isFinite(fish.startHour) && Number.isFinite(fish.endHour);

  return (
    <div className="modalOverlay" onClick={() => setSelectedFish(null)}>
      <div
        className="fishModal card shadow-lg text-start"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="card-body">
          <button
            className="btn btn-sm btn-outline-secondary float-end"
            aria-label="Close fish details"
            type="button"
            onClick={() => setSelectedFish(null)}
          >
            X
          </button>

          <img className="fishIcon mb-3" src={fish.iconUrl} alt={fish.name} />

          <h2 className="h4 card-title">
            {fish.name}
            {fish.isBigFish && (
              <span className="text-warning"> [ ★ Big Fish ] </span>
            )}
          </h2>
          <p>Level: {fish.level ?? "Unavailable"}</p>
          <p>Zone: {fish.zone || "Unavailable"}</p>
          <p>Spot: {primarySpot || "No spot data"}</p>
          <p>Bait: {baitText || "No bait data"}</p>
          {fish.fishingSpots?.length > 1 && (
            <p>
              Other spots:{" "}
              {fish.fishingSpots
                .filter((spot) => spot !== primarySpot)
                .join(", ")}
            </p>
          )}
          {fish.weather?.length > 0 && (
            <p>Weather: {fish.weather.join(", ")}</p>
          )}
          {fish.previousWeather?.length > 0 && (
            <p>Previous weather: {fish.previousWeather.join(", ")}</p>
          )}
          {fish.tug && <p>Tug: {fish.tug}</p>}
          {fish.hookset && <p>Hookset: {fish.hookset}</p>}
          {fish.fishingOptions?.length > 0 && (
            <details className="mb-3">
              <summary>Fishing spots and bait</summary>
              <ul className="mt-2">
                {fish.fishingOptions.map((option, index) => (
                  <li key={`${option.spot}-${index}`}>
                    {option.spot}:{" "}
                    {option.baitPath?.join(" → ") ||
                      option.bait ||
                      "Bait unknown"}
                    {Number.isFinite(option.startHour) &&
                      Number.isFinite(option.endHour) &&
                      ` (${option.startHour}:00–${option.endHour}:00 ET)`}
                    {option.weather?.length > 0 &&
                      `; weather: ${option.weather.join(", ")}`}
                    {option.previousWeather?.length > 0 &&
                      `; previous weather: ${option.previousWeather.join(", ")}`}
                  </li>
                ))}
              </ul>
            </details>
          )}
          <p>
            Time:{" "}
            {!hasTime
              ? "Unavailable"
              : isAllDay
                ? "All Day"
                : `${fish.startHour}:00 - ${fish.endHour}:00`}
          </p>
          {isPriceLoading ? (
            <p>Loading price...</p>
          ) : priceError ? (
            <p className="text-warning" role="alert">
              {priceError}
            </p>
          ) : marketPrice > 0 ? (
            <p>Raiden price: {marketPrice} gil</p>
          ) : (
            <p>No market data</p>
          )}

          <button
            className="btn btn-primary mt-3"
            type="button"
            onClick={handleAddToTracker}
            disabled={isTracked || isAdding}
          >
            {isTracked
              ? "Already tracked"
              : isAdding
                ? "Adding..."
                : "Add to Tracker"}
          </button>
          {trackerError && (
            <p className="text-danger" role="alert">
              {trackerError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FishDetailsModal;
