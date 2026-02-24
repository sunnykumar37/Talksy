import { format, isToday, isYesterday, isThisYear } from "date-fns";

export function formatTimestamp(timestamp: number) {
    const date = new Date(timestamp);
    // Always show time inside the bubble (date comes from the header)
    return format(date, "h:mm a");
}

export function formatShortTimestamp(timestamp: number) {
    const date = new Date(timestamp);

    if (isToday(date)) {
        return format(date, "h:mm a");
    }

    if (isYesterday(date)) {
        return "Yesterday";
    }

    return format(date, "MM/dd/yy");
}

export function formatDateHeader(timestamp: number) {
    const date = new Date(timestamp);

    if (isToday(date)) {
        return "Today";
    }

    if (isYesterday(date)) {
        return "Yesterday";
    }

    if (isThisYear(date)) {
        return format(date, "EEEE, MMM d");
    }

    return format(date, "EEEE, MMM d, yyyy");
}
