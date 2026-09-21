import {
    Datagrid,
    DateField,
    FunctionField,
    List,
    ReferenceField,
    SelectInput,
    TextField,
    useListContext,
    useRecordContext,
} from 'react-admin';
import { Chip, Stack, Tooltip, Typography } from '@mui/material';

import { useRunsProbeBatch } from '../archive/useBatchProbe';
import { asColumn } from '../components';
import type { RunRecord } from '../contract';
import StatusField, { statusChoices } from './StatusField';
import { hasEntries } from './ProvenanceTable';
import { formatDuration, runDuration } from './duration';
import { presetLabel } from './preset';

const runFilters = [
    <SelectInput
        key="status"
        source="status"
        label="Status"
        choices={statusChoices}
        alwaysOn
    />,
];

// Every row asks with the whole page's ids, so the batch hook collapses the
// column into one probe.
const OutputsField = () => {
    const { data } = useListContext<RunRecord>();
    const record = useRecordContext<RunRecord>();
    const { states, error } = useRunsProbeBatch((data ?? []).map(run => run.id));
    if (!record) return null;
    if (error) {
        return (
            <Tooltip title={error}>
                <Chip size="small" label="Archive unavailable" variant="outlined" />
            </Tooltip>
        );
    }
    const state = states.get(record.id);
    if (state === undefined) {
        return <Chip size="small" label="Checking…" variant="outlined" />;
    }
    if (state === null) {
        return (
            <Typography
                variant="body2"
                component="span"
                sx={{
                    color: 'text.disabled',
                }}
            >
                —
            </Typography>
        );
    }
    if (state.failed > 0) {
        return <Chip size="small" color="error" label="Archive failed" />;
    }
    if (state.complete === state.artifacts) {
        return <Chip size="small" color="success" label={`Archived ${state.artifacts}`} />;
    }
    return (
        <Chip
            size="small"
            color="warning"
            variant="outlined"
            label={`${state.complete}/${state.artifacts} archived`}
        />
    );
};

const OutputsColumn = asColumn(OutputsField);

const Empty = () => (
    <Typography
        variant="body2"
        sx={{
            color: 'text.secondary',
            p: 3,
        }}
    >
        Runs appear once a desktop app syncs a processed pass.
    </Typography>
);

/** Read-only list of the runs desktop apps report. */
const RunList = () => (
    <List
        filters={runFilters}
        sort={{ field: 'started_at', order: 'DESC' }}
        perPage={25}
        empty={<Empty />}
    >
        <Datagrid rowClick="show" bulkActionButtons={false}>
            <ReferenceField
                source="pass_id"
                reference="passes"
                link="show"
                label="Pass"
                sortable={false}
            >
                <TextField source="label" />
            </ReferenceField>
            <ReferenceField
                source="pass_id"
                reference="passes"
                link={false}
                label="Transect"
                sortable={false}
            >
                <ReferenceField source="transect_id" reference="transects" link="show">
                    <TextField source="name" />
                </ReferenceField>
            </ReferenceField>
            <StatusField label="Status" />
            <DateField source="started_at" label="Started" showTime />
            <FunctionField<RunRecord>
                label="Duration"
                render={record => {
                    const seconds = runDuration(record.started_at, record.finished_at);
                    return seconds == null ? '—' : formatDuration(seconds);
                }}
            />
            <TextField
                source="gui_version"
                label="GUI version"
                emptyText="—"
                sortable={false}
            />
            <TextField
                source="segmentation_model"
                label="Segmentation model"
                emptyText="—"
                sortable={false}
            />
            <FunctionField<RunRecord>
                label="Preset"
                render={record => (
                    <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                    >
                        <span>{presetLabel(record)}</span>
                        {hasEntries(record.preset_deviations) && (
                            <Chip
                                size="small"
                                color="warning"
                                label="Deviations"
                                variant="outlined"
                            />
                        )}
                    </Stack>
                )}
            />
            <OutputsColumn label="Outputs" sortable={false} />
        </Datagrid>
    </List>
);

export default RunList;
