import {
    Datagrid,
    DateField,
    EditButton,
    FunctionField,
    Labeled,
    NumberField,
    Pagination,
    ReferenceField,
    ReferenceManyField,
    Show,
    TextField,
    TopToolbar,
    useGetList,
    useRecordContext,
} from 'react-admin';
import { Alert, Chip, Grid, Stack, Typography } from '@mui/material';

import { SyncFields, TombstoneButton } from '../components';
import type { CameraCalibration, CameraProfile } from '../contract';
import { useCanAuthor } from '../permissions';
import DeployCalibrationButton from './DeployCalibrationButton';
import FollowNewestButton from './FollowNewestButton';

const CameraProfileShowActions = () => {
    const canAuthor = useCanAuthor();
    return (
        <TopToolbar>
            <FollowNewestButton />
            {canAuthor && <EditButton />}
            <TombstoneButton noun="camera profile" />
        </TopToolbar>
    );
};

/** The newest published calibration of the rig on display, deployed or not. */
const useNewest = (profileId?: string) => {
    const { data } = useGetList<CameraCalibration>(
        'camera_calibrations',
        {
            filter: { camera_profile_id: profileId },
            sort: { field: 'version', order: 'DESC' },
            pagination: { page: 1, perPage: 1 },
        },
        { enabled: Boolean(profileId) },
    );
    return data?.[0];
};

const Deployed = () => {
    const record = useRecordContext<CameraProfile>();
    const newest = useNewest(record?.id ? String(record.id) : undefined);
    if (!record) {
        return null;
    }
    if (!record.current_calibration_id) {
        return (
            <Typography variant="body2">
                {newest
                    ? `Newest published, version ${newest.version}`
                    : 'Nothing published yet'}
            </Typography>
        );
    }
    return (
        <ReferenceField
            source="current_calibration_id"
            reference="camera_calibrations"
            link={false}
        >
            <FunctionField<CameraCalibration>
                render={calibration => `Version ${calibration.version}`}
            />
        </ReferenceField>
    );
};

/** The state deploying exists to make visible: published, but reaching nobody. */
const Staged = () => {
    const record = useRecordContext<CameraProfile>();
    const newest = useNewest(record?.id ? String(record.id) : undefined);
    if (!record?.current_calibration_id || !newest) {
        return null;
    }
    if (newest.id === record.current_calibration_id) {
        return null;
    }
    return (
        <Alert severity="info">
            Version {newest.version} is published but not deployed. Laptops keep taking the
            deployed calibration until you deploy this one.
        </Alert>
    );
};

const DeployedChip = ({ deployed }: { deployed?: string | null }) => {
    const record = useRecordContext<CameraCalibration>();
    if (!record || record.id !== deployed) {
        return null;
    }
    return <Chip label="Deployed" size="small" color="primary" />;
};

const Calibrations = () => {
    const record = useRecordContext<CameraProfile>();
    const deployed = record?.current_calibration_id as string | null | undefined;
    return (
        <ReferenceManyField
            reference="camera_calibrations"
            target="camera_profile_id"
            sort={{ field: 'version', order: 'DESC' }}
            pagination={<Pagination />}
            label={false}
        >
            <Datagrid rowClick={false} bulkActionButtons={false}>
                <NumberField source="version" />
                <DeployedChip deployed={deployed} />
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
                <DeployCalibrationButton deployed={deployed} />
            </Datagrid>
        </ReferenceManyField>
    );
};

const CameraProfileShow = () => (
    <Show actions={<CameraProfileShowActions />}>
        <Stack spacing={2} sx={{ p: 2 }}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Labeled label="Name">
                        <TextField source="name" />
                    </Labeled>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Labeled label="Description">
                        <TextField source="description" emptyText="—" />
                    </Labeled>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Labeled label="Laptops take">
                        <Deployed />
                    </Labeled>
                </Grid>
            </Grid>

            <Staged />

            <Typography variant="h6">Calibrations</Typography>
            <Typography variant="body2" color="text.secondary">
                Each is one measurement of this rig. Versions coexist: a housing change
                invalidates the last measurement without invalidating the runs made under it.
                Publishing one stages it. Deploying one is what sends it to the laptops, and a
                laptop takes it on its next sync.
            </Typography>
            <Calibrations />

            <SyncFields />
        </Stack>
    </Show>
);

export default CameraProfileShow;
