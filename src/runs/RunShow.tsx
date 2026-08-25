import { ReactNode, useState } from 'react';
import {
    DateField,
    Labeled,
    Loading,
    NumberField,
    ReferenceField,
    Show,
    TextField,
    useGetOne,
    useRecordContext,
} from 'react-admin';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
} from '@mui/material';

import ArchivedOutputs from '../archive/ArchivedOutputs';
import { HashField, SyncFields } from '../components';
import type { Device, RunRecord } from '../contract';
import RunCoverTable from '../cover/RunCoverTable';
import { profileTotals, type ProfileTotals } from '../devices/profile';
import RunCloudTab from '../viewer/RunCloudTab';
import ProvenanceTable, { hasEntries } from './ProvenanceTable';
import { RunPeakSummary, StageDurationsTable, StagePeaksTable } from './StageBreakdown';
import StatusField from './StatusField';
import { formatDuration, runDuration } from './duration';
import { presetLabel } from './preset';

const Heading = ({ title }: { title: string }) => (
    <Typography
        variant="overline"
        sx={{
            color: 'text.secondary',
        }}
    >
        {title}
    </Typography>
);

const Panel = ({ title, children }: { title: string; children: ReactNode }) => (
    <Card variant="outlined">
        <CardContent>
            <Stack spacing={1.5}>
                <Heading title={title} />
                {children}
            </Stack>
        </CardContent>
    </Card>
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

const Monospace = ({
    value,
    emptyText = '—',
}: {
    value?: string | null;
    emptyText?: string;
}) => (
    <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
        {value || emptyText}
    </Typography>
);

const CloudSection = () => {
    // Mounted on first expand, so the cloud never downloads for runs nobody opens.
    const [opened, setOpened] = useState(false);
    return (
        <Accordion
            variant="outlined"
            disableGutters
            defaultExpanded={false}
            onChange={(_, expanded) => expanded && setOpened(true)}
        >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Heading title="3D cloud" />
            </AccordionSummary>
            <AccordionDetails>{opened && <RunCloudTab />}</AccordionDetails>
        </Accordion>
    );
};

const Provenance = ({ record, totals }: { record: RunRecord; totals: ProfileTotals }) => {
    const deviated = hasEntries(record.preset_deviations);
    return (
        <Accordion variant="outlined" disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack
                    direction="row"
                    spacing={1.5}
                    useFlexGap
                    sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                >
                    <Heading title="Provenance and resource use" />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Versions, models, preset settings, and memory and time per stage
                    </Typography>
                    {deviated && (
                        <Chip
                            size="small"
                            color="warning"
                            label="Preset deviations"
                            variant="outlined"
                        />
                    )}
                </Stack>
            </AccordionSummary>
            <AccordionDetails>
                <Stack spacing={1.5}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                        }}
                    >
                        Two runs are comparable only where every value here matches.
                    </Typography>
                    <Fields>
                        <Labeled label="GUI version">
                            <TextField source="gui_version" emptyText="—" />
                        </Labeled>
                        <Labeled label="Library version">
                            <TextField source="library_version" emptyText="—" />
                        </Labeled>
                        <Labeled label="Segmentation model">
                            <TextField source="segmentation_model" emptyText="—" />
                        </Labeled>
                        <Labeled label="Mapping backend">
                            <TextField source="mapping_backend" emptyText="—" />
                        </Labeled>
                        <Labeled label="Taxonomy version">
                            <NumberField source="taxonomy_version" emptyText="—" />
                        </Labeled>
                        <Labeled label="Taxonomy hash">
                            <HashField source="taxonomy_hash" emptyText="—" />
                        </Labeled>
                        <Labeled label="Preset">
                            <TextField source="preset_name" emptyText="—" />
                        </Labeled>
                        <Labeled label="Preset version">
                            <NumberField source="preset_version" emptyText="—" />
                        </Labeled>
                        <Labeled label="Preset hash">
                            <HashField source="preset_hash" emptyText="—" />
                        </Labeled>
                        <Labeled label="Duration">
                            <Typography variant="body2">
                                {record.run_duration_s == null
                                    ? '—'
                                    : formatDuration(record.run_duration_s)}
                            </Typography>
                        </Labeled>
                        <Labeled label="Run directory">
                            <Monospace value={record.run_dir_name} />
                        </Labeled>
                    </Fields>

                    <Heading title="Model revisions" />
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                        }}
                    >
                        Best-effort: the upstream revision present at launch, not proof it was
                        loaded.
                    </Typography>
                    <ProvenanceTable
                        value={record.model_revisions}
                        emptyText="No revisions recorded."
                    />

                    <Heading title="Preset deviations" />
                    {deviated ? (
                        <>
                            <Alert severity="warning">
                                The operator departed from the {record.preset_name || 'preset'}{' '}
                                on the settings below.
                            </Alert>
                            <ProvenanceTable value={record.preset_deviations} emptyText="" />
                        </>
                    ) : (
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'text.secondary',
                            }}
                        >
                            Nothing recorded. Either the run stayed on its preset, or the
                            desktop app did not report deviations.
                        </Typography>
                    )}

                    {hasEntries(record.stage_durations) && (
                        <>
                            <Heading title="Stage durations" />
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'text.secondary',
                                }}
                            >
                                Wall clock per stage, so a slow run names its slow stage.
                            </Typography>
                            <StageDurationsTable value={record.stage_durations} emptyText="" />
                        </>
                    )}

                    {hasEntries(record.stage_peaks) && (
                        <>
                            <Heading title="Stage peaks" />
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'text.secondary',
                                }}
                            >
                                Peak resource use per stage, so an out-of-memory run stays
                                explicable.
                            </Typography>
                            <StagePeaksTable
                                value={record.stage_peaks}
                                totals={totals}
                                emptyText=""
                            />
                        </>
                    )}
                </Stack>
            </AccordionDetails>
        </Accordion>
    );
};

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
    const seconds = runDuration(record.started_at, record.finished_at);
    const versions = [
        record.gui_version ? `GUI ${record.gui_version}` : null,
        record.library_version ? `lib ${record.library_version}` : null,
    ]
        .filter(Boolean)
        .join(' · ');
    return (
        <Stack spacing={2} sx={{ p: 2 }}>
            <Panel title="Run">
                <Fields>
                    <Labeled label="Status">
                        <StatusField />
                    </Labeled>
                    <Labeled label="Pass">
                        <ReferenceField source="pass_id" reference="passes" link="show">
                            <TextField source="label" emptyText="Unlabelled pass" />
                        </ReferenceField>
                    </Labeled>
                    <Labeled label="Transect">
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
                    </Labeled>
                    <Labeled label="Started">
                        <DateField source="started_at" showTime emptyText="—" />
                    </Labeled>
                    <Labeled label="Finished">
                        <DateField source="finished_at" showTime emptyText="—" />
                    </Labeled>
                    <Labeled label="Duration">
                        <Typography variant="body2">
                            {seconds == null ? '—' : formatDuration(seconds)}
                        </Typography>
                    </Labeled>
                    <Labeled label="Device">
                        <ReferenceField
                            source="device_id"
                            reference="devices"
                            link="show"
                            emptyText="—"
                        >
                            <TextField source="name" />
                        </ReferenceField>
                    </Labeled>
                    <Labeled label="Preset">
                        {/* Both facts: an overridden run is the one whose preset matters. */}
                        <Stack
                            direction="row"
                            spacing={1}
                            useFlexGap
                            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                        >
                            <Typography variant="body2">{presetLabel(record)}</Typography>
                            {hasEntries(record.preset_deviations) && (
                                <Chip
                                    size="small"
                                    color="warning"
                                    label="Deviations"
                                    variant="outlined"
                                />
                            )}
                        </Stack>
                    </Labeled>
                    <Labeled label="Versions">
                        <Typography variant="body2">{versions || '—'}</Typography>
                    </Labeled>
                </Fields>
                <Heading title="Peak resource use" />
                <RunPeakSummary value={record.stage_peaks} totals={totals} />
            </Panel>

            {record.status === 'failed' && (
                <Alert severity="error">
                    <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
                    >
                        {record.error || 'The run failed without reporting an error.'}
                    </Typography>
                </Alert>
            )}

            <Panel title="Scale">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    What the cover was measured at. A run scaled from a tape length that has
                    since been corrected keeps the length it used.
                </Typography>
                <Fields>
                    <Labeled label="Camera profile">
                        <TextField source="camera_profile" emptyText="—" />
                    </Labeled>
                    <Labeled label="Scale">
                        <TextField source="scale_type" emptyText="—" />
                    </Labeled>
                    <Labeled label="Tape length used (m)">
                        <NumberField source="transect_length_m" emptyText="—" />
                    </Labeled>
                    <Labeled label="Crop width (m)">
                        <NumberField source="crop_width_m" emptyText="—" />
                    </Labeled>
                    <Labeled label="Metres per pixel">
                        <NumberField
                            source="pixel_size_m"
                            emptyText="—"
                            options={{ maximumFractionDigits: 5 }}
                        />
                    </Labeled>
                </Fields>
            </Panel>

            <Panel title="Cover">
                <RunCoverTable />
            </Panel>

            <Panel title="Archived outputs">
                <ArchivedOutputs />
            </Panel>

            <CloudSection />

            <Provenance record={record} totals={totals} />

            <SyncFields />
        </Stack>
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
