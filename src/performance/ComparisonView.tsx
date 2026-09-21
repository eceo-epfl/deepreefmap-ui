import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDataProvider } from 'react-admin';
import { Box, Button, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';

import type { ConfigurationSummary, PerformanceEvidence } from '../contract';
import type { DrmDataProvider } from '../dataProvider';
import {
    capacity,
    fields,
    METRICS,
    MetricBar,
    metricKeys,
    rowStyle,
    scalesFor,
    singleStats,
} from './PerformanceBars';

type ComparisonProps = { deviceId?: string; presetName?: string; presetVersion?: number };
const modelKey = (row: PerformanceEvidence) =>
    JSON.stringify([
        fields(row.settings).mapping_backend,
        fields(row.settings).segmentation_model,
    ]);
const modelLabel = (row: PerformanceEvidence) => {
    const settings = fields(row.settings);
    return `${settings.mapping_backend ?? 'Unknown mapping'} · ${settings.segmentation_model ?? 'Unknown segmentation'}`;
};
export const configurationLabel = (row: PerformanceEvidence) => {
    const settings = fields(row.settings);
    return `${settings.processing_width ?? '?'} × ${settings.processing_height ?? '?'} · ${settings.fps ?? '?'} fps`;
};
const memoryLabel = (basis: string) =>
    ({ process: 'DeepReefMap memory', machine: 'Total system memory' })[basis] ??
    'Memory scope unknown';
const workloadLabel = (group: ConfigurationSummary) =>
    !group.workload.n
        ? 'Frames not recorded'
        : group.workload.min === group.workload.max
          ? `${group.workload.min?.toLocaleString()} frames`
          : `${group.workload.min?.toLocaleString()} to ${group.workload.max?.toLocaleString()} frames`;

function Evidence({
    query,
    scales,
}: {
    query: Record<string, string>;
    scales: ReturnType<typeof scalesFor>;
}) {
    const provider = useDataProvider<DrmDataProvider>();
    const [offset, setOffset] = useState(0);
    const { data, error } = useQuery({
        queryKey: ['performance', 'evidence', query, offset],
        queryFn: () => provider.performanceEvidence({ ...query, offset: String(offset) }),
        retry: false,
    });
    if (error)
        return <Typography role="alert">Evidence unavailable: {error.message}</Typography>;
    if (!data) return <Typography sx={{ p: 2 }}>Loading runs...</Typography>;
    return (
        <Box>
            {data.rows.map(row => (
                <Box key={row.id} sx={rowStyle} data-testid="performance-run">
                    <Tooltip
                        title={`${row.recorded_at ?? 'Date not recorded'}. ${row.timing_note}`}
                    >
                        <Box>
                            <Typography variant="body2">
                                {row.frames?.toLocaleString() ?? 'Unknown'} frames
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {row.status}
                                {row.duration_s != null
                                    ? ` · ${row.duration_s.toFixed(0)} s`
                                    : ''}
                            </Typography>
                        </Box>
                    </Tooltip>
                    {metricKeys.map(metric => (
                        <MetricBar
                            key={metric}
                            metric={metric}
                            stats={singleStats(row[metric])}
                            maximum={scales[metric]}
                            total={capacity(row, metric)}
                        />
                    ))}
                </Box>
            ))}
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ px: 2, display: 'block' }}
            >
                Memory shows the peak reached in each run. Timing excludes cached, partial and
                unverified runs.
            </Typography>
            {data.total > 50 && (
                <Stack direction="row" spacing={1} sx={{ p: 1, alignItems: 'center' }}>
                    <Button
                        disabled={!offset}
                        onClick={() => setOffset(Math.max(0, offset - 50))}
                    >
                        Previous
                    </Button>
                    <Typography variant="caption">
                        {offset + 1} to {Math.min(offset + 50, data.total)} of {data.total}
                    </Typography>
                    <Button
                        disabled={offset + 50 >= data.total}
                        onClick={() => setOffset(offset + 50)}
                    >
                        Next
                    </Button>
                </Stack>
            )}
        </Box>
    );
}

