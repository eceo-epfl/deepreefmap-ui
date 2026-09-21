import { useState } from 'react';
import { Loading, useRecordContext } from 'react-admin';
import {
    Alert,
    Box,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';

import { CoverLevel, CoverSeriesEntry, Transect } from '../contract';
import { CoverBar } from './CoverFigure';
import CoverSeriesChart, { entryKey, entryLabel } from './CoverSeriesChart';
import LevelToggle from './LevelToggle';
import { useClassColours } from './useClassGroups';
import { useCoverSeries } from './useCoverSeries';
import { formatCount, formatPercent } from './usePooledCover';

const FALLBACK = '#9e9e9e';

const passCount = (entry: CoverSeriesEntry) =>
    `${entry.contributing_passes} ${entry.contributing_passes === 1 ? 'pass' : 'passes'}`;

/** One entry as a stacked bar. */
const EntryBar = ({ entry }: { entry: CoverSeriesEntry }) => (
    <Stack spacing={0.5}>
        <Typography variant="subtitle2">{entryLabel(entry)}</Typography>
        <CoverBar groups={entry.groups} />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {passCount(entry)} over {formatCount(entry.denominator)} points
        </Typography>
    </Stack>
);

/** One entry's per-class table. */
const EntryTable = ({
    entry,
    colours,
}: {
    entry: CoverSeriesEntry;
    colours: Map<string, string>;
}) => (
    <Stack spacing={1}>
        <Typography variant="subtitle2">{entryLabel(entry)}</Typography>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Class</TableCell>
                    <TableCell align="right">Cover</TableCell>
                    <TableCell align="right">Min</TableCell>
                    <TableCell align="right">Max</TableCell>
                    <TableCell align="right">Passes</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {entry.groups.map(group => (
                    <TableRow key={group.class_group}>
                        <TableCell>
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{
                                    alignItems: 'center',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '2px',
                                        backgroundColor:
                                            colours.get(group.class_group) ??
                                            group.colour ??
                                            FALLBACK,
                                    }}
                                />
                                <span>{group.class_group}</span>
                            </Stack>
                        </TableCell>
                        <TableCell align="right">{formatPercent(group.fraction)}</TableCell>
                        <TableCell align="right">
                            {formatPercent(group.min_fraction)}
                        </TableCell>
                        <TableCell align="right">
                            {formatPercent(group.max_fraction)}
                        </TableCell>
                        <TableCell align="right">{entry.contributing_passes}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </Stack>
);

/**
 * Cover along this transect, one series entry per campaign: a survey event is the
 * passes of one transect in one campaign. The registry orders the series by the
 * campaigns' begin dates, with the passes on no campaign last.
 */
const Statistics = () => {
    const transect = useRecordContext<Transect>();
    const [level, setLevel] = useState<CoverLevel>('coarse');
    const { series, error, pending } = useCoverSeries(transect?.id, level);
    const colours = useClassColours(level);

    if (!transect) return <Loading />;
    const entries = series?.entries ?? [];

    return (
        <Stack spacing={3} sx={{ mt: 1 }}>
            <LevelToggle value={level} onChange={setLevel} />

            {error && <Alert severity="error">{error}</Alert>}
            {pending && <Loading />}
            {series && !pending && !entries.length && (
                <Alert severity="info">
                    No processed passes yet. The series fills in when a laptop syncs a run.
                </Alert>
            )}

            {!pending && entries.length > 0 && (
                <>
                    <CoverSeriesChart entries={entries} colours={colours} />

                    <Stack spacing={2}>
                        {entries.map(entry => (
                            <EntryBar key={entryKey(entry)} entry={entry} />
                        ))}
                    </Stack>

                    <Stack spacing={2}>
                        {entries.map(entry => (
                            <EntryTable
                                key={entryKey(entry)}
                                entry={entry}
                                colours={colours}
                            />
                        ))}
                    </Stack>
                </>
            )}
        </Stack>
    );
};

export default Statistics;
