import {
    CreateButton,
    Datagrid,
    ExportButton,
    List,
    SearchInput,
    TextField,
    TextInput,
    TopToolbar,
} from 'react-admin';
import { Box, Typography } from '@mui/material';

import { SiteMapAll } from '../maps/Sites';
import { useCanAuthor } from '../permissions';

const siteFilters = [
    <SearchInput source="q" alwaysOn key="q" />,
    <TextInput source="country" key="country" />,
    <TextInput source="region" key="region" />,
];

const SiteListActions = () => {
    const canAuthor = useCanAuthor();
    return (
        <TopToolbar>
            {canAuthor && <CreateButton />}
            <ExportButton />
        </TopToolbar>
    );
};

const SiteEmpty = () => {
    const canAuthor = useCanAuthor();
    return (
        <Box
            sx={{
                textAlign: 'center',
                m: 4,
            }}
        >
            <Typography variant="h6" gutterBottom>
                No sites yet
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                A site is a named reef location. Define one here, then add the transects the
                divers will swim, and the desktop clients will pick both up on their next sync.
            </Typography>
            {canAuthor && <CreateButton label="Create the first site" />}
        </Box>
    );
};

const SiteList = () => (
    <List
        actions={<SiteListActions />}
        filters={siteFilters}
        sort={{ field: 'name', order: 'ASC' }}
        perPage={25}
        empty={<SiteEmpty />}
    >
        <SiteMapAll />
        <Datagrid rowClick="show" bulkActionButtons={false}>
            <TextField source="name" />
            <TextField source="country" emptyText="—" />
            <TextField source="region" emptyText="—" sortable={false} />
        </Datagrid>
    </List>
);

export default SiteList;
