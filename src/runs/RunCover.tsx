import { useState } from 'react';
import { Loading, useGetList, useRecordContext } from 'react-admin';
import { Alert, Box, Grid, Stack, Typography } from '@mui/material';

import { CoverLevel, CoverRow, RunRecord } from '../contract';
import CoverDonut from '../cover/CoverDonut';
import LevelToggle from '../cover/LevelToggle';
import RunCoverTable from '../cover/RunCoverTable';
import { useClassColours } from '../cover/useClassGroups';
import OrthoView from './OrthoView';

const ROW_PAGE = 200;

/** The run's ortho beside the cover it reported, at one level. */
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
            <LevelToggle value={level} onChange={setLevel} />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 7 }}>
                    <OrthoView level={level} />
                </Grid>
                <Grid size={{ xs: 12, lg: 5 }}>
                    <Stack spacing={2}>
                        {isPending ? (
                            <Loading />
                        ) : rows.length === 0 ? (
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                No cover reported at this level.
                            </Typography>
                        ) : (
                            <>
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <CoverDonut slices={slices} legend={false} />
                                </Box>
                                <RunCoverTable rows={rows} colours={colours} />
                            </>
                        )}
                    </Stack>
                </Grid>
            </Grid>
            {!isPending && rows.length === 0 && run.status !== 'succeeded' && (
                <Alert severity="info">Cover is reported once a run succeeds.</Alert>
            )}
        </Stack>
    );
};

export default RunCover;
