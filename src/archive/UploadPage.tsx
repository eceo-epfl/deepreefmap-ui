import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { HttpError, Title, useDataProvider, useGetList } from 'react-admin';
import { Link } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    LinearProgress,
    Stack,
    Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import type { VideoAsset } from '../contract';
import type { DrmDataProvider } from '../dataProvider';
import { formatBytes } from '../videos/VideoFields';
import { imohashOfFile } from './hash';
import { uploadVideo } from './upload';

type Phase =
    | { name: 'idle' }
    | { name: 'uploading'; sent: number; total: number }
    | { name: 'complete'; deduplicated: boolean }
    | { name: 'error'; message: string; unconfigured: boolean };

/** Whether the registry already knows a clip with this content, and a link if so. */
const VideoMatch = ({ contentHash }: { contentHash: string }) => {
    const { data, isPending } = useGetList<VideoAsset>('videos', {
        filter: { hash: contentHash },
        pagination: { page: 1, perPage: 1 },
        sort: { field: 'created_at', order: 'DESC' },
    });
    if (isPending) return null;
    const video = data?.[0];
    if (!video) {
        return (
            <Typography variant="body2">
                Stored, but no registered clip carries this hash. It attaches to one when a
                device that holds the same file syncs.
            </Typography>
        );
    }
    return (
        <Typography variant="body2">
            This content is registered as the clip{' '}
            <Link to={`/videos/${video.id}/show`}>{video.file_name}</Link>.
        </Typography>
    );
};

const Progress = ({ phase }: { phase: Phase }) => {
    switch (phase.name) {
        case 'uploading':
            return (
                <Box>
                    <Typography variant="body2" gutterBottom>
                        Uploading part {Math.min(phase.sent + 1, phase.total)} of {phase.total}
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={(phase.sent / phase.total) * 100}
                    />
                </Box>
            );
        default:
            return null;
    }
};

const UploadPage = () => {
    const dataProvider = useDataProvider<DrmDataProvider>();
    const [file, setFile] = useState<File | null>(null);
    const [contentHash, setContentHash] = useState<string | null>(null);
    const [phase, setPhase] = useState<Phase>({ name: 'idle' });
    // The hash-upload-poll chain outlives renders, so state writes after unmount
    // are gated on this rather than surfacing React warnings.
    const alive = useRef(true);
    useEffect(() => {
        alive.current = true;
        return () => {
            alive.current = false;
        };
    }, []);

    const send = async (picked: File) => {
        setFile(picked);
        setContentHash(null);
        if (picked.size === 0) {
            setPhase({
                name: 'error',
                message: 'The file is empty, and the archive refuses empty content.',
                unconfigured: false,
            });
            return;
        }
        try {
            // Sampled, so this is instant even for a 4 GB chapter.
            const hash = await imohashOfFile(picked);
            if (!alive.current) return;
            setContentHash(hash);
            setPhase({ name: 'uploading', sent: 0, total: 1 });
            const outcome = await uploadVideo(dataProvider, picked, hash, (sent, total) => {
                if (alive.current) setPhase({ name: 'uploading', sent, total });
            });
            if (!alive.current) return;
            setPhase({ name: 'complete', deduplicated: outcome.deduplicated });
        } catch (error) {
            if (!alive.current) return;
            if (error instanceof HttpError && error.status === 503) {
                setPhase({ name: 'error', message: error.message, unconfigured: true });
                return;
            }
            setPhase({
                name: 'error',
                message: error instanceof Error ? error.message : 'The upload failed.',
                unconfigured: false,
            });
        }
    };

    const pick = (event: ChangeEvent<HTMLInputElement>) => {
        const picked = event.target.files?.[0];
        // The same file can be picked again after a failure.
        event.target.value = '';
        if (picked) send(picked);
    };

    const busy = phase.name === 'uploading';

    return (
        <>
            <Title title="Upload to the archive" />
            <Card sx={{ mt: 2, maxWidth: 760 }}>
                <CardContent>
                    <Stack spacing={2}>
                        <Typography variant="h6">Upload to the archive</Typography>

                        <Box>
                            <Button
                                component="label"
                                variant="contained"
                                startIcon={<CloudUploadIcon />}
                                disabled={busy}
                            >
                                Choose a video file
                                <input type="file" hidden onChange={pick} />
                            </Button>
                        </Box>

                        {file && (
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                {file.name} · {formatBytes(file.size)}
                                {contentHash ? ` · ${contentHash}` : ''}
                            </Typography>
                        )}

                        <Progress phase={phase} />

                        {phase.name === 'complete' && (
                            <>
                                <Alert severity="success">
                                    {phase.deduplicated
                                        ? 'Already archived, so nothing was sent.'
                                        : 'Stored.'}
                                </Alert>
                                {contentHash && <VideoMatch contentHash={contentHash} />}
                            </>
                        )}

                        {phase.name === 'error' &&
                            (phase.unconfigured ? (
                                <Alert severity="warning">
                                    The archive is not configured on this registry, so nothing
                                    can be uploaded. An administrator has to set the S3
                                    environment on the server first.
                                </Alert>
                            ) : (
                                <Alert severity="error">{phase.message}</Alert>
                            ))}
                    </Stack>
                </CardContent>
            </Card>
        </>
    );
};

export default UploadPage;
