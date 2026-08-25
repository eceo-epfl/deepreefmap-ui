import type { PerformanceGroup } from '../contract';
import { presetLabel } from '../runs/preset';

export const METRIC_KEYS = ['ram', 'swap', 'vram', 'duration'] as const;
export type MetricKey = (typeof METRIC_KEYS)[number];

/**
 * One metric across the runs in a group. Every run contributes its own peak, the
 * largest value across that run's stages, and these are the figures over those
 * per-run peaks: bytes for memory, seconds for duration.
 *
 * `std` is the sample standard deviation, null below two observations. `n` counts
 * the runs that observed this metric, so it sits below the group's run count when
 * a machine reports no VRAM or a run reported nothing usable.
 */
export type MetricStats = {
    mean: number | null;
    std: number | null;
    min: number | null;
    max: number | null;
    n: number;
};

/** The memory ceilings a group's bars scale against. Swap has no reported total. */
export type MetricTotals = { ram: number | null; vram: number | null };

/**
 * The largest share of its own memory that any device in a pooled row reached.
 *
 * A row spanning several machines has no single ceiling, and one machine's peak
 * against another's total says nothing: a 40 GB peak on a 64 GB laptop is not 250%
 * of the 16 GB laptop beside it. Each machine's own peak over its own total is a
 * real figure, and the largest of those is the one that came closest to filling a
 * device, so that is what a pooled row warns against.
 */
export type MetricUtilisation = { ram: number | null; vram: number | null };

const NOTHING_OBSERVED: MetricStats = { mean: null, std: null, min: null, max: null, n: 0 };

export const metricStats = (group: PerformanceGroup): Record<MetricKey, MetricStats> => ({
    ram: {
        mean: group.ram_mean_bytes ?? null,
        std: group.ram_std_bytes ?? null,
        min: group.ram_min_bytes ?? null,
        max: group.ram_max_bytes ?? null,
        n: group.ram_n,
    },
    swap: {
        mean: group.swap_mean_bytes ?? null,
        std: group.swap_std_bytes ?? null,
        min: group.swap_min_bytes ?? null,
        max: group.swap_max_bytes ?? null,
        n: group.swap_n,
    },
    vram: {
        mean: group.vram_mean_bytes ?? null,
        std: group.vram_std_bytes ?? null,
        min: group.vram_min_bytes ?? null,
        max: group.vram_max_bytes ?? null,
        n: group.vram_n,
    },
    duration: {
        mean: group.duration_mean_s ?? null,
        std: group.duration_std_s ?? null,
        min: group.duration_min_s ?? null,
        max: group.duration_max_s ?? null,
        n: group.duration_n,
    },
});

/** The device's current hardware, not what it carried when the runs happened. */
export const groupTotals = (group: PerformanceGroup): MetricTotals => ({
    ram: group.total_ram_bytes ?? null,
    vram: group.total_vram_bytes ?? null,
});

const minOf = (values: (number | null)[]): number | null =>
    values.reduce<number | null>(
        (low, value) => (value == null ? low : Math.min(low ?? value, value)),
        null,
    );

const maxOf = (values: (number | null)[]): number | null =>
    values.reduce<number | null>(
        (high, value) => (value == null ? high : Math.max(high ?? value, value)),
        null,
    );

/**
 * Several groups' figures for one metric as a single figure.
 *
 * The mean weights each group by its own sample size, so a device with forty runs
 * does not count the same as one with two. The variance adds the spread *between*
 * the group means to the spread within them: two laptops each perfectly steady but
 * sitting 10 GB apart are not a fleet with zero deviation, and averaging their
 * deviations would claim exactly that.
 *
 * Min and max are the true observed extremes, so they pool by taking the extreme.
 */
export const poolStats = (parts: MetricStats[]): MetricStats => {
    const observed = parts.flatMap(part =>
        part.n > 0 && part.mean != null ? [{ ...part, mean: part.mean }] : [],
    );
    const n = observed.reduce((total, part) => total + part.n, 0);
    if (!n) return NOTHING_OBSERVED;
    const mean = observed.reduce((sum, part) => sum + part.n * part.mean, 0) / n;
    const sumOfSquares = observed.reduce((sum, part) => {
        const within = part.std == null ? 0 : (part.n - 1) * part.std ** 2;
        const between = part.n * (part.mean - mean) ** 2;
        return sum + within + between;
    }, 0);
    return {
        mean,
        std: n < 2 ? null : Math.sqrt(sumOfSquares / (n - 1)),
        min: minOf(observed.map(part => part.min)),
        max: maxOf(observed.map(part => part.max)),
        n,
    };
};

