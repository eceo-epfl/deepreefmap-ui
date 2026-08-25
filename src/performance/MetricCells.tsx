import { Box, TableCell, Tooltip, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import type { Preset } from '../contract';
import { formatDuration } from '../runs/duration';
import { presetLabel } from '../runs/preset';
import { HOT_FRACTION, MeterBar } from '../runs/StageBreakdown';
import { byteScale, formatBytes } from '../videos/VideoFields';
import { METRIC_KEYS } from './statistics';
import type { MetricKey, MetricStats, MetricTotals, MetricUtilisation } from './statistics';

const METRIC_HEADERS: Record<MetricKey, string> = {
    ram: 'Mean peak RAM',
    swap: 'Mean peak swap',
    vram: 'Mean peak VRAM',
    duration: 'Mean duration',
};

// The sampler reads RAM from the run's own process tree and VRAM from the card, so
// the two are not on the same footing and the column that says so has to be visible.
const METRIC_NOTES: Partial<Record<MetricKey, string>> = {
    vram: 'Sampled across the whole card, so the desktop and anything else using the GPU counts towards it. RAM covers the processes of the run alone.',
};

export const Dash = () => (
    <Typography variant="body2" component="span" sx={{ color: 'text.disabled' }}>
        —
    </Typography>
);

export const RunsCell = ({ count, failed }: { count: number; failed: number }) => (
    <Typography variant="body2" component="span">
        {count}
        {failed > 0 && (
            <Typography variant="body2" component="span" color="warning.main">
                {' '}
                ({failed} failed)
            </Typography>
        )}
    </Typography>
);

/** "name vN" as a link when the preset still exists, plain text when it is gone. */
export const PresetCell = ({
    group,
    presets,
}: {
    group: { preset_name?: string | null; preset_version?: number | null };
    presets: Preset[] | undefined;
}) => {
    if (!group.preset_name) return <Dash />;
    const match = (presets ?? []).find(
        preset => preset.name === group.preset_name && preset.version === group.preset_version,
    );
    const label = presetLabel(group);
    if (!match) return <Typography variant="body2">{label}</Typography>;
    return (
        <Typography variant="body2">
            <Link to={`/presets/${match.id}/show`}>{label}</Link>
        </Typography>
    );
};

/** The device the runs came from, linked while the registry still knows it. */
export const DeviceCell = ({
    id,
    name,
}: {
    id: string | null | undefined;
    name: string | null | undefined;
}) => {
    if (!name) return <Dash />;
    return (
        <Typography variant="body2">
            {id ? <Link to={`/devices/${id}/show`}>{name}</Link> : name}
        </Typography>
    );
};

// A mean and its deviation only compare if they read in one unit, so the byte
// formatters take both figures and scale them against a single divisor.
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

// formatDuration rounds to whole seconds, so a deviation under half a second reads as
// no spread at all. Small figures keep a decimal to stay honest about that.
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

// Duration reports no ceiling, so this line is memory only. A row of one device
// states the peak against that device's memory. A pooled row cannot, because its
// devices are different sizes, so it states the fullest device's own share instead.
// Either way the ceiling is the memory reported now, not what the machine carried
// when the runs happened, so a since-downsized laptop is named rather than given a
// share above 100%.
const ceilingNote = (
    total: number | null,
    max: number | null,
    utilisation: number | null,
): string | null => {
    if (total != null && total > 0 && max != null) {
        return max > total
            ? `highest run above the ${formatBytes(total)} this device reports now`
            : `highest run ${Math.round((max / total) * 100)}% of ${formatBytes(total)}`;
    }
    if (utilisation == null) return null;
    return utilisation > 1
        ? 'fullest device ran above the memory it reports now'
        : `fullest device reached ${Math.round(utilisation * 100)}% of its own memory`;
};

/**
 * One metric as `mean ± sample deviation`, over the observed range and sample size.
 *
 * The bar carries the mean and the tick the highest run observed. The mean is the
 * figure to plan a fleet around, the maximum is the one that fills a laptop, so a
 * maximum near the device ceiling turns the whole cell to the warning colour even
 * when the mean sits comfortably below it.
 */
const MetricCell = ({
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
    if (!n || mean == null) return <Dash />;
    // Duration, a pooled row and a device that never reported its memory all lack a
    // ceiling, so their bars rank the column instead and are striped to say so.
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
        ceiling == null && 'the bar ranks this row against the widest figure in the column',
    ]
        .filter(Boolean)
        .join(' · ');
    return (
        <Tooltip title={tip}>
            <Box sx={{ minWidth: 128 }}>
                <Typography
                    variant="body2"
                    sx={{ whiteSpace: 'nowrap' }}
                    color={hot ? 'warning.main' : 'text.primary'}
                >
                    {figure}
                </Typography>
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
                <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
                >
                    {observed ? `${observed} · ` : ''}n={n}
                </Typography>
            </Box>
        </Tooltip>
    );
};

const MetricHeader = ({ metric }: { metric: MetricKey }) => {
    const note = METRIC_NOTES[metric];
    if (!note) return <>{METRIC_HEADERS[metric]}</>;
    return (
        <Tooltip title={note}>
            <Box component="span" sx={{ textDecoration: 'underline dotted', cursor: 'help' }}>
                {METRIC_HEADERS[metric]}
            </Box>
        </Tooltip>
    );
};

export const MetricHeaders = () => (
    <>
        {METRIC_KEYS.map(metric => (
            <TableCell key={metric} sx={{ whiteSpace: 'nowrap' }}>
                <MetricHeader metric={metric} />
            </TableCell>
        ))}
    </>
);

/** The four metric cells of a row, in the order `MetricHeaders` names them. */
export const MetricCells = ({
    stats,
    maxima,
    totals,
    utilisation,
}: {
    stats: Record<MetricKey, MetricStats>;
    maxima: Record<MetricKey, number>;
    // A row of one device carries that device's ceilings. A pooled row carries the
    // fullest share its devices reached instead, never both: comparing one machine's
    // peak against another machine's total is what produces a figure over 100%.
    totals?: MetricTotals;
    utilisation?: MetricUtilisation;
}) => (
    <>
        {METRIC_KEYS.map(metric => (
            <TableCell key={metric}>
                <MetricCell
                    metric={metric}
                    stats={stats[metric]}
                    total={memoryFigure(metric, totals)}
                    utilisation={memoryFigure(metric, utilisation)}
                    columnMax={maxima[metric]}
                />
            </TableCell>
        ))}
    </>
);

/** The widest figure per metric, for the columns that have no device ceiling. */
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
