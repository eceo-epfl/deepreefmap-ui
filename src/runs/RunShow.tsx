import { ReactNode } from 'react';
import {
    DateField,
    Loading,
    ReferenceField,
    Show,
    TabbedShowLayout,
    TextField,
    useGetOne,
    useRecordContext,
} from 'react-admin';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Alert, Box, Paper, Stack, Tooltip, Typography } from '@mui/material';

import ArchivedOutputs from '../archive/ArchivedOutputs';
import { HashField, SyncFields } from '../components';
import type { CameraCalibration, Device, RunRecord } from '../contract';
import { profileTotals, type ProfileTotals } from '../devices/profile';
import RunCloudTab from '../viewer/RunCloudTab';
import ProvenanceTable from './ProvenanceTable';
import RunCover from './RunCover';
import { RunPeakSummary, STAGE_PEAK_NOTES, StagesTable } from './StageBreakdown';
import StatusField from './StatusField';
import { formatDuration, runDuration } from './duration';
import { presetLabel } from './preset';

const Heading = ({ title, tip }: { title: string; tip?: string | string[] }) => (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            {title}
        </Typography>
        {tip && (
            <Tooltip
                title={
                    Array.isArray(tip) ? (
                        <Box component="ul" sx={{ m: 0, pl: 2 }}>
                            {tip.map(line => (
                                <li key={line}>{line}</li>
                            ))}
                        </Box>
                    ) : (
                        tip
                    )
                }
            >
                <InfoOutlinedIcon fontSize="inherit" sx={{ color: 'text.secondary' }} />
            </Tooltip>
        )}
    </Stack>
);

const Term = ({ label, children }: { label: string; children: ReactNode }) => (
    <>
        <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
            {label}
        </Typography>
        <Box sx={{ minWidth: 0 }}>{children}</Box>
    </>
);

