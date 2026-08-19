import { maxValue, minValue, NumberInput, required, TextInput } from 'react-admin';
import { Grid, Typography } from '@mui/material';

type SiteFormValues = {
    latitude?: number | null;
    longitude?: number | null;
};

/** A lone coordinate cannot be mapped, so take both or neither. */
export const validateSite = (values: SiteFormValues) => {
    const { latitude, longitude } = values;
    if ((latitude == null) === (longitude == null)) return {};
    return latitude == null
        ? { latitude: 'Latitude is required when longitude is set' }
        : { longitude: 'Longitude is required when latitude is set' };
};

const SiteInputs = () => (
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
                <TextInput
                    source="name"
                    validate={required()}
                    helperText="Unique across the registry, ignoring case."
                    fullWidth
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 3,
                }}
            >
                <TextInput source="country" fullWidth />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 3,
                }}
            >
                <TextInput source="region" fullWidth />
            </Grid>
            <Grid size={12}>
                <TextInput source="description" multiline rows={3} fullWidth />
            </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Representative point
        </Typography>
        <Grid container spacing={2}>
            <Grid
                size={{
                    xs: 12,
                    sm: 6,
                }}
            >
                <NumberInput
                    source="latitude"
                    validate={[minValue(-90), maxValue(90)]}
                    helperText="Decimal degrees, -90 to 90."
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
                    source="longitude"
                    validate={[minValue(-180), maxValue(180)]}
                    helperText="Decimal degrees, -180 to 180."
                    fullWidth
                />
            </Grid>
        </Grid>
    </>
);

export default SiteInputs;
