import { Box, Stack, Tooltip, Typography } from '@mui/material';

import type { ConfigurationSummary, Distribution, PerformanceEvidence } from '../contract';
import { formatBytes } from '../videos/VideoFields';

export const METRICS = {
    ram: 'RAM',
    swap: 'Swap',
    vram: 'VRAM',
    seconds_per_frame: 'Time / frame',
};
export type Metric = keyof typeof METRICS;
export const metricKeys = Object.keys(METRICS) as Metric[];
export const fields = (value: unknown): Record<string, unknown> =>
    value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
const capacityKeys = {
    ram: 'total_ram_bytes',
    swap: 'total_swap_bytes',
    vram: 'total_vram_bytes',
    seconds_per_frame: '',
};
export const capacity = (row: PerformanceEvidence, metric: Metric): number =>
    Number(fields(row.hardware)[capacityKeys[metric]]) || 0;
export const metricText = (value: number | null | undefined, metric: Metric): string =>
    value == null
        ? 'No data'
        : metric === 'seconds_per_frame'
          ? `${value.toFixed(2)} s`
          : formatBytes(value);
export const scalesFor = (groups: ConfigurationSummary[]): Record<Metric, number> =>
    Object.fromEntries(
        metricKeys.map(metric => [
            metric,
            Math.max(
                1,
                ...groups.map(group =>
                    Math.max(
                        capacity(group.configuration, metric),
                        group.stats[metric].max ?? 0,
                    ),
                ),
            ),
        ]),
    ) as Record<Metric, number>;
export const singleStats = (value: number | null | undefined): Distribution => ({
    n: value == null ? 0 : 1,
    min: value,
    q1: value,
    median: value,
    q3: value,
    max: value,
});

export const rowStyle = {
    display: 'grid',
    gridTemplateColumns: 'minmax(230px, 2fr) repeat(4, minmax(125px, 1fr))',
    gap: 2,
    alignItems: 'center',
    px: 2,
    py: 1.5,
    minWidth: 850,
};

export function MetricBar({
    stats,
    metric,
    maximum,
    total,
}: {
    stats: Distribution;
    metric: Metric;
    maximum: number;
    total: number;
}) {
    const color = (value: number) =>
        !total
            ? '#469dff'
            : value / total >= 0.9
              ? '#ff7771'
              : value / total >= 0.5
                ? '#e6a52b'
                : '#49b489';
    const x = (value: number | null | undefined) =>
        3 + 194 * Math.min(1, (value ?? 0) / maximum);
    const median = stats.median;
    const description = stats.n
        ? `Median: ${metricText(median, metric)}. Middle 50%: ${metricText(stats.q1, metric)} to ${metricText(stats.q3, metric)}. Highest: ${metricText(stats.max, metric)}. ${stats.n} observations. Scale: 0 to ${metricText(maximum, metric)}.`
        : 'No eligible measurements recorded';
    return (
        <Tooltip title={description}>
            <Box aria-label={`${METRICS[metric]}: ${description}`}>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }} spacing={1}>
                    <Typography
                        variant="body2"
                        sx={{ fontWeight: median == null ? 400 : 600 }}
                    >
                        {metricText(median, metric)}
                    </Typography>
                    {median != null && total > 0 && (
                        <Typography variant="caption" color="text.secondary">
                            {((100 * median) / total).toFixed(0)}%
                        </Typography>
                    )}
                </Stack>
                <svg
                    viewBox="0 0 200 28"
                    width="100%"
                    height="28"
                    role="img"
                    aria-label={`${METRICS[metric]} distribution`}
                >
                    <rect
                        x="3"
                        y="11"
                        width="194"
                        height="6"
                        rx="3"
                        fill="currentColor"
                        opacity="0.15"
                    />
                    {stats.n > 0 && (
                        <>
                            <rect
                                x="3"
                                y="11"
                                width={x(median) - 3}
                                height="6"
                                fill={color(median ?? 0)}
                                opacity="0.4"
                            />
                            <line
                                x1={x(stats.min)}
                                x2={x(stats.max)}
                                y1="14"
                                y2="14"
                                stroke={color(median ?? 0)}
                                strokeWidth="2"
                            />
                            {stats.n > 1 && (
                                <rect
                                    x={x(stats.q1)}
                                    y="10"
                                    width={Math.max(2, x(stats.q3) - x(stats.q1))}
                                    height="8"
                                    fill={color(median ?? 0)}
                                />
                            )}
                            <line
                                x1={x(stats.max)}
                                x2={x(stats.max)}
                                y1="7"
                                y2="21"
                                stroke={color(stats.max ?? 0)}
                                strokeWidth="2"
                            />
                            <line
                                x1={x(median)}
                                x2={x(median)}
                                y1="7"
                                y2="21"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                        </>
                    )}
                </svg>
            </Box>
        </Tooltip>
    );
}
