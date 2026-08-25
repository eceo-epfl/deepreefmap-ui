import {
    Datagrid,
    DateField,
    FunctionField,
    Labeled,
    Pagination,
    ReferenceField,
    ReferenceManyField,
    Show,
    SimpleShowLayout,
    TextField,
    TopToolbar,
    useNotify,
    useRecordContext,
} from 'react-admin';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
    Alert,
    Box,
    Divider,
    IconButton,
    LinearProgress,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';

import { AccountField, asColumn, DurationField } from '../components';
import { RunStatusChip } from '../runs/StatusField';
import { formatBytes } from '../videos/VideoFields';
import DevicePerformance from './DevicePerformance';
import DeviceStatusField from './DeviceStatusField';
import RelativeDateField, { STALE_AFTER_SECONDS, relativeTime } from './RelativeDateField';
import AssignedPresetPanel from './AssignedPresetPanel';
import RenameDeviceButton from './RenameDeviceButton';
import RevokeDeviceButton from './RevokeDeviceButton';
import { asObject, numberOf, textOf } from './profile';
import type { Device } from '../contract';

const DurationColumn = asColumn(DurationField);

const DeviceShowActions = () => (
    <TopToolbar>
        <RenameDeviceButton />
        <RevokeDeviceButton />
    </TopToolbar>
);

const RevokedNotice = () => {
    const record = useRecordContext<Device>();
    if (!record?.revoked_at) return null;
    return (
        <Alert severity="error">
            Revoked on {new Date(record.revoked_at).toLocaleString()}. This installation can no
            longer sync, and needs a new connect code to come back.
        </Alert>
    );
};

const SectionHeading = ({ title }: { title: string }) => (
    <Typography
        variant="overline"
        sx={{
            color: 'text.secondary',
        }}
    >
        {title}
    </Typography>
);

const HardwareLine = ({ label, value }: { label: string; value: string | null }) => (
    <Labeled label={label}>
        <Typography variant="body2">{value ?? '—'}</Typography>
    </Labeled>
);

// Older heartbeats sent only the total, so the gauge degrades to a plain figure.
const DiskLine = ({ profile }: { profile: Record<string, unknown> }) => {
    const total = numberOf(profile, 'disk_total_bytes');
    const free = numberOf(profile, 'disk_free_bytes');
    if (total == null || free == null) {
        return <HardwareLine label="Disk" value={total == null ? null : formatBytes(total)} />;
    }
    const used = Math.max(total - free, 0);
    const fraction = total > 0 ? used / total : 0;
    return (
        <Labeled label="Disk">
            <Box sx={{ minWidth: 240 }}>
                <LinearProgress
                    variant="determinate"
                    value={Math.min(fraction, 1) * 100}
                    color={fraction > 0.85 ? 'warning' : 'primary'}
                    sx={{ height: 6, borderRadius: 1, mb: 0.5 }}
                />
                <Typography variant="body2">
                    {formatBytes(used)} used of {formatBytes(total)} · {formatBytes(free)} free
                </Typography>
            </Box>
        </Labeled>
    );
};

/** What the device says about itself. Static hardware plus survey-disk headroom. */
const HardwarePanel = () => {
    const record = useRecordContext<Device>();
    const profile = asObject(record?.system_profile);
    if (!record) return null;
    if (!profile) {
        return (
            <Typography
                variant="body2"
                sx={{
                    color: 'text.secondary',
                }}
            >
                This device has not reported its hardware yet. A profile arrives the next time
                it checks in.
            </Typography>
        );
    }

    const os = textOf(profile, 'os_name');
    const osRelease = textOf(profile, 'os_release');
    const logical = numberOf(profile, 'cpu_logical');
    const physical = numberOf(profile, 'cpu_physical');
    const ram = numberOf(profile, 'total_ram_bytes');
    const swap = numberOf(profile, 'total_swap_bytes');
    const gpu = asObject(profile.gpu);
    const gpuName = gpu && textOf(gpu, 'name');
    const vram = gpu && numberOf(gpu, 'total_vram_bytes');

    return (
        <Stack
            direction="row"
            spacing={3}
            useFlexGap
            sx={{
                flexWrap: 'wrap',
            }}
        >
            <HardwareLine
                label="Operating system"
                value={os ? [os, osRelease].filter(Boolean).join(' ') : null}
            />
            <HardwareLine
                label="CPU"
                value={
                    logical == null
                        ? null
                        : `${logical} logical / ${physical ?? '?'} physical cores`
                }
            />
            <HardwareLine label="RAM" value={ram == null ? null : formatBytes(ram)} />
            <HardwareLine label="Swap" value={swap == null ? null : formatBytes(swap)} />
            <HardwareLine label="GPU" value={gpuName} />
            <HardwareLine label="VRAM" value={vram == null ? null : formatBytes(vram)} />
            <DiskLine profile={profile} />
        </Stack>
    );
};

