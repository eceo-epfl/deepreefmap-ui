import {
    EditButton,
    FunctionField,
    Labeled,
    Loading,
    NumberField,
    ReferenceField,
    Show,
    TabbedShowLayout,
    TextField,
    TopToolbar,
    useRecordContext,
} from 'react-admin';
import { Alert, Box, Grid, Stack } from '@mui/material';

import ProposedChangesPanel from '../changes/ProposedChangesPanel';
import { CoordinateField, SyncFields, TombstoneButton, ValidateButton } from '../components';
import { useCanAuthor } from '../permissions';
import type { Transect } from '../contract';
import Statistics from '../cover/Statistics';
import { TransectMapOne } from '../maps/Transects';
import { AssignSiteRecordButton } from './AssignSiteButton';
import TransectPasses from './TransectPasses';

const TransectShowActions = () => {
    const record = useRecordContext<Transect>();
    const canAuthor = useCanAuthor();
    return (
        <TopToolbar>
            <ValidateButton
                section="transects"
                disabledReason={record?.site_id == null ? 'Assign a site first' : undefined}
            />
            {canAuthor && <EditButton />}
            <TombstoneButton noun="transect" />
        </TopToolbar>
    );
};

const TransectMap = () => {
    const record = useRecordContext<Transect>();
    if (!record) return <Loading />;
    return <TransectMapOne record={record} />;
};

const accuracy = (value: number | null | undefined) => (value == null ? '' : ` ±${value} m`);

const NoSiteWarning = () => {
    const record = useRecordContext<Transect>();
    const canAuthor = useCanAuthor();
    if (!record || record.site_id != null) return null;
    return (
        <Alert severity="warning" action={canAuthor ? <AssignSiteRecordButton /> : undefined}>
            No site. Validation needs one.
        </Alert>
    );
};

const TransectHeader = () => (
    <Grid container spacing={2} sx={{ p: 2 }}>
        <Grid size={12}>
            <Stack spacing={1}>
                <NoSiteWarning />
                <ProposedChangesPanel section="transects" />
            </Stack>
        </Grid>
        <Grid
            size={{
                xs: 12,
                md: 4,
            }}
        >
            <Grid container spacing={2}>
                <Grid size={6}>
                    <Labeled label="Name">
                        <TextField source="name" />
                    </Labeled>
                </Grid>
                <Grid size={6}>
                    <Labeled label="Site">
                        <ReferenceField
                            source="site_id"
                            reference="sites"
                            link="show"
                            emptyText="—"
                        >
                            <TextField source="name" />
                        </ReferenceField>
                    </Labeled>
                </Grid>
                <Grid size={6}>
                    <Labeled label="Length (m)">
                        <NumberField source="length_m" emptyText="—" />
                    </Labeled>
                </Grid>
                <Grid size={6}>
                    <Labeled label="Depth (m)">
                        <NumberField source="depth_m" emptyText="—" />
                    </Labeled>
                </Grid>
                <Grid size={6}>
                    <Labeled label="Start depth (m)">
                        <NumberField source="start_depth_m" emptyText="—" />
                    </Labeled>
                </Grid>
                <Grid size={6}>
                    <Labeled label="End depth (m)">
                        <NumberField source="end_depth_m" emptyText="—" />
                    </Labeled>
                </Grid>
                <Grid size={12}>
                    <Labeled label="Description">
                        <TextField source="description" emptyText="—" />
                    </Labeled>
                </Grid>
                <Grid size={12}>
                    <Labeled label="Start">
                        <FunctionField<Transect>
                            render={record => (
                                <>
                                    <CoordinateField
                                        latSource="start_lat"
                                        lonSource="start_lon"
                                    />
                                    {accuracy(record.start_accuracy_m)}
                                </>
                            )}
                        />
                    </Labeled>
                </Grid>
                <Grid size={12}>
                    <Labeled label="End">
                        <FunctionField<Transect>
                            render={record => (
                                <>
                                    <CoordinateField latSource="end_lat" lonSource="end_lon" />
                                    {accuracy(record.end_accuracy_m)}
                                </>
                            )}
                        />
                    </Labeled>
                </Grid>
            </Grid>
        </Grid>
        <Grid
            size={{
                xs: 12,
                md: 8,
            }}
        >
            <TransectMap />
        </Grid>
    </Grid>
);

const TransectShow = () => (
    <Show actions={<TransectShowActions />}>
        <>
            <TransectHeader />
            <TabbedShowLayout>
                <TabbedShowLayout.Tab label="Passes">
                    <TransectPasses />
                </TabbedShowLayout.Tab>
                <TabbedShowLayout.Tab label="Statistics">
                    <Statistics />
                </TabbedShowLayout.Tab>
            </TabbedShowLayout>
            <Box sx={{ p: 2 }}>
                <SyncFields />
            </Box>
        </>
    </Show>
);

export default TransectShow;
