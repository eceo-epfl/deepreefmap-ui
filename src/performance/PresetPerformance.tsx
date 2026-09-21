import { useRecordContext } from 'react-admin';
import { Box, Stack } from '@mui/material';

import type { Preset } from '../contract';
import GroupTable, { CAPTION, Note, summaryError } from './GroupTable';
import { DeviceCell, PresetCell, SystemCell } from './MetricCells';
import {
    configKey,
    configNote,
    modelsLabel,
    processingConfig,
    processingSettings,
} from './statistics';
import { usePerformanceSummary } from './usePerformanceSummary';

/** Fleet summary rows for this preset, matched by name and version. */
const PresetPerformance = () => {
    const record = useRecordContext<Preset>();
    const { groups, error } = usePerformanceSummary();
    if (!record) return null;
    if (error) return <Note>{summaryError(error)}</Note>;
    if (!groups) return <Note>Loading…</Note>;
    const rows = groups.filter(
        group => group.preset_name === record.name && group.preset_version === record.version,
    );
    if (!rows.length) return <Note>No runs report performance for this preset yet.</Note>;
    const settings = processingSettings(record.settings);
    return (
        <Stack spacing={1}>
            <Note>{CAPTION}</Note>
            <Box sx={{ overflowX: 'auto' }}>
                <GroupTable
                    groups={rows}
                    sortKey={group =>
                        `${group.device_name ?? ''}|${modelsLabel(group)}|${configKey(processingConfig(group))}`
                    }
                    lead={[
                        {
                            header: 'Device',
                            cell: group => (
                                <DeviceCell id={group.device_id} name={group.device_name} />
                            ),
                        },
                        { header: 'System', cell: group => <SystemCell group={group} /> },
                        {
                            header: 'Settings',
                            cell: group => (
                                <PresetCell
                                    models={modelsLabel(group)}
                                    note={configNote(processingConfig(group), settings)}
                                />
                            ),
                        },
                    ]}
                />
            </Box>
        </Stack>
    );
};

export default PresetPerformance;
