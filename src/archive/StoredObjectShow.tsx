import {
    DateField,
    Labeled,
    Show,
    TextField,
    TopToolbar,
    useRecordContext,
} from 'react-admin';
import { Alert, Stack } from '@mui/material';

import { HashField } from '../components';
import type { StoredObject } from '../contract';
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
        </Stack>
    </Show>
);

export default StoredObjectShow;
