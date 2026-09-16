import { useRecordContext } from 'react-admin';
import { Link } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';

import type { Device } from '../contract';
import GroupTable, { CAPTION, Note } from '../performance/GroupTable';
import { PresetCell } from '../performance/MetricCells';
import { configKey, modelsLabel, processingConfig } from '../performance/statistics';
import { usePerformanceSummary } from '../performance/usePerformanceSummary';
import { matchNote, usePresetLookup } from '../performance/usePresetLookup';
import { presetLabel } from '../runs/preset';

const FleetLink = () => (
    <Typography variant="body2">
        <Link to="/performance">Compare with the fleet</Link>
    </Typography>
);

/** What this device's runs cost it, from the fleet summary the registry aggregates. */
const DevicePerformance = () => {
    const record = useRecordContext<Device>();
    const { groups, error } = usePerformanceSummary();
    const rows = record ? (groups ?? []).filter(group => group.device_id === record.id) : [];
    const lookup = usePresetLookup(rows);
    if (!record) return null;
    if (error) {
        return (
            <Note>{`The registry did not answer the performance summary (${error}).`}</Note>
        );
    }
    if (!groups) return <Note>Loading…</Note>;
    if (!rows.length) {
        return (
            <Stack spacing={1}>
                <Note>No runs from this device report performance data yet.</Note>
                <FleetLink />
            </Stack>
        );
    }
    return (
        <Stack spacing={1}>
            <Note>{CAPTION}</Note>
            <Box sx={{ overflowX: 'auto' }}>
                <GroupTable
                    groups={rows}
                    sortKey={group =>
                        `${presetLabel(group)}|${modelsLabel(group)}|${configKey(processingConfig(group))}`
                    }
                    lead={[
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
            </Box>
            <FleetLink />
        </Stack>
    );
};

export default DevicePerformance;
