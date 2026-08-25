import {
    DateField,
    Labeled,
    ReferenceField,
    Show,
    TextField,
    TopToolbar,
    useGetOne,
    useRecordContext,
} from 'react-admin';
import { Grid, Stack, Typography } from '@mui/material';

import type { Change } from '../contract';
import DecisionButtons from './DecisionButtons';
import PatchTable from './PatchTable';
import StatusField from './StatusField';

const ShowActions = () => (
    <TopToolbar>
        <DecisionButtons />
    </TopToolbar>
);

/** The patch beside the row as it stands, so a curator sees what accepting would do. */
const Diff = () => {
    const record = useRecordContext<Change>();
    const { data: current } = useGetOne(
        record?.table_key ?? 'sites',
        { id: record?.row_id ?? '' },
        { enabled: Boolean(record?.row_id) },
    );
    if (!record) return null;
    return (
        <PatchTable
            patch={(record.patch ?? {}) as Record<string, unknown>}
            current={current as Record<string, unknown> | undefined}
        />
    );
};

const ChangeShow = () => (
    <Show actions={<ShowActions />}>
        <Stack spacing={2} sx={{ p: 2 }}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 2 }}>
                    <Labeled label="Status">
                        <StatusField />
                    </Labeled>
                </Grid>
                <Grid size={{ xs: 6, md: 2 }}>
                    <Labeled label="Section">
                        <TextField source="table_key" />
                    </Labeled>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Labeled label="Row">
                        <TextField source="row_id" />
                    </Labeled>
                </Grid>
                <Grid size={{ xs: 6, md: 2 }}>
                    <Labeled label="Reason">
                        <TextField source="reason" emptyText="—" />
                    </Labeled>
                </Grid>
                <Grid size={{ xs: 6, md: 2 }}>
                    <Labeled label="Device">
                        <ReferenceField
                            source="device_id"
                            reference="devices"
                            link="show"
                            emptyText="console"
                        >
                            <TextField source="name" />
                        </ReferenceField>
                    </Labeled>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                    <Labeled label="Recorded">
                        <DateField source="created_at" showTime />
                    </Labeled>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                    <Labeled label="Decided">
                        <DateField source="decided_at" showTime emptyText="—" />
                    </Labeled>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                    <Labeled label="Decided by">
                        <TextField source="decided_by" emptyText="—" />
                    </Labeled>
                </Grid>
            </Grid>
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Fields changed
            </Typography>
            <Diff />
        </Stack>
    </Show>
);

export default ChangeShow;
