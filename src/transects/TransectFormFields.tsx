import {
    NumberInput,
    ReferenceInput,
    SelectInput,
    TextInput,
    maxValue,
    minValue,
    required,
} from 'react-admin';
import { Grid, Typography } from '@mui/material';

const latitude = [required(), minValue(-90), maxValue(90)];
const longitude = [required(), minValue(-180), maxValue(180)];
const nonNegative = [minValue(0)];

const TransectFormFields = () => (
    <>
        <Typography variant="h6" gutterBottom>
            Identity
        </Typography>
        <Grid container spacing={2}>
            <Grid
                size={{
                    xs: 12,
                    sm: 6,
                }}
            >
                <ReferenceInput source="site_id" reference="sites">
                    <SelectInput
                        optionText="name"
                        label="Site"
                        helperText="A transect name only has to be unique within its site."
                        fullWidth
                    />
                </ReferenceInput>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 6,
                }}
            >
                <TextInput source="name" validate={required()} fullWidth />
            </Grid>
            <Grid size={12}>
                <TextInput source="description" multiline defaultValue="" fullWidth />
            </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            End points
        </Typography>
        <Grid container spacing={2}>
            <Grid
                size={{
                    xs: 12,
                    sm: 4,
                }}
            >
                <NumberInput
                    source="start_lat"
                    label="Start latitude"
                    validate={latitude}
                    fullWidth
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 4,
                }}
            >
                <NumberInput
                    source="start_lon"
                    label="Start longitude"
                    validate={longitude}
                    fullWidth
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 4,
                }}
            >
                <NumberInput
                    source="start_accuracy_m"
                    label="Start accuracy (m)"
                    validate={nonNegative}
                    helperText="GPS accuracy at the time of the fix."
                    fullWidth
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 4,
                }}
            >
                <NumberInput
                    source="end_lat"
                    label="End latitude"
                    validate={latitude}
                    fullWidth
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 4,
                }}
            >
                <NumberInput
                    source="end_lon"
                    label="End longitude"
                    validate={longitude}
                    fullWidth
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 4,
                }}
            >
                <NumberInput
                    source="end_accuracy_m"
                    label="End accuracy (m)"
                    validate={nonNegative}
                    fullWidth
                />
            </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Measurements
        </Typography>
        <Grid container spacing={2}>
            <Grid
                size={{
                    xs: 12,
                    sm: 6,
                }}
            >
                <NumberInput
                    source="length_m"
                    label="Length (m)"
                    validate={nonNegative}
                    helperText="The tape reading used to scale the reconstruction."
                    fullWidth
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 6,
                }}
            >
                <NumberInput
                    source="depth_m"
                    label="Depth (m)"
                    validate={nonNegative}
                    fullWidth
                />
            </Grid>
        </Grid>
    </>
);

export default TransectFormFields;
