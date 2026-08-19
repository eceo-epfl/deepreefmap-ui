import { useState } from 'react';
import { Loading, useGetList, useRecordContext } from 'react-admin';
import {
    Alert,
    Box,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@mui/material';

import { CoverLevel, CoverRow, RunRecord } from '../contract';
import LevelToggle from './LevelToggle';
import { useClassColours } from './useClassGroups';
import { formatCount, formatPercent } from './usePooledCover';

const ROW_PAGE = 200;
const FALLBACK = '#9e9e9e';

/** The cover rows this run reported, as it reported them. */
const RunCoverTable = () => {
    const run = useRecordContext<RunRecord>();
    const [level, setLevel] = useState<CoverLevel>('coarse');
    const colours = useClassColours(level);
    const { data, isPending } = useGetList<CoverRow>('cover_rows', {
        filter: { run_id: run?.id, level, estimator: 'per_pass' },
        pagination: { page: 1, perPage: ROW_PAGE },
        sort: { field: 'fraction', order: 'DESC' },
    });

    if (!run || isPending) return <Loading />;
    const rows = data ?? [];

    return (
        <Stack spacing={2} sx={{ mt: 1 }}>
            <LevelToggle value={level} onChange={setLevel} />

            {rows.length === 0 ? (
                <Alert severity="info">This run reported no cover at this level.</Alert>
            ) : (
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Class</TableCell>
                            <TableCell align="right">Cover</TableCell>
                            <TableCell align="right">Points</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map(row => (
                            <TableRow key={row.id}>
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
                                                    colours.get(row.class_group) ?? FALLBACK,
                                            }}
                                        />
                                        <span>{row.class_group}</span>
                                    </Stack>
                                </TableCell>
                                <TableCell align="right">
                                    {formatPercent(row.fraction)}
                                </TableCell>
                                <TableCell align="right">
                                    {row.point_count == null
                                        ? '—'
                                        : formatCount(row.point_count)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </Stack>
    );
};

export default RunCoverTable;
