import {
    Datagrid,
    Pagination,
    ReferenceField,
    ReferenceManyField,
    TextField,
} from 'react-admin';
import { Stack, Typography } from '@mui/material';

import { asColumn, DurationField, QualityField } from '../components';
import { DirectionField } from '../passes/DirectionField';

const QualityColumn = asColumn(QualityField);
const WindowColumn = asColumn(DurationField);

const NoPasses = () => (
    <Stack spacing={1} sx={{ py: 4 }}>
        <Typography variant="subtitle2">No passes yet</Typography>
        <Typography
            variant="body2"
            sx={{
                color: 'text.secondary',
            }}
        >
            They arrive when a laptop syncs.
        </Typography>
    </Stack>
);

/** Every pass swum on this line, across all campaigns. The revisit history. */
const TransectPasses = () => (
    <ReferenceManyField
        reference="passes"
        target="transect_id"
        sort={{ field: 'created_at', order: 'DESC' }}
        perPage={25}
        pagination={<Pagination />}
    >
        <Datagrid rowClick="show" bulkActionButtons={false} empty={<NoPasses />}>
            <ReferenceField
                source="campaign_id"
                reference="campaigns"
                link="show"
                label="Campaign"
                sortable={false}
                emptyText="—"
            >
                <TextField source="name" />
            </ReferenceField>
            <TextField source="label" sortable={false} emptyText="Unnamed" />
            <WindowColumn label="Window" sortable={false} source="begin_s" endSource="end_s" />
            <DirectionField label="Direction" />
            <QualityColumn label="Quality" />
        </Datagrid>
    </ReferenceManyField>
);

export default TransectPasses;
