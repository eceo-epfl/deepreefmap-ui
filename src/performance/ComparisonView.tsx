import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDataProvider } from 'react-admin';
import {
    Box,
    Button,
    MenuItem,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';

import type { ConfigurationSummary, Distribution, PerformanceEvidence } from '../contract';
import type { DrmDataProvider } from '../dataProvider';
import { formatBytes } from '../videos/VideoFields';

const METRICS = {
    seconds_per_frame: 'Processing speed',
    ram: 'RAM',
    swap: 'Swap',
    vram: 'VRAM',
};
type Metric = keyof typeof METRICS;
type Fields = Record<string, unknown>;
const fields = (value: unknown): Fields =>
    value && typeof value === 'object' ? (value as Fields) : {};
const valueText = (value: unknown) => (value == null ? '?' : String(value));

export const configurationLabel = (row: PerformanceEvidence): string => {
    const settings = fields(row.settings);
    return `${valueText(settings.processing_width)} × ${valueText(settings.processing_height)} · ${valueText(settings.fps)} fps · batch ${valueText(settings.preprocess_batch_size)} · ${valueText(settings.mapping_backend)} · ${valueText(settings.segmentation_model)}${row.known ? '' : ' · legacy'}`;
};

const metricText = (value: number | null | undefined, metric: Metric): string =>
    value == null
        ? 'Not recorded'
        : metric === 'seconds_per_frame'
          ? `${value.toFixed(2)} s/frame`
          : formatBytes(value);

const Range = ({ stats, maximum }: { stats: Distribution; maximum: number }) => {
    if (!stats.n) return null;
    const x = (value: number | null | undefined) => 5 + (290 * (value ?? 0)) / (maximum || 1);
    return (
        <svg
            viewBox="0 0 300 24"
            width="100%"
            height="24"
            role="img"
            aria-label="Median, middle 50 percent and observed range"
        >
            <line x1={x(stats.min)} x2={x(stats.max)} y1="12" y2="12" stroke="currentColor" />
            {stats.n > 1 && (
                <line
                    x1={x(stats.q1)}
                    x2={x(stats.q3)}
                    y1="12"
                    y2="12"
                    stroke="#469dff"
                    strokeWidth="8"
                />
            )}
            <line
                x1={x(stats.median)}
                x2={x(stats.median)}
                y1="3"
                y2="21"
                stroke="currentColor"
                strokeWidth="3"
            />
        </svg>
    );
};

const Summary = ({ group }: { group: ConfigurationSummary }) => (
    <Stack spacing={1}>
        <Typography>
            {group.completed} completed · {group.failed} failed ·{' '}
            {group.workload.n
                ? `${group.workload.min?.toLocaleString()} to ${group.workload.max?.toLocaleString()} frames`
                : 'Frames not recorded'}
        </Typography>
        <Typography variant="caption">
            {group.configuration.basis} RAM/swap; whole-card VRAM. Statistics cover completed
            runs.
        </Typography>
        {!group.configuration.known && (
            <Typography>
                Legacy metadata: comparable settings and timing eligibility are unknown.
            </Typography>
        )}
        <Stack direction="row" spacing={3} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {(Object.keys(METRICS) as Metric[]).map(metric => {
                const stats = group.stats[metric];
                const totalKey = {
                    ram: 'total_ram_bytes',
                    swap: 'total_swap_bytes',
                    vram: 'total_vram_bytes',
                    seconds_per_frame: '',
                }[metric];
                const total = fields(group.configuration.hardware)[totalKey];
                return (
                    <Box key={metric}>
                        <Typography variant="subtitle2">{METRICS[metric]}</Typography>
                        <Typography>{metricText(stats.median, metric)}</Typography>
                        <Typography variant="caption" component="div">
                            Highest {metricText(stats.max, metric)} · {stats.n} observations
                        </Typography>
                        {stats.n > 1 && (
                            <Typography variant="caption" component="div">
                                Middle 50% {metricText(stats.q1, metric)} to{' '}
                                {metricText(stats.q3, metric)}
                            </Typography>
                        )}
                        {typeof total === 'number' && total > 0 && stats.median != null && (
                            <Typography variant="caption">
                                Median {((100 * stats.median) / total).toFixed(0)}% of capacity
                            </Typography>
                        )}
                    </Box>
                );
            })}
        </Stack>
    </Stack>
);

const WorkloadPlot = ({
    rows,
    metric,
}: {
    rows: PerformanceEvidence[];
    metric: 'ram' | 'swap' | 'vram';
}) => {
    const points = rows.filter(row => row.frames != null && row[metric] != null);
    if (!points.length) return <Typography>No paired workload observations.</Typography>;
    const maxX = Math.max(...points.map(row => row.frames ?? 0), 1);
    const maxY = Math.max(...points.map(row => row[metric] ?? 0), 1);
    return (
        <Box>
            <Typography variant="caption">
                {METRICS[metric]} versus frames, this evidence page. 0 to{' '}
                {maxX.toLocaleString()} frames; 0 to {formatBytes(maxY)}.
            </Typography>
            <svg
                viewBox="0 0 600 160"
                width="100%"
                height="160"
                role="img"
                aria-label={`${METRICS[metric]} peak versus processed frames`}
            >
                <path d="M 35 10 V 140 H 590" fill="none" stroke="currentColor" />
                {points.map(row => (
                    <circle
                        key={row.id}
                        cx={35 + (545 * (row.frames ?? 0)) / maxX}
                        cy={140 - (125 * (row[metric] ?? 0)) / maxY}
                        r="4"
                        fill="#469dff"
                    >
                        <title>
                            {row.frames} frames, {metricText(row[metric], metric)},{' '}
                            {row.status}
                        </title>
                    </circle>
                ))}
            </svg>
        </Box>
    );
};

const Evidence = ({ query, metric }: { query: Record<string, string>; metric: Metric }) => {
    const provider = useDataProvider<DrmDataProvider>();
    const [offset, setOffset] = useState(0);
    const { data, error } = useQuery({
        queryKey: ['performance', 'evidence', query, offset],
        queryFn: () => provider.performanceEvidence({ ...query, offset: String(offset) }),
        retry: false,
    });
    if (error)
        return <Typography role="alert">Evidence unavailable: {error.message}</Typography>;
    if (!data) return <Typography>Loading evidence...</Typography>;
    return (
        <Stack spacing={1}>
            <WorkloadPlot
                rows={data.rows}
                metric={metric === 'seconds_per_frame' ? 'ram' : metric}
            />
            <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {[
                                'Recorded',
                                'Status',
                                'Frames',
                                'RAM',
                                'Swap',
                                'VRAM',
                                'Duration',
                                'Seconds/frame',
                                'Timing evidence',
                            ].map(label => (
                                <TableCell key={label}>{label}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.rows.map(row => (
                            <TableRow key={row.id}>
                                <TableCell>{row.recorded_at ?? 'Unknown'}</TableCell>
                                <TableCell>{row.status}</TableCell>
                                <TableCell>{row.frames ?? 'Unknown'}</TableCell>
                                {(['ram', 'swap', 'vram'] as const).map(key => (
                                    <TableCell key={key}>
                                        {metricText(row[key], key)}
                                    </TableCell>
                                ))}
                                <TableCell>
                                    {row.duration_s == null
                                        ? 'Not recorded'
                                        : `${row.duration_s.toFixed(1)} s`}
                                </TableCell>
                                <TableCell>
                                    {metricText(row.seconds_per_frame, 'seconds_per_frame')}
                                </TableCell>
                                <TableCell>{row.timing_note}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
            <Stack direction="row" spacing={1}>
                <Button disabled={!offset} onClick={() => setOffset(Math.max(0, offset - 50))}>
                    Previous
                </Button>
                <Typography>
                    {data.total ? offset + 1 : 0} to {Math.min(offset + 50, data.total)} of{' '}
                    {data.total}
                </Typography>
                <Button
                    disabled={offset + 50 >= data.total}
                    onClick={() => setOffset(offset + 50)}
                >
                    Next
                </Button>
            </Stack>
        </Stack>
    );
};

type ComparisonProps = { deviceId?: string; presetName?: string; presetVersion?: number };
type SelectionState = {
    device?: string;
    baseline: string;
    parameter: string;
    metric: Metric;
    minimum: string;
    maximum: string;
    expanded: boolean;
};

const useComparison = ({ deviceId, presetName, presetVersion }: ComparisonProps) => {
    const provider = useDataProvider<DrmDataProvider>();
    const [state, setState] = useState<SelectionState>({
        device: deviceId,
        baseline: '',
        parameter: 'resolution',
        metric: 'ram',
        minimum: '',
        maximum: '',
        expanded: false,
    });
    const update = (patch: Partial<SelectionState>) =>
        setState(previous => ({ ...previous, ...patch }));
    const scope: Record<string, string> = {};
    if (deviceId) scope.device_id = deviceId;
    if (presetName) scope.preset_name = presetName;
    if (presetVersion != null) scope.preset_version = String(presetVersion);
    const discovery = useQuery({
        queryKey: ['performance', 'comparison', scope],
        queryFn: () => provider.performanceComparison(scope),
        retry: false,
    });
    const configurations = discovery.data?.configurations ?? [];
    const device = state.device ?? configurations[0]?.device_id ?? '';
    const options = configurations.filter(row => (row.device_id ?? '') === device);
    const selected = options.find(row => row.id === state.baseline) ?? options[0];
    const query: Record<string, string> = { ...scope, parameter: state.parameter };
    if (device) query.device_id = device;
    if (selected) query.baseline = selected.id;
    if (state.minimum) query.min_frames = state.minimum;
    if (state.maximum) query.max_frames = state.maximum;
    const invalid =
        [state.minimum, state.maximum].some(
            value => value !== '' && (!/^\d+$/.test(value) || Number(value) > 4294967295),
        ) ||
        Boolean(
            state.minimum && state.maximum && Number(state.minimum) > Number(state.maximum),
        );
    const comparison = useQuery({
        queryKey: ['performance', 'comparison', query],
        queryFn: () => provider.performanceComparison(query),
        enabled: !!selected && !invalid,
        retry: false,
    });
    const devices = new Map(
        configurations.map(row => [
            row.device_id ?? '',
            row.device_name ?? 'Unattributed device',
        ]),
    );
    return {
        state,
        update,
        device,
        options,
        selected,
        query,
        invalid,
        comparison,
        discovery,
        devices,
        error: discovery.error || comparison.error,
    };
};
type ComparisonModel = ReturnType<typeof useComparison>;

const Choice = ({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: Map<string, string>;
    onChange: (value: string) => void;
}) => (
    <TextField
        select
        label={label}
        value={value}
        onChange={event => onChange(event.target.value)}
    >
        {Array.from(options, ([key, text]) => (
            <MenuItem key={key} value={key}>
                {text}
            </MenuItem>
        ))}
    </TextField>
);

const SelectionControls = ({
    model,
    deviceFixed,
}: {
    model: ComparisonModel;
    deviceFixed: boolean;
}) => (
    <Stack spacing={2}>
        {!deviceFixed && (
            <Choice
                label="Device"
                value={model.device}
                options={model.devices}
                onChange={device => model.update({ device, baseline: '', expanded: false })}
            />
        )}
        <Choice
            label="Configuration"
            value={model.selected?.id ?? ''}
            options={new Map(model.options.map(row => [row.id, configurationLabel(row)]))}
            onChange={baseline => model.update({ baseline, expanded: false })}
        />
        <Stack direction="row" spacing={2}>
            <TextField
                label="Minimum frames"
                type="number"
                value={model.state.minimum}
                onChange={event => model.update({ minimum: event.target.value })}
            />
            <TextField
                label="Maximum frames"
                type="number"
                value={model.state.maximum}
                onChange={event => model.update({ maximum: event.target.value })}
            />
        </Stack>
    </Stack>
);

const ParameterControls = ({ model }: { model: ComparisonModel }) => (
    <Stack direction="row" spacing={2}>
        <Choice
            label="Compare parameter"
            value={model.state.parameter}
            options={
                new Map(
                    Object.entries({
                        resolution: 'Resolution',
                        fps: 'Input framerate',
                        batch: 'Batch size',
                        models: 'Models',
                    }),
                )
            }
            onChange={parameter => model.update({ parameter })}
        />
        <Choice
            label="Comparison metric"
            value={model.state.metric}
            options={new Map(Object.entries(METRICS))}
            onChange={metric => model.update({ metric: metric as Metric })}
        />
    </Stack>
);

const ComparisonChart = ({ model }: { model: ComparisonModel }) => {
    const data = model.comparison.data;
    const metric = model.state.metric;
    const chart = data?.baseline ? [data.baseline, ...data.alternatives] : [];
    const maximum = Math.max(...chart.map(group => group.stats[metric].max ?? 0), 1);
    return (
        <Stack spacing={1}>
            {chart.map((group, index) => (
                <Box key={group.configuration.id}>
                    <Typography variant="body2">
                        {index
                            ? configurationLabel(group.configuration)
                            : 'Selected configuration'}
                    </Typography>
                    <Range stats={group.stats[metric]} maximum={maximum} />
                    <Typography variant="caption">
                        {metricText(group.stats[metric].median, metric)} ·{' '}
                        {group.stats[metric].n} observations
                    </Typography>
                </Box>
            ))}
            <Typography variant="caption">
                Median marker · middle 50% band · observed range. Other settings and hardware
                must match. Resource measurements do not establish output quality.
            </Typography>
            {data && !data.alternatives.length && <Typography>No comparable runs.</Typography>}
        </Stack>
    );
};

const ComparisonResults = ({ model }: { model: ComparisonModel }) => {
    if (model.invalid)
        return (
            <Typography role="alert">
                Enter non-negative whole frame counts, with minimum no greater than maximum.
            </Typography>
        );
    if (model.comparison.isPending) return <Typography>Loading comparison...</Typography>;
    const baseline = model.comparison.data?.baseline;
    return (
        <Stack spacing={2}>
            {baseline ? (
                <Summary group={baseline} />
            ) : (
                <Typography>No observations for this configuration and workload.</Typography>
            )}
            <ParameterControls model={model} />
            <ComparisonChart model={model} />
            <Button
                onClick={() => model.update({ expanded: !model.state.expanded })}
                aria-expanded={model.state.expanded}
            >
                Explore evidence
            </Button>
            {model.state.expanded && model.selected && (
                <Evidence
                    key={JSON.stringify(model.query)}
                    query={model.query}
                    metric={model.state.metric}
                />
            )}
        </Stack>
    );
};

export default function ComparisonView(props: ComparisonProps) {
    const model = useComparison(props);
    return (
        <Stack spacing={2}>
            <Typography variant="h6">Configuration performance</Typography>
            {model.error && (
                <Typography role="alert">
                    Performance comparison unavailable: {model.error.message}
                </Typography>
            )}
            {model.discovery.isPending && <Typography>Loading configurations...</Typography>}
            {!model.discovery.isPending &&
                !model.discovery.data?.configurations.length &&
                !model.error && <Typography>No performance observations yet.</Typography>}
            {!!model.discovery.data?.configurations.length && (
                <>
                    <SelectionControls model={model} deviceFixed={!!props.deviceId} />
                    {!model.error && <ComparisonResults model={model} />}
                </>
            )}
        </Stack>
    );
}
