import { isFishAvailableTime } from "../util/eorzeaTime";

function FishCard({ fish, setSelectedFish, currentHour }) {
  const available = isFishAvailableTime(
    fish.startHour,
    fish.endHour,
    currentHour,
  );
  const isAllDay = fish.startHour === 0 && fish.endHour === 24;
  const hasTime =
    Number.isFinite(fish.startHour) && Number.isFinite(fish.endHour);

  return (
    <div
      className="card h-100 text-start fishCard color"
      onClick={() => setSelectedFish(fish)}
      style={{ cursor: "pointer" }}
    >
      <div className="card-body">
        <div className="d-flex align-items-start gap-3">
          <img
            className="fishIcon"
            src={fish.iconUrl}
            alt={fish.name}
            loading="lazy"
          />

          <div className="flex-grow-1">
            <h2
              className={`h5 card-title mb-2 ${fish.isBigFish ? "text-warning" : ""}`}
            >
              {fish.name}
            </h2>
            <p className="card-text small">
              Level: {fish.level ?? "Unavailable"}
            </p>
            <p className="card-text small">
              Zone: {fish.zone || "Unavailable"}
            </p>
            <p className="card-text small">
              Time:{" "}
              {!hasTime
                ? "Unavailable"
                : isAllDay
                  ? "All Day"
                  : `${fish.startHour}:00 - ${fish.endHour}:00`}
            </p>
            {hasTime && (
              <span
                className={`badge mt-2 ${
                  isAllDay
                    ? "text-bg-info"
                    : available
                      ? "text-bg-success"
                      : "text-bg-secondary"
                }`}
              >
                {isAllDay
                  ? "All Day"
                  : available
                    ? "Available"
                    : "Not Available"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FishCard;
