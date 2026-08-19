import {
    CreateButton,
    Datagrid,
    DateField,
    ExportButton,
    List,
    SearchInput,
    TextField,
    TopToolbar,
} from 'react-admin';
import { Box, Typography } from '@mui/material';

import { useCanAuthor } from '../permissions';

const campaignFilters = [<SearchInput source="q" alwaysOn key="q" />];

const CampaignListActions = () => {
    const canAuthor = useCanAuthor();
    return (
        <TopToolbar>
            {canAuthor && <CreateButton />}
            <ExportButton />
        </TopToolbar>
    );
};

const CampaignEmpty = () => {
    const canAuthor = useCanAuthor();
    return (
        <Box
            sx={{
                textAlign: 'center',
                m: 4,
            }}
        >
            <Typography variant="h6" gutterBottom>
                No campaigns yet
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                A campaign is one expedition, named after its archive folder, for example
                2025_10_eritrea. One expedition visits many sites, and every pass the field
                team records is filed against it.
            </Typography>
            {canAuthor && <CreateButton label="Create the first campaign" />}
        </Box>
    );
};

const CampaignList = () => (
    <List
        actions={<CampaignListActions />}
        filters={campaignFilters}
        sort={{ field: 'begin_date', order: 'DESC' }}
        perPage={25}
        empty={<CampaignEmpty />}
    >
        <Datagrid rowClick="show" bulkActionButtons={false}>
            <TextField source="name" />
            <DateField source="begin_date" emptyText="—" />
            <DateField source="end_date" emptyText="—" />
        </Datagrid>
    </List>
);

export default CampaignList;
