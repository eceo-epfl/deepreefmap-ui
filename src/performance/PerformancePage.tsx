import { useState } from 'react';
import { Title } from 'react-admin';
import {
    Box,
    Button,
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

import type { PerformanceGroup } from '../contract';
import { presetLabel } from '../runs/preset';
import GroupTable, { CAPTION, Note, summaryError } from './GroupTable';
import {
    columnMaxima,
    DeviceCell,
    LastRunCell,
    PeaksCell,
    PeaksHeader,
    PresetCell,
    RunsCell,
    SystemCell,
} from './MetricCells';
import { configKey, modelsLabel, processingConfig, rollUpByPreset } from './statistics';
import type { PresetRollup } from './statistics';
import { usePerformanceSummary } from './usePerformanceSummary';
import { matchNote, usePresetLookup } from './usePresetLookup';
import type { PresetLookup } from './usePresetLookup';
import ComparisonView from './ComparisonView';

type Grouping = 'device' | 'preset';

const DeviceGrainTable = ({
    groups,
    lookup,
}: {
    groups: PerformanceGroup[];
    lookup: PresetLookup;
}) => (
    <GroupTable
        groups={groups}
        sortKey={group =>
            `${group.device_name ?? ''}|${presetLabel(group)}|${modelsLabel(group)}|${configKey(processingConfig(group))}`
        }
        lead={[
            {
                header: 'Device',
                cell: group => <DeviceCell id={group.device_id} name={group.device_name} />,
            },
            { header: 'System', cell: group => <SystemCell group={group} /> },
            {
                header: 'Preset',
                cell: group => {
                    const match = lookup(group);
                    return (
                        <PresetCell
                            label={group.preset_name ? presetLabel(group) : null}
                            presetId={match?.id}
                            models={modelsLabel(group)}
                            note={matchNote(match, processingConfig(group))}
                        />
                    );
                },
            },
        ]}
    />
);

const PresetRollupTable = ({
    rollups,
    lookup,
}: {
    rollups: PresetRollup[];
    lookup: PresetLookup;
}) => {
    const maxima = columnMaxima(rollups);
    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Preset</TableCell>
                    <TableCell>Devices</TableCell>
                    <TableCell>Runs</TableCell>
                    <PeaksHeader />
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Last run</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {rollups.map(row => {
                    const match = lookup(row);
                    return (
                        <TableRow key={row.key}>
                            <PresetCell
                                label={row.preset_name ? presetLabel(row) : null}
                                presetId={match?.id}
                                models={row.models}
                                note={matchNote(match, row.config)}
                            />
                            <TableCell>
                                <Typography variant="body2">{row.device_count}</Typography>
                            </TableCell>
                            <RunsCell count={row.run_count} failed={row.failed_count} />
                            <PeaksCell
                                stats={row.stats}
                                utilisation={row.utilisation}
                                maxima={maxima}
                            />
                            <LastRunCell at={row.last_run_at} />
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
};

/** Fleet resource use per device × preset × models × config, from synced runs. */
const FleetStatistics = () => {
    const [grouping, setGrouping] = useState<Grouping>('device');
    const { groups, error } = usePerformanceSummary();
    const lookup = usePresetLookup(groups);

    return (
        <Card sx={{ mt: 1 }}>
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
                    {error ? (
                        <Note>{summaryError(error)}</Note>
                    ) : !groups ? (
                        <Note>Loading…</Note>
                    ) : !groups.length ? (
                        <Note>No runs report performance data yet.</Note>
                    ) : (
                        <Box sx={{ overflowX: 'auto' }}>
                            {grouping === 'device' ? (
                                <DeviceGrainTable groups={groups} lookup={lookup} />
                            ) : (
                                <PresetRollupTable
                                    rollups={rollUpByPreset(groups)}
                                    lookup={lookup}
                                />
                            )}
                        </Box>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};

const PerformancePage = () => {
    const [fleet, setFleet] = useState(false);
    return (
        <Card sx={{ mt: 1 }}>
            <Title title="Performance" />
            <CardContent>
                <Stack spacing={2}>
                    <ComparisonView />
                    <Button onClick={() => setFleet(!fleet)} aria-expanded={fleet}>
                        Explore fleet statistics
                    </Button>
                    {fleet && <FleetStatistics />}
                </Stack>
            </CardContent>
        </Card>
    );
};

export default PerformancePage;
