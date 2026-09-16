import { useEffect, useMemo, useState } from "react";
import SiteHeader from "../components/SiteHeader";
import useFishCatalogue from "../service/useFishCatalogue";
import {
  addFishToFishingList,
  createFishingList,
  deleteFishingList,
  getFishingLists,
  removeFishFromFishingList,
  updateFishingList,
} from "../service/listService";
import { getXivapiItemsByIds } from "../service/xivapiService";

function getListId(list) {
  return list._id || list.id;
}

function ListsPage() {
  const {
    fish: catalogue,
    loading: fishLoading,
    incomplete,
    retry,
  } = useFishCatalogue();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [drafts, setDrafts] = useState({});
  const [fishSelections, setFishSelections] = useState({});
  const [fishMetadata, setFishMetadata] = useState({});
  const [busyListId, setBusyListId] = useState(null);

  const catalogueById = useMemo(
    () => new Map(catalogue.map((fish) => [fish.id, fish])),
    [catalogue],
  );

  const fishOptions = useMemo(
    () => [...catalogue].sort((a, b) => a.name.localeCompare(b.name)),
    [catalogue],
  );

  useEffect(() => {
    getFishingLists()
      .then((data) => {
        setLists(data);
        setDrafts(
          Object.fromEntries(
            data.map((list) => [
              getListId(list),
              {
                name: list.name,
                description: list.description || "",
              },
            ]),
          ),
        );
      })
      .catch((requestError) => {
        setError(requestError.message || "Could not load your fishing lists.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const listedFishIds = useMemo(
    () => [...new Set(lists.flatMap((list) => list.fishIds || []))],
    [lists],
  );

  useEffect(() => {
    if (listedFishIds.length === 0) {
      return;
    }

    let active = true;

    getXivapiItemsByIds(listedFishIds)
      .then((items) => {
        if (!active) return;
        setFishMetadata(items);
      })
      .catch((error) =>
        console.warn("XIVAPI fish details unavailable:", error),
      );

    return () => {
      active = false;
    };
  }, [listedFishIds]);

  function replaceList(updatedList) {
    const updatedId = getListId(updatedList);

    setLists((currentLists) =>
      currentLists.map((list) =>
        getListId(list) === updatedId ? updatedList : list,
      ),
    );
  }

  async function handleCreate(event) {
    event.preventDefault();
    setError("");

    if (!newName.trim()) {
      setError("Give the list a name first.");
      return;
    }

    setCreating(true);

    try {
      const created = await createFishingList({
        name: newName.trim(),
        description: newDescription.trim(),
        fishIds: [],
      });
      const id = getListId(created);

      setLists((currentLists) => [created, ...currentLists]);
      setDrafts((currentDrafts) => ({
        ...currentDrafts,
        [id]: {
          name: created.name,
          description: created.description || "",
        },
      }));
      setNewName("");
      setNewDescription("");
    } catch (requestError) {
      setError(requestError.message || "Could not create the list.");
    } finally {
      setCreating(false);
    }
  }

  function handleDraftChange(listId, field, value) {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [listId]: {
        ...currentDrafts[listId],
        [field]: value,
      },
    }));
  }

  async function handleSaveList(list) {
    const listId = getListId(list);
    const draft = drafts[listId];

    if (!draft?.name?.trim()) {
      setError("List name cannot be empty.");
      return;
    }

    setError("");
    setBusyListId(listId);

    try {
      const updated = await updateFishingList(listId, {
        name: draft.name.trim(),
        description: draft.description || "",
      });
      replaceList(updated);
    } catch (requestError) {
      setError(requestError.message || "Could not update the list.");
    } finally {
      setBusyListId(null);
    }
  }

  async function handleDeleteList(list) {
    const listId = getListId(list);

    if (!window.confirm(`Delete "${list.name}"?`)) {
      return;
    }

    setError("");
    setBusyListId(listId);

    try {
      await deleteFishingList(listId);
      setLists((currentLists) =>
        currentLists.filter((currentList) => getListId(currentList) !== listId),
      );
      setDrafts((currentDrafts) => {
        const nextDrafts = { ...currentDrafts };
        delete nextDrafts[listId];
        return nextDrafts;
      });
    } catch (requestError) {
      setError(requestError.message || "Could not delete the list.");
    } finally {
      setBusyListId(null);
    }
  }

  async function handleAddFish(list) {
    const listId = getListId(list);
    const fishId = Number(fishSelections[listId]);

    if (!Number.isInteger(fishId) || fishId <= 0) {
      setError("Choose a fish before adding it.");
      return;
    }

    setError("");
    setBusyListId(listId);

    try {
      const updated = await addFishToFishingList(listId, fishId);
      replaceList(updated);
      setFishSelections((currentSelections) => ({
        ...currentSelections,
        [listId]: "",
      }));
    } catch (requestError) {
      setError(requestError.message || "Could not add the fish.");
    } finally {
      setBusyListId(null);
    }
  }

  async function handleRemoveFish(list, fishId) {
    const listId = getListId(list);
    setError("");
    setBusyListId(listId);

    try {
      const updated = await removeFishFromFishingList(listId, fishId);
      replaceList(updated);
    } catch (requestError) {
      setError(requestError.message || "Could not remove the fish.");
    } finally {
      setBusyListId(null);
    }
  }

  function getFishInfo(fishId) {
    const externalFish = fishMetadata[fishId];
    const catalogueFish = catalogueById.get(Number(fishId));

    return {
      id: fishId,
      name: externalFish?.name || catalogueFish?.name || `Fish #${fishId}`,
      iconUrl: externalFish?.iconUrl || catalogueFish?.iconUrl || null,
      source: externalFish || catalogueFish ? "XIVAPI" : "Details unavailable",
    };
  }

  return (
    <>
      <SiteHeader />

      <main className="container py-4">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-4">
          <div>
            <h1 className="h2 mb-1">My Fishing Lists</h1>
            <p className="text-secondary mb-0">
              Create personal lists and fill them with FFXIV fish. XIVAPI
              integration now supports larger lists and cached item metadata.
            </p>
          </div>
        </div>

        {fishLoading && <p role="status">Loading fish catalogue...</p>}
        {incomplete && (
          <p className="small text-secondary" role="status">
            Some fish data could not be loaded.{" "}
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
        {error && <div className="alert alert-danger">{error}</div>}

        <form className="card bg-dark text-light mb-4" onSubmit={handleCreate}>
          <div className="card-body">
            <h2 className="h5">Create a list</h2>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label" htmlFor="new-list-name">
                  Name
                </label>
                <input
                  id="new-list-name"
                  className="form-control"
                  maxLength={60}
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  placeholder="Big Fish Hunt"
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="new-list-description">
                  Description
                </label>
                <input
                  id="new-list-description"
                  className="form-control"
                  maxLength={300}
                  value={newDescription}
                  onChange={(event) => setNewDescription(event.target.value)}
                  placeholder="Fish I want to catch this week"
                />
              </div>
              <div className="col-12 col-md-2 d-flex align-items-end">
                <button
                  className="btn btn-warning w-100"
                  type="submit"
                  disabled={creating}
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </form>

        {loading && (
          <div className="d-flex align-items-center gap-2 text-secondary">
            <div className="spinner-border spinner-border-sm" role="status" />
            <span>Loading your lists...</span>
          </div>
        )}

        {!loading && lists.length === 0 && (
          <p className="text-secondary">No fishing lists yet.</p>
        )}

        <div className="row g-4">
          {lists.map((list) => {
            const listId = getListId(list);
            const fishIds = list.fishIds || [];
            const availableFish = fishOptions.filter(
              (fish) => !fishIds.includes(fish.id),
            );
            const isBusy = busyListId === listId;

            return (
              <div className="col-12" key={listId}>
                <section className="card bg-dark text-light">
                  <div className="card-body">
                    <div className="row g-3 align-items-end">
                      <div className="col-12 col-md-4">
                        <label
                          className="form-label"
                          htmlFor={`name-${listId}`}
                        >
                          List name
                        </label>
                        <input
                          id={`name-${listId}`}
                          className="form-control"
                          maxLength={60}
                          value={drafts[listId]?.name ?? list.name}
                          onChange={(event) =>
                            handleDraftChange(
                              listId,
                              "name",
                              event.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="col-12 col-md-5">
                        <label
                          className="form-label"
                          htmlFor={`description-${listId}`}
                        >
                          Description
                        </label>
                        <input
                          id={`description-${listId}`}
                          className="form-control"
                          maxLength={300}
                          value={
                            drafts[listId]?.description ??
                            list.description ??
                            ""
                          }
                          onChange={(event) =>
                            handleDraftChange(
                              listId,
                              "description",
                              event.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="col-12 col-md-3 d-flex gap-2">
                        <button
                          className="btn btn-primary flex-grow-1"
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleSaveList(list)}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleDeleteList(list)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <hr className="border-secondary" />

                    <div className="row g-2 align-items-end mb-3">
                      <div className="col-12 col-md-9">
                        <label
                          className="form-label"
                          htmlFor={`fish-${listId}`}
                        >
                          Add fish
                        </label>
                        <select
                          id={`fish-${listId}`}
                          className="form-select"
                          value={fishSelections[listId] || ""}
                          onChange={(event) =>
                            setFishSelections((currentSelections) => ({
                              ...currentSelections,
                              [listId]: event.target.value,
                            }))
                          }
                        >
                          <option value="">Choose a fish...</option>
                          {availableFish.map((fish) => (
                            <option key={fish.id} value={fish.id}>
                              {fish.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-12 col-md-3">
                        <button
                          className="btn btn-outline-warning w-100"
                          type="button"
                          disabled={isBusy || availableFish.length === 0}
                          onClick={() => handleAddFish(list)}
                        >
                          Add fish
                        </button>
                      </div>
                    </div>

                    {fishIds.length === 0 ? (
                      <p className="text-secondary mb-0">
                        This list has no fish yet.
                      </p>
                    ) : (
                      <div className="row g-2">
                        {fishIds.map((fishId) => {
                          const fish = getFishInfo(fishId);

                          return (
                            <div
                              className="col-12 col-md-6 col-xl-4"
                              key={fishId}
                            >
                              <div className="border border-secondary rounded p-2 h-100 d-flex align-items-center gap-3">
                                {fish.iconUrl && (
                                  <img
                                    src={fish.iconUrl}
                                    alt=""
                                    width="48"
                                    height="48"
                                    loading="lazy"
                                  />
                                )}
                                <div className="flex-grow-1 overflow-hidden">
                                  <div className="fw-semibold text-truncate">
                                    {fish.name}
                                  </div>
                                  <div className="small text-secondary">
                                    #{fish.id} · {fish.source}
                                  </div>
                                </div>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleRemoveFish(list, fishId)}
                                  aria-label={`Remove ${fish.name} from ${list.name}`}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}

export default ListsPage;
