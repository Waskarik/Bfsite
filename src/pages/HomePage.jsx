import { useEffect, useMemo, useState } from "react";
import fishData from "../data/fish.json";
import FishList from "../components/FishList";
import FishDetailsModal from "../components/FishDetailsModal.jsx";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import EorzeaClock from "../components/EorzeaClock";
import SiteHeader from "../components/SiteHeader";
import { getTrackerEntries } from "../service/trackerService";
import { isFishAvailableTime, getEorzeaTime } from "../util/eorzeaTime";

function HomePage() {
  const [selectedFish, setSelectedFish] = useState(null);
  const [trackerEntries, setTrackerEntries] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentTime, setCurrentTime] = useState(getEorzeaTime());
  const currentHour = Number(currentTime.split(":")[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getEorzeaTime());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    getTrackerEntries()
      .then((data) => {
        setTrackerEntries(data.filter((entry) => entry.fishId != null));
      })
      .catch((error) => {
        console.error("Failed to load tracker:", error);
      });
  }, []);

  const trackedIds = useMemo(
    () => new Set(trackerEntries.map((entry) => entry.fishId)),
    [trackerEntries],
  );

  const caughtIds = useMemo(
    () =>
      new Set(
        trackerEntries
          .filter((entry) => entry.caught)
          .map((entry) => entry.fishId),
      ),
    [trackerEntries],
  );

  const visibleFish = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return fishData.fish
      .filter((fish) => {
        const matchesSearch = fish.name.toLowerCase().includes(normalizedQuery);

        if (!matchesSearch) {
          return false;
        }
        if (filter === "available") {
          return isFishAvailableTime(
            fish.startHour,
            fish.endHour,
            currentHour,
          );
        }
        if (filter === "Tracked") {
          return trackedIds.has(fish.id);
        }

        if (filter === "Caught") {
          return caughtIds.has(fish.id);
        }

        if (filter === "Missing") {
          return !caughtIds.has(fish.id);
        }

        return true;
      })
      .sort((a, b) => {
        const aAvailable = isFishAvailableTime(
          a.startHour,
          a.endHour,
          currentHour,
        );
        const bAvailable = isFishAvailableTime(
          b.startHour,
          b.endHour,
          currentHour,
        );
        const aAllDay = a.startHour === 0 && a.endHour === 24;
        const bAllDay = b.startHour === 0 && b.endHour === 24;

        if (a.isBigFish && !b.isBigFish) return -1;
        if (!a.isBigFish && b.isBigFish) return 1;
        if (aAvailable && !bAvailable) return -1;
        if (!aAvailable && bAvailable) return 1;
        if (aAllDay && !bAllDay) return 1;
        if (!aAllDay && bAllDay) return -1;

        return 0;
      })
      .slice(0, 50);
  }, [query, filter, trackedIds, caughtIds, currentHour]);

  function handleTrackerEntryAdded(newEntry) {
    setTrackerEntries((currentEntries) => {
      const alreadyExists = currentEntries.some(
        (entry) => entry.fishId === newEntry.fishId,
      );

      return alreadyExists ? currentEntries : [...currentEntries, newEntry];
    });
  }

  const selectedFishIsTracked = selectedFish ? trackedIds.has(selectedFish.id) : false;

  return (
    <>
      <SiteHeader />

      <main className="container py-4">
        <EorzeaClock />

        <SearchBar query={query} setQuery={setQuery} />
        <FilterBar filter={filter} setFilter={setFilter} />

        {selectedFish && (
          <FishDetailsModal
            key={selectedFish.id}
            fish={selectedFish}
            setSelectedFish={setSelectedFish}
            isTracked={selectedFishIsTracked}
            onTrackerEntryAdded={handleTrackerEntryAdded}
          />
        )}

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
