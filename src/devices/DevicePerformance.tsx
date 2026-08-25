import { useGetList, useRecordContext } from 'react-admin';
import { Link } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';

import type { Device, Preset } from '../contract';
import GroupTable from '../performance/GroupTable';
import { PresetCell } from '../performance/MetricCells';
import { configLabel, modelsLabel } from '../performance/statistics';
import { usePerformanceSummary } from '../performance/usePerformanceSummary';
import { presetLabel } from '../runs/preset';

const CAPTION =
    'Mean and sample standard deviation across the runs this laptop reported, where ' +
    'every run contributes its peak across stages. A failed run counts once it ' +
    'recorded peaks, because an out-of-memory run is the one worth seeing.';

const EMPTY =
    'No runs from this device report performance data yet. Figures appear once it ' +
    'syncs a run that recorded per-stage peaks.';

const UNAVAILABLE =
    'The registry did not answer the performance summary. It may predate this console.';

const Note = ({ children }: { children: string }) => (
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {children}
    </Typography>
);

const FleetLink = () => (
    <Typography variant="body2">
        <Link to="/performance">Compare this laptop with the rest of the fleet</Link>
    </Typography>
);

/** What this device's runs cost it, from the fleet summary the registry aggregates. */
const DevicePerformance = () => {
    const record = useRecordContext<Device>();
    const { groups, error } = usePerformanceSummary();
    // Same parameters as the assignment panel, so the page shares one fetch.
    const { data: presets } = useGetList<Preset>('presets', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'name', order: 'ASC' },
    });
    if (!record) return null;
    if (error) return <Note>{UNAVAILABLE}</Note>;
    if (!groups) return <Note>Loading…</Note>;
    const rows = groups.filter(group => group.device_id === record.id);
    if (!rows.length) {
        return (
            <Stack spacing={1}>
                <Note>{EMPTY}</Note>
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
                        `${presetLabel(group)}|${modelsLabel(group)}|${configLabel(group)}`
                    }
                    lead={[
                        {
                            header: 'Preset',
                            cell: group => <PresetCell group={group} presets={presets} />,
                        },
                    ]}
                />
            </Box>
            <FleetLink />
        </Stack>
    );
};

export default DevicePerformance;
