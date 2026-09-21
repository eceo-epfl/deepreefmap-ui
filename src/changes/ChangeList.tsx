import {
    Datagrid,
    DateField,
    FunctionField,
    List,
    ReferenceField,
    SelectInput,
    TextField,
    TextInput,
} from 'react-admin';
import { Box, Typography } from '@mui/material';

import type { Change } from '../contract';
import { GLOSSARY } from '../contract/glossary';
import DecisionButtons from './DecisionButtons';
import StatusField, { statusChoices } from './StatusField';

const changeFilters = [
    <SelectInput key="status" source="status" choices={statusChoices} alwaysOn />,
    <TextInput key="table_key" source="table_key" label="Section" />,
    <TextInput key="row_id" source="row_id" label="Row id" />,
];

const ChangeEmpty = () => (
    <Box sx={{ textAlign: 'center', m: 4 }}>
        <Typography variant="h6" gutterBottom>
            No changes recorded yet
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {GLOSSARY.changes}
        </Typography>
    </Box>
);

const Author = () => (
    <FunctionField<Change>
        label="By"
        sortable={false}
        render={record =>
            record.device_id ? (
                <ReferenceField source="device_id" reference="devices" link="show">
                    <TextField source="name" />
                </ReferenceField>
            ) : (
                <span>{record.author ?? 'console'}</span>
            )
        }
    />
);

/** The ledger, proposals first: what laptops sent that a curator has yet to decide. */
const ChangeList = () => (
    <List
        filters={changeFilters}
        filterDefaultValues={{ status: 'proposed' }}
        sort={{ field: 'seq', order: 'DESC' }}
        perPage={50}
        empty={<ChangeEmpty />}
    >
        <Datagrid rowClick="show" bulkActionButtons={false}>
            <TextField source="seq" label="#" />
            <StatusField label="Status" sortable={false} />
            <TextField source="table_key" label="Section" />
            <TextField source="reason" emptyText="—" sortable={false} />
            <Author />
            <DateField source="created_at" showTime />
            <FunctionField<Change>
                label="Fields"
                sortable={false}
                render={record => Object.keys(record.patch ?? {}).join(', ') || '—'}
            />
            <DecisionButtons />
        </Datagrid>
    </List>
);

export default ChangeList;
