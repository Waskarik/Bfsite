import { useEffect, useMemo, useState } from "react";
import useFishCatalogue from "../service/useFishCatalogue";
import FishList from "../components/FishList";
import FishDetailsModal from "../components/FishDetailsModal.jsx";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import EorzeaClock from "../components/EorzeaClock";
import SiteHeader from "../components/SiteHeader";
import { getTrackerEntries } from "../service/trackerService";
import { getEorzeaTime, isFishAvailableTime } from "../util/eorzeaTime";
import useAuth from "../context/useAuth";

function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id || user?._id;
  const [selectedFish, setSelectedFish] = useState(null);
  const [trackerEntries, setTrackerEntries] = useState([]);
  const [trackerUserId, setTrackerUserId] = useState(null);
  const [trackerError, setTrackerError] = useState(null);
  const [trackerAttempt, setTrackerAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [currentTime, setCurrentTime] = useState(getEorzeaTime);
  const currentHour = Number(currentTime.split(":")[0]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(getEorzeaTime()), 1000);
    return () => clearInterval(interval);
  }, []);
  const {
    fish: fishCatalogue,
    loading,
    incomplete,
    retry,
  } = useFishCatalogue();

  useEffect(() => {
    if (!userId) return;
    let active = true;
    getTrackerEntries()
      .then((data) => {
        if (!active) return;
        setTrackerEntries(data.filter((entry) => entry.fishId != null));
        setTrackerUserId(userId);
        setTrackerError(null);
      })
      .catch((error) => {
        if (active)
          setTrackerError({
            userId,
            message: error.message || "Could not load your tracker.",
          });
      });
    return () => {
      active = false;
    };
  }, [userId, trackerAttempt]);

  const trackedIds = useMemo(
    () =>
      new Set(
        userId && trackerUserId === userId
          ? trackerEntries.map((entry) => Number(entry.fishId))
          : [],
      ),
    [trackerEntries, trackerUserId, userId],
  );

  const caughtIds = useMemo(
    () =>
      new Set(
        (userId && trackerUserId === userId ? trackerEntries : [])
          .filter((entry) => entry.caught)
          .map((entry) => Number(entry.fishId)),
      ),
    [trackerEntries, trackerUserId, userId],
  );

  const visibleFish = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return fishCatalogue
      .filter((fish) => {
        const fishId = Number(fish.id);
        const fishName = String(fish.name || "").toLowerCase();
        const matchesSearch = fishName.includes(normalizedQuery);

        if (!matchesSearch) {
          return false;
        }

        if (filter === "Available") {
          const startHour = Number(fish.startHour);
          const endHour = Number(fish.endHour);

          if (
            fish.timeKnown === false ||
            !Number.isFinite(startHour) ||
            !Number.isFinite(endHour)
          ) {
            return false;
          }

          return isFishAvailableTime(startHour, endHour, currentHour);
        }
        if (filter === "Tracked") {
          return trackedIds.has(fishId);
        }
        if (filter === "Caught") {
          return caughtIds.has(fishId);
        }
        if (filter === "Missing") {
          return !caughtIds.has(fishId);
        }

        return true;
      })
      .sort((a, b) => {
        const aStart = Number(a.startHour);
        const aEnd = Number(a.endHour);
        const bStart = Number(b.startHour);
        const bEnd = Number(b.endHour);
        const aHasWindow =
          a.timeKnown !== false &&
          Number.isFinite(aStart) &&
          Number.isFinite(aEnd);
        const bHasWindow =
          b.timeKnown !== false &&
          Number.isFinite(bStart) &&
          Number.isFinite(bEnd);
        const aAvailable =
          aHasWindow && isFishAvailableTime(aStart, aEnd, currentHour);
        const bAvailable =
          bHasWindow && isFishAvailableTime(bStart, bEnd, currentHour);
        const aAllDay = aHasWindow && aStart === 0 && aEnd === 24;
        const bAllDay = bHasWindow && bStart === 0 && bEnd === 24;

        if (a.isBigFish && !b.isBigFish) return -1;
        if (!a.isBigFish && b.isBigFish) return 1;
        if (aAvailable && !bAvailable) return -1;
        if (!aAvailable && bAvailable) return 1;
        if (aAllDay && !bAllDay) return 1;
        if (!aAllDay && bAllDay) return -1;
        return String(a.name || "").localeCompare(String(b.name || ""));
      })
      .slice(0, 50);
  }, [fishCatalogue, query, filter, trackedIds, caughtIds, currentHour]);

  function handleTrackerEntryAdded(newEntry) {
    setTrackerUserId(userId);
    setTrackerEntries((currentEntries) => {
      const alreadyExists = currentEntries.some(
        (entry) => Number(entry.fishId) === Number(newEntry.fishId),
      );

      return alreadyExists ? currentEntries : [...currentEntries, newEntry];
    });
  }

  const selectedFishIsTracked = selectedFish
    ? trackedIds.has(Number(selectedFish.id))
    : false;
  const selectedFishDetails = selectedFish
    ? fishCatalogue.find((fish) => Number(fish.id) === Number(selectedFish.id))
    : null;

  return (
    <>
      <SiteHeader />

      <main className="container py-4">
        <EorzeaClock />

        <SearchBar query={query} setQuery={setQuery} />
        <FilterBar filter={filter} setFilter={setFilter} />

        {!authLoading &&
          !userId &&
          ["Tracked", "Caught", "Missing"].includes(filter) && (
            <p className="small text-secondary" role="status">
              Log in to filter your tracked fish.
            </p>
          )}
        {userId && trackerError?.userId === userId && (
          <p className="text-warning" role="alert">
            {trackerError.message}
            <button
              className="btn btn-link btn-sm"
              type="button"
              onClick={() => setTrackerAttempt((attempt) => attempt + 1)}
            >
              Retry tracker
            </button>
          </p>
        )}

        {incomplete && (
          <p className="small text-secondary" role="status">
            Some fish data could not be refreshed. Local data is being used.
            <button
              type="button"
              className="btn btn-link btn-sm"
              onClick={retry}
              disabled={loading}
            >
              Retry
            </button>
          </p>
        )}

        {selectedFishDetails && (
          <FishDetailsModal
            key={selectedFish.id}
            fish={selectedFishDetails}
            setSelectedFish={setSelectedFish}
            isTracked={selectedFishIsTracked}
            onTrackerEntryAdded={handleTrackerEntryAdded}
          />
        )}

        {loading && <p role="status">Loading fish...</p>}
        <FishList
          fish={visibleFish}
          setSelectedFish={setSelectedFish}
          currentHour={currentHour}
        />
      </main>
    </>
  );
}

export default HomePage;
