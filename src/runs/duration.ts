/** Elapsed wall clock of a run, or `null` while it is still going. */
export const runDuration = (
    startedAt: string | null | undefined,
    finishedAt: string | null | undefined,
): number | null => {
    if (!startedAt || !finishedAt) return null;
    const seconds = (Date.parse(finishedAt) - Date.parse(startedAt)) / 1000;
    return Number.isFinite(seconds) && seconds >= 0 ? seconds : null;
};

export const formatDuration = (seconds: number): string => {
    const total = Math.round(seconds);
    if (total < 60) return `${total}s`;
    const minutes = Math.floor(total / 60);
    if (minutes < 60) return `${minutes}m ${total % 60}s`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};
