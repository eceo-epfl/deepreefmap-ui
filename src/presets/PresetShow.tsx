import {
    EditButton,
    Labeled,
    NumberField,
    Show,
    TextField,
    TopToolbar,
    useRecordContext,
} from 'react-admin';
import {
    Box,
    Divider,
    Grid,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography,
} from '@mui/material';

import { SyncFields, TombstoneButton } from '../components';
import { useCanAuthor } from '../permissions';
import type { Preset } from '../contract';
import { PRESET_FIELDS, PRESET_SCHEMA_VERSION, unknownKeys } from './schema';

const PresetShowActions = () => {
    const canAuthor = useCanAuthor();
    return (
        <TopToolbar>
            {canAuthor && <EditButton />}
            <TombstoneButton noun="preset" />
        </TopToolbar>
    );
};

const titled = (label: string) => label.charAt(0).toUpperCase() + label.slice(1);

const shown = (value: unknown, unit: string): string => {
    if (value === undefined) return '—';
    if (value === null) return 'follows the model';
    if (typeof value === 'boolean') return value ? 'yes' : 'no';
    const plain = typeof value === 'string' ? value : JSON.stringify(value);
    return unit ? `${plain} ${unit}` : plain;
};

// The stored document read through the published schema: a labelled row per known
// key, and whatever else the document carries listed as unrecognised.
const SettingsBlock = () => {
    const record = useRecordContext<Preset>();
    if (!record) return null;
    const settings = (record.settings ?? {}) as Record<string, unknown>;
    const unrecognised = unknownKeys(settings);
    return (
        <Box>
            <Table size="small" sx={{ maxWidth: 560 }}>
                <TableBody>
                    {PRESET_FIELDS.map(field => (
                        <TableRow key={field.key}>
                            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0 }}>
                                {titled(field.label)}
                            </TableCell>
                            <TableCell sx={{ border: 0, fontFamily: 'monospace' }}>
                                {shown(settings[field.key], field.unit)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {unrecognised.length > 0 && (
                <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Not in preset schema v{PRESET_SCHEMA_VERSION}:
                    </Typography>
                    <Box
                        component="pre"
                        sx={{
                            m: 0,
                            p: 1.5,
                            borderRadius: 1,
                            bgcolor: 'action.hover',
                            fontSize: 13,
                            overflowX: 'auto',
                        }}
                    >
                        {JSON.stringify(
                            Object.fromEntries(unrecognised.map(key => [key, settings[key]])),
                            null,
                            2,
                        )}
                    </Box>
                </Box>
            )}
        </Box>
    );
};

const PresetShow = () => (
    <Show actions={<PresetShowActions />}>
        <Stack
            spacing={2}
            sx={{
                p: 2,
            }}
        >
            <Grid container spacing={2}>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 4,
                    }}
                >
                    <Labeled label="Name">
                        <TextField source="name" />
                    </Labeled>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 2,
                    }}
                >
                    <Labeled label="Version">
                        <NumberField source="version" />
                    </Labeled>
                </Grid>
                <Grid size={12}>
                    <Labeled label="Description">
                        <TextField source="description" emptyText="—" />
                    </Labeled>
                </Grid>
                <Grid size={12}>
                    <Labeled label="Settings" sx={{ width: '100%' }}>
                        <SettingsBlock />
                    </Labeled>
                </Grid>
            </Grid>

            <Divider />
            <SyncFields />
        </Stack>
    </Show>
);

export default PresetShow;
