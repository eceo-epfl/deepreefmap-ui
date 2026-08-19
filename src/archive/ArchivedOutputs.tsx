import {
    Datagrid,
    FunctionField,
    Pagination,
    ReferenceField,
    ReferenceManyField,
    useRecordContext,
} from 'react-admin';
import { Typography } from '@mui/material';

import { asColumn } from '../components';
import type { RunArtifact, StoredObject } from '../contract';
import { SizeField } from '../videos/VideoFields';
import DownloadButton from './DownloadButton';
import StatusField from './StatusField';

const SizeColumn = asColumn(SizeField);

const NoArtifacts = () => (
    <Typography
        variant="body2"
        sx={{
            color: 'text.secondary',
            p: 1,
        }}
    >
        No outputs archived for this run yet. Artefacts appear once a client uploads the run
        directory.
    </Typography>
);

// The download route answers 409 until the linked object is complete.
const CompleteDownload = () => {
    const object = useRecordContext<StoredObject>();
    if (!object || object.status !== 'complete') return null;
    return <DownloadButton objectId={object.id} />;
};

/** The run directory files a client archived, each through its stored object. */
const ArchivedOutputs = () => (
    <ReferenceManyField
        reference="run_artifacts"
        target="run_id"
        sort={{ field: 'relpath', order: 'ASC' }}
        perPage={25}
        pagination={<Pagination />}
    >
        <Datagrid bulkActionButtons={false} empty={<NoArtifacts />} rowClick={false}>
            <FunctionField<RunArtifact>
                label="Path"
                render={artifact => (
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {artifact.relpath}
                    </Typography>
                )}
            />
            <SizeColumn label="Size" source="size_bytes" sortable={false} />
            <ReferenceField
                source="stored_object_id"
                reference="stored_objects"
                link="show"
                label="Archive"
                sortable={false}
                emptyText="—"
            >
                <StatusField />
            </ReferenceField>
            <ReferenceField
                source="stored_object_id"
                reference="stored_objects"
                link={false}
                label={false}
                sortable={false}
            >
                <CompleteDownload />
            </ReferenceField>
        </Datagrid>
    </ReferenceManyField>
);

export default ArchivedOutputs;
