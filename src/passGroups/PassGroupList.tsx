import {
    CreateButton,
    Datagrid,
    DateField,
    ExportButton,
    List,
    TextField,
    TopToolbar,
} from 'react-admin';
import { Box, Typography } from '@mui/material';

import { useCanAuthor } from '../permissions';

const PassGroupListActions = () => {
    const canAuthor = useCanAuthor();
    return (
        <TopToolbar>
            {canAuthor && <CreateButton />}
            <ExportButton />
        </TopToolbar>
    );
};

const PassGroupEmpty = () => {
    const canAuthor = useCanAuthor();
    return (
        <Box
            sx={{
                textAlign: 'center',
                m: 4,
            }}
        >
            <Typography variant="h6" gutterBottom>
                No groups yet
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                A group names one survey event, finer than a campaign: one expedition can
                resurvey the same transect twice. Assign passes to a group from the passes
                list, and the statistics series orders itself by period label.
            </Typography>
            {canAuthor && <CreateButton label="Create the first group" />}
        </Box>
    );
};

const PassGroupList = () => (
    <List
        actions={<PassGroupListActions />}
        sort={{ field: 'period_label', order: 'ASC' }}
        perPage={25}
        empty={<PassGroupEmpty />}
    >
        <Datagrid rowClick="edit" bulkActionButtons={false}>
            <TextField source="name" />
            <TextField source="period_label" label="Period label" emptyText="—" />
            <DateField source="updated_at" label="Updated" showTime />
        </Datagrid>
    </List>
);

export default PassGroupList;
