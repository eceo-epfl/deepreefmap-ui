import { SimpleForm, TextInput, required } from 'react-admin';
import { Grid } from '@mui/material';

/** Letters, numbers, underscores and hyphens: a laptop resolves a profile file by
 * this name on its own disk, and the registry refuses anything else. */
const resolvable = (value?: string) =>
    !value || /^[A-Za-z0-9_-]+$/.test(value)
        ? undefined
        : 'Letters, numbers, underscores and hyphens only';

const CameraProfileForm = () => (
    <SimpleForm>
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextInput
                    source="name"
                    validate={[required(), resolvable]}
                    helperText="What a preset and a laptop's profile file call this rig."
                    fullWidth
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextInput
                    source="description"
                    helperText="The body, lens mode, housing and resolution this covers."
                    fullWidth
                />
            </Grid>
        </Grid>
    </SimpleForm>
);

export default CameraProfileForm;