export const modelsLabel = (group: PerformanceGroup): string =>
    `${group.segmentation_model ?? 'no segmentation'} · ${group.mapping_backend ?? 'no mapping'}`;

/** Legacy runs carry no config, so a group of only those reads as one dash. */
export const configLabel = (group: PerformanceGroup): string => {
    const resolution =
        group.processing_width != null && group.processing_height != null
            ? `${group.processing_width}×${group.processing_height}`
            : '—';
    const fps = group.fps != null ? `${group.fps}fps` : '—';
    const batch =
        group.preprocess_batch_size != null ? `batch ${group.preprocess_batch_size}` : '—';
    if (resolution === '—' && fps === '—' && batch === '—') return '—';
    return `${resolution} · ${fps} · ${batch}`;
};

/** One row per preset × models × config, pooled across the devices that ran it. */
export type PresetRollup = {
    key: string;
    preset_name: string | null;
    preset_version: number | null;
    models: string;
    config: string;
    device_count: number;
    run_count: number;
    failed_count: number;
    stats: Record<MetricKey, MetricStats>;
    utilisation: MetricUtilisation;
    last_run_at: string | null;
};

const latestRun = (members: PerformanceGroup[]): string | null =>
    members.reduce<string | null>(
        (latest, member) =>
            member.last_run_at && (!latest || member.last_run_at > latest)
                ? member.last_run_at
                : latest,
        null,
    );

const peakUtilisation = (
    members: PerformanceGroup[],
    peak: (member: PerformanceGroup) => number | null | undefined,
    ceiling: (member: PerformanceGroup) => number | null | undefined,
): number | null =>
    maxOf(
        members.map(member => {
            const total = ceiling(member);
            const highest = peak(member);
            return total != null && total > 0 && highest != null ? highest / total : null;
        }),
    );

const rollUp = (key: string, members: PerformanceGroup[]): PresetRollup => {
    const perMember = members.map(metricStats);
    return {
        key,
        preset_name: members[0].preset_name ?? null,
        preset_version: members[0].preset_version ?? null,
        models: modelsLabel(members[0]),
        config: configLabel(members[0]),
        // By device rather than by row: two rows whose labels collide are one laptop,
        // and the runs that carry no device at all count as one between them.
        device_count: new Set(members.map(member => member.device_id ?? '')).size,
        run_count: members.reduce((total, member) => total + member.run_count, 0),
        failed_count: members.reduce((total, member) => total + member.failed_count, 0),
        stats: {
            ram: poolStats(perMember.map(entry => entry.ram)),
            swap: poolStats(perMember.map(entry => entry.swap)),
            vram: poolStats(perMember.map(entry => entry.vram)),
            duration: poolStats(perMember.map(entry => entry.duration)),
        },
        utilisation: {
            ram: peakUtilisation(
                members,
                member => member.ram_max_bytes,
                member => member.total_ram_bytes,
            ),
            vram: peakUtilisation(
                members,
                member => member.vram_max_bytes,
                member => member.total_vram_bytes,
            ),
        },
        last_run_at: latestRun(members),
    };
};

// The hash is in the bucket key but not here, so two settings published under one
// name and version still sort beside each other rather than by their hashes.
const sortKey = (row: PresetRollup): string =>
    `${presetLabel(row)}|${row.models}|${row.config}`;

export const rollUpByPreset = (groups: PerformanceGroup[]): PresetRollup[] => {
    const buckets = new Map<string, PerformanceGroup[]>();
    for (const group of groups) {
        // Config is part of the key, so runs at 4K never blend into quarter-size ones,
        // and so is the settings hash, because the console only warns against editing
        // settings without a version bump. Both device-grain views key on it too.
        const key = `${presetLabel(group)}|${group.preset_hash ?? ''}|${modelsLabel(group)}|${configLabel(group)}`;
        buckets.set(key, [...(buckets.get(key) ?? []), group]);
    }
    return Array.from(buckets.entries(), ([key, members]) => rollUp(key, members)).sort(
        (a, b) => sortKey(a).localeCompare(sortKey(b)),
    );
};
