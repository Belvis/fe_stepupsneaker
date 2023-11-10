import dayjs from "dayjs";

export function formatTimestamp(timestamp: number) {
  const formattedDateTime = dayjs(timestamp).format("DD/MM/YYYY HH:mm:ss");
  const formattedDate = dayjs(timestamp).format("DD/MM/YYYY");
  const formattedTime = dayjs(timestamp).format("HH:mm");

  return {
    dateFormat: formattedDate,
    timeFormat: formattedTime,
    dateTimeFormat: formattedDateTime,
  };
}
