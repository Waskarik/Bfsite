import { useEffect, useState } from "react";
import {  deleteTrackerEntry, getTrackerEntries, updateTrackerEntry} from "../service/trackerService";
import fishData from "../data/fish.json";
import SiteHeader from "../components/SiteHeader";

function TrackerPage() {

  const [tracker, setTracker] = useState([]);
  const [notesDraft, setNotesDraft] = useState({});

  useEffect(() => {
    getTrackerEntries()
      .then((data) => {
        setTracker(data.filter((entry) => entry.fishId != null));
      })
      .catch((error) => {
        console.error("Failed to load tracker:", error);
      });
  }, []);

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

  return (
    <>
      <SiteHeader />

      <main className="container py-4">
        <h1 className="h2 mb-4">My Tracker</h1>

        {tracker.length === 0 && (
          <p className="text-secondary">No fish tracked yet.</p>
        )}

        <div className="row g-3">
          {tracker.map((entry) => {
            const fish = fishData.fish.find(
              (oneFish) => oneFish.id === entry.fishId,
            );

            if (!fish) {
              return null;
            }

            const primarySpot = fish.fishingSpot || fish.fishingSpots?.[0];

            return (
              <div className="col-12 col-lg-6" key={entry.id}>
                <div className="card h-100 text-start  bg-dark text-light">
                  <div className="card-body">
                    <h3 className="h5 card-title">{fish.name}</h3>
                    <p className="card-text small">Zone: {fish.zone}</p>
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
                    <p className="card-text small"> {entry.notes} </p>

                    <div className="d-flex flex-wrap gap-2 mt-2">
                      <button
                        className="btn btn-sm btn-primary"
                        type="button"
                        onClick={() => handleUpdate(entry.id, {notes: notesDraft[entry.id] ?? entry.notes ?? "" })}>
                      
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
