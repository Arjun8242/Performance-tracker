/**
 * Normalizes a date to UTC midnight (00:00:00.000)
 */
export const normalizeDate = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return new Date();
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

/**
 * Get the current week range (Monday to Sunday) in UTC
 */
export const getCurrentWeekRange = () => {
    const now = new Date();
    const day = now.getUTCDay(); // 0 (Sun) to 6 (Sat)
    // Adjust to Monday: If Sunday (0), go back 6 days. Else go back (day-1) days.
    const diff = now.getUTCDate() - (day === 0 ? 6 : day - 1);
    const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff));
    monday.setUTCHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    sunday.setUTCHours(23, 59, 59, 999);

    return { start: monday, end: sunday };
};

/**
 * Get UTC Day Name
 */
export const getDayName = (date) => {
    const d = new Date(date);
    return ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][d.getUTCDay()];
};
