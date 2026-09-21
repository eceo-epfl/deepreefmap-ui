import { SyntheticEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Datagrid,
    ListContextProvider,
    ReferenceField,
    TextField,
    Title,
    useDataProvider,
    useGetManyAggregate,
    useList,
    useRecordContext,
} from 'react-admin';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, Box, Card, Chip, Stack, Tab, Tabs, Typography } from '@mui/material';

import { asColumn } from '../components';
import type {
    ArchiveOverview as Overview,
    ClipOverview,
    RunOverview,
    RunOverviewState,
    Transect,
    TransectPass,
} from '../contract';
import type { DrmDataProvider } from '../dataProvider';
import RelativeDateField from '../devices/RelativeDateField';
import { formatBytes, SizeField } from '../videos/VideoFields';
import StatusField from './StatusField';
import StoredObjectList, { UploaderField } from './StoredObjectList';

const TABS = ['runs', 'clips', 'objects'] as const;
type TabName = (typeof TABS)[number];

const SizeColumn = asColumn(SizeField);
const StatusColumn = asColumn(StatusField);
const RelativeDateColumn = asColumn(RelativeDateField);

type RunRow = RunOverview & { id: string };
type ClipRow = ClipOverview & { id: string };

const STATE_LABELS: Record<RunOverviewState, string> = {
    complete: 'Complete',
    partial: 'Partial',
    failed: 'Failed',
    pending: 'Pending',
};

const STATE_COLOURS: Record<RunOverviewState, 'success' | 'warning' | 'error' | 'default'> = {
    complete: 'success',
    partial: 'warning',
    failed: 'error',
    pending: 'default',
};

const RunStateChip = ({ state }: { state: RunOverviewState }) => (
    <Chip
        size="small"
        label={STATE_LABELS[state] ?? state}
        color={STATE_COLOURS[state] ?? 'default'}
        variant={state === 'complete' || state === 'failed' ? 'filled' : 'outlined'}
    />
);

const RunStateFieldCell = () => {
    const record = useRecordContext<RunRow>();
    if (!record) return null;
    return <RunStateChip state={record.state} />;
};

// Passes without a label fall back to the transect name, as in the run list.
const RunFieldCell = () => {
    const record = useRecordContext<RunRow>();
    const passes = useGetManyAggregate<TransectPass>('passes', {
        ids: record ? [record.pass_id] : [],
    });
    const pass = passes.data?.[0];
    const transects = useGetManyAggregate<Transect>(
        'transects',
        { ids: pass?.transect_id ? [pass.transect_id] : [] },
        { enabled: !!pass && !pass.label },
    );
    if (!record) return null;
    const name = pass?.label || transects.data?.[0]?.name || record.pass_id.slice(0, 8);
    const started = record.started_at
        ? ` · started ${new Date(record.started_at).toLocaleDateString()}`
        : '';
    return (
        <Link to={`/runs/${record.run_id}/show`} onClick={event => event.stopPropagation()}>
            pass {name}
            {started}
        </Link>
    );
};

const FilesFieldCell = () => {
    const record = useRecordContext<RunRow>();
    if (!record) return null;
    return (
        <Stack direction="row" spacing={1} component="span">
            <span>
                {record.complete} / {record.artifacts}
            </span>
            {record.failed > 0 && (
                <Typography variant="body2" component="span" color="error.main">
                    {record.failed} failed
                </Typography>
            )}
        </Stack>
    );
};

const FileNameFieldCell = () => {
    const record = useRecordContext<ClipRow>();
    if (!record) return null;
    return (
        <Link
            to={`/videos/${record.video_id}/show`}
            onClick={event => event.stopPropagation()}
        >
            {record.file_name}
        </Link>
    );
};

const RunStateField = asColumn(RunStateFieldCell);
const RunField = asColumn(RunFieldCell);
const FilesField = asColumn(FilesFieldCell);
const FileNameField = asColumn(FileNameFieldCell);

const EmptyLine = ({ children }: { children: string }) => (
    <Typography
        variant="body2"
        sx={{
            p: 3,
            color: 'text.secondary',
        }}
    >
        {children}
    </Typography>
);

