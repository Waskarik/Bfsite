const XIVAPI_BASE_URL = "https://v2.xivapi.com/api";
const itemCache = new Map();

function makeIconUrl(icon) {
  const path = icon?.path_hr1 || icon?.path;

  if (!path) {
    return null;
  }

  return `${XIVAPI_BASE_URL}/asset?path=${encodeURIComponent(path)}&format=png`;
}

async function fetchItemChunk(ids) {
  const params = new URLSearchParams({
    rows: ids.join(","),
    fields: "Name,Icon",
    language: "en",
  });

  const response = await fetch(`${XIVAPI_BASE_URL}/sheet/Item?${params}`);

  if (!response.ok) {
    throw new Error(`XIVAPI request failed with status ${response.status}.`);
  }

  const data = await response.json();

  return (data.rows || []).map((row) => ({
    id: row.row_id,
    name: row.fields?.Name || `Fish #${row.row_id}`,
    iconUrl: makeIconUrl(row.fields?.Icon),
  }));
}

export async function getXivapiItemsByIds(itemIds) {
  const ids = [...new Set(itemIds.map(Number))].filter(
    (id) => Number.isInteger(id) && id > 0,
  );

  const missingIds = ids.filter((id) => !itemCache.has(id));

  for (let index = 0; index < missingIds.length; index += 100) {
    const chunk = missingIds.slice(index, index + 100);
    try {
      const items = await fetchItemChunk(chunk);
      items.forEach((item) => itemCache.set(item.id, item));
    } catch (error) {
      console.warn("XIVAPI batch failed", {
        batchIndex: index / 100,
        idCount: chunk.length,
        error,
      });
    }
  }

  const items = Object.fromEntries(
    ids.filter((id) => itemCache.has(id)).map((id) => [id, itemCache.get(id)]),
  );

  if (import.meta.env?.DEV) {
    const received = Object.keys(items).length;
    console.info(
      `XIVAPI: requested ${ids.length}, received ${received}, unavailable ${ids.length - received} (received includes cache)`,
    );
  }

  return items;
}

const catalogueCache = new Map();
let catalogueRequest;
let catalogueComplete = false;

export function getXivapiFishCatalogue() {
  if (catalogueComplete)
    return Promise.resolve({
      fish: [...catalogueCache.values()],
      incomplete: false,
    });
  if (catalogueRequest) return catalogueRequest;
  catalogueRequest = loadFishCatalogue().finally(() => {
    catalogueRequest = null;
  });
  return catalogueRequest;
}

async function loadFishCatalogue() {
  let after;
  try {
    while (true) {
      const params = new URLSearchParams({
        limit: "100",
        fields:
          "Item.Name,Item.Icon,GatheringItemLevel.GatheringItemLevel,FishingSpot.PlaceName.Name,FishingSpot.TerritoryType.PlaceName.Name",
        language: "en",
      });
      if (after !== undefined) params.set("after", String(after));
      const response = await fetch(
        XIVAPI_BASE_URL + "/sheet/FishParameter?" + params,
      );
      if (!response.ok)
        throw new Error("XIVAPI catalogue request failed: " + response.status);
      const data = await response.json();
      if (!Array.isArray(data.rows))
        throw new Error("Invalid XIVAPI catalogue response");
      if (data.rows.length === 0) break;
      for (const row of data.rows) {
        const item = row.fields?.Item;
        if (!item?.row_id || !item.fields?.Name) continue;
        const spot = row.fields.FishingSpot?.fields;
        const fish = {
          id: item.row_id,
          name: item.fields.Name,
          iconUrl: makeIconUrl(item.fields.Icon),
          level: row.fields.GatheringItemLevel?.fields?.GatheringItemLevel,
          fishingSpot: spot?.PlaceName?.fields?.Name,
          zone: spot?.TerritoryType?.fields?.PlaceName?.fields?.Name,
        };
        catalogueCache.set(fish.id, fish);
        itemCache.set(fish.id, fish);
      }
      const next = data.rows.at(-1).row_id;
      if (!Number.isInteger(next) || (after !== undefined && next <= after))
        throw new Error("XIVAPI pagination did not advance");
      after = next;
    }
    catalogueComplete = true;
  } catch (error) {
    console.warn("XIVAPI catalogue unavailable", { after, error });
  }
  return { fish: [...catalogueCache.values()], incomplete: !catalogueComplete };
}
