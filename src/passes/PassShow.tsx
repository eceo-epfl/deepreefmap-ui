import {
    Datagrid,
    DateField,
    EditButton,
    FunctionField,
    Labeled,
    NumberField,
    ReferenceField,
    ReferenceManyField,
    Show,
    TextField,
    TopToolbar,
} from 'react-admin';
import { Divider, Grid, Stack, Tooltip, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import ProposedChangesPanel from '../changes/ProposedChangesPanel';
import {
    asColumn,
    DurationField,
    QualityField,
    SyncFields,
    TombstoneButton,
    ValidateButton,
} from '../components';
import { useCanAuthor } from '../permissions';
import { RunStatusChip } from '../runs/StatusField';
import { DirectionField } from './DirectionField';

const DurationColumn = asColumn(DurationField);

const PassShowActions = () => {
    const canAuthor = useCanAuthor();
    return (
        <TopToolbar>
            <ValidateButton section="passes" />
            {canAuthor && <EditButton />}
            <TombstoneButton noun="pass" />
        </TopToolbar>
    );
};

const SectionHeading = ({ title, tip }: { title: string; tip?: string }) => (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
        <Typography
            variant="overline"
            sx={{
                color: 'text.secondary',
            }}
        >
            {title}
        </Typography>
        {tip && (
            <Tooltip title={tip}>
                <InfoOutlinedIcon fontSize="inherit" sx={{ color: 'text.secondary' }} />
            </Tooltip>
        )}
    </Stack>
);

const NoClips = () => (
    <Typography
        variant="body2"
        sx={{
            color: 'text.secondary',
            p: 1,
        }}
    >
        No clips linked to this pass.
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
        No runs yet. They appear when a laptop reconstructs this pass and syncs.
    </Typography>
);

const PassClips = () => (
    <ReferenceManyField
        reference="pass_videos"
        target="pass_id"
        sort={{ field: 'ordinal', order: 'ASC' }}
        perPage={25}
    >
        <Datagrid bulkActionButtons={false} empty={<NoClips />}>
            <NumberField source="ordinal" label="Order" />
            <ReferenceField
                source="video_id"
                reference="videos"
                link="show"
                label="File"
                sortable={false}
            >
                <TextField source="file_name" />
            </ReferenceField>
            <ReferenceField
                source="video_id"
                reference="videos"
                link={false}
                label="Duration"
                sortable={false}
            >
                <DurationColumn source="duration_s" />
            </ReferenceField>
            <ReferenceField
                source="video_id"
                reference="videos"
                link={false}
                label="Captured"
                sortable={false}
            >
                <DateField source="captured_at" showTime emptyText="—" />
            </ReferenceField>
        </Datagrid>
    </ReferenceManyField>
);

const PassRuns = () => (
    <ReferenceManyField
        reference="runs"
        target="pass_id"
        sort={{ field: 'created_at', order: 'DESC' }}
        perPage={10}
    >
        <Datagrid bulkActionButtons={false} empty={<NoRuns />}>
            <FunctionField
                label="Status"
                render={record => <RunStatusChip status={record.status as string} />}
            />
            <TextField source="run_dir_name" label="Run directory" sortable={false} />
            <TextField source="mapping_backend" emptyText="—" sortable={false} />
            <TextField source="segmentation_model" emptyText="—" sortable={false} />
            <DateField source="started_at" showTime emptyText="—" />
            <DateField source="finished_at" showTime emptyText="—" />
        </Datagrid>
    </ReferenceManyField>
);

const PassShow = () => (
    <Show actions={<PassShowActions />}>
        <Stack
            spacing={2}
            sx={{
                p: 2,
            }}
        >
            <ProposedChangesPanel section="passes" />
            <Grid container spacing={2}>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
                >
                    <Labeled label="Label">
                        <TextField source="label" emptyText="Unnamed" />
                    </Labeled>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
                >
                    <Labeled label="Transect">
                        <ReferenceField
                            source="transect_id"
                            reference="transects"
                            link="show"
                            emptyText="No transect: unscaled"
                        >
                            <TextField source="name" />
                        </ReferenceField>
                    </Labeled>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
                >
                    <Labeled label="Campaign">
                        <ReferenceField
                            source="campaign_id"
                            reference="campaigns"
                            link="show"
                            emptyText="—"
                        >
                            <TextField source="name" />
                        </ReferenceField>
                    </Labeled>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
                >
                    <Labeled label="Surveyed on">
                        <DateField source="surveyed_on" emptyText="—" />
                    </Labeled>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
                >
                    <Labeled label="Quality">
                        <QualityField />
                    </Labeled>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
                >
                    <Labeled label="Window">
                        <DurationField source="begin_s" endSource="end_s" />
                    </Labeled>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
                >
                    <Labeled label="Direction">
                        <DirectionField />
                    </Labeled>
                </Grid>
                <Grid size={12}>
                    <Labeled label="Notes">
                        <TextField source="notes" emptyText="—" />
                    </Labeled>
                </Grid>
            </Grid>

            <Divider />
            <SectionHeading
                title="Clips, in playing order"
                tip="The window is an offset into these clips played end to end."
            />
            <PassClips />

            <Divider />
            <SectionHeading title="Runs" />
            <PassRuns />

            <Divider />
            <SyncFields />
        </Stack>
    </Show>
);

export default PassShow;
