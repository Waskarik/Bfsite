import { useEffect, useMemo, useState } from "react";
import {
  deleteTrackerEntry,
  getTrackerEntries,
  updateTrackerEntry,
} from "../service/trackerService";
import { getXivapiItemsByIds } from "../service/xivapiService";
import useFishCatalogue from "../service/useFishCatalogue";
import SiteHeader from "../components/SiteHeader";
import FishDetailsModal from "../components/FishDetailsModal.jsx";

function TrackerPage() {
  const {
    fish: catalogue,
    loading: fishLoading,
    incomplete,
    retry,
  } = useFishCatalogue();
  const [tracker, setTracker] = useState([]);
  const [selectedFish, setSelectedFish] = useState(null);
  const [notesDraft, setNotesDraft] = useState({});
  const [fishMetadata, setFishMetadata] = useState({});
  const [fishRefreshIncomplete, setFishRefreshIncomplete] = useState(false);

  useEffect(() => {
    getTrackerEntries()
      .then((data) => {
        setTracker(data.filter((entry) => entry.fishId != null));
      })
      .catch((error) => {
        console.error("Failed to load tracker:", error);
      });
  }, []);

  const trackedFishIds = useMemo(
    () => [...new Set(tracker.map((entry) => entry.fishId))],
    [tracker],
  );

  useEffect(() => {
    if (trackedFishIds.length === 0) {
      return;
    }

    let active = true;

    getXivapiItemsByIds(trackedFishIds)
      .then((items) => {
        if (!active) return;
        setFishRefreshIncomplete(trackedFishIds.some((id) => !items[id]));
        setFishMetadata((currentMetadata) => ({
          ...currentMetadata,
          ...items,
        }));
      })
      .catch((error) => {
        console.warn("XIVAPI fish details unavailable:", error);
        if (active) setFishRefreshIncomplete(true);
      });

    return () => {
      active = false;
    };
  }, [trackedFishIds]);

  function handleUpdate(id, changes) {
    updateTrackerEntry(id, changes)
      .then((updatedEntry) => {
        setTracker((currentTracker) =>
          currentTracker.map((entry) =>
            entry.id === id ? updatedEntry : entry,
          ),
        );
      })
      .catch((error) => {
        console.error("Failed to update tracker entry:", error);
      });
  }

  function handleNotesChange(id, notes) {
    setNotesDraft((currentDraft) => ({
      ...currentDraft,
      [id]: notes,
    }));
  }

  function handleDelete(id) {
    deleteTrackerEntry(id)
      .then(() => {
        setTracker((currentTracker) =>
          currentTracker.filter((entry) => entry.id !== id),
        );
      })
      .catch((error) => {
        console.error("Failed to delete tracker entry:", error);
      });
  }

  const missingDetails =
    fishRefreshIncomplete &&
    trackedFishIds.some(
      (id) =>
        !fishMetadata[id] && !catalogue.some((fish) => fish.id === Number(id)),
    );

  return (
    <>
      <SiteHeader />

      <main className="container py-4">
        <h1 className="h2 mb-4">My Tracker</h1>

        {selectedFish && (
          <FishDetailsModal
            key={selectedFish.id}
            fish={selectedFish}
            setSelectedFish={setSelectedFish}
            isTracked={true}
          />
        )}

        {trackedFishIds.length > 0 && (missingDetails || incomplete) && (
          <p className="small text-secondary" role="status">
            Some fish data could not be refreshed. Local data is being used.
            <button
              type="button"
              className="btn btn-link btn-sm"
              onClick={retry}
              disabled={fishLoading}
            >
              Retry
            </button>
          </p>
        )}

        {tracker.length === 0 && (
          <p className="text-secondary">No fish tracked yet.</p>
        )}

        <div className="row g-3">
          {tracker.map((entry) => {
            const catalogueFish = catalogue.find(
              (oneFish) => oneFish.id === Number(entry.fishId),
            );

            const externalFish = fishMetadata[entry.fishId];
            const fish = {
              ...catalogueFish,
              id: entry.fishId,
              name:
                externalFish?.name ||
                catalogueFish?.name ||
                `Fish #${entry.fishId}`,
              iconUrl: externalFish?.iconUrl || catalogueFish?.iconUrl,
            };
            const primarySpot = fish.fishingSpot || fish.fishingSpots?.[0];

            return (
              <div className="col-12 col-lg-6" key={entry.id}>
                <div className="card h-100 text-start bg-dark text-light">
                  <div className="card-body">
                    <div className="d-flex align-items-start justify-content-between gap-3">
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        {fish.iconUrl && (
                          <img
                            className="fishIcon mb-2"
                            src={fish.iconUrl}
                            alt={fish.name}
                            loading="lazy"
                          />
                        )}
                        <h3 className="h5 card-title text-break">{fish.name}</h3>
                      </div>
                      <button
                        className="btn btn-outline-info rounded-2 flex-shrink-0 d-inline-flex align-items-center justify-content-center p-0 fw-semibold shadow-sm"
                        style={{ width: 36, height: 36 }}
                        type="button"
                        aria-label={"View details for " + fish.name}
                        title="View fish details"
                        onClick={() => setSelectedFish(fish)}
                      >
                        i
                      </button>
                    </div>
                    <p className="card-text small">
                      Zone: {fish.zone || "Unavailable"}
                    </p>
                    <p className="card-text small">
                      Spot: {primarySpot || "No spot data"}
                    </p>
                    <p className="card-text small">
                      Caught: {entry.caught ? "Yes" : "No"}
                    </p>
                    <p className="card-text small">
                      Favorite: {entry.favorite ? "Yes" : "No"}
                    </p>

                    <div className="d-flex flex-wrap gap-2 my-3">
                      <button
                        className="btn btn-sm btn-outline-success"
                        type="button"
                        onClick={() =>
                          handleUpdate(entry.id, { caught: !entry.caught })
                        }
                      >
                        {entry.caught ? "Mark as Missing" : "Mark as Caught"}
                      </button>

                      <button
                        className="btn btn-sm btn-outline-warning"
                        type="button"
                        onClick={() =>
                          handleUpdate(entry.id, {
                            favorite: !entry.favorite,
                          })
                        }
                      >
                        {entry.favorite ? "Remove Favorite" : "Favorite"}
                      </button>
                    </div>

                    <label className="form-label w-100">
                      Notes:
                      <input
                        className="form-control mt-1"
                        type="text"
                        value={notesDraft[entry.id] ?? entry.notes ?? ""}
                        onChange={(event) =>
                          handleNotesChange(entry.id, event.target.value)
                        }
                      />
                    </label>
                    <p className="card-text small">{entry.notes}</p>

                    <div className="d-flex flex-wrap gap-2 mt-2">
                      <button
                        className="btn btn-sm btn-primary"
                        type="button"
                        onClick={() =>
                          handleUpdate(entry.id, {
                            notes: notesDraft[entry.id] ?? entry.notes ?? "",
                          })
                        }
                      >
                        Save Notes
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                      >
                        Remove from Tracker
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}

export default TrackerPage;
