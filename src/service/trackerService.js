const TRACKER_URL = "https://fffishing-server.onrender.com/tracker";

export function addTrackerEntry(entry) {
  return fetch(TRACKER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(entry)
  })
    .then((response) => response.json());
}

export function getTrackerEntries() {
  return fetch(TRACKER_URL)
    .then((response) => response.json());
}

export function updateTrackerEntry(id, changes) {
  return fetch(`${TRACKER_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(changes)
  })
    .then((response) => response.json());
}

export function deleteTrackerEntry(id) {
  return fetch(`${TRACKER_URL}/${id}`, {
    method: "DELETE"
  });
}
