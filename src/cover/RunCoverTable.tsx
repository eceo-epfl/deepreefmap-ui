import {
    Box,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';

import { CoverRow } from '../contract';
import { formatCount, formatPercent } from './usePooledCover';

const FALLBACK = '#9e9e9e';

/** The cover rows one run reported, in a scrolling container with a sticky header. */
const RunCoverTable = ({
    rows,
    colours,
    maxHeight = 360,
}: {
    rows: CoverRow[];
    colours: Map<string, string>;
    maxHeight?: number;
}) => (
    <TableContainer sx={{ maxHeight, overflow: 'auto' }}>
        <Table size="small" stickyHeader>
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
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
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
                        <TableCell align="right">{formatPercent(row.fraction)}</TableCell>
                        <TableCell align="right">
                            {row.point_count == null ? '—' : formatCount(row.point_count)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
);

export default RunCoverTable;