function ConfigurationRow({
    group,
    scales,
    query,
}: {
    group: ConfigurationSummary;
    scales: ReturnType<typeof scalesFor>;
    query: Record<string, string>;
}) {
    const [expanded, setExpanded] = useState(false);
    const row = group.configuration;
    const settings = fields(row.settings);
    return (
        <Box
            sx={{ bgcolor: 'action.hover', borderRadius: 1, mb: 1, pb: expanded ? 1 : 0 }}
            data-testid="performance-configuration"
        >
            <Box sx={rowStyle}>
                <Box>
                    <Tooltip title={JSON.stringify(settings)}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {configurationLabel(row)}
                        </Typography>
                    </Tooltip>
                    <Typography variant="caption" color="text.secondary" component="div">
                        {workloadLabel(group)}
                        {settings.preprocess_batch_size != null
                            ? ` · batch ${settings.preprocess_batch_size}`
                            : ''}
                        {settings.mode === 'geometry_only' ? ' · geometry only' : ''}
                    </Typography>
                    <Button
                        size="small"
                        onClick={() => setExpanded(!expanded)}
                        aria-expanded={expanded}
                        sx={{ px: 0, minWidth: 0 }}
                    >
                        {expanded ? '▾' : '▸'} {group.count}{' '}
                        {group.count === 1 ? 'run' : 'runs'}
                        {group.failed ? ` · ${group.failed} failed` : ''}
                    </Button>
                </Box>
                {metricKeys.map(metric => (
                    <MetricBar
                        key={metric}
                        metric={metric}
                        stats={group.stats[metric]}
                        maximum={scales[metric]}
                        total={capacity(row, metric)}
                    />
                ))}
            </Box>
            {expanded && <Evidence query={{ ...query, baseline: row.id }} scales={scales} />}
        </Box>
    );
}

function GroupRows({
    groups,
    query,
}: {
    groups: ConfigurationSummary[];
    query: Record<string, string>;
}) {
    const scales = scalesFor(groups);
    const sections = new Map<string, ConfigurationSummary[]>();
    for (const group of groups) {
        const row = group.configuration;
        const key = JSON.stringify([row.device_id, modelKey(row), row.basis, row.hardware]);
        sections.set(key, [...(sections.get(key) ?? []), group]);
    }
    return (
        <Box sx={{ overflowX: 'auto' }}>
            <Box sx={rowStyle}>
                <Typography variant="caption">Configuration</Typography>
                {metricKeys.map(metric => (
                    <Typography variant="caption" key={metric}>
                        {METRICS[metric]}
                    </Typography>
                ))}
            </Box>
            {Array.from(sections, ([key, rows]) => (
                <Box key={key}>
                    <Tooltip
                        title={`RAM and swap use this measurement scope. VRAM measures the whole graphics card. Hardware: ${JSON.stringify(rows[0].configuration.hardware)}`}
                    >
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ px: 2, py: 1 }}
                        >
                            {rows[0].configuration.device_name ?? 'Unattributed device'} ·{' '}
                            {modelLabel(rows[0].configuration)} ·{' '}
                            {memoryLabel(rows[0].configuration.basis)}
                        </Typography>
                    </Tooltip>
                    {rows
                        .sort((a, b) =>
                            configurationLabel(a.configuration).localeCompare(
                                configurationLabel(b.configuration),
                                undefined,
                                { numeric: true },
                            ),
                        )
                        .map(group => (
                            <ConfigurationRow
                                key={group.configuration.id}
                                group={group}
                                scales={scales}
                                query={query}
                            />
                        ))}
                </Box>
            ))}
            <Tooltip title="Statistics cover completed runs. Columns share absolute scales; percentages use recorded capacity. Workloads may differ. These observations do not establish output quality or isolate the effect of one setting.">
                <Typography variant="caption" color="text.secondary">
                    Bars: median · band: middle 50% · end tick: highest
                </Typography>
            </Tooltip>
        </Box>
    );
}

