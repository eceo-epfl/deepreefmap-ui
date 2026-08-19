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
    useRecordContext,
} from 'react-admin';
import { Alert, Box, Divider, Stack, Typography } from '@mui/material';

import { AccountField, asColumn, DurationField } from '../components';
import { RunStatusChip } from '../runs/StatusField';
import { formatBytes } from '../videos/VideoFields';
import DeviceStatusField from './DeviceStatusField';
import RelativeDateField, { STALE_AFTER_SECONDS, relativeTime } from './RelativeDateField';
import RenameDeviceButton from './RenameDeviceButton';
import RevokeDeviceButton from './RevokeDeviceButton';
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

// The profile is stored as sent, so every read below survives a device that
// reported a different shape.
const asObject = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;

const textOf = (profile: Record<string, unknown>, key: string): string | null => {
    const value = profile[key];
    return typeof value === 'string' && value ? value : null;
};

const numberOf = (profile: Record<string, unknown>, key: string): number | null => {
    const value = profile[key];
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

const HardwareLine = ({ label, value }: { label: string; value: string | null }) => (
    <Labeled label={label}>
        <Typography variant="body2">{value ?? '—'}</Typography>
    </Labeled>
);

/** What the device says about itself. Static hardware only: no free space, no paths. */
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
    const disk = numberOf(profile, 'disk_total_bytes');
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
            <HardwareLine
                label="GPU"
                value={
                    gpuName
                        ? vram == null
                            ? gpuName
                            : `${gpuName} · ${formatBytes(vram)}`
                        : null
                }
            />
            <HardwareLine label="Disk" value={disk == null ? null : formatBytes(disk)} />
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
            </Stack>
            {record.profile_reported_at && (
                <Typography
                    variant="caption"
                    sx={{
                        color: 'text.secondary',
                    }}
                >
                    reported {relativeTime(record.profile_reported_at)}
                </Typography>
            )}
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
                <Labeled label="Enrolled">
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
                <Labeled label="Device id">
                    <TextField source="id" />
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
            <Labeled label="Onboarded by">
                <AccountField source="enrolled_by" />
            </Labeled>
            <Typography
                variant="caption"
                sx={{
                    color: 'text.secondary',
                }}
            >
                Who redeemed the connect code. Uploads are attributed to the device name above,
                not to this account.
            </Typography>
        </SimpleShowLayout>
    </Show>
);

export default DeviceShow;
