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
import { Alert, Box, Stack, Tooltip, Typography } from '@mui/material';

import ArchivedOutputs from '../archive/ArchivedOutputs';
import { HashField, SyncFields } from '../components';
import type { Device, RunRecord } from '../contract';
import { profileTotals, type ProfileTotals } from '../devices/profile';
import RunCloudTab from '../viewer/RunCloudTab';
import ProvenanceTable, { hasEntries } from './ProvenanceTable';
import RunCover from './RunCover';
import {
    RunPeakSummary,
    STAGE_PEAK_NOTES,
    StageDurationsTable,
    StagePeaksTable,
} from './StageBreakdown';
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

/** Two label/value pairs per row, values ellipsised rather than wrapped. */
const Facts = ({ children }: { children: ReactNode }) => (
    <Box
        sx={{
            display: 'grid',
            gridTemplateColumns: 'max-content minmax(0, 1fr) max-content minmax(0, 1fr)',
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

const Fields = ({ children }: { children: ReactNode }) => (
    <Box
        sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        }}
    >
        {children}
    </Box>
);

const Labeled = ({ label, children }: { label: string; children: ReactNode }) => (
    <Stack spacing={0.25}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {label}
        </Typography>
        <Typography variant="body2" component="div" sx={{ wordBreak: 'break-all' }}>
            {children}
        </Typography>
    </Stack>
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
        record.camera_profile ? `camera ${record.camera_profile}` : null,
    ];
    return parts.filter(Boolean).join(', ') || '—';
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

const Performance = ({ record, totals }: { record: RunRecord; totals: ProfileTotals }) => (
    <Stack spacing={2} sx={{ width: '100%' }}>
        <Heading title="Peak resource use" />
        <RunPeakSummary value={record.stage_peaks} totals={totals} />

        <Heading title="Stage durations" tip="Wall clock per stage." />
        <StageDurationsTable
            value={record.stage_durations}
            emptyText="No stage durations recorded."
        />

        <Heading title="Stage peaks" tip={STAGE_PEAK_NOTES} />
        <StagePeaksTable
            value={record.stage_peaks}
            totals={totals}
            emptyText="No stage peaks recorded."
        />

        <Heading
            title="Model revisions"
            tip="Upstream revision at launch, not proof it was loaded."
        />
        <ProvenanceTable value={record.model_revisions} emptyText="No revisions recorded." />

        <Heading title="Preset deviations" tip="Settings that departed from the preset." />
        {hasEntries(record.preset_deviations) ? (
            <ProvenanceTable value={record.preset_deviations} emptyText="" />
        ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                None recorded.
            </Typography>
        )}

        <Heading
            title="Provenance"
            tip="Two runs are comparable only where every value matches."
        />
        <Fields>
            <Labeled label="Segmentation model">{record.segmentation_model || '—'}</Labeled>
            <Labeled label="Mapping backend">{record.mapping_backend || '—'}</Labeled>
            <Labeled label="Taxonomy version">{record.taxonomy_version ?? '—'}</Labeled>
            <Labeled label="Taxonomy hash">
                <HashField source="taxonomy_hash" emptyText="—" />
            </Labeled>
            <Labeled label="Preset hash">
                <HashField source="preset_hash" emptyText="—" />
            </Labeled>
            <Labeled label="Run directory">
                <span style={{ fontFamily: 'monospace' }}>{record.run_dir_name || '—'}</span>
            </Labeled>
        </Fields>
    </Stack>
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
