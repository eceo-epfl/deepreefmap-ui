import { Dispatch, SetStateAction, useState } from 'react';
import {
    Button,
    Datagrid,
    DateField,
    ExportButton,
    List,
    SearchInput,
    TextField,
    TextInput,
    TopToolbar,
} from 'react-admin';
import { Link } from 'react-router-dom';
import { Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import AddLinkIcon from '@mui/icons-material/AddLink';

import { AccountField } from '../components';
import DeviceStatusField from './DeviceStatusField';
import RelativeDateField, { STALE_AFTER_SECONDS } from './RelativeDateField';

type Visibility = 'all' | 'active' | 'revoked';

// `revoked_at_neq: null` is the registry's is-not-null form. These go through the List
// `filter` prop rather than the filter form, which strips null values.
const VISIBILITY_FILTERS: Record<Visibility, Record<string, null>> = {
    all: {},
    active: { revoked_at: null },
    revoked: { revoked_at_neq: null },
};

const deviceFilters = [
    <SearchInput source="q" alwaysOn placeholder="Name" key="q" />,
    <TextInput source="platform" key="platform" />,
    <TextInput source="gui_version" label="GUI version" key="gui_version" />,
];

const ConnectButton = () => (
    <Button component={Link} to="/devices/connect" label="Connect a device">
        <AddLinkIcon />
    </Button>
);

const DeviceListEmpty = () => (
    <Stack
        spacing={2}
        sx={{
            alignItems: 'flex-start',
            p: 3,
        }}
    >
        <Typography variant="h6">No devices are enrolled yet</Typography>
        <Typography
            variant="body2"
            sx={{
                color: 'text.secondary',
            }}
        >
            Mint a connect code and paste it into the desktop app once. It names itself at
            enrolment.
        </Typography>
        <ConnectButton />
    </Stack>
);

const DeviceListActions = ({
    visibility,
    onVisibilityChange,
}: {
    visibility: Visibility;
    onVisibilityChange: Dispatch<SetStateAction<Visibility>>;
}) => (
    <TopToolbar>
        <ToggleButtonGroup
            size="small"
            exclusive
            value={visibility}
            onChange={(_, next: Visibility | null) => next && onVisibilityChange(next)}
        >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="active">Active</ToggleButton>
            <ToggleButton value="revoked">Revoked</ToggleButton>
        </ToggleButtonGroup>
        <ConnectButton />
        <ExportButton />
    </TopToolbar>
);

const DeviceList = () => {
    const [visibility, setVisibility] = useState<Visibility>('all');

    return (
        <List
            filters={deviceFilters}
            filter={VISIBILITY_FILTERS[visibility]}
            actions={
                <DeviceListActions
                    visibility={visibility}
                    onVisibilityChange={setVisibility}
                />
            }
            empty={<DeviceListEmpty />}
            sort={{ field: 'created_at', order: 'DESC' }}
            perPage={25}
        >
            <Datagrid
                rowClick="show"
                bulkActionButtons={false}
                rowSx={record => (record.revoked_at ? { opacity: 0.55 } : {})}
            >
                <TextField source="name" label="Device name" />
                <DeviceStatusField label="Status" />
                <TextField source="platform" emptyText="—" sortable={false} />
                <TextField
                    source="gui_version"
                    label="GUI version"
                    emptyText="—"
                    sortable={false}
                />
                <TextField
                    source="library_version"
                    label="Library version"
                    emptyText="—"
                    sortable={false}
                />
                <AccountField source="enrolled_by" label="Onboarded by" sortable={false} />
                <DateField source="created_at" label="Enrolled" showTime />
                <RelativeDateField
                    source="last_seen_at"
                    label="Last seen"
                    staleAfter={STALE_AFTER_SECONDS}
                />
            </Datagrid>
        </List>
    );
};

export default DeviceList;
