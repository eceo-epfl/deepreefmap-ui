import { useRecordContext } from 'react-admin';
import { Box, Typography } from '@mui/material';

import type { Preset } from '../contract';
import GroupTable from './GroupTable';
import { DeviceCell } from './MetricCells';
import { configLabel, modelsLabel } from './statistics';
import { usePerformanceSummary } from './usePerformanceSummary';

const Note = ({ children }: { children: string }) => (
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {children}
    </Typography>
);

/** How this preset has performed per device, models and config, from the shared fleet
 * summary. Runs name their preset, so the match is name plus version. */
const PresetPerformance = () => {
    const record = useRecordContext<Preset>();
    const { groups, error } = usePerformanceSummary();
    if (!record) return null;
    if (error) {
        return (
            <Note>
                The registry did not answer the performance summary. It may predate this
                console.
            </Note>
        );
    }
    if (!groups) return <Note>Loading…</Note>;
    const rows = groups.filter(
        group => group.preset_name === record.name && group.preset_version === record.version,
    );
    if (!rows.length) {
        return <Note>No runs report performance data against this preset yet.</Note>;
    }
    return (
        <>
            <Note>
                Mean and sample standard deviation across runs, where every run contributes its
                peak across stages.
            </Note>
            <Box sx={{ overflowX: 'auto' }}>
                <GroupTable
                    groups={rows}
                    sortKey={group =>
                        `${group.device_name ?? ''}|${modelsLabel(group)}|${configLabel(group)}`
                    }
                    lead={[
                        {
                            header: 'Device',
                            cell: group => (
                                <DeviceCell id={group.device_id} name={group.device_name} />
                            ),
                        },
                    ]}
                />
            </Box>
        </>
    );
};

export default PresetPerformance;
