import { useState } from 'react';
import { Loading, useGetList, useRecordContext } from 'react-admin';
import { Alert, Box, Grid, Stack, Typography } from '@mui/material';

import { CoverLevel, CoverRow, RunRecord } from '../contract';
import CoverDonut from '../cover/CoverDonut';
import LevelToggle from '../cover/LevelToggle';
import RunCoverTable from '../cover/RunCoverTable';
import { useClassColours } from '../cover/useClassGroups';
import OrthoImage from './OrthoImage';

const ROW_PAGE = 200;

/** The ortho image beside the run's cover at one level, table below. */
const RunCover = () => {
    const run = useRecordContext<RunRecord>();
    const [level, setLevel] = useState<CoverLevel>('coarse');
    const colours = useClassColours(level);
    const { data, isPending } = useGetList<CoverRow>(
        'cover_rows',
        {
            filter: { run_id: run?.id, level, estimator: 'per_pass' },
            pagination: { page: 1, perPage: ROW_PAGE },
            sort: { field: 'fraction', order: 'DESC' },
        },
        { enabled: !!run },
    );
    if (!run) return <Loading />;
    const rows = data ?? [];
    const slices = rows.map(row => ({
        name: row.class_group,
        fraction: row.fraction,
        colour: colours.get(row.class_group),
    }));
    return (
        <Stack spacing={2} sx={{ width: '100%' }}>
            <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <OrthoImage />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={1.5}>
                        <LevelToggle value={level} onChange={setLevel} />
                        {isPending ? (
                            <Loading />
                        ) : rows.length === 0 ? (
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                This run reported no cover at this level.
                            </Typography>
                        ) : (
                            <CoverDonut slices={slices} />
                        )}
                    </Stack>
                </Grid>
            </Grid>
            {rows.length > 0 && (
                <Box>
                    <RunCoverTable rows={rows} colours={colours} />
                </Box>
            )}
            {!isPending && rows.length === 0 && run.status !== 'succeeded' && (
                <Alert severity="info">Cover is reported once a run succeeds.</Alert>
            )}
        </Stack>
    );
};

export default RunCover;