const SoftwareLines = () => {
    const record = useRecordContext<Device>();
    if (!record) return null;
    return (
        <Stack spacing={0.5}>
            <Stack
                direction="row"
                spacing={3}
                useFlexGap
                sx={{
                    flexWrap: 'wrap',
                }}
            >
                <Labeled label="GUI version">
                    <TextField source="gui_version" emptyText="—" />
                </Labeled>
                <Labeled label="Library version">
                    <TextField source="library_version" emptyText="—" />
                </Labeled>
                <Labeled label="Preset schema">
                    <TextField source="preset_schema_version" emptyText="—" />
                </Labeled>
            </Stack>
            {(record.profile_reported_at || record.versions_changed_at) && (
                <Typography
                    variant="caption"
                    sx={{
                        color: 'text.secondary',
                    }}
                >
                    {[
                        record.profile_reported_at &&
                            `reported ${relativeTime(record.profile_reported_at)}`,
                        record.versions_changed_at &&
                            `changed ${relativeTime(record.versions_changed_at)}`,
                    ]
                        .filter(Boolean)
                        .join(' · ')}
                </Typography>
            )}
        </Stack>
    );
};

const AuditPanel = () => {
    const record = useRecordContext<Device>();
    const notify = useNotify();
    if (!record) return null;
    return (
        <Stack spacing={0.5}>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <Typography
                    variant="caption"
                    sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                >
                    {record.id}
                </Typography>
                <Tooltip title="Copy device id">
                    <IconButton
                        size="small"
                        onClick={() => {
                            navigator.clipboard.writeText(String(record.id));
                            notify('Device id copied.', { type: 'info' });
                        }}
                    >
                        <ContentCopyIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                </Tooltip>
            </Stack>
            <Typography
                variant="caption"
                sx={{
                    color: 'text.secondary',
                }}
            >
                Connect code redeemed by{' '}
                <AccountField source="enrolled_by" variant="caption" />
            </Typography>
        </Stack>
    );
};

const NoRuns = () => (
    <Typography
        variant="body2"
        sx={{
            color: 'text.secondary',
        }}
    >
        No runs reported from this device yet.
    </Typography>
);

const NoClips = () => (
    <Typography
        variant="body2"
        sx={{
            color: 'text.secondary',
        }}
    >
        No clips registered from this device yet.
    </Typography>
);

const DeviceRuns = () => (
    <ReferenceManyField
        reference="runs"
        target="device_id"
        sort={{ field: 'created_at', order: 'DESC' }}
        perPage={10}
        pagination={<Pagination />}
    >
        <Datagrid rowClick="show" bulkActionButtons={false} empty={<NoRuns />}>
            <FunctionField
                label="Status"
                render={record => <RunStatusChip status={record.status as string} />}
            />
            <ReferenceField
                source="pass_id"
                reference="passes"
                link="show"
                label="Pass"
                sortable={false}
            >
                <TextField source="label" emptyText="Unlabelled pass" />
            </ReferenceField>
            <TextField source="run_dir_name" label="Run directory" sortable={false} />
            <DateField source="started_at" showTime emptyText="—" sortable={false} />
        </Datagrid>
    </ReferenceManyField>
);

const DeviceClips = () => (
    <ReferenceManyField
        reference="videos"
        target="device_id"
        sort={{ field: 'created_at', order: 'DESC' }}
        perPage={10}
        pagination={<Pagination />}
    >
        <Datagrid rowClick="show" bulkActionButtons={false} empty={<NoClips />}>
            <TextField source="file_name" label="File name" sortable={false} />
            <DurationColumn label="Duration" source="duration_s" sortable={false} />
            <DateField source="captured_at" label="Captured" showTime emptyText="—" />
        </Datagrid>
    </ReferenceManyField>
);

const DeviceShow = () => (
    <Show actions={<DeviceShowActions />}>
        <SimpleShowLayout>
            <RevokedNotice />
            <Stack
                direction="row"
                spacing={3}
                useFlexGap
                sx={{
                    flexWrap: 'wrap',
                }}
            >
                <Labeled label="Device name">
                    <TextField source="name" />
                </Labeled>
                <Labeled label="Status">
                    <DeviceStatusField />
                </Labeled>
                <Labeled label="Platform">
                    <TextField source="platform" emptyText="—" />
                </Labeled>
            </Stack>
            <Divider />
            <SectionHeading title="Hardware" />
            <HardwarePanel />
            <SectionHeading title="Software" />
            <SoftwareLines />
            <SectionHeading title="Assigned preset" />
            <AssignedPresetPanel />
            <Divider />
            <SectionHeading title="Performance" />
            <DevicePerformance />
            <Divider />
            <SectionHeading title="Enrolment" />
            <Stack
                direction="row"
                spacing={3}
                useFlexGap
                sx={{
                    flexWrap: 'wrap',
                }}
            >
                <Labeled label="Onboarded">
                    <DateField source="created_at" showTime />
                </Labeled>
                <Labeled label="Last seen">
                    <RelativeDateField
                        source="last_seen_at"
                        staleAfter={STALE_AFTER_SECONDS}
                    />
                </Labeled>
                <Labeled label="Revoked">
                    <DateField source="revoked_at" showTime emptyText="—" />
                </Labeled>
            </Stack>
            <Divider />
            <Box>
                <SectionHeading title="Recent runs" />
                <DeviceRuns />
            </Box>
            <Box>
                <SectionHeading title="Recent clips" />
                <DeviceClips />
            </Box>
            <Divider />
            <SectionHeading title="Audit" />
            <AuditPanel />
        </SimpleShowLayout>
    </Show>
);

export default DeviceShow;
