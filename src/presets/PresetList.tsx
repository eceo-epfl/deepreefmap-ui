import {
    CreateButton,
    Datagrid,
    DateField,
    ExportButton,
    List,
    NumberField,
    TextField,
    TopToolbar,
    useGetList,
    useRecordContext,
} from 'react-admin';
import { Box, Typography } from '@mui/material';

import { asColumn } from '../components';
import type { Device, Preset } from '../contract';
import { GLOSSARY } from '../contract/glossary';
import { useCanAuthor } from '../permissions';

// Every row runs the identical query, so react-admin's cache answers the whole
// column from one request.
const AssignedCountField = () => {
    const record = useRecordContext<Preset>();
    const { data } = useGetList<Device>('devices', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'name', order: 'ASC' },
        filter: { revoked_at: null },
    });
    if (!record || !data) return <span>—</span>;
    return (
        <span>{data.filter(device => device.assigned_preset_id === record.id).length}</span>
    );
};

const AssignedCountColumn = asColumn(AssignedCountField);

const PresetListActions = () => {
    const canAuthor = useCanAuthor();
    return (
        <TopToolbar>
            {canAuthor && <CreateButton />}
            <ExportButton />
        </TopToolbar>
    );
};

const PresetEmpty = () => {
    const canAuthor = useCanAuthor();
    return (
        <Box
            sx={{
                textAlign: 'center',
                m: 4,
            }}
        >
            <Typography variant="h6" gutterBottom>
                No presets yet
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                {GLOSSARY.presets}
            </Typography>
            {canAuthor && <CreateButton label="Create the first preset" />}
        </Box>
    );
};

const PresetList = () => (
    <List
        actions={<PresetListActions />}
        sort={{ field: 'updated_at', order: 'DESC' }}
        perPage={25}
        empty={<PresetEmpty />}
    >
        <Datagrid rowClick="show" bulkActionButtons={false}>
            <TextField source="name" />
            <NumberField source="version" />
            <TextField source="description" emptyText="—" sortable={false} />
            <AssignedCountColumn label="Assigned devices" sortable={false} />
            <DateField source="updated_at" label="Updated" showTime />
        </Datagrid>
    </List>
);

export default PresetList;
