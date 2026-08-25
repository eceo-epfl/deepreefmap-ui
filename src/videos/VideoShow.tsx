import {
    BooleanField,
    Datagrid,
    DateField,
    EditButton,
    FunctionField,
    Labeled,
    ListContextProvider,
    Loading,
    NumberField,
    ReferenceField,
    ReferenceManyField,
    Show,
    TextField,
    TopToolbar,
    useList,
    useRecordContext,
} from 'react-admin';
import { Alert, Box, Divider, Grid, Stack, Typography } from '@mui/material';

import ArchiveChip from '../archive/ArchiveChip';
import ProposedChangesPanel from '../changes/ProposedChangesPanel';
import {
    asColumn,
    DurationField,
    HashField,
    SyncFields,
    TombstoneButton,
    TriStateField,
    ValidateButton,
} from '../components';
import type { VideoAsset } from '../contract';
import { useCanAuthor } from '../permissions';
import { RunStatusChip } from '../runs/StatusField';
import { ReviewField, RigPositionField } from './ReviewField';
import { ResolutionField, SizeField } from './VideoFields';
import { useVideoRuns } from './useVideoRuns';

const DurationColumn = asColumn(DurationField);

const VideoShowActions = () => {
    const canAuthor = useCanAuthor();
    return (
        <TopToolbar>
            <ValidateButton section="videos" />
            {canAuthor && <EditButton />}
            <TombstoneButton noun="video" />
        </TopToolbar>
    );
};

const NoPasses = () => (
    <Typography
        variant="body2"
        sx={{
            color: 'text.secondary',
            p: 1,
        }}
    >
        No pass covers this clip yet. Divers trim their passes on the laptop, and the windows
        arrive with the next sync.
    </Typography>
);

const NoRuns = () => (
    <Typography
        variant="body2"
        sx={{
            color: 'text.secondary',
            p: 1,
        }}
    >
        No run has consumed this clip yet. Runs appear once a desktop client reconstructs a
        pass built on it and syncs.
    </Typography>
);

// The probe keys on the content hash, so an unhashed clip is never looked up.
const VideoArchive = () => {
    const record = useRecordContext<VideoAsset>();
    return <ArchiveChip contentHash={record?.hash} />;
};

/** Runs reach a clip through its passes, so the registry resolves the join. */
const VideoRuns = () => {
    const record = useRecordContext<VideoAsset>();
    const { runs, error, pending } = useVideoRuns(record?.id);
    const listContext = useList({ data: runs ?? [] });
    if (error) return <Alert severity="error">{error}</Alert>;
    if (pending || !runs) return <Loading />;
    return (
        <ListContextProvider value={listContext}>
            <Datagrid resource="runs" bulkActionButtons={false} empty={<NoRuns />}>
                <FunctionField
                    label="Status"
                    render={run => <RunStatusChip status={run.status as string} />}
                />
                <ReferenceField
                    source="pass_id"
                    reference="passes"
                    link="show"
                    label="Pass"
                    sortable={false}
                >
                    <TextField source="label" emptyText="Unlabelled pass" />
                </ReferenceField>
                <TextField source="mapping_backend" emptyText="—" sortable={false} />
                <TextField source="segmentation_model" emptyText="—" sortable={false} />
                <DateField source="started_at" showTime emptyText="—" sortable={false} />
            </Datagrid>
        </ListContextProvider>
    );
};

const VideoPasses = () => (
    <ReferenceManyField
        reference="pass_videos"
        target="video_id"
        sort={{ field: 'ordinal', order: 'ASC' }}
        perPage={25}
    >
        <Datagrid bulkActionButtons={false} empty={<NoPasses />}>
            <NumberField source="ordinal" label="Ordinal in pass" />
            <ReferenceField
                source="pass_id"
                reference="passes"
                link="show"
                label="Pass"
                sortable={false}
            >
                <TextField source="label" emptyText="Unnamed" />
            </ReferenceField>
            <ReferenceField
                source="pass_id"
                reference="passes"
                link={false}
                label="Window"
                sortable={false}
            >
                <DurationColumn source="begin_s" endSource="end_s" />
            </ReferenceField>
            <ReferenceField
                source="pass_id"
                reference="passes"
                link={false}
                label="Transect"
                sortable={false}
            >
                <ReferenceField
                    source="transect_id"
                    reference="transects"
                    link="show"
                    emptyText="—"
                >
                    <TextField source="name" />
                </ReferenceField>
            </ReferenceField>
        </Datagrid>
    </ReferenceManyField>
);

const VideoShow = () => (
    <Show actions={<VideoShowActions />}>
        <Stack
            spacing={2}
            sx={{
                p: 2,
            }}
        >
            <ProposedChangesPanel section="videos" />
            <Grid container spacing={2}>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                    }}
                >
                    <Labeled label="File name">
                        <TextField source="file_name" />
                    </Labeled>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                    }}
                >
                    <Labeled label="Quick hash (imohash)">
                        <HashField abbreviate={false} />
                    </Labeled>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        md: 4,
                    }}
                >
                    <Labeled label="Archive">
                        <VideoArchive />
                    </Labeled>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
                >
                    <Labeled label="Duration">
                        <DurationField source="duration_s" />
                    </Labeled>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
                >
                    <Labeled label="Size">
                        <SizeField />
                    </Labeled>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
                >
                    <Labeled label="Resolution">
                        <ResolutionField />
                    </Labeled>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
                >
                    <Labeled label="Frame rate">
                        <NumberField source="fps" emptyText="—" />
                    </Labeled>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
                >
                    <Labeled label="Codec">
                        <TextField source="codec" emptyText="—" />
                    </Labeled>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
                >
                    <Labeled label="Captured">
                        <DateField source="captured_at" showTime emptyText="—" />
                    </Labeled>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
                >
                    <Labeled label="Timestamp source">
                        <TextField source="captured_source" emptyText="Unknown" />
                    </Labeled>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
                >
                    <Stack direction="row" spacing={3}>
                        <Labeled label="Gravity">
                            <TriStateField source="gravity" />
                        </Labeled>
                        <Labeled label="GPS">
                            <TriStateField source="gps" />
                        </Labeled>
                    </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Labeled label="Camera">
                        <TextField source="camera_label" emptyText="—" />
                    </Labeled>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Labeled label="Rig position">
                        <RigPositionField />
                    </Labeled>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Labeled label="Upside down">
                        <BooleanField source="upside_down" />
                    </Labeled>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Labeled label="Review">
                        <ReviewField />
                    </Labeled>
                </Grid>
                <Grid size={12}>
                    <Labeled label="Notes">
                        <TextField source="notes" emptyText="—" />
                    </Labeled>
                </Grid>
            </Grid>

            <Divider />
            <Box>
                <Typography
                    variant="overline"
                    sx={{
                        color: 'text.secondary',
                    }}
                >
                    Passes using this clip
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                        color: 'text.secondary',
                        display: 'block',
                    }}
                >
                    One clip often holds several passes, sometimes swum in both directions.
                </Typography>
            </Box>
            <VideoPasses />

            <Divider />
            <Box>
                <Typography
                    variant="overline"
                    sx={{
                        color: 'text.secondary',
                    }}
                >
                    Runs from this clip
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                        color: 'text.secondary',
                        display: 'block',
                    }}
                >
                    Every reconstruction whose pass drew frames from this clip.
                </Typography>
            </Box>
            <VideoRuns />

            <Divider />
            <SyncFields />
        </Stack>
    </Show>
);

export default VideoShow;
