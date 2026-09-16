import { useEffect, useState } from "react";
import { getXivapiFishCatalogue } from "./xivapiService";
import {
  addFishingDetails,
  getSupplementCatalogue,
  hasFishingDetails,
} from "./fishSupplement";

export default function useFishCatalogue() {
  const [state, setState] = useState({
    fish: [],
    loading: true,
    incomplete: false,
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    getXivapiFishCatalogue()
      .then((result) => {
        if (!active) return;

        const localFish = getSupplementCatalogue();
        const fishById = new Map(localFish.map((fish) => [fish.id, fish]));

        result.fish
          .filter((fish) => hasFishingDetails(fish.id))
          .map(addFishingDetails)
          .forEach((fish) => fishById.set(fish.id, fish));

        setState({
          ...result,
          fish: [...fishById.values()],
          loading: false,
        });
      })
      .catch((error) => {
        console.warn("XIVAPI catalogue unavailable; using local supplement", error);
        if (active) {
          setState({
            fish: getSupplementCatalogue(),
            incomplete: true,
            loading: false,
          });
        }
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  function retry() {
    setState((current) => ({ ...current, loading: true }));
    setAttempt((current) => current + 1);
  }

  return { ...state, retry };
}
