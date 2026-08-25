import type { ReactNode } from 'react';
import {
    Box,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';

import type { ProfileTotals } from '../devices/profile';
import { formatBytes } from '../videos/VideoFields';
import { formatDuration } from './duration';

// The coarse pipeline stages in execution order, matching the desktop
// application's instrumentation keys. Unknown stages render after these.
export const STAGE_ORDER = [
    'startup',
    'preprocess',
    'mapping',
    'cloud',
    'ortho',
    'save_view',
    'scene_save',
];

export type StagePeak = {
    ram_bytes: number | null;
    swap_bytes: number | null;
    vram_bytes: number | null;
};

/** The largest figure per metric across every stage of one run. */
type RunPeaks = {
    ram: number | null;
    swap: number | null;
    vram: number | null;
};

const asObject = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;

const asBytes = (value: unknown): number | null =>
    typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;

const inPipelineOrder = <T,>(entries: [string, T][]): [string, T][] => {
    const rank = (stage: string) => {
        const index = STAGE_ORDER.indexOf(stage);
        return index === -1 ? STAGE_ORDER.length : index;
    };
    return [...entries].sort((a, b) => rank(a[0]) - rank(b[0]));
};

/** A `stage_peaks` json column as ordered rows, dropping anything malformed. */
const parseStagePeaks = (value: unknown): [string, StagePeak][] => {
    const stages = asObject(value);
    if (!stages) return [];
    const entries: [string, StagePeak][] = [];
    for (const [stage, raw] of Object.entries(stages)) {
        const peak = asObject(raw);
        if (!peak) continue;
        entries.push([
            stage,
            {
                ram_bytes: asBytes(peak.ram_bytes),
                swap_bytes: asBytes(peak.swap_bytes),
                vram_bytes: asBytes(peak.vram_bytes),
            },
        ]);
    }
    return inPipelineOrder(entries);
};

const parseStageDurations = (value: unknown): [string, number][] => {
    const stages = asObject(value);
    if (!stages) return [];
    const entries: [string, number][] = [];
    for (const [stage, raw] of Object.entries(stages)) {
        const seconds = asBytes(raw);
        if (seconds !== null) entries.push([stage, seconds]);
    }
    return inPipelineOrder(entries);
};

const peakOf = (values: (number | null)[]): number | null =>
    values.reduce<number | null>(
        (peak, value) => (value == null ? peak : Math.max(peak ?? 0, value)),
        null,
    );

/** Above this share of a ceiling, a peak is close enough to warn about. */
export const HOT_FRACTION = 0.85;

/** The bar under a memory figure: solid against a device ceiling, striped against the run's largest stage. */
export const MeterBar = ({
    fraction,
    relative,
    hot,
    height = 4,
    children,
}: {
    fraction: number;
    relative: boolean;
    hot: boolean;
    height?: number;
    children?: ReactNode;
}) => {
    const theme = useTheme();
    const colour = hot ? theme.palette.warning.main : theme.palette.primary.main;
    return (
        <Box sx={{ position: 'relative', height, borderRadius: 2, bgcolor: 'action.hover' }}>
            <Box
                sx={{
                    width: `${Math.min(Math.max(fraction, 0), 1) * 100}%`,
                    height: '100%',
                    borderRadius: 2,
                    ...(relative
                        ? {
                              backgroundImage: `repeating-linear-gradient(115deg, ${colour} 0 3px, transparent 3px 6px)`,
                          }
                        : { backgroundColor: colour }),
                }}
            />
            {children}
        </Box>
    );
};

/** A peak with a bar under it: against the device total when known, else `max`. */
const PeakCell = ({
    bytes,
    total,
    max,
}: {
    bytes: number | null;
    total: number | null;
    max: number;
}) => {
    if (bytes == null) {
        return (
            <Typography
                variant="body2"
                component="span"
                sx={{
                    color: 'text.disabled',
                }}
            >
                —
            </Typography>
        );
    }
    const scale = total ?? max;
    const hot = total != null && total > 0 && bytes / total > HOT_FRACTION;
    const tip =
        total == null
            ? `${formatBytes(bytes)}, ranked against the run's largest stage`
            : `${formatBytes(bytes)} of ${formatBytes(total)}`;
    return (
        <Tooltip title={tip}>
            <Box sx={{ minWidth: 72 }}>
                <Typography variant="body2" color={hot ? 'warning.main' : 'text.primary'}>
                    {formatBytes(bytes)}
                </Typography>
                <MeterBar
                    fraction={scale > 0 ? bytes / scale : 0}
                    relative={total == null}
                    hot={hot}
                />
            </Box>
        </Tooltip>
    );
};

/** The peak each metric reached anywhere in the run. */
const runPeaks = (value: unknown): RunPeaks => {
    const rows = parseStagePeaks(value);
    return {
        ram: peakOf(rows.map(([, peak]) => peak.ram_bytes)),
        swap: peakOf(rows.map(([, peak]) => peak.swap_bytes)),
        vram: peakOf(rows.map(([, peak]) => peak.vram_bytes)),
    };
};

type Gauge = { label: string; bytes: number; total: number | null };

const gaugeNote = (bytes: number, total: number | null): string => {
    if (total == null || total <= 0) return 'this device reports no total';
    // The total is the memory the device reports now, so an older run can sit above it.
    if (bytes > total) return `above the ${formatBytes(total)} it reports now`;
    return `${Math.round((bytes / total) * 100)}% of the device total`;
};

const PeakGauge = ({ label, bytes, total }: Gauge) => {
    const hot = total != null && total > 0 && bytes / total > HOT_FRACTION;
    return (
        <Stack spacing={0.25} sx={{ flex: '1 1 200px', maxWidth: 300 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {label}
            </Typography>
            <Typography
                variant="h6"
                sx={{ lineHeight: 1.3 }}
                color={hot ? 'warning.main' : 'text.primary'}
            >
                {total == null
                    ? formatBytes(bytes)
                    : `${formatBytes(bytes)} of ${formatBytes(total)}`}
            </Typography>
            {total != null && total > 0 && (
                <MeterBar fraction={bytes / total} relative={false} hot={hot} height={6} />
            )}
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {gaugeNote(bytes, total)}
            </Typography>
        </Stack>
    );
};

/** What the run peaked at, as gauges. */
export const RunPeakSummary = ({
    value,
    totals,
}: {
    value: unknown;
    totals: ProfileTotals;
}) => {
    const peaks = runPeaks(value);
    const gauges: Gauge[] = [];
    if (peaks.ram != null)
        gauges.push({ label: 'Peak RAM', bytes: peaks.ram, total: totals.ram });
    // Zero swap or VRAM says the run never touched them, which earns no gauge.
    if (peaks.swap) gauges.push({ label: 'Peak swap', bytes: peaks.swap, total: totals.swap });
    if (peaks.vram) gauges.push({ label: 'Peak VRAM', bytes: peaks.vram, total: totals.vram });
    if (!gauges.length) {
        return (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                This run reported no resource figures.
            </Typography>
        );
    }
    return (
        <Stack direction="row" spacing={3} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {gauges.map(gauge => (
                <PeakGauge key={gauge.label} {...gauge} />
            ))}
        </Stack>
    );
};

/** Tooltip lines for the stages heading. */
export const STAGE_PEAK_NOTES = [
    'Wall clock and peak memory per stage.',
    'Solid bar: share of the device total.',
    "Striped bar: share of the run's largest stage.",
];

/** One row per stage: how long it took and what it held, in pipeline order. */
export const StagesTable = ({
    durations,
    peaks,
    totals,
    emptyText,
}: {
    durations: unknown;
    peaks: unknown;
    totals: ProfileTotals;
    emptyText: string;
}) => {
    const peakRows = parseStagePeaks(peaks);
    const seconds = new Map(parseStageDurations(durations));
    const stages = inPipelineOrder(
        [...new Set([...peakRows.map(([stage]) => stage), ...seconds.keys()])].map(
            stage => [stage, stage] as [string, string],
        ),
    ).map(([stage]) => stage);
    if (!stages.length) {
        return (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {emptyText}
            </Typography>
        );
    }
    const byStage = new Map(peakRows);
    const ramMax = peakOf(peakRows.map(([, peak]) => peak.ram_bytes)) ?? 0;
    const swapMax = peakOf(peakRows.map(([, peak]) => peak.swap_bytes)) ?? 0;
    const vramMax = peakOf(peakRows.map(([, peak]) => peak.vram_bytes)) ?? 0;
    const anySwap = swapMax > 0;
    const anyVram = vramMax > 0;
    return (
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ pl: 0 }}>Stage</TableCell>
                        <TableCell align="right">Time</TableCell>
                        <TableCell>RAM</TableCell>
                        {anySwap && <TableCell>Swap</TableCell>}
                        {anyVram && <TableCell>VRAM</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {stages.map(stage => {
                        const peak = byStage.get(stage);
                        const took = seconds.get(stage);
                        return (
                            <TableRow key={stage}>
                                <TableCell sx={{ border: 0, pl: 0, color: 'text.secondary' }}>
                                    {stage}
                                </TableCell>
                                <TableCell
                                    align="right"
                                    sx={{ border: 0, whiteSpace: 'nowrap' }}
                                >
                                    {took == null ? '—' : formatDuration(took)}
                                </TableCell>
                                <TableCell sx={{ border: 0 }}>
                                    <PeakCell
                                        bytes={peak?.ram_bytes ?? null}
                                        total={totals.ram}
                                        max={ramMax}
                                    />
                                </TableCell>
                                {anySwap && (
                                    <TableCell sx={{ border: 0 }}>
                                        <PeakCell
                                            bytes={peak?.swap_bytes ?? null}
                                            total={totals.swap}
                                            max={swapMax}
                                        />
                                    </TableCell>
                                )}
                                {anyVram && (
                                    <TableCell sx={{ border: 0 }}>
                                        <PeakCell
                                            bytes={peak?.vram_bytes ?? null}
                                            total={totals.vram}
                                            max={vramMax}
                                        />
                                    </TableCell>
                                )}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
