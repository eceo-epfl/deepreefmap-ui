import { Fragment } from 'react';
import type { ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

import type { PerformanceGroup } from '../contract';
import { presetLabel } from '../runs/preset';
import { columnMaxima, LastRunCell, PeaksCell, PeaksHeader, RunsCell } from './MetricCells';
import {
    configKey,
    groupTotals,
    metricStats,
    modelsLabel,
    processingConfig,
} from './statistics';

/** A column the caller puts in front of the shared runs, peaks and last-run ones. */
export type LeadColumn = {
    header: string;
    cell: (group: PerformanceGroup) => ReactNode;
};

/** The one-line caption every embedding of the table sits under. */
export const CAPTION = 'Mean ± sd of per-run peaks.';

export const summaryError = (error: string) => `Performance summary unavailable (${error}).`;

export const Note = ({ children }: { children: string }) => (
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {children}
    </Typography>
);

// Preset settings can change without a version bump; the hash separates those rows.
const rowKey = (group: PerformanceGroup): string =>
    `${group.device_id ?? ''}|${presetLabel(group)}|${group.preset_hash ?? ''}|${modelsLabel(group)}|${configKey(processingConfig(group))}`;

/** Device-grain rows of the fleet summary, one shape wherever they are shown. */
const GroupTable = ({
    groups,
    lead,
    sortKey,
}: {
    groups: PerformanceGroup[];
    lead: LeadColumn[];
    sortKey: (group: PerformanceGroup) => string;
}) => {
    const rows = groups
        .map(group => ({
            group,
            stats: metricStats(group),
            totals: groupTotals(group),
        }))
        .sort((a, b) => sortKey(a.group).localeCompare(sortKey(b.group)));
    const maxima = columnMaxima(rows);
    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    {lead.map(column => (
                        <TableCell key={column.header} sx={{ whiteSpace: 'nowrap' }}>
                            {column.header}
                        </TableCell>
                    ))}
                    <TableCell>Runs</TableCell>
                    <PeaksHeader />
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Last run</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.map(({ group, stats, totals }) => (
                    <TableRow key={rowKey(group)}>
                        {lead.map(column => (
                            <Fragment key={column.header}>{column.cell(group)}</Fragment>
                        ))}
                        <RunsCell count={group.run_count} failed={group.failed_count} />
                        <PeaksCell stats={stats} totals={totals} maxima={maxima} />
                        <LastRunCell at={group.last_run_at} />
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default GroupTable;
