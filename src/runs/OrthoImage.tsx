import { useEffect, useState } from 'react';
import { useDataProvider, useGetOne, useRecordContext } from 'react-admin';
import { Alert, Box, LinearProgress, Typography } from '@mui/material';

import { useRunArtifacts } from '../archive/useRunArtifacts';
import type { RunRecord, StoredObject } from '../contract';
import type { DrmDataProvider } from '../dataProvider';

const ORTHO_RELPATH = 'ortho.png';
const MAX_HEIGHT = 420;

type Load =
    { name: 'loading' } | { name: 'ready'; url: string } | { name: 'error'; message: string };

const Muted = ({ children }: { children: string }) => (
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {children}
    </Typography>
);

const OrthoLoader = ({ objectId }: { objectId: string }) => {
    const dataProvider = useDataProvider<DrmDataProvider>();
    const [load, setLoad] = useState<Load>({ name: 'loading' });

    useEffect(() => {
        let alive = true;
        let objectUrl: string | undefined;
        const run = async () => {
            try {
                const { url } = await dataProvider.archiveDownload(objectId);
                const response = await fetch(url);
                if (!response.ok)
                    throw new Error(`The image fetch answered ${response.status}`);
                const blob = await response.blob();
                if (!alive) return;
                objectUrl = URL.createObjectURL(blob);
                setLoad({ name: 'ready', url: objectUrl });
            } catch (error) {
                if (alive) {
                    setLoad({
                        name: 'error',
                        message:
                            error instanceof Error
                                ? error.message
                                : 'The ortho image failed to load.',
                    });
                }
            }
        };
        run();
        return () => {
            alive = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [dataProvider, objectId]);

    if (load.name === 'error') return <Alert severity="error">{load.message}</Alert>;
    if (load.name === 'loading') return <LinearProgress />;
    return (
        <Box
            component="a"
            href={load.url}
            target="_blank"
            rel="noopener"
            sx={{ display: 'block', lineHeight: 0 }}
        >
            <Box
                component="img"
                src={load.url}
                alt="Ortho image"
                sx={{
                    maxWidth: '100%',
                    maxHeight: MAX_HEIGHT,
                    objectFit: 'contain',
                    borderRadius: 1,
                }}
            />
        </Box>
    );
};

/** The run's archived ortho image, or one line on how to get one. */
const OrthoImage = () => {
    const record = useRecordContext<RunRecord>();
    const { data: artifacts, isPending, error } = useRunArtifacts(record?.id);
    const artifact = artifacts?.find(candidate => candidate.relpath === ORTHO_RELPATH);
    const { data: object } = useGetOne<StoredObject>(
        'stored_objects',
        { id: artifact?.stored_object_id ?? '' },
        { enabled: !!artifact?.stored_object_id },
    );

    if (!record || isPending) return <LinearProgress />;
    if (error)
        return <Alert severity="error">The run&apos;s artefacts could not be listed.</Alert>;
    if (!artifact?.stored_object_id) {
        return <Muted>The ortho image appears once the desktop app archives the run.</Muted>;
    }
    if (!object) return <LinearProgress />;
    if (object.status === 'failed') {
        return <Alert severity="error">The ortho image upload failed.</Alert>;
    }
    if (object.status !== 'complete') return <Muted>Ortho image still uploading.</Muted>;
    return <OrthoLoader objectId={object.id} />;
};

export default OrthoImage;
