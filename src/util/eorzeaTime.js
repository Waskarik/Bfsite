export function getEorzeaTime() {
  const earthSeconds = Date.now() / 1000;
  const eorzeaSeconds = earthSeconds * (3600 / 175);
  const secondsPerDay = 24 * 60 * 60;
  const currentDaySeconds = eorzeaSeconds % secondsPerDay;

  const hours = Math.floor(currentDaySeconds / 3600);
  const minutes = Math.floor((currentDaySeconds % 3600) / 60);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

  export function isFishAvailableTime (startHour, endHour, currentHour) {
    if(startHour === 0 && endHour === 24) return true 
    if(startHour < endHour) {
    return currentHour >= startHour && currentHour < endHour;}
    return currentHour >= startHour || currentHour < endHour;

  }
  