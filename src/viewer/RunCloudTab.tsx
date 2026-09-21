import { Suspense, lazy, useEffect, useState } from 'react';
import { useDataProvider, useRecordContext } from 'react-admin';
import { Alert, Box, LinearProgress, Typography } from '@mui/material';

import { useRunArtifactObject } from '../archive/useRunArtifactObject';
import type { RunRecord } from '../contract';
import type { DrmDataProvider } from '../dataProvider';
import { formatBytes } from '../videos/VideoFields';
import { fetchWebCloud, type DrmwCloud } from './drmw';

// The viewer, with three.js, loads as its own chunk when a cloud is opened.
const CloudViewer = lazy(() => import('./CloudViewer'));

const CLOUD_RELPATH = 'cloud_web.drmw';

type Load =
    | { name: 'loading'; received: number; total: number | null }
    | { name: 'ready'; cloud: DrmwCloud }
    | { name: 'error'; message: string };

const Muted = ({ children }: { children: string }) => (
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {children}
    </Typography>
);

const Downloading = ({ received, total }: { received: number; total: number | null }) => (
    <Box>
        <Typography variant="body2" gutterBottom>
            Downloading the cloud: {formatBytes(received)}
            {total ? ` of ${formatBytes(total)}` : ''}
        </Typography>
        <LinearProgress
            variant={total ? 'determinate' : 'indeterminate'}
            value={total ? (received / total) * 100 : undefined}
        />
    </Box>
);

const CloudLoader = ({ objectId }: { objectId: string }) => {
    const dataProvider = useDataProvider<DrmDataProvider>();
    const [load, setLoad] = useState<Load>({ name: 'loading', received: 0, total: null });

    useEffect(() => {
        let alive = true;
        const run = async () => {
            try {
                const { url } = await dataProvider.archiveDownload(objectId);
                if (!alive) return;
                const cloud = await fetchWebCloud(url, (received, total) => {
                    if (alive) setLoad({ name: 'loading', received, total });
                });
                if (alive) setLoad({ name: 'ready', cloud });
            } catch (error) {
                if (alive) {
                    setLoad({
                        name: 'error',
                        message:
                            error instanceof Error
                                ? error.message
                                : 'The cloud failed to load.',
                    });
                }
            }
        };
        run();
        return () => {
            alive = false;
        };
    }, [dataProvider, objectId]);

    if (load.name === 'error') return <Alert severity="error">{load.message}</Alert>;
    if (load.name === 'loading') {
        return <Downloading received={load.received} total={load.total} />;
    }
    return (
        <Suspense fallback={<LinearProgress />}>
            <CloudViewer cloud={load.cloud} />
        </Suspense>
    );
};

/** Finds the run's archived web cloud and mounts the viewer over it. */
const RunCloudTab = () => {
    const record = useRecordContext<RunRecord>();
    const state = useRunArtifactObject(record?.id, CLOUD_RELPATH);

    if (state.name === 'pending') return <LinearProgress />;
    if (state.name === 'error') return <Alert severity="error">{state.message}</Alert>;
    if (state.name === 'absent') {
        return <Muted>No web cloud archived yet. Archive the run from the desktop app.</Muted>;
    }
    return <CloudLoader objectId={state.objectId} />;
};

export default RunCloudTab;
