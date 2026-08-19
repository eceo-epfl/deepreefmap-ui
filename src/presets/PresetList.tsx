import {
    CreateButton,
    Datagrid,
    DateField,
    ExportButton,
    List,
    NumberField,
    TextField,
    TopToolbar,
} from 'react-admin';
import { Box, Typography } from '@mui/material';

import { useCanAuthor } from '../permissions';

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
                A preset is a named, versioned settings document the desktop application pulls,
                so every laptop reconstructs with the same parameters.
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
            <DateField source="updated_at" label="Updated" showTime />
        </Datagrid>
    </List>
);

export default PresetList;
