import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
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
export const parseStagePeaks = (value: unknown): [string, StagePeak][] => {
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

const HOT_FRACTION = 0.85;

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
    const fraction = scale > 0 ? Math.min(bytes / scale, 1) : 0;
    const hot = total != null && total > 0 && bytes / total > HOT_FRACTION;
    const cell = (
        <Box sx={{ minWidth: 96 }}>
            <Typography variant="body2" color={hot ? 'warning.main' : 'text.primary'}>
                {formatBytes(bytes)}
            </Typography>
            <Box sx={{ height: 4, borderRadius: 2, bgcolor: 'action.hover' }}>
                <Box
                    sx={{
                        width: `${fraction * 100}%`,
                        height: '100%',
                        borderRadius: 2,
                        bgcolor: hot ? 'warning.main' : 'primary.main',
                    }}
                />
            </Box>
        </Box>
    );
    if (total == null) return cell;
    return <Tooltip title={`${formatBytes(bytes)} of ${formatBytes(total)}`}>{cell}</Tooltip>;
};

const maxOf = (values: (number | null)[]): number =>
    values.reduce<number>((peak, value) => Math.max(peak, value ?? 0), 0);

const summarise = (label: string, bytes: number, total: number | null): string =>
    total
        ? `${label} ${formatBytes(bytes)} of ${formatBytes(total)}`
        : `${label} ${formatBytes(bytes)}`;

/** Per-stage memory peaks as bars, scaled to the device's ceilings when known. */
export const StagePeaksTable = ({
    value,
    totals,
    emptyText,
}: {
    value: unknown;
    totals: ProfileTotals;
    emptyText: string;
}) => {
    const rows = parseStagePeaks(value);
    if (!rows.length) {
        return (
            <Typography
                variant="body2"
                sx={{
                    color: 'text.secondary',
                }}
            >
                {emptyText}
            </Typography>
        );
    }
    const ramMax = maxOf(rows.map(([, peak]) => peak.ram_bytes));
    const swapMax = maxOf(rows.map(([, peak]) => peak.swap_bytes));
    const vramMax = maxOf(rows.map(([, peak]) => peak.vram_bytes));
    const summary = [
        summarise('RAM', ramMax, totals.ram),
        summarise('swap', swapMax, totals.swap),
        vramMax > 0 ? summarise('VRAM', vramMax, totals.vram) : null,
    ]
        .filter(Boolean)
        .join(' · ');
    return (
        <Box>
            <Table size="small" sx={{ maxWidth: 560 }}>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ pl: 0 }}>Stage</TableCell>
                        <TableCell>RAM</TableCell>
                        <TableCell>Swap</TableCell>
                        <TableCell>VRAM</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map(([stage, peak]) => (
                        <TableRow key={stage}>
                            <TableCell sx={{ border: 0, pl: 0, color: 'text.secondary' }}>
                                {stage}
                            </TableCell>
                            <TableCell sx={{ border: 0 }}>
                                <PeakCell
                                    bytes={peak.ram_bytes}
                                    total={totals.ram}
                                    max={ramMax}
                                />
                            </TableCell>
                            <TableCell sx={{ border: 0 }}>
                                <PeakCell
                                    bytes={peak.swap_bytes}
                                    total={totals.swap}
                                    max={swapMax}
                                />
                            </TableCell>
                            <TableCell sx={{ border: 0 }}>
                                <PeakCell
                                    bytes={peak.vram_bytes}
                                    total={totals.vram}
                                    max={vramMax}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Run peaks: {summary}
            </Typography>
        </Box>
    );
};

/** Per-stage wall-clock durations in pipeline order. */
export const StageDurationsTable = ({
    value,
    emptyText,
}: {
    value: unknown;
    emptyText: string;
}) => {
    const rows = parseStageDurations(value);
    if (!rows.length) {
        return (
            <Typography
                variant="body2"
                sx={{
                    color: 'text.secondary',
                }}
            >
                {emptyText}
            </Typography>
        );
    }
    return (
        <Table size="small" sx={{ maxWidth: 360 }}>
            <TableBody>
                {rows.map(([stage, seconds]) => (
                    <TableRow key={stage}>
                        <TableCell sx={{ border: 0, pl: 0, color: 'text.secondary' }}>
                            {stage}
                        </TableCell>
                        <TableCell sx={{ border: 0 }}>{formatDuration(seconds)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
