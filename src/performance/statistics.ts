import type { PerformanceGroup } from '../contract';
import { presetLabel } from '../runs/preset';

export const METRIC_KEYS = ['ram', 'swap', 'vram', 'duration'] as const;
export type MetricKey = (typeof METRIC_KEYS)[number];

/** Figures over the per-run peaks of one metric: bytes for memory, seconds for duration. */
// `std` is the sample standard deviation, null below two observations. `n` counts the
// runs that observed this metric and can sit below the group's run count.
export type MetricStats = {
    mean: number | null;
    std: number | null;
    min: number | null;
    max: number | null;
    n: number;
};

/** The memory ceilings a group's bars scale against. Swap has no reported total. */
export type MetricTotals = { ram: number | null; vram: number | null };

/** The largest share of its own memory that any device in a pooled row reached. */
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

/** Several groups' figures for one metric pooled into one. */
// The mean is weighted by sample size. The variance is the within-group spread plus
// the spread between group means. Min and max take the extreme.
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

/** The processing settings a group ran under. Legacy runs carry none. */
export type ProcessingConfig = {
    width: number | null;
    height: number | null;
    fps: number | null;
    batch: number | null;
};

export const processingConfig = (group: PerformanceGroup): ProcessingConfig => ({
    width: group.processing_width ?? null,
    height: group.processing_height ?? null,
    fps: group.fps ?? null,
    batch: group.preprocess_batch_size ?? null,
});

export const configKey = (config: ProcessingConfig): string =>
    `${config.width ?? ''}x${config.height ?? ''}|${config.fps ?? ''}|${config.batch ?? ''}`;

const sizeLabel = (width: number | null, height: number | null): string | null =>
    width != null && height != null ? `${width}×${height}` : null;

/** The processing keys of a preset's settings document. Absent keys read as null. */
export type ProcessingSettings = ProcessingConfig;

const numberOrNull = (value: unknown): number | null =>
    typeof value === 'number' && Number.isFinite(value) ? value : null;

export const processingSettings = (settings: unknown): ProcessingSettings => {
    const doc = (settings ?? {}) as Record<string, unknown>;
    return {
        width: numberOrNull(doc.processing_width),
        height: numberOrNull(doc.processing_height),
        fps: numberOrNull(doc.fps),
        batch: numberOrNull(doc.preprocess_batch_size),
    };
};

const fullConfig = (config: ProcessingConfig): string | null => {
    const parts = [
        sizeLabel(config.width, config.height),
        config.fps == null ? null : `${config.fps}fps`,
        config.batch == null ? null : `batch ${config.batch}`,
    ].filter(Boolean);
    return parts.length ? parts.join(' · ') : null;
};

/** The keys on which a group's config departs from its preset; the whole config with no preset. */
// A preset size of null is derived on the device and never counts as a departure.
export const configNote = (
    config: ProcessingConfig,
    settings: ProcessingSettings | null,
): string | null => {
    if (settings == null) return fullConfig(config);
    const parts: string[] = [];
    const ran = sizeLabel(config.width, config.height);
    const set = sizeLabel(settings.width, settings.height);
    if (ran && set && ran !== set) parts.push(`${ran} (preset ${set})`);
    if (config.fps != null && settings.fps != null && config.fps !== settings.fps) {
        parts.push(`fps ${config.fps} (preset ${settings.fps})`);
    }
    if (config.batch != null && settings.batch != null && config.batch !== settings.batch) {
        parts.push(`batch ${config.batch} (preset ${settings.batch})`);
    }
    return parts.length ? parts.join(' · ') : null;
};

/** One row per preset × models × config, pooled across the devices that ran it. */
export type PresetRollup = {
    key: string;
    preset_name: string | null;
    preset_version: number | null;
    models: string;
    config: ProcessingConfig;
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
        config: processingConfig(members[0]),
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
    `${presetLabel(row)}|${row.models}|${configKey(row.config)}`;

export const rollUpByPreset = (groups: PerformanceGroup[]): PresetRollup[] => {
    const buckets = new Map<string, PerformanceGroup[]>();
    for (const group of groups) {
        // Keyed on config and settings hash as well, matching the device-grain rows.
        const key = `${presetLabel(group)}|${group.preset_hash ?? ''}|${modelsLabel(group)}|${configKey(processingConfig(group))}`;
        buckets.set(key, [...(buckets.get(key) ?? []), group]);
    }
    return Array.from(buckets.entries(), ([key, members]) => rollUp(key, members)).sort(
        (a, b) => sortKey(a).localeCompare(sortKey(b)),
    );
};
