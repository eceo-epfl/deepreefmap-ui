import {
    Datagrid,
    DateField,
    EditButton,
    Labeled,
    NumberField,
    Pagination,
    ReferenceManyField,
    Show,
    TextField,
    TopToolbar,
} from 'react-admin';
import { Grid, Stack, Typography } from '@mui/material';

import { SyncFields, TombstoneButton } from '../components';
import { useCanAuthor } from '../permissions';

const CameraProfileShowActions = () => {
    const canAuthor = useCanAuthor();
    return (
        <TopToolbar>
            {canAuthor && <EditButton />}
            <TombstoneButton noun="camera profile" />
        </TopToolbar>
    );
};

const CameraProfileShow = () => (
    <Show actions={<CameraProfileShowActions />}>
        <Stack spacing={2} sx={{ p: 2 }}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Labeled label="Name">
                        <TextField source="name" />
                    </Labeled>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Labeled label="Description">
                        <TextField source="description" emptyText="—" />
                    </Labeled>
                </Grid>
            </Grid>

            <Typography variant="h6">Calibrations</Typography>
            <Typography variant="body2" color="text.secondary">
                Each is one measurement of this rig. Versions coexist: a housing change
                invalidates the last measurement without invalidating the runs made under it.
                Laptops resolve the newest.
            </Typography>
            <ReferenceManyField
                reference="camera_calibrations"
                target="camera_profile_id"
                sort={{ field: 'version', order: 'DESC' }}
                pagination={<Pagination />}
                label={false}
            >
                <Datagrid rowClick={false} bulkActionButtons={false}>
                    <NumberField source="version" />
                    <TextField source="image_width" label="Width" emptyText="—" />
                    <TextField source="image_height" label="Height" emptyText="—" />
                    <NumberField
                        source="reprojection_error_px"
                        label="Reprojection error (px)"
                        options={{ maximumFractionDigits: 2 }}
                        emptyText="—"
                    />
                    <NumberField source="registered_frames" label="Frames" emptyText="—" />
                    <TextField source="source_clip" label="From clip" emptyText="—" />
                    <DateField source="created_at" label="Published" showTime />
                </Datagrid>
            </ReferenceManyField>

            <SyncFields />
        </Stack>
    </Show>
);

export default CameraProfileShow;