const RunsTable = ({ runs }: { runs: RunOverview[] }) => {
    const rows: RunRow[] = runs.map(run => ({ ...run, id: run.run_id }));
    const context = useList({ data: rows, perPage: rows.length || 1 });
    if (rows.length === 0) return <EmptyLine>No run outputs archived.</EmptyLine>;
    return (
        <ListContextProvider value={context}>
            <Datagrid
                rowClick={id => `/runs/${id}/show`}
                bulkActionButtons={false}
                sx={{ '& .RaDatagrid-headerCell': { whiteSpace: 'nowrap' } }}
            >
                <RunField label="Run" sortable={false} />
                <ReferenceField
                    source="device_id"
                    reference="devices"
                    link="show"
                    label="Device"
                    sortable={false}
                    emptyText="—"
                >
                    <TextField source="name" />
                </ReferenceField>
                <FilesField label="Files" sortable={false} />
                <SizeColumn label="Size" source="size_bytes" sortable={false} />
                <RunStateField label="State" sortable={false} />
                <RelativeDateColumn
                    label="Last archived"
                    source="last_completed_at"
                    emptyText="—"
                    sortable={false}
                />
            </Datagrid>
        </ListContextProvider>
    );
};

const ClipsTable = ({ clips }: { clips: ClipOverview[] }) => {
    const rows: ClipRow[] = clips.map(clip => ({ ...clip, id: clip.object_id }));
    const context = useList({ data: rows, perPage: rows.length || 1 });
    if (rows.length === 0) return <EmptyLine>No clips archived.</EmptyLine>;
    return (
        <ListContextProvider value={context}>
            <Datagrid
                rowClick={id => `/stored_objects/${id}/show`}
                bulkActionButtons={false}
                sx={{ '& .RaDatagrid-headerCell': { whiteSpace: 'nowrap' } }}
            >
                <FileNameField label="File name" sortable={false} />
                <SizeColumn label="Size" source="size_bytes" sortable={false} />
                <StatusColumn label="State" sortable={false} />
                <UploaderField label="Uploaded by" sortable={false} />
                <RelativeDateColumn
                    label="Archived"
                    source="completed_at"
                    emptyText="—"
                    sortable={false}
                />
            </Datagrid>
        </ListContextProvider>
    );
};

const plural = (count: number, noun: string) => `${count} ${noun}${count === 1 ? '' : 's'}`;

const Totals = ({ overview }: { overview: Overview }) => {
    const archived =
        overview.runs.reduce((sum, run) => sum + run.size_bytes, 0) +
        overview.clips.reduce((sum, clip) => sum + clip.size_bytes, 0);
    return (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
            <Typography variant="body1">
                {plural(overview.runs.length, 'run')} · {plural(overview.clips.length, 'clip')}{' '}
                · {formatBytes(archived)}
            </Typography>
            {overview.unlinked.objects > 0 && (
                <Typography
                    variant="body2"
                    sx={{
                        color: 'text.secondary',
                    }}
                >
                    {plural(overview.unlinked.objects, 'unlinked object')},{' '}
                    {formatBytes(overview.unlinked.size_bytes)}
                </Typography>
            )}
        </Stack>
    );
};

const asTab = (value: string | null): TabName =>
    TABS.includes(value as TabName) ? (value as TabName) : 'runs';

const ArchiveOverview = () => {
    const dataProvider = useDataProvider<DrmDataProvider>();
    const [params, setParams] = useSearchParams();
    const tab = asTab(params.get('tab'));
    const { data, error, isPending } = useQuery({
        queryKey: ['archive', 'overview'],
        queryFn: () => dataProvider.archiveOverview(),
    });
    const select = (_: SyntheticEvent, next: TabName) => {
        setParams(next === 'runs' ? {} : { tab: next }, { replace: true });
    };
    return (
        <>
            <Title title="Archive" />
            <Box sx={{ mt: 2 }}>
                <Stack spacing={2}>
                    {error && (
                        <Alert severity="warning">
                            {error instanceof Error ? error.message : 'Archive unavailable.'}
                        </Alert>
                    )}
                    {data && <Totals overview={data} />}
                    <Tabs value={tab} onChange={select}>
                        <Tab
                            value="runs"
                            label={data ? `Runs (${data.runs.length})` : 'Runs'}
                        />
                        <Tab
                            value="clips"
                            label={data ? `Clips (${data.clips.length})` : 'Clips'}
                        />
                        <Tab value="objects" label="Objects" />
                    </Tabs>
                    {tab === 'objects' ? (
                        <StoredObjectList />
                    ) : (
                        <Card>
                            {isPending && <EmptyLine>Loading…</EmptyLine>}
                            {data && tab === 'runs' && <RunsTable runs={data.runs} />}
                            {data && tab === 'clips' && <ClipsTable clips={data.clips} />}
                        </Card>
                    )}
                </Stack>
            </Box>
        </>
    );
};

export default ArchiveOverview;
