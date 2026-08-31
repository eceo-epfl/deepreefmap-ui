import {
    NumberInput,
    ReferenceInput,
    SelectInput,
    TextInput,
    maxValue,
    minValue,
    required,
} from 'react-admin';
import { useWatch } from 'react-hook-form';
import { Grid, Typography } from '@mui/material';

const latitude = [minValue(-90), maxValue(90)];
const longitude = [minValue(-180), maxValue(180)];
const nonNegative = [minValue(0)];

type EndPoints = {
    start_lat?: number | null;
    start_lon?: number | null;
    end_lat?: number | null;
    end_lon?: number | null;
};

type Depths = {
    depth_m?: number | null;
    start_depth_m?: number | null;
    end_depth_m?: number | null;
};

/**
 * The depth of a line measured at both ends is their mean. The registry derives it
 * on write, and the form sends the same figure so the saved row reads back as shown.
 * A line with an end missing keeps whatever single reading it carries: that is how
 * the historical sheets record depth.
 */
export const fillDepthFromEnds = <T extends Depths>(values: T): T => {
    if (values.start_depth_m == null || values.end_depth_m == null) {
        return values;
    }
    return { ...values, depth_m: (values.start_depth_m + values.end_depth_m) / 2 };
};

/** Depth: stated where the ends give it, entered where they do not. */
const DepthInput = () => {
    const start = useWatch({ name: 'start_depth_m' }) as number | null | undefined;
    const end = useWatch({ name: 'end_depth_m' }) as number | null | undefined;
    const derived = start != null && end != null;
    return (
        <NumberInput
            source="depth_m"
            label="Depth (m)"
            validate={nonNegative}
            readOnly={derived}
            helperText={
                derived
                    ? 'The mean of the two ends, kept in step with them.'
                    : 'The single reading, where the ends were not recorded separately.'
            }
            fullWidth
        />
    );
};

/** An end point is both coordinates or neither; the line as a whole may have none. */
export const validateEndPoints = (values: EndPoints) => {
    const errors: Record<string, string> = {};
    if ((values.start_lat == null) !== (values.start_lon == null)) {
        errors[values.start_lat == null ? 'start_lat' : 'start_lon'] =
            'Both start coordinates, or neither';
    }
    if ((values.end_lat == null) !== (values.end_lon == null)) {
        errors[values.end_lat == null ? 'end_lat' : 'end_lon'] =
            'Both end coordinates, or neither';
    }
    return errors;
};

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
                        validate={required()}
                        helperText="Names are unique within a site."
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
            End points (optional)
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
                    helperText="Tape reading; scales the reconstruction."
                    fullWidth
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 6,
                }}
            >
                <DepthInput />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 6,
                }}
            >
                <NumberInput
                    source="start_depth_m"
                    label="Start depth (m)"
                    validate={nonNegative}
                    helperText="Where the tape was tied off."
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
                    source="end_depth_m"
                    label="End depth (m)"
                    validate={nonNegative}
                    helperText="Where the tape ran out."
                    fullWidth
                />
            </Grid>
        </Grid>
    </>
);

export default TransectFormFields;
