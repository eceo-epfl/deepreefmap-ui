import {
    DateField,
    Labeled,
    Show,
    TextField,
    TopToolbar,
    useGetList,
    useRecordContext,
} from 'react-admin';
import { Link } from 'react-router-dom';
import { Alert, Stack, Typography } from '@mui/material';

import { HashField } from '../components';
import type { RunArtifact, StoredObject, VideoAsset } from '../contract';
import { SizeField } from '../videos/VideoFields';
import DownloadButton from './DownloadButton';
import StatusField from './StatusField';
import { UploaderField } from './StoredObjectList';

const StoredObjectActions = () => {
    const record = useRecordContext<StoredObject>();
    return (
        <TopToolbar>
            {/* The download route answers 409 until the object is complete. */}
            {record?.status === 'complete' && <DownloadButton objectId={record.id} />}
        </TopToolbar>
    );
};

const FailureNotice = () => {
    const record = useRecordContext<StoredObject>();
    if (record?.status !== 'failed') return null;
    return <Alert severity="error">{record.failure ?? 'The upload failed.'}</Alert>;
};

const NoConsumers = ({ children }: { children: string }) => (
    <Typography
        variant="body2"
        sx={{
            color: 'text.secondary',
        }}
    >
        {children}
    </Typography>
);

// Clips reference the archive by content hash, not by object id, so the join
// runs over `hash` here.
const VideoConsumers = ({ contentHash }: { contentHash: string }) => {
    const { data, isPending } = useGetList<VideoAsset>('videos', {
        pagination: { page: 1, perPage: 25 },
        sort: { field: 'file_name', order: 'ASC' },
        filter: { hash: contentHash },
    });
    if (isPending) return null;
    if (!data?.length) {
        return <NoConsumers>No registered clip carries this hash.</NoConsumers>;
    }
    return (
        <Stack spacing={0.5}>
            {data.map(video => (
                <Typography key={video.id} variant="body2">
                    <Link to={`/videos/${video.id}/show`}>{video.file_name}</Link>
                </Typography>
            ))}
        </Stack>
    );
};

const ArtifactConsumers = ({ objectId }: { objectId: string }) => {
    const { data, isPending } = useGetList<RunArtifact>('run_artifacts', {
        pagination: { page: 1, perPage: 25 },
        sort: { field: 'relpath', order: 'ASC' },
        filter: { stored_object_id: objectId },
    });
    if (isPending) return null;
    if (!data?.length) {
        return <NoConsumers>No run artefact links this object.</NoConsumers>;
    }
    return (
        <Stack spacing={0.5}>
            {data.map(artifact => (
                <Stack
                    key={artifact.id}
                    direction="row"
                    spacing={1}
                    useFlexGap
                    sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}
                >
                    <Typography variant="body2">
                        <Link to={`/runs/${artifact.run_id}/show`}>Run</Link>
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {artifact.relpath}
                    </Typography>
                </Stack>
            ))}
        </Stack>
    );
};

/** The rows that reference this blob, so an object explains why it is kept. */
const UsedByPanel = () => {
    const record = useRecordContext<StoredObject>();
    if (!record) return null;
    return (
        <Labeled label="Used by">
            {record.kind === 'video' ? (
                <VideoConsumers contentHash={record.content_hash} />
            ) : (
                <ArtifactConsumers objectId={record.id} />
            )}
        </Labeled>
    );
};

const ObjectTitle = () => {
    const record = useRecordContext<StoredObject>();
    return <span>{record ? `Object ${record.content_hash}` : 'Object'}</span>;
};

// The bucket layout is the server's business, so `s3_key` stays off the page.
const StoredObjectShow = () => (
    <Show title={<ObjectTitle />} actions={<StoredObjectActions />}>
        <Stack spacing={2} sx={{ p: 2 }}>
            <FailureNotice />
            <Labeled label="Content hash">
                <HashField source="content_hash" abbreviate={false} />
            </Labeled>
            <Stack
                direction="row"
                spacing={3}
                useFlexGap
                sx={{
                    flexWrap: 'wrap',
                }}
            >
                <Labeled label="Status">
                    <StatusField />
                </Labeled>
                <Labeled label="Kind">
                    <TextField source="kind" />
                </Labeled>
                <Labeled label="Size">
                    <SizeField />
                </Labeled>
                <Labeled label="Uploaded by">
                    <UploaderField />
                </Labeled>
            </Stack>
            <Stack
                direction="row"
                spacing={3}
                useFlexGap
                sx={{
                    flexWrap: 'wrap',
                }}
            >
                <Labeled label="Created">
                    <DateField source="created_at" showTime />
                </Labeled>
                <Labeled label="Last part">
                    <DateField source="last_part_at" showTime emptyText="—" />
                </Labeled>
                <Labeled label="Verified">
                    <DateField source="completed_at" showTime emptyText="—" />
                </Labeled>
            </Stack>
            <UsedByPanel />
        </Stack>
    </Show>
);

export default StoredObjectShow;
