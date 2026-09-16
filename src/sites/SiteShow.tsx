import {
    CreateButton,
    Datagrid,
    EditButton,
    FunctionField,
    Labeled,
    Loading,
    NumberField,
    Pagination,
    ReferenceManyField,
    Show,
    SimpleShowLayout,
    TextField,
    TopToolbar,
    useRecordContext,
} from 'react-admin';
import { Box, Divider, Grid, Typography } from '@mui/material';

import ProposedChangesPanel from '../changes/ProposedChangesPanel';
import { CoordinateField, SyncFields, TombstoneButton, ValidateButton } from '../components';
import { useCanAuthor } from '../permissions';
import { SiteMapOne } from '../maps/Sites';
import type { Site, Transect } from '../contract';

const SiteShowActions = () => {
    const canAuthor = useCanAuthor();
    return (
        <TopToolbar>
            <ValidateButton section="sites" />
            {canAuthor && <EditButton />}
            <TombstoneButton noun="site" />
        </TopToolbar>
    );
};

const SiteMap = () => {
    const record = useRecordContext<Site>();
    if (!record) return <Loading />;
    return <SiteMapOne record={record} />;
};

const NoTransects = () => (
    <Typography
        variant="body2"
        sx={{
            color: 'text.secondary',
        }}
    >
        No transects yet.
    </Typography>
);

const SiteTransects = () => {
    const canAuthor = useCanAuthor();
    const record = useRecordContext<Site>();
    return (
        <Box>
            <Typography
                variant="overline"
                sx={{
                    color: 'text.secondary',
                }}
            >
                Transects
            </Typography>
            <ReferenceManyField
                reference="transects"
                target="site_id"
                sort={{ field: 'name', order: 'ASC' }}
                perPage={10}
                pagination={<Pagination />}
            >
                <Datagrid rowClick="show" bulkActionButtons={false} empty={<NoTransects />}>
                    <TextField source="name" />
                    <NumberField source="length_m" label="Length (m)" emptyText="—" />
                    <NumberField source="depth_m" label="Depth (m)" emptyText="—" />
                    <FunctionField<Transect>
                        label="Start"
                        render={record =>
                            record.start_lat == null
                                ? '—'
                                : `${record.start_lat}°, ${record.start_lon}°`
                        }
                    />
                    <FunctionField<Transect>
                        label="End"
                        render={record =>
                            record.end_lat == null
                                ? '—'
                                : `${record.end_lat}°, ${record.end_lon}°`
                        }
                    />
                </Datagrid>
            </ReferenceManyField>
            {canAuthor && record && (
                <Box
                    sx={{
                        mt: 1,
                    }}
                >
                    <CreateButton
                        resource="transects"
                        label="Add transect"
                        state={{ record: { site_id: record.id } }}
                    />
                </Box>
            )}
        </Box>
    );
};

const SiteShow = () => (
    <Show actions={<SiteShowActions />}>
        <SimpleShowLayout>
            <ProposedChangesPanel section="sites" />
            <Grid container spacing={2}>
                <Grid
                    size={{
                        xs: 12,
                        md: 5,
                    }}
                >
                    <Labeled label="Name">
                        <TextField source="name" />
                    </Labeled>
                    <Labeled label="Country">
                        <TextField source="country" emptyText="—" />
                    </Labeled>
                    <Labeled label="Region">
                        <TextField source="region" emptyText="—" />
                    </Labeled>
                    <Labeled label="Coordinates">
                        <CoordinateField latSource="latitude" lonSource="longitude" />
                    </Labeled>
                    <Labeled label="Description">
                        <TextField source="description" emptyText="—" />
                    </Labeled>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        md: 7,
                    }}
                >
                    <SiteMap />
                </Grid>
            </Grid>
            <Divider />
            <SiteTransects />
            <Divider />
            <SyncFields />
        </SimpleShowLayout>
    </Show>
);

export default SiteShow;