/** Label/value pairs on a grid, values ellipsised rather than wrapped. */
const Facts = ({ children, pairs = 2 }: { children: ReactNode; pairs?: number }) => (
    <Box
        sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${pairs}, max-content minmax(0, 1fr))`,
            columnGap: 3,
            rowGap: 1,
            alignItems: 'baseline',
            '& .MuiTypography-body2, & a': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            },
        }}
    >
        {children}
    </Box>
);

const deviationLine = (value: unknown): string => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return '';
    return Object.entries(value as Record<string, unknown>)
        .map(
            ([key, entry]) =>
                `${key} ${typeof entry === 'object' ? JSON.stringify(entry) : entry}`,
        )
        .join(', ');
};

const scaleLine = (record: RunRecord): string => {
    const parts = [
        record.scale_type,
        record.transect_length_m == null ? null : `tape ${record.transect_length_m} m`,
        record.crop_width_m == null ? null : `crop ${record.crop_width_m} m`,
        record.pixel_size_m == null
            ? null
            : `${(record.pixel_size_m * 1000).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
              })} mm/px`,
    ];
    return parts.filter(Boolean).join(', ') || '—';
};

const CalibrationVersion = () => {
    const record = useRecordContext<CameraCalibration>();
    return (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {record ? `calibration v${record.version}` : ''}
        </Typography>
    );
};

/** The rig the run was shot on, and the measurement it was rectified with when
 * that measurement came from the registry. A laptop that calibrated its own
 * camera has a name and nothing to link to. */
const CameraLine = ({ record }: { record: RunRecord }) => {
    if (!record.camera_calibration_id) {
        return (
            <Typography variant="body2">
                {record.camera_profile
                    ? `${record.camera_profile}, calibrated on the device`
                    : '—'}
            </Typography>
        );
    }
    return (
        <ReferenceField
            source="camera_calibration_id"
            reference="camera_calibrations"
            link={false}
        >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
                <ReferenceField
                    source="camera_profile_id"
                    reference="camera_profiles"
                    link="show"
                >
                    <TextField source="name" />
                </ReferenceField>
                <CalibrationVersion />
            </Stack>
        </ReferenceField>
    );
};

const versionsLine = (record: RunRecord): string =>
    [
        record.gui_version ? `GUI ${record.gui_version}` : null,
        record.library_version ? `lib ${record.library_version}` : null,
    ]
        .filter(Boolean)
        .join(', ') || '—';

const Overview = ({ record }: { record: RunRecord }) => {
    const seconds = runDuration(record.started_at, record.finished_at);
    const deviations = deviationLine(record.preset_deviations);
    return (
        <Stack spacing={2} sx={{ width: '100%' }}>
            <Facts>
                <Term label="Status">
                    <StatusField />
                </Term>
                <Term label="Pass">
                    <ReferenceField source="pass_id" reference="passes" link="show">
                        <TextField source="label" emptyText="Unlabelled pass" />
                    </ReferenceField>
                </Term>
                <Term label="Transect">
                    <ReferenceField source="pass_id" reference="passes" link={false}>
                        <ReferenceField
                            source="transect_id"
                            reference="transects"
                            link="show"
                            emptyText="—"
                        >
                            <TextField source="name" />
                        </ReferenceField>
                    </ReferenceField>
                </Term>
                <Term label="Campaign">
                    <ReferenceField source="pass_id" reference="passes" link={false}>
                        <ReferenceField
                            source="campaign_id"
                            reference="campaigns"
                            link="show"
                            emptyText="—"
                        >
                            <TextField source="name" />
                        </ReferenceField>
                    </ReferenceField>
                </Term>
                <Term label="Started">
                    <DateField source="started_at" showTime emptyText="—" />
                </Term>
                <Term label="Duration">
                    <Typography variant="body2">
                        {seconds == null ? '—' : formatDuration(seconds)}
                    </Typography>
                </Term>
                <Term label="Device">
                    <ReferenceField
                        source="device_id"
                        reference="devices"
                        link="show"
                        emptyText="—"
                    >
                        <TextField source="name" />
                    </ReferenceField>
                </Term>
                <Term label="Preset">
                    <Typography variant="body2">{presetLabel(record)}</Typography>
                    {deviations && (
                        <Typography variant="caption" sx={{ color: 'warning.main' }}>
                            {deviations}
                        </Typography>
                    )}
                </Term>
                <Term label="Camera">
                    <CameraLine record={record} />
                </Term>
                <Term label="Scale">
                    <Typography variant="body2">{scaleLine(record)}</Typography>
                </Term>
                <Term label="Versions">
                    <Typography variant="body2">{versionsLine(record)}</Typography>
                </Term>
            </Facts>
            <SyncFields />
        </Stack>
    );
};

/** One titled block of the performance tab, all the same width in the grid. */
const Panel = ({
    title,
    tip,
    children,
}: {
    title: string;
    tip?: string | string[];
    children: ReactNode;
}) => (
    <Paper variant="outlined" sx={{ p: 2, minWidth: 0 }}>
        <Heading title={title} tip={tip} />
        <Box sx={{ mt: 1 }}>{children}</Box>
    </Paper>
);

/** Columns balanced in reading order, as many as the width takes. */
const Panels = ({ children }: { children: ReactNode }) => (
    <Box
        sx={{
            width: '100%',
            columnWidth: 440,
            columnGap: '16px',
            '& > *': { breakInside: 'avoid', mb: 2 },
        }}
    >
        {children}
    </Box>
);

const Performance = ({ record, totals }: { record: RunRecord; totals: ProfileTotals }) => (
    <Panels>
        <Panel title="Stages" tip={STAGE_PEAK_NOTES}>
            <StagesTable
                durations={record.stage_durations}
                peaks={record.stage_peaks}
                totals={totals}
                emptyText="No stages recorded."
            />
        </Panel>

        <Panel title="Peak resource use" tip="Highest across all stages.">
            <RunPeakSummary value={record.stage_peaks} totals={totals} />
        </Panel>

        <Panel
            title="Provenance"
            tip="Two runs are comparable only where every value matches."
        >
            <Facts pairs={1}>
                <Term label="Segmentation">
                    <Typography variant="body2">{record.segmentation_model || '—'}</Typography>
                </Term>
                <Term label="Mapping">
                    <Typography variant="body2">{record.mapping_backend || '—'}</Typography>
                </Term>
                <Term label="Taxonomy">
                    <Typography variant="body2">{record.taxonomy_version ?? '—'}</Typography>
                </Term>
                <Term label="Taxonomy hash">
                    <HashField source="taxonomy_hash" emptyText="—" />
                </Term>
                <Term label="Preset hash">
                    <HashField source="preset_hash" emptyText="—" />
                </Term>
                <Term label="Run directory">
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {record.run_dir_name || '—'}
                    </Typography>
                </Term>
            </Facts>
        </Panel>

        <Panel
            title="Model revisions"
            tip="Upstream revision at launch, not proof it was loaded."
        >
            <ProvenanceTable value={record.model_revisions} emptyText="None recorded." />
        </Panel>

        <Panel title="Preset deviations" tip="Settings that departed from the preset.">
            <ProvenanceTable value={record.preset_deviations} emptyText="None recorded." />
        </Panel>
    </Panels>
);

const RunLayout = () => {
    const record = useRecordContext<RunRecord>();
    // The device row carries the memory ceilings the stage peaks are scaled against.
    const { data: device } = useGetOne<Device>(
        'devices',
        { id: record?.device_id ?? '' },
        { enabled: Boolean(record?.device_id) },
    );
    if (!record) return <Loading />;
    const totals = profileTotals(device?.system_profile);
    return (
        <>
            {record.status === 'failed' && (
                <Alert severity="error" sx={{ m: 2, mb: 0 }}>
                    <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
                    >
                        {record.error || 'The run failed without reporting an error.'}
                    </Typography>
                </Alert>
            )}
            <TabbedShowLayout>
                <TabbedShowLayout.Tab label="Overview">
                    <Overview record={record} />
                </TabbedShowLayout.Tab>
                <TabbedShowLayout.Tab label="Cover" path="cover">
                    <RunCover />
                </TabbedShowLayout.Tab>
                <TabbedShowLayout.Tab label="Outputs" path="outputs">
                    <ArchivedOutputs />
                </TabbedShowLayout.Tab>
                <TabbedShowLayout.Tab label="3D cloud" path="cloud">
                    <RunCloudTab />
                </TabbedShowLayout.Tab>
                <TabbedShowLayout.Tab label="Performance" path="performance">
                    <Performance record={record} totals={totals} />
                </TabbedShowLayout.Tab>
            </TabbedShowLayout>
        </>
    );
};

const RunTitle = () => {
    const record = useRecordContext<RunRecord>();
    return <span>{record ? `Run ${record.run_dir_name || record.id}` : 'Run'}</span>;
};

/** Provenance for one pipeline execution. Runs are never authored here. */
const RunShow = () => (
    <Show title={<RunTitle />} actions={false}>
        <RunLayout />
    </Show>
);

export default RunShow;
