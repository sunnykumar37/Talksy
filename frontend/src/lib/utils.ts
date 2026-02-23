import { format, isToday, isYesterday, isThisYear } from "date-fns";

export function formatTimestamp(timestamp: number) {
    const date = new Date(timestamp);

    if (isToday(date)) {
        return format(date, "h:mm p");
    }

    if (isYesterday(date)) {
        return "Yesterday";
    }

    if (isThisYear(date)) {
        return format(date, "MMM d, h:mm p");
    }

    return format(date, "MMM d, yyyy, h:mm p");
}

export function formatShortTimestamp(timestamp: number) {
    const date = new Date(timestamp);

    if (isToday(date)) {
        return format(date, "h:mm p");
    }

    if (isYesterday(date)) {
        return "Yesterday";
    }

    return format(date, "MM/dd/yy");
}