export default function ComparisonView({
    deviceId,
    presetName,
    presetVersion,
}: ComparisonProps) {
    const provider = useDataProvider<DrmDataProvider>();
    const [device, setDevice] = useState('');
    const [models, setModels] = useState('');
    const [filters, setFilters] = useState(false);
    const [minimum, setMinimum] = useState('');
    const [maximum, setMaximum] = useState('');
    const scope: Record<string, string> = {};
    if (deviceId) scope.device_id = deviceId;
    if (presetName) scope.preset_name = presetName;
    if (presetVersion != null) scope.preset_version = String(presetVersion);
    const invalid =
        [minimum, maximum].some(
            value => value !== '' && (!/^\d+$/.test(value) || Number(value) > 4294967295),
        ) || Boolean(minimum && maximum && Number(minimum) > Number(maximum));
    const query = {
        ...scope,
        ...(minimum ? { min_frames: minimum } : {}),
        ...(maximum ? { max_frames: maximum } : {}),
    };
    const { data, error, isPending } = useQuery({
        queryKey: ['performance', 'comparison', query],
        queryFn: () => provider.performanceComparison(query),
        enabled: !invalid,
        retry: false,
    });
    const configurations = data?.configurations ?? [];
    const devices = new Map(
        configurations.map(row => [
            row.device_id ?? 'unknown',
            row.device_name ?? 'Unattributed device',
        ]),
    );
    const modelOptions = new Map(configurations.map(row => [modelKey(row), modelLabel(row)]));
    const groups = (data?.groups ?? []).filter(
        group =>
            (!device || (group.configuration.device_id ?? 'unknown') === device) &&
            (!models || modelKey(group.configuration) === models),
    );
    return (
        <Stack spacing={2}>
            <Typography variant="h6">Recorded performance</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {!deviceId && (
                    <TextField
                        select
                        label="Device"
                        value={device || 'all'}
                        onChange={event =>
                            setDevice(event.target.value === 'all' ? '' : event.target.value)
                        }
                        sx={{ minWidth: 180 }}
                    >
                        <MenuItem value="all">All devices</MenuItem>
                        {Array.from(devices, ([id, name]) => (
                            <MenuItem key={id} value={id}>
                                {name}
                            </MenuItem>
                        ))}
                    </TextField>
                )}
                <TextField
                    select
                    label="Models"
                    value={models || 'all'}
                    onChange={event =>
                        setModels(event.target.value === 'all' ? '' : event.target.value)
                    }
                    sx={{ flex: 1, minWidth: 220 }}
                >
                    <MenuItem value="all">All models</MenuItem>
                    {Array.from(modelOptions, ([id, name]) => (
                        <MenuItem key={id} value={id}>
                            {name}
                        </MenuItem>
                    ))}
                </TextField>
                <Button onClick={() => setFilters(!filters)} aria-expanded={filters}>
                    Filters{minimum || maximum ? ' (active)' : ''}
                </Button>
            </Stack>
            {filters && (
                <Stack direction="row" spacing={2}>
                    <TextField
                        label="Minimum frames"
                        type="number"
                        value={minimum}
                        onChange={event => setMinimum(event.target.value)}
                    />
                    <TextField
                        label="Maximum frames"
                        type="number"
                        value={maximum}
                        onChange={event => setMaximum(event.target.value)}
                    />
                </Stack>
            )}
            {invalid ? (
                <Typography role="alert">
                    Enter non-negative whole frame counts, with minimum no greater than
                    maximum.
                </Typography>
            ) : error ? (
                <Typography role="alert">
                    Performance comparison unavailable: {error.message}
                </Typography>
            ) : isPending ? (
                <Typography>Loading performance...</Typography>
            ) : data && !data.groups ? (
                <Typography role="alert">
                    Update the API to load configuration summaries.
                </Typography>
            ) : groups.length ? (
                <GroupRows key={JSON.stringify(query)} groups={groups} query={query} />
            ) : (
                <Typography>No recorded runs match these filters.</Typography>
            )}
        </Stack>
    );
}
