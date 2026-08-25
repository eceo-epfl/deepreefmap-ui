import {
    CreateButton,
    Datagrid,
    ExportButton,
    List,
    NumberField,
    ReferenceField,
    ReferenceInput,
    SearchInput,
    SelectInput,
    TextField,
    TopToolbar,
    useListContext,
} from 'react-admin';
import { Stack, Typography } from '@mui/material';

import { ValidatedField, ValidateSelectedButton } from '../components';
import type { Transect } from '../contract';
import { GLOSSARY } from '../contract/glossary';
import { TransectMapAll } from '../maps/Transects';
import { useCanAuthor } from '../permissions';
import AssignSiteButton from './AssignSiteButton';

const transectFilters = [
    <SearchInput source="q" alwaysOn key="q" />,
    <ReferenceInput source="site_id" reference="sites" key="site_id">
        <SelectInput optionText="name" label="Site" />
    </ReferenceInput>,
];

const TransectListActions = () => {
    const canAuthor = useCanAuthor();
    return (
        <TopToolbar>
            {canAuthor && <CreateButton />}
            <ExportButton />
        </TopToolbar>
    );
};

const TransectListEmpty = () => {
    const canAuthor = useCanAuthor();
    return (
        <Stack
            spacing={2}
            sx={{
                alignItems: 'center',
                p: 6,
                textAlign: 'center',
            }}
        >
            <Typography variant="h6">No transects yet</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {GLOSSARY.transects}
            </Typography>
            {canAuthor && <CreateButton label="Create transect" />}
        </Stack>
    );
};

const TransectListBody = () => {
    const { filterValues } = useListContext<Transect>();
    const canAuthor = useCanAuthor();

    return (
        <>
            <TransectMapAll filter={filterValues} />
            <Datagrid
                rowClick="show"
                bulkActionButtons={
                    canAuthor ? (
                        <>
                            <AssignSiteButton />
                            <ValidateSelectedButton
                                section="transects"
                                sendable={record => record.site_id != null}
                                skipReason="no site"
                            />
                        </>
                    ) : (
                        false
                    )
                }
            >
                <TextField source="name" />
                <ReferenceField
                    source="site_id"
                    reference="sites"
                    link="show"
                    sortable={false}
                    emptyText="unassigned"
                >
                    <TextField source="name" />
                </ReferenceField>
                <NumberField source="length_m" label="Length (m)" />
                <NumberField source="depth_m" label="Depth (m)" />
                <ValidatedField label="Validated" sortable={false} />
            </Datagrid>
        </>
    );
};

const TransectList = () => (
    <List
        filters={transectFilters}
        actions={<TransectListActions />}
        empty={<TransectListEmpty />}
        sort={{ field: 'name', order: 'ASC' }}
        perPage={25}
    >
        <TransectListBody />
    </List>
);

export default TransectList;
