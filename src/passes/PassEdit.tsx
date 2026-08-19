import { Edit, SaveButton, SimpleForm, TextInput, Toolbar } from 'react-admin';
import { Grid } from '@mui/material';

import { QualityInput } from '../components';

// A CRUD delete removes the row outright, while syncing clients expect a tombstone.
const SaveOnlyToolbar = () => (
    <Toolbar>
        <SaveButton />
    </Toolbar>
);

// The window, the direction and the camera orientation are what the desktop application
// recorded. Quality and notes are the two judgements a person adds afterwards.
const PassEdit = () => (
    <Edit redirect="show">
        <SimpleForm toolbar={<SaveOnlyToolbar />}>
            <Grid container spacing={2}>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                    }}
                >
                    <QualityInput fullWidth />
                </Grid>
                <Grid size={12}>
                    <TextInput source="notes" multiline fullWidth />
                </Grid>
            </Grid>
        </SimpleForm>
    </Edit>
);

export default PassEdit;
