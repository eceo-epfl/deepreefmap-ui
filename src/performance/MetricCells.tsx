import { Box, Stack, TableCell, Tooltip, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Link } from 'react-router-dom';

import type { PerformanceGroup } from '../contract';
import { relativeTime } from '../devices/RelativeDateField';
import { formatDuration } from '../runs/duration';
import { HOT_FRACTION, MeterBar } from '../runs/StageBreakdown';
import { byteScale, formatBytes } from '../videos/VideoFields';
import { METRIC_KEYS } from './statistics';
import type { MetricKey, MetricStats, MetricTotals, MetricUtilisation } from './statistics';

const METRIC_LABELS: Record<MetricKey, string> = {
    ram: 'RAM',
    swap: 'Swap',
    vram: 'VRAM',
    duration: 'Time',
};

// The sampler reads RAM from the run's own process tree and VRAM from the card.
const VRAM_NOTE = "VRAM counts the whole card, RAM only the run's processes";

const BAR_NOTES = [
    'Bar: mean of per-run peaks. Tick: highest run.',
    "Solid bar: share of the device's memory.",
    "Striped bar: share of the column's widest figure.",
];

export const Dash = () => (
    <Typography variant="body2" component="span" sx={{ color: 'text.disabled' }}>
        —
    </Typography>
);

const Muted = ({ children }: { children: string }) => (
    <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
        {children}
    </Typography>
);

export const RunsCell = ({ count, failed }: { count: number; failed: number }) => (
    <TableCell>
        <Typography variant="body2" component="span" sx={{ whiteSpace: 'nowrap' }}>
            {count}
            {failed > 0 && (
                <Typography variant="caption" component="span" color="warning.main">
                    {' '}
                    {failed} failed
                </Typography>
            )}
        </Typography>
    </TableCell>
);

export const LastRunCell = ({ at }: { at: string | null | undefined }) => (
    <TableCell>
        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
            {at ? relativeTime(at) : '—'}
        </Typography>
    </TableCell>
);

/** Preset name, models beneath, config departures beneath those. */
// `label` undefined drops the name line, null draws a dash in its place.
export const PresetCell = ({
    label,
    presetId,
    models,
    note,
}: {
    label?: string | null;
    presetId?: string | null;
    models: string;
    note: string | null;
}) => (
    <TableCell>
        {label !== undefined && (
            <Typography variant="body2">
                {label == null ? (
                    <Dash />
                ) : presetId ? (
                    <Link to={`/presets/${presetId}/show`}>{label}</Link>
                ) : (
                    label
                )}
            </Typography>
        )}
        <Muted>{models}</Muted>
        {note && <Muted>{note}</Muted>}
    </TableCell>
);

/** The device the runs came from, linked while the registry still knows it. */
export const DeviceCell = ({
    id,
    name,
}: {
    id: string | null | undefined;
    name: string | null | undefined;
}) => (
    <TableCell>
        {name ? (
            <Typography variant="body2">
                {id ? <Link to={`/devices/${id}/show`}>{name}</Link> : name}
            </Typography>
        ) : (
            <Dash />
        )}
    </TableCell>
);

const systemLabel = (group: PerformanceGroup): string | null => {
    const parts = [
        group.gpu_name,
        group.total_vram_bytes == null ? null : `${formatBytes(group.total_vram_bytes)} VRAM`,
        group.total_ram_bytes == null ? null : `${formatBytes(group.total_ram_bytes)} RAM`,
    ].filter(Boolean);
    return parts.length ? parts.join(' · ') : null;
};

export const SystemCell = ({ group }: { group: PerformanceGroup }) => (
    <TableCell>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {systemLabel(group) ?? '—'}
        </Typography>
    </TableCell>
);

// Mean and deviation share one divisor and unit.
const scaledBytes = (value: number, divisor: number): string =>
    divisor === 1 ? String(Math.round(value)) : (value / divisor).toFixed(1);

const bytesPair = (mean: number, std: number | null): string => {
    const { divisor, unit } = byteScale(mean);
    const figure = scaledBytes(mean, divisor);
    return std == null
        ? `${figure} ${unit}`
        : `${figure} ± ${scaledBytes(std, divisor)} ${unit}`;
};

const bytesRange = (low: number, high: number): string => {
    const { divisor, unit } = byteScale(high);
    return `${scaledBytes(low, divisor)} to ${scaledBytes(high, divisor)} ${unit}`;
};

// formatDuration rounds to whole seconds; small deviations keep a decimal.
const deviationSeconds = (seconds: number): string =>
    seconds < 10 ? `${seconds.toFixed(1)}s` : formatDuration(seconds);

const headline = (metric: MetricKey, mean: number, std: number | null): string => {
    if (metric !== 'duration') return bytesPair(mean, std);
    return std == null
        ? formatDuration(mean)
        : `${formatDuration(mean)} ± ${deviationSeconds(std)}`;
};

const range = (metric: MetricKey, low: number, high: number): string =>
    metric === 'duration'
        ? `${formatDuration(low)} to ${formatDuration(high)}`
        : bytesRange(low, high);

/** Only memory carries these. Swap and duration report neither figure. */
const memoryFigure = (
    metric: MetricKey,
    figures: MetricTotals | MetricUtilisation | undefined,
): number | null => {
    if (!figures) return null;
    if (metric === 'ram') return figures.ram;
    if (metric === 'vram') return figures.vram;
    return null;
};

