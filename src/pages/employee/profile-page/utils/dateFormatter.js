import {
  format,
  parseISO,
  isBefore,
  subDays,
  formatDistanceToNow,
  differenceInYears,
} from "date-fns";

export const formatDate = (timestamp, formatType = "default") => {
  if (!timestamp) return "";

  const isTimeOnly = /^\d{2}:\d{2}(:\d{2})?$/.test(timestamp); // matches single time
  const isTimeRange = /^(\d{2}:\d{2}(:\d{2})?)\s+(\d{2}:\d{2}(:\d{2})?)$/.test(
    timestamp
  );

  const date =
    typeof timestamp === "string" && !isTimeOnly && !isTimeRange
      ? parseISO(timestamp.replace(" ", "T"))
      : timestamp;

  switch (formatType) {
    case "fullMonth":
      return format(date, "MMMM dd, yyyy");

    case "shortMonth":
      return format(date, "MMM dd yyyy");

    case "fullWithTime":
      return format(date, "MMMM dd, yyyy '·' hh:mmaaa");

    case "time12":
      if (isTimeOnly) {
        return format(
          parseISO(`1970-01-01T${timestamp}`),
          "h:mma"
        ).toLowerCase();
      }

      if (isTimeRange) {
        return timestamp
          .split(/\s+/)
          .map((t) =>
            format(parseISO(`1970-01-01T${t}`), "h:mma").toLowerCase()
          )
          .join(" - ");
      }

      return format(date, "h:mma").toLowerCase();

    case "relative":
      const oneWeekAgo = subDays(new Date(), 7);
      if (isBefore(date, oneWeekAgo)) {
        return format(date, "MMM dd yyyy 'at' h:mmaaa").toLowerCase();
      } else {
        const relative = formatDistanceToNow(date, { addSuffix: true });
        return relative
          .replace("about ", "")
          .replace("minute", "min")
          .replace("less than a minute", "just now");
      }

    case "age":
      return `${differenceInYears(new Date(), date)} yrs old`;

    default:
      return format(date, "yyyy-MM-dd HH:mm:ss");
  }
};

export const toYMDLocal = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default formatDate;
