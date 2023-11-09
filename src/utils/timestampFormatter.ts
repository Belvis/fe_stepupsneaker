import dayjs from "dayjs";

export function formatTimestamp(timestamp: number) {
  const formattedDate = dayjs(timestamp).format("DD/MM/YYYY");
  const formattedTime = dayjs(timestamp).format("HH:mm");

  return { dateFormat: formattedDate, timeFormat: formattedTime };
}
