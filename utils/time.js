const formatTimeString = (date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const parseTimeString = (timeString) => {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return { hours, minutes, seconds };
};

const calculateDuration = (startTime, endTime) => {
  const start = parseTimeString(startTime);
  const end = parseTimeString(endTime);

  const startInSeconds =
    start.hours * 3600 + start.minutes * 60 + start.seconds;
  const endInSeconds = end.hours * 3600 + end.minutes * 60 + end.seconds;

  const durationInSeconds = endInSeconds - startInSeconds;
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = durationInSeconds % 60;

  return { hours, minutes, seconds };
};

module.exports = { formatTimeString, calculateDuration };
