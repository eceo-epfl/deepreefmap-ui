import { Suspense, lazy, useEffect, useState } from 'react';
import { useDataProvider, useGetList, useGetOne, useRecordContext } from 'react-admin';
import { Alert, Box, LinearProgress, Typography } from '@mui/material';

import type { RunArtifact, RunRecord, StoredObject } from '../contract';
import type { DrmDataProvider } from '../dataProvider';
import { formatBytes } from '../videos/VideoFields';
import { fetchWebCloud, type DrmwCloud } from './drmw';

// three.js is the app's largest optional dependency, so the viewer loads as its
// own chunk only when a cloud is actually opened.
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
    const {
        data: artifacts,
        isPending,
        error,
    } = useGetList<RunArtifact>(
        'run_artifacts',
        {
            filter: { run_id: record?.id },
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'relpath', order: 'ASC' },
        },
        { enabled: !!record },
    );
    const artifact = artifacts?.find(candidate => candidate.relpath === CLOUD_RELPATH);
    const { data: object } = useGetOne<StoredObject>(
        'stored_objects',
        { id: artifact?.stored_object_id ?? '' },
        { enabled: !!artifact?.stored_object_id },
    );

    if (!record || isPending) return <LinearProgress />;
    if (error) {
        return <Alert severity="error">The run&apos;s artefacts could not be listed.</Alert>;
    }
    if (!artifact) {
        return (
            <Muted>
                This run has not archived a web cloud yet. Archive the run from the desktop
                app.
            </Muted>
        );
    }
    if (!artifact.stored_object_id) {
        return (
            <Muted>
                The web cloud is registered but its bytes have not been archived yet. Archive
                the run from the desktop app.
            </Muted>
        );
    }
    if (!object) return <LinearProgress />;
    if (object.status === 'failed') {
        return (
            <Alert severity="error">
                The archived cloud did not upload completely, so it cannot be viewed.
            </Alert>
        );
    }
    if (object.status !== 'complete') {
        return <Muted>The web cloud is still uploading.</Muted>;
    }
    return <CloudLoader objectId={object.id} />;
};

export default RunCloudTab;