// Memory only. One device states its peak against the total it reports now; a
// pooled row states the fullest device's share of its own total.
const ceilingNote = (
    total: number | null,
    max: number | null,
    utilisation: number | null,
): string | null => {
    if (total != null && total > 0 && max != null) {
        return max > total
            ? `highest run above the ${formatBytes(total)} reported now`
            : `highest run ${Math.round((max / total) * 100)}% of ${formatBytes(total)}`;
    }
    if (utilisation == null) return null;
    return utilisation > 1
        ? 'fullest device above the memory it reports now'
        : `fullest device at ${Math.round(utilisation * 100)}% of its memory`;
};

const MetricLabel = ({ metric }: { metric: MetricKey }) => (
    <Typography
        variant="caption"
        sx={{ color: 'text.secondary', width: 36, flex: 'none', whiteSpace: 'nowrap' }}
    >
        {METRIC_LABELS[metric]}
    </Typography>
);

/** One metric as label, bar and `mean ± sd` on one line: bar is the mean, tick the highest run. */
const MetricRow = ({
    metric,
    stats,
    total,
    utilisation,
    columnMax,
}: {
    metric: MetricKey;
    stats: MetricStats;
    total: number | null;
    utilisation: number | null;
    columnMax: number;
}) => {
    const { mean, std, min, max, n } = stats;
    if (!n || mean == null) {
        return (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <MetricLabel metric={metric} />
                <Dash />
            </Stack>
        );
    }
    // Without a ceiling (duration, pooled row, unreported memory) the bar ranks the column.
    const ceiling = total != null && total > 0 ? total : null;
    const scale = ceiling ?? columnMax;
    const share = (value: number) => (scale > 0 ? Math.min(value / scale, 1) : 0);
    const filled = ceiling != null && max != null ? max / ceiling : utilisation;
    const hot = filled != null && filled > HOT_FRACTION;
    const figure = headline(metric, mean, std);
    // A single run, or several that landed on the same figure, has no range to show.
    const observed =
        min != null && max != null && min !== max ? range(metric, min, max) : null;
    const tip = [
        n === 1 ? `${figure} from a single run` : `mean ${figure} across ${n} runs`,
        observed && `range ${observed}`,
        ceilingNote(total, max, utilisation),
        metric === 'vram' && VRAM_NOTE,
    ].filter((line): line is string => Boolean(line));
    return (
        <Tooltip
            title={
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                    {tip.map(line => (
                        <li key={line}>{line}</li>
                    ))}
                </Box>
            }
        >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <MetricLabel metric={metric} />
                <Box sx={{ flex: '1 1 96px', minWidth: 96 }}>
                    <MeterBar fraction={share(mean)} relative={ceiling == null} hot={hot}>
                        {max != null && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: -2,
                                    bottom: -2,
                                    width: 2,
                                    // Clamped so the tick stays inside its own track at
                                    // either end of the scale.
                                    left: `clamp(0px, ${share(max) * 100}%, calc(100% - 2px))`,
                                    bgcolor: hot ? 'warning.main' : 'text.secondary',
                                }}
                            />
                        )}
                    </MeterBar>
                </Box>
                <Typography
                    variant="body2"
                    sx={{ whiteSpace: 'nowrap', flex: 'none' }}
                    color={hot ? 'warning.main' : 'text.primary'}
                >
                    {figure}
                    <Typography
                        variant="caption"
                        component="span"
                        sx={{ color: 'text.secondary' }}
                    >
                        {' '}
                        n={n}
                    </Typography>
                </Typography>
            </Stack>
        </Tooltip>
    );
};

export const PeaksHeader = () => (
    <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <span>Peaks</span>
            <Tooltip
                title={
                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                        {BAR_NOTES.map(note => (
                            <li key={note}>{note}</li>
                        ))}
                    </Box>
                }
            >
                <InfoOutlinedIcon
                    fontSize="inherit"
                    sx={{ color: 'text.secondary', cursor: 'help' }}
                />
            </Tooltip>
        </Stack>
    </TableCell>
);

/** The four metrics of a row stacked in one cell, in `METRIC_KEYS` order. */
export const PeaksCell = ({
    stats,
    maxima,
    totals,
    utilisation,
}: {
    stats: Record<MetricKey, MetricStats>;
    maxima: Record<MetricKey, number>;
    // One device carries its ceilings; a pooled row carries its fullest share. Never both.
    totals?: MetricTotals;
    utilisation?: MetricUtilisation;
}) => (
    <TableCell sx={{ minWidth: 320 }}>
        <Stack spacing={0.5}>
            {METRIC_KEYS.map(metric => (
                <MetricRow
                    key={metric}
                    metric={metric}
                    stats={stats[metric]}
                    total={memoryFigure(metric, totals)}
                    utilisation={memoryFigure(metric, utilisation)}
                    columnMax={maxima[metric]}
                />
            ))}
        </Stack>
    </TableCell>
);

/** The widest figure per metric, for the rows that have no device ceiling. */
export const columnMaxima = (
    rows: { stats: Record<MetricKey, MetricStats> }[],
): Record<MetricKey, number> => {
    const widest = (metric: MetricKey) =>
        rows.reduce((high, row) => Math.max(high, row.stats[metric].max ?? 0), 0);
    return {
        ram: widest('ram'),
        swap: widest('swap'),
        vram: widest('vram'),
        duration: widest('duration'),
    };
};
