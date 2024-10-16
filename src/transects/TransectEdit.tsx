import {
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    minValue,
    maxValue,
    required,
} from 'react-admin';
import { Grid, Typography } from '@mui/material';

const TransectEdit = () => {
    return (
        <Edit redirect="show">
            <SimpleForm>
                {/* Basic Information */}
                <Typography variant="h6" gutterBottom>
                    Basic Information
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextInput source="id" disabled fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextInput source="name" validate={[required()]} fullWidth />
                    </Grid>
                    <Grid item xs={12}>
                        <TextInput source="description" multiline />
                    </Grid>
                </Grid>

                {/* Location */}
                <Typography variant="h6" gutterBottom style={{ marginTop: '16px' }}>
                    Location
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <NumberInput source="latitude_start" validate={[required(), minValue(-90), maxValue(90)]} fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <NumberInput source="longitude_start" validate={[required(), minValue(-180), maxValue(180)]} fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <NumberInput source="latitude_end" validate={[required(), minValue(-90), maxValue(90)]} fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <NumberInput source="longitude_end" validate={[required(), minValue(-180), maxValue(180)]} fullWidth />
                    </Grid>
                </Grid>

                {/* Measurements */}
                <Typography variant="h6" gutterBottom style={{ marginTop: '16px' }}>
                    Measurements
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <NumberInput source="length" label="length (m)" validate={[minValue(0)]} fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <NumberInput source="depth" label="depth (m)" validate={[minValue(0)]} fullWidth />
                    </Grid>
                </Grid>
            </SimpleForm>
        </Edit>
    );
};

export default TransectEdit;
