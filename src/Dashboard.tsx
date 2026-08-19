import {
    Datagrid,
    DateField,
    ListContextProvider,
    ReferenceField,
    ResourceContextProvider,
    TextField,
    Title,
    useGetList,
    useList,
    usePermissions,
} from 'react-admin';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

import type { RunRecord, Transect } from './contract';
import Overview from './maps/Overview';
import StatusField from './runs/StatusField';

// A Keycloak login without a deepreefmap realm role. The API answers every route with a
// 403, so there is nothing to show and nothing worth requesting.
const NoAccess = () => (
    <Card sx={{ mt: 2, maxWidth: 620 }}>
        <CardContent>
            <Typography variant="h6" gutterBottom>
                You are signed in without access
            </Typography>
            <Typography
                variant="body2"
                sx={{
                    color: 'text.secondary',
                }}
            >
                Ask an administrator for the member or administrator role, then sign in again.
            </Typography>
        </CardContent>
    </Card>
);

const RECENT = 8;

const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card sx={{ flex: 1, minWidth: 320 }}>
        <CardContent>
            <Typography
                variant="overline"
                sx={{
                    color: 'text.secondary',
                }}
            >
                {title}
            </Typography>
            {children}
        </CardContent>
    </Card>
);

const Nothing = ({ what }: { what: string }) => (
    <Typography
        variant="body2"
        sx={{
            color: 'text.secondary',
            mt: 1,
        }}
    >
        No {what} yet.
    </Typography>
);

const LatestRuns = () => {
    const { data, isPending } = useGetList<RunRecord>('runs', {
        pagination: { page: 1, perPage: RECENT },
        sort: { field: 'started_at', order: 'DESC' },
    });
    const context = useList({ data, isPending, perPage: RECENT });
    if (!isPending && !data?.length) return <Nothing what="uploads" />;

    return (
        // The resource context is what lets rowClick resolve a show route from here.
        <ResourceContextProvider value="runs">
            <ListContextProvider value={context}>
                <Datagrid rowClick="show" bulkActionButtons={false}>
                    <ReferenceField
                        source="pass_id"
                        reference="passes"
                        link="show"
                        label="Pass"
                    >
                        <TextField source="label" emptyText="unnamed" />
                    </ReferenceField>
                    <DateField source="started_at" label="Ran" showTime sortable={false} />
                    <StatusField label="Status" />
                </Datagrid>
            </ListContextProvider>
        </ResourceContextProvider>
    );
};

const RecentlyChanged = () => {
    const { data, isPending } = useGetList<Transect>('transects', {
        pagination: { page: 1, perPage: RECENT },
        sort: { field: 'updated_at', order: 'DESC' },
    });
    const context = useList({ data, isPending, perPage: RECENT });
    if (!isPending && !data?.length) return <Nothing what="transects" />;

    return (
        <ResourceContextProvider value="transects">
            <ListContextProvider value={context}>
                <Datagrid rowClick="show" bulkActionButtons={false}>
                    <TextField source="name" sortable={false} />
                    <ReferenceField
                        source="site_id"
                        reference="sites"
                        link="show"
                        emptyText="unassigned"
                        sortable={false}
                    >
                        <TextField source="name" />
                    </ReferenceField>
                    <DateField source="updated_at" label="Changed" showTime sortable={false} />
                </Datagrid>
            </ListContextProvider>
        </ResourceContextProvider>
    );
};

const Dashboard = () => {
    const { permissions, isPending } = usePermissions();
    if (isPending) return null;

    if (permissions !== 'admin' && permissions !== 'user') {
        return (
            <>
                <Title title="DeepReefMap" />
                <NoAccess />
            </>
        );
    }

    return (
        <>
            <Title title="DeepReefMap" />
            <Stack spacing={2} sx={{ mt: 2 }}>
                <Box sx={{ '& .leaflet-container': { borderRadius: 1 } }}>
                    <Overview />
                </Box>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Panel title="Latest uploads">
                        <LatestRuns />
                    </Panel>
                    <Panel title="Recently changed transects">
                        <RecentlyChanged />
                    </Panel>
                </Stack>
            </Stack>
        </>
    );
};

export default Dashboard;
