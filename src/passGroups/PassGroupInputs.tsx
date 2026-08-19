import { required, TextInput } from 'react-admin';
import { Grid } from '@mui/material';

const PassGroupInputs = () => (
    <Grid container spacing={2}>
        <Grid
            size={{
                xs: 12,
                sm: 6,
            }}
        >
            <TextInput
                source="name"
                validate={required()}
                helperText="The survey event, for example Autumn resurvey."
                fullWidth
            />
        </Grid>
        <Grid
            size={{
                xs: 12,
                sm: 6,
            }}
        >
            <TextInput
                source="period_label"
                label="Period label"
                helperText="Where the event sits on a timeline, for example 2024 spring. Orders the statistics series."
                fullWidth
            />
        </Grid>
        <Grid size={12}>
            <TextInput source="description" multiline rows={3} fullWidth />
        </Grid>
    </Grid>
);

export default PassGroupInputs;
