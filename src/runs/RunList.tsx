import {
    Datagrid,
    DateField,
    FunctionField,
    List,
    ReferenceField,
    SelectInput,
    TextField,
} from 'react-admin';
import { Chip, Typography } from '@mui/material';

import type { RunRecord } from '../contract';
import StatusField, { statusChoices } from './StatusField';
import { hasEntries } from './ProvenanceTable';
import { formatDuration, runDuration } from './duration';

const runFilters = [
    <SelectInput
        key="status"
        source="status"
        label="Status"
        choices={statusChoices}
        alwaysOn
    />,
];

const Empty = () => (
    <Typography
        variant="body2"
        sx={{
            color: 'text.secondary',
            p: 3,
        }}
    >
        Runs appear here after a desktop client processes a pass and syncs.
    </Typography>
);

/** Runs are reported by the desktop app, so this list is read-only. */
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
                render={record =>
                    hasEntries(record.preset_deviations) ? (
                        <Chip
                            size="small"
                            color="warning"
                            label="Deviations"
                            variant="outlined"
                        />
                    ) : (
                        <span>{record.preset_name || '—'}</span>
                    )
                }
            />
        </Datagrid>
    </List>
);

export default RunList;
