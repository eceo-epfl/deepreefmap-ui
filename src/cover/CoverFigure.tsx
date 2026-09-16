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

import type { PooledCover } from '../contract';
import { formatCount, formatPercent } from './usePooledCover';

const FALLBACK = '#9e9e9e';

type BarSegment = {
    class_group: string;
    colour?: string | null;
    fraction: number;
};

/** A stacked bar in the class colours the desktop viewer uses. */
export const CoverBar = ({ groups }: { groups: BarSegment[] }) => (
    <Box sx={{ display: 'flex', height: 22, borderRadius: 1, overflow: 'hidden' }}>
        {groups
            .filter(group => group.fraction > 0)
            .map(group => (
                <Box
                    key={group.class_group}
                    title={`${group.class_group} ${formatPercent(group.fraction)}`}
                    sx={{
                        width: `${group.fraction * 100}%`,
                        backgroundColor: group.colour ?? FALLBACK,
                    }}
                />
            ))}
    </Box>
);

/** How much of the transect the figure rests on, stated rather than implied. */
const Coverage = ({ cover }: { cover: PooledCover }) => {
    const partial = cover.contributing_passes < cover.expected_passes;
    const text = `${cover.contributing_passes} of ${
        cover.expected_passes
    } passes over ${formatCount(cover.denominator)} points`;
    return partial ? (
        <Alert severity="warning" sx={{ py: 0 }}>
            {text}
        </Alert>
    ) : (
        <Typography
            variant="caption"
            sx={{
                color: 'text.secondary',
            }}
        >
            {text}
        </Typography>
    );
};

const CoverFigure = ({ cover }: { cover: PooledCover }) => {
    if (!cover.groups.length) {
        return <Alert severity="info">No cover reported for these passes yet.</Alert>;
    }

    return (
        <Stack spacing={1}>
            <CoverBar groups={cover.groups} />
            <Coverage cover={cover} />
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Class</TableCell>
                        <TableCell align="right">Cover</TableCell>
                        <TableCell align="right">Points</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {cover.groups.map(group => (
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
                                            backgroundColor: group.colour ?? FALLBACK,
                                        }}
                                    />
                                    <span>{group.class_group}</span>
                                </Stack>
                            </TableCell>
                            <TableCell align="right">
                                {formatPercent(group.fraction)}
                            </TableCell>
                            <TableCell align="right">
                                {formatCount(group.point_count)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Stack>
    );
};

export default CoverFigure;
