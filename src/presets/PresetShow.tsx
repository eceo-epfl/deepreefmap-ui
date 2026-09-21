import {
    Datagrid,
    EditButton,
    Labeled,
    NumberField,
    Pagination,
    ReferenceManyField,
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
    Tooltip,
    Typography,
} from '@mui/material';

import { asColumn, SyncFields, TombstoneButton } from '../components';
import DeviceStatusField from '../devices/DeviceStatusField';
import PresetPerformance from '../performance/PresetPerformance';
import { useCanAuthor } from '../permissions';
import type { Device, Preset } from '../contract';
import AssignToAllButton from './AssignToAllButton';
import { PRESET_FIELDS, PRESET_SCHEMA_VERSION, unknownKeys } from './schema';

const PresetShowActions = () => {
    const canAuthor = useCanAuthor();
    return (
        <TopToolbar>
            <AssignToAllButton />
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

// Null or behind: the laptop would refuse or misread this document.
const SchemaVersionField = () => {
    const device = useRecordContext<Device>();
    if (!device) return null;
    const version = device.preset_schema_version;
    if (version != null && version >= PRESET_SCHEMA_VERSION) return <span>{version}</span>;
    return (
        <Tooltip
            title={
                version == null
                    ? 'No preset schema version reported.'
                    : `Device reads schema v${version}, console writes v${PRESET_SCHEMA_VERSION}.`
            }
        >
            <Typography variant="body2" component="span" color="warning.main">
                {version ?? '—'}
            </Typography>
        </Tooltip>
    );
};

const SchemaVersionColumn = asColumn(SchemaVersionField);

const NoAssignees = () => (
    <Typography
        variant="body2"
        sx={{
            color: 'text.secondary',
            p: 1,
        }}
    >
        No device is assigned this preset.
    </Typography>
);

const AssignedDevices = () => (
    <ReferenceManyField
        reference="devices"
        target="assigned_preset_id"
        sort={{ field: 'name', order: 'ASC' }}
        perPage={10}
        pagination={<Pagination />}
    >
        <Datagrid rowClick="show" bulkActionButtons={false} empty={<NoAssignees />}>
            <TextField source="name" label="Device name" />
            <DeviceStatusField label="Status" />
            <TextField
                source="gui_version"
                label="GUI version"
                emptyText="—"
                sortable={false}
            />
            <SchemaVersionColumn label="Preset schema" sortable={false} />
        </Datagrid>
    </ReferenceManyField>
);

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
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'text.secondary',
                        }}
                    >
                        Console preset schema v{PRESET_SCHEMA_VERSION}
                    </Typography>
                </Grid>
            </Grid>

            <Divider />
            <Box>
                <Typography
                    variant="overline"
                    sx={{
                        color: 'text.secondary',
                    }}
                >
                    Devices using this preset
                </Typography>
                <AssignedDevices />
            </Box>

            <Divider />
            <Box>
                <Typography
                    variant="overline"
                    sx={{
                        color: 'text.secondary',
                    }}
                >
                    Performance
                </Typography>
                <PresetPerformance />
            </Box>

            <Divider />
            <SyncFields />
        </Stack>
    </Show>
);

export default PresetShow;
