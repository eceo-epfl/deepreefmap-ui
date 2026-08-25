import {
    Datagrid,
    List,
    ReferenceField,
    SelectInput,
    TextField,
    useRecordContext,
} from 'react-admin';
import { Box, Typography } from '@mui/material';

import { AccountField, asColumn, HashField } from '../components';
import type { StoredObject } from '../contract';
import { STORED_OBJECT_STATUS_VALUES } from '../contract';
import RelativeDateField from '../devices/RelativeDateField';
import { SizeField } from '../videos/VideoFields';
import StatusField from './StatusField';

const HashColumn = asColumn(HashField);
const SizeColumn = asColumn(SizeField);
const StatusColumn = asColumn(StatusField);
const RelativeDateColumn = asColumn(RelativeDateField);

const statusChoices = STORED_OBJECT_STATUS_VALUES.map(id => ({ id, name: id }));

const archiveFilters = [
    <SelectInput key="status" source="status" label="Status" choices={statusChoices} />,
    <SelectInput
        key="kind"
        source="kind"
        label="Kind"
        choices={[
            { id: 'video', name: 'video' },
            { id: 'artifact', name: 'artifact' },
        ]}
    />,
];

/** A blob is sent by a device or by a person through the console, never both. */
export const UploaderField = ({
    emptyText = '—',
}: {
    label?: string;
    sortable?: boolean;
    emptyText?: string;
}) => {
    const record = useRecordContext<StoredObject>();
    if (!record) return null;
    if (record.uploaded_by_device_id) {
        return (
            <ReferenceField source="uploaded_by_device_id" reference="devices" link="show">
                <TextField source="name" />
            </ReferenceField>
        );
    }
    return <AccountField source="uploaded_by" emptyText={emptyText} />;
};

const ArchiveEmpty = () => (
    <Box sx={{ m: 4 }}>
        <Typography
            variant="body2"
            sx={{
                color: 'text.secondary',
            }}
        >
            No objects archived.
        </Typography>
    </Box>
);

// Rendered inside the overview's Objects tab; the tab is what the URL carries.
const StoredObjectList = () => (
    <List
        title={false}
        disableSyncWithLocation
        filters={archiveFilters}
        sort={{ field: 'created_at', order: 'DESC' }}
        perPage={50}
        empty={<ArchiveEmpty />}
    >
        <Datagrid rowClick="show" bulkActionButtons={false}>
            <HashColumn label="Content hash" source="content_hash" />
            <TextField source="kind" sortable={false} />
            <StatusColumn label="Status" sortable={false} />
            <SizeColumn label="Size" source="size_bytes" sortable={false} />
            <RelativeDateColumn
                label="Archived"
                source="completed_at"
                emptyText="—"
                sortable={false}
            />
            <UploaderField label="Uploaded by" sortable={false} />
        </Datagrid>
    </List>
);

export default StoredObjectList;
