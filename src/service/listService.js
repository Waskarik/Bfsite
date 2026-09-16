import { apiRequest } from "./api";

export function getFishingLists() {
  return apiRequest("/lists");
}

export function createFishingList(list) {
  return apiRequest("/lists", {
    method: "POST",
    body: JSON.stringify(list),
  });
}

export function updateFishingList(id, changes) {
  return apiRequest(`/lists/${id}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

export function deleteFishingList(id) {
  return apiRequest(`/lists/${id}`, {
    method: "DELETE",
  });
}

export function addFishToFishingList(id, fishId) {
  return apiRequest(`/lists/${id}/fish/${fishId}`, {
    method: "POST",
  });
}

export function removeFishFromFishingList(id, fishId) {
  return apiRequest(`/lists/${id}/fish/${fishId}`, {
    method: "DELETE",
  });
}
