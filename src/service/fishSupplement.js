import supplement from "../data/fishSupplement.json" with { type: "json" };

export function hasFishingDetails(fishId) {
  return Boolean(supplement.fish[fishId]);
}

export function getSupplementCatalogue() {
  return Object.entries(supplement.fish).map(([id, details]) =>
    addFishingDetails({
      id: Number(id),
      ...details,
      name: `Fish #${id}`,
      iconUrl: null,
    }),
  );
}

export function addFishingDetails(fish) {
  const details = supplement.fish[fish.id];
  if (!details) return fish;

  return {
    ...details,
    ...fish,
    zone: fish.zone || details.zone,
    fishingSpot:
      fish.fishingSpot || details.fishingSpot || details.fishingSpots?.[0],
  };
}
