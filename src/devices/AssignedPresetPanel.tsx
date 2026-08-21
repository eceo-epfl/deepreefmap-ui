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
    Chip,
    MenuItem,
    Stack,
    TextField as MuiTextField,
    Typography,
} from '@mui/material';

import type { DrmDataProvider } from '../dataProvider/index';
import type { Device, Preset } from '../contract';
import { relativeTime } from './RelativeDateField';

/** How the device answered the assignment, from its heartbeat. */
const AcknowledgementChip = ({ device, assigned }: { device: Device; assigned?: Preset }) => {
    if (!device.assigned_preset_id) return null;
    if (!device.active_preset_reported_at) {
        return <Chip size="small" label="Not yet acknowledged" />;
    }
    const matches =
        assigned &&
        device.active_preset_name === assigned.name &&
        device.active_preset_version === assigned.version;
    if (matches) {
        return (
            <Chip
                size="small"
                color="success"
                label={`Acknowledged ${relativeTime(device.active_preset_reported_at)}`}
            />
        );
    }
    return (
        <Chip
            size="small"
            color="warning"
            label={`Reports ${device.active_preset_name ?? 'nothing'} v${
                device.active_preset_version ?? '?'
            }`}
        />
    );
};

/** The server-chosen default preset for this device, with its acknowledgement state.
 * Sits beside the hardware panel: see a struggling laptop, hand it lighter settings. */
const AssignedPresetPanel = () => {
    const record = useRecordContext<Device>();
    const dataProvider = useDataProvider<DrmDataProvider>();
    const notify = useNotify();
    const refresh = useRefresh();
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
            <Stack direction="row" spacing={2} useFlexGap sx={{ alignItems: 'center' }}>
                <Typography variant="body2">
                    {assigned
                        ? `${assigned.name} v${assigned.version}`
                        : record.assigned_preset_id
                          ? 'Assigned preset no longer exists'
                          : 'No preset assigned. The device follows its own default.'}
                </Typography>
                <AcknowledgementChip device={record} assigned={assigned ?? undefined} />
            </Stack>
            <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center' }}>
                <MuiTextField
                    select
                    size="small"
                    label="Assign a preset"
                    value={choice}
                    onChange={event => setChoice(event.target.value)}
                    sx={{ minWidth: 260 }}
                >
                    {(presets ?? []).map(preset => (
                        <MenuItem key={preset.id} value={preset.id}>
                            {preset.name} v{preset.version}
                        </MenuItem>
                    ))}
                </MuiTextField>
                <Button
                    variant="outlined"
                    size="small"
                    disabled={saving || !choice}
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
                    The device learns the assignment when it next checks in, then reports the
                    preset it actually runs under.
                </Typography>
            </Box>
        </Stack>
    );
};

export default AssignedPresetPanel;
