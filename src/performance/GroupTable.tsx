import type { ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

import type { PerformanceGroup } from '../contract';
import { presetLabel } from '../runs/preset';
import { relativeTime } from '../devices/RelativeDateField';
import { columnMaxima, MetricCells, MetricHeaders, RunsCell } from './MetricCells';
import { configLabel, groupTotals, metricStats, modelsLabel } from './statistics';

/** A column the caller puts in front of the shared models, config and metric ones. */
type LeadColumn = {
    header: string;
    cell: (group: PerformanceGroup) => ReactNode;
};

// The registry groups by preset hash as well as name and version, and the console only
// warns against editing settings without a version bump. Two such edits are two rows
// that agree on everything else, so the hash has to be in the key.
const rowKey = (group: PerformanceGroup): string =>
    `${group.device_id ?? ''}|${presetLabel(group)}|${group.preset_hash ?? ''}|${modelsLabel(group)}|${configLabel(group)}`;

const HeadCell = ({ children }: { children: ReactNode }) => (
    <TableCell sx={{ whiteSpace: 'nowrap' }}>{children}</TableCell>
);

const Nowrap = ({ children }: { children: string }) => (
    <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
        {children}
    </Typography>
);

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
                        <HeadCell key={column.header}>{column.header}</HeadCell>
                    ))}
                    <HeadCell>Models</HeadCell>
                    <HeadCell>Config</HeadCell>
                    <HeadCell>Runs</HeadCell>
                    <MetricHeaders />
                    <HeadCell>Last run</HeadCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.map(({ group, stats, totals }) => (
                    <TableRow key={rowKey(group)}>
                        {lead.map(column => (
                            <TableCell key={column.header}>{column.cell(group)}</TableCell>
                        ))}
                        <TableCell>
                            <Typography variant="body2">{modelsLabel(group)}</Typography>
                        </TableCell>
                        <TableCell>
                            <Nowrap>{configLabel(group)}</Nowrap>
                        </TableCell>
                        <TableCell>
                            <RunsCell count={group.run_count} failed={group.failed_count} />
                        </TableCell>
                        <MetricCells stats={stats} totals={totals} maxima={maxima} />
                        <TableCell>
                            <Nowrap>
                                {group.last_run_at ? relativeTime(group.last_run_at) : '—'}
                            </Nowrap>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default GroupTable;
