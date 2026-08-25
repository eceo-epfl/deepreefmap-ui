import { useState } from 'react';
import {
    useDataProvider,
    useGetList,
    useGetOne,
    useNotify,
    useRecordContext,
    useRefresh,
} from 'react-admin';
import {
    Box,
    Button,
    MenuItem,
    Stack,
    TextField as MuiTextField,
    Typography,
} from '@mui/material';

import type { DrmDataProvider } from '../dataProvider/index';
import type { Device, Preset } from '../contract';
import { relativeTime } from './RelativeDateField';

/** How the device answered the assignment, from its heartbeat. */
const acknowledgement = (device: Device, assigned?: Preset): string => {
    if (!device.assigned_preset_id) {
        return 'No preset assigned. The device follows its own default.';
    }
    if (!device.active_preset_reported_at) return 'Not yet acknowledged.';
    const matches =
        assigned &&
        device.active_preset_name === assigned.name &&
        device.active_preset_version === assigned.version;
    if (matches) {
        return `Acknowledged ${relativeTime(device.active_preset_reported_at)}.`;
    }
    return `Device reports ${device.active_preset_name ?? 'nothing'} v${
        device.active_preset_version ?? '?'
    }.`;
};

/** The server-chosen default preset for this device, with its acknowledgement state. */
const AssignedPresetPanel = () => {
    const record = useRecordContext<Device>();
    const dataProvider = useDataProvider<DrmDataProvider>();
    const notify = useNotify();
    const refresh = useRefresh();
    // Only the pending override; empty means the select shows the assignment itself.
    const [choice, setChoice] = useState('');
    const [saving, setSaving] = useState(false);

    const { data: presets } = useGetList<Preset>('presets', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'name', order: 'ASC' },
    });
    const { data: assigned } = useGetOne<Preset>(
        'presets',
        { id: record?.assigned_preset_id ?? '' },
        { enabled: Boolean(record?.assigned_preset_id) },
    );

    if (!record) return null;

    const current = record.assigned_preset_id ?? '';
    const value = choice || current;
    const known = (presets ?? []).some(preset => preset.id === current);

    const assign = async (presetId: string | null) => {
        setSaving(true);
        try {
            await dataProvider.assignPreset(record.id, presetId);
            notify(presetId ? 'Preset assigned.' : 'Assignment cleared.', { type: 'info' });
            setChoice('');
            refresh();
        } catch (failure) {
            notify(failure instanceof Error ? failure.message : 'Assignment failed.', {
                type: 'warning',
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Stack spacing={1}>
            <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'flex-start' }}>
                <MuiTextField
                    select
                    size="small"
                    label="Assigned preset"
                    value={value}
                    onChange={event => setChoice(event.target.value)}
                    helperText={acknowledgement(record, assigned ?? undefined)}
                    sx={{ minWidth: 260 }}
                >
                    {/* Keeps the select valid while presets load, or when the assigned
                        preset has been deleted since. */}
                    {current && !known && (
                        <MenuItem value={current} disabled>
                            {assigned
                                ? `${assigned.name} v${assigned.version}`
                                : presets
                                  ? 'Assigned preset no longer exists'
                                  : '…'}
                        </MenuItem>
                    )}
                    {(presets ?? []).map(preset => (
                        <MenuItem key={preset.id} value={preset.id}>
                            {preset.name} v{preset.version}
                        </MenuItem>
                    ))}
                </MuiTextField>
                <Button
                    variant="outlined"
                    size="small"
                    disabled={saving || !choice || choice === current}
                    onClick={() => assign(choice)}
                >
                    Assign
                </Button>
                {record.assigned_preset_id && (
                    <Button size="small" disabled={saving} onClick={() => assign(null)}>
                        Clear
                    </Button>
                )}
            </Stack>
            <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Applied at the device&apos;s next check-in.
                </Typography>
            </Box>
        </Stack>
    );
};

export default AssignedPresetPanel;
