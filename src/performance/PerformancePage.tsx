import { useState } from 'react';
import { Title, useGetList } from 'react-admin';
import {
    Box,
    Card,
    CardContent,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';

import type { PerformanceGroup, Preset } from '../contract';
import { relativeTime } from '../devices/RelativeDateField';
import { presetLabel } from '../runs/preset';
import { formatBytes } from '../videos/VideoFields';
import GroupTable from './GroupTable';
import {
    columnMaxima,
    DeviceCell,
    MetricCells,
    MetricHeaders,
    PresetCell,
    RunsCell,
} from './MetricCells';
import { configLabel, modelsLabel, rollUpByPreset } from './statistics';
import type { PresetRollup } from './statistics';
import { usePerformanceSummary } from './usePerformanceSummary';

type Grouping = 'device' | 'preset';

const CAPTION =
    'Each run contributes one figure per metric, its peak across every stage of that ' +
    'run. The columns are the mean and sample standard deviation of those per-run ' +
    'peaks, taken across the runs in each group, with the observed range and the ' +
    'sample size beneath. n is counted per metric, so a laptop with no discrete GPU ' +
    'contributes runs but no VRAM. The figures cover runs that recorded per-stage ' +
    'peaks, a failed run among them once it recorded some. A run that recorded none, ' +
    'after an early crash or from an older build, does not appear at all, not even ' +
    'in the Runs count.';

const BARS =
    'A solid bar fills a memory total the device reported, so it says how full that ' +
    'machine was. A striped bar has none to fill and only ranks its row against the ' +
    'widest figure in the column, which is what duration, swap and any device that ' +
    'never reported its memory get. The tick on a bar marks the highest single run.';

const HeadCell = ({ children }: { children: string }) => (
    <TableCell sx={{ whiteSpace: 'nowrap' }}>{children}</TableCell>
);

const Note = ({ children }: { children: string }) => (
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {children}
    </Typography>
);

const ConfigCell = ({ children }: { children: string }) => (
    <TableCell>
        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
            {children}
        </Typography>
    </TableCell>
);

const LastRunCell = ({ at }: { at: string | null | undefined }) => (
    <TableCell>
        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
            {at ? relativeTime(at) : '—'}
        </Typography>
    </TableCell>
);

const systemLabel = (group: PerformanceGroup): string | null => {
    const parts = [
        group.gpu_name,
        group.total_vram_bytes == null ? null : `${formatBytes(group.total_vram_bytes)} VRAM`,
        group.total_ram_bytes == null ? null : `${formatBytes(group.total_ram_bytes)} RAM`,
    ].filter(Boolean);
    return parts.length ? parts.join(' · ') : null;
};

const DeviceGrainTable = ({
    groups,
    presets,
}: {
    groups: PerformanceGroup[];
    presets: Preset[] | undefined;
}) => (
    <GroupTable
        groups={groups}
        sortKey={group =>
            `${group.device_name ?? ''}|${presetLabel(group)}|${modelsLabel(group)}|${configLabel(group)}`
        }
        lead={[
            {
                header: 'Device',
                cell: group => <DeviceCell id={group.device_id} name={group.device_name} />,
            },
            {
                header: 'System',
                cell: group => (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {systemLabel(group) ?? '—'}
                    </Typography>
                ),
            },
            {
                header: 'Preset',
                cell: group => <PresetCell group={group} presets={presets} />,
            },
        ]}
    />
);

const PresetRollupTable = ({
    rollups,
    presets,
}: {
    rollups: PresetRollup[];
    presets: Preset[] | undefined;
}) => {
    const maxima = columnMaxima(rollups);
    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <HeadCell>Preset</HeadCell>
                    <HeadCell>Models</HeadCell>
                    <HeadCell>Config</HeadCell>
                    <HeadCell>Devices</HeadCell>
                    <HeadCell>Runs</HeadCell>
                    <MetricHeaders />
                    <HeadCell>Last run</HeadCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {rollups.map(row => (
                    <TableRow key={row.key}>
                        <TableCell>
                            <PresetCell group={row} presets={presets} />
                        </TableCell>
                        <TableCell>
                            <Typography variant="body2">{row.models}</Typography>
                        </TableCell>
                        <ConfigCell>{row.config}</ConfigCell>
                        <TableCell>
                            <Typography variant="body2">{row.device_count}</Typography>
                        </TableCell>
                        <TableCell>
                            <RunsCell count={row.run_count} failed={row.failed_count} />
                        </TableCell>
                        <MetricCells
                            stats={row.stats}
                            utilisation={row.utilisation}
                            maxima={maxima}
                        />
                        <LastRunCell at={row.last_run_at} />
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

/** Fleet resource use per device × preset × models × config, from synced runs. */
const PerformancePage = () => {
    const [grouping, setGrouping] = useState<Grouping>('device');
    const { groups, error } = usePerformanceSummary();
    // Same parameters as the assignment panel, so the whole console shares one fetch.
    const { data: presets } = useGetList<Preset>('presets', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'name', order: 'ASC' },
    });

    return (
        <Card sx={{ mt: 1 }}>
            <Title title="Performance" />
            <CardContent>
                <Stack spacing={2}>
                    <Stack
                        direction="row"
                        spacing={2}
                        useFlexGap
                        sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                    >
                        <Typography variant="h6">Performance</Typography>
                        <ToggleButtonGroup
                            size="small"
                            exclusive
                            value={grouping}
                            onChange={(_, next: Grouping | null) => next && setGrouping(next)}
                        >
                            <ToggleButton value="device">By device</ToggleButton>
                            <ToggleButton value="preset">By preset</ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>
                    <Note>{CAPTION}</Note>
                    <Note>{BARS}</Note>
                    {grouping === 'preset' && (
                        <Note>
                            One row per preset, models and config, pooled across the devices
                            that ran it. The pooled deviation carries the spread between those
                            devices as well as the spread within each of them. These rows have
                            no single memory ceiling, so every bar is a striped one, and a row
                            is flagged when one of its devices came close to filling its own
                            memory.
                        </Note>
                    )}
                    {error ? (
                        <Note>
                            {`The registry did not answer the performance summary. It may predate this console. (${error})`}
                        </Note>
                    ) : !groups ? (
                        <Note>Loading…</Note>
                    ) : !groups.length ? (
                        <Note>
                            No runs report performance data yet. Figures appear once enrolled
                            laptops sync finished runs.
                        </Note>
                    ) : (
                        <Box sx={{ overflowX: 'auto' }}>
                            {grouping === 'device' ? (
                                <DeviceGrainTable groups={groups} presets={presets} />
                            ) : (
                                <PresetRollupTable
                                    rollups={rollUpByPreset(groups)}
                                    presets={presets}
                                />
                            )}
                        </Box>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};

export default PerformancePage;
