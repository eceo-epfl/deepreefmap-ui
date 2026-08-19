import { NumberInput, required, TextInput } from 'react-admin';
import { Grid, Typography } from '@mui/material';

type PresetFormValues = {
    settings?: unknown;
};

// The registry stores settings as JSON while the form edits them as text, so an
// untouched record still holds the stored document rather than a string.
export const validatePreset = ({ settings }: PresetFormValues) => {
    if (typeof settings !== 'string') return {};
    if (!settings.trim()) {
        return { settings: 'Settings are required. {} is the minimum.' };
    }
    try {
        JSON.parse(settings);
        return {};
    } catch (error) {
        return {
            settings: `Not valid JSON: ${
                error instanceof Error ? error.message : 'could not parse'
            }`,
        };
    }
};

/** Submitted values with the settings text parsed back into the stored document. */
export const parsePresetSettings = <T extends PresetFormValues>(values: T): T => ({
    ...values,
    settings:
        typeof values.settings === 'string' ? JSON.parse(values.settings) : values.settings,
});

const formatSettings = (value: unknown) =>
    typeof value === 'string' ? value : JSON.stringify(value ?? {}, null, 2);

const PresetInputs = () => (
    <Grid container spacing={2}>
        <Grid
            size={{
                xs: 12,
                sm: 8,
            }}
        >
            <TextInput
                source="name"
                validate={required()}
                helperText="Devices label a run with name and version."
                fullWidth
            />
        </Grid>
        <Grid
            size={{
                xs: 12,
                sm: 4,
            }}
        >
            <NumberInput source="version" validate={required()} fullWidth />
        </Grid>
        <Grid size={12}>
            <TextInput source="description" multiline rows={2} fullWidth />
        </Grid>
        <Grid size={12}>
            <TextInput
                source="settings"
                label="Settings (JSON)"
                format={formatSettings}
                multiline
                minRows={8}
                fullWidth
                sx={{ '& textarea': { fontFamily: 'monospace' } }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Keys mirror the desktop preset: fps, segmentation_name, mapping_name,
                camera_profile_name and so on. Clients ignore keys they do not recognise.
            </Typography>
        </Grid>
    </Grid>
);

export default PresetInputs;
