import { useState } from 'react';
import {
    BooleanInput,
    maxValue,
    minValue,
    NumberInput,
    required,
    SelectInput,
    TextInput,
} from 'react-admin';
import { useFormContext, useWatch } from 'react-hook-form';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Grid,
    TextField as MuiTextField,
    Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { choicesFor, PRESET_FIELDS, PRESET_SCHEMA_VERSION } from './schema';
import type { PresetFieldDef } from './schema';

const titled = (label: string) => label.charAt(0).toUpperCase() + label.slice(1);

// The one relationship the flat field table cannot express: an explicit processing
// size applies only under the `Custom` resolution preset. Native, Half and Quarter
// divide the segmentation model's native size on the device
// (`form/panel.py::_apply_resolution_preset`), so the console has no number to
// publish. Disabled rather than read-only on purpose: react-hook-form leaves a
// disabled field out of the submitted values, so a number typed under Custom stops
// being published the moment the resolution moves off it.
const CUSTOM_SIZE_KEYS = ['processing_width', 'processing_height'];

const DERIVED_SIZE_HELP =
    'Native, Half and Quarter derive this from the segmentation model. Choose Custom to set it.';

const SettingInput = ({
    field,
    customSize,
}: {
    field: PresetFieldDef;
    customSize: boolean;
}) => {
    const source = `settings.${field.key}`;
    const label = field.unit ? `${titled(field.label)} (${field.unit})` : titled(field.label);
    if (field.kind === 'bool') {
        return <BooleanInput source={source} label={label} helperText={false} />;
    }
    if (field.kind === 'enum') {
        return (
            <SelectInput
                source={source}
                label={label}
                choices={choicesFor(field.choices)}
                validate={required()}
                fullWidth
                helperText={false}
            />
        );
    }
    const derived = !customSize && CUSTOM_SIZE_KEYS.includes(field.key);
    const validate = [
        ...(field.minimum === null ? [] : [minValue(field.minimum)]),
        ...(field.maximum === null ? [] : [maxValue(field.maximum)]),
    ];
    return (
        <NumberInput
            source={source}
            label={label}
            min={field.minimum ?? undefined}
            max={field.maximum ?? undefined}
            step={field.step ?? undefined}
            validate={validate}
            fullWidth
            disabled={derived}
            helperText={
                derived
                    ? DERIVED_SIZE_HELP
                    : field.nullable
                      ? 'Empty follows the model.'
                      : false
            }
        />
    );
};

/** The generated settings form: every field the schema publishes, scoped to the
 * chosen processing method. */
const SettingsFields = () => {
    const mapping = useWatch({ name: 'settings.mapping_name' }) as string | undefined;
    const resolution = useWatch({ name: 'settings.resolution_preset' }) as string | undefined;
    const visible = PRESET_FIELDS.filter(
        field =>
            field.applies_when.length === 0 ||
            (mapping !== undefined && field.applies_when.includes(mapping)),
    );
    return (
        <Grid container spacing={2}>
            {visible.map(field => (
                <Grid key={field.key} size={{ xs: 12, sm: field.kind === 'enum' ? 6 : 4 }}>
                    <SettingInput field={field} customSize={resolution === 'Custom'} />
                </Grid>
            ))}
        </Grid>
    );
};

// The escape hatch the raw textarea used to be: paste a whole document, apply, and
// the form fields take it. Keys the schema does not know survive a round trip.
const AdvancedJsonEditor = () => {
    const { getValues, setValue } = useFormContext();
    const [text, setText] = useState('');
    const [error, setError] = useState<string | null>(null);

    const snapshot = (_: unknown, expanded: boolean) => {
        if (!expanded) return;
        setText(JSON.stringify(getValues('settings') ?? {}, null, 2));
        setError(null);
    };

    const apply = () => {
        try {
            const parsed: unknown = JSON.parse(text);
            if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
                throw new Error('the document must be a JSON object');
            }
            setValue('settings', parsed, { shouldDirty: true });
            setError(null);
        } catch (failure) {
            setError(
                `Not applied: ${failure instanceof Error ? failure.message : 'invalid JSON'}`,
            );
        }
    };

    return (
        <Accordion disableGutters elevation={0} onChange={snapshot} sx={{ mt: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Advanced: edit as JSON
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <MuiTextField
                    value={text}
                    onChange={event => setText(event.target.value)}
                    multiline
                    minRows={8}
                    fullWidth
                    slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: 13 } } }}
                />
                {error && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                        {error}
                    </Alert>
                )}
                <Box sx={{ mt: 1 }}>
                    <Button variant="outlined" size="small" onClick={apply}>
                        Apply to the form
                    </Button>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};

const PresetInputs = () => (
    <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 8 }}>
            <TextInput
                source="name"
                validate={required()}
                helperText="Devices label a run with name and version."
                fullWidth
            />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
            <NumberInput source="version" validate={required()} fullWidth />
        </Grid>
        <Grid size={12}>
            <TextInput source="description" multiline rows={2} fullWidth />
        </Grid>
        <Grid size={12}>
            <SettingsFields />
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Fields follow preset schema v{PRESET_SCHEMA_VERSION}. Devices ignore keys they
                do not recognise.
            </Typography>
            <AdvancedJsonEditor />
        </Grid>
    </Grid>
);

export default PresetInputs;
