import { apiRequest } from "./api";

export function addTrackerEntry(entry) {
  return apiRequest("/tracker", {
    method: "POST",
    body: JSON.stringify(entry),
  });
}

export function getTrackerEntries() {
  return apiRequest("/tracker");
}

export function updateTrackerEntry(id, changes) {
  return apiRequest(`/tracker/${id}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

export function deleteTrackerEntry(id) {
  return apiRequest(`/tracker/${id}`, {
    method: "DELETE",
  });
}