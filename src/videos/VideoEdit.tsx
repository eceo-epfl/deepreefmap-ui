import {
    BooleanInput,
    Edit,
    SaveButton,
    SelectInput,
    SimpleForm,
    TextInput,
    Toolbar,
} from 'react-admin';
import { Grid, Typography } from '@mui/material';

import { ReviewInput, rigPositionChoices } from './ReviewField';

const SaveOnlyToolbar = () => (
    <Toolbar>
        <SaveButton />
    </Toolbar>
);

/**
 * What a person knows about a clip that no probe can read: which camera of the rig
 * shot it, where that camera sat, whether it was mounted upside down, and whether the
 * footage is any good.
 */
const VideoEdit = () => (
    <Edit redirect="show">
        <SimpleForm toolbar={<SaveOnlyToolbar />}>
            <Typography variant="h6" gutterBottom>
                Camera
            </Typography>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <TextInput
                        source="camera_label"
                        label="Camera"
                        helperText="As the field team labels it, eg. GoPro_3 or cam1."
                        fullWidth
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <SelectInput
                        source="rig_position"
                        label="Rig position"
                        choices={rigPositionChoices}
                        emptyText="Not recorded"
                        fullWidth
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <BooleanInput source="upside_down" label="Mounted upside down" />
                </Grid>
            </Grid>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Review
            </Typography>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <ReviewInput fullWidth />
                </Grid>
                <Grid size={12}>
                    <TextInput source="notes" multiline fullWidth />
                </Grid>
            </Grid>
        </SimpleForm>
    </Edit>
);

export default VideoEdit;
