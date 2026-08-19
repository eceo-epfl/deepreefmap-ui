import {
    Datagrid,
    DateField,
    EditButton,
    FunctionField,
    Labeled,
    Link,
    Pagination,
    ReferenceField,
    ReferenceManyField,
    Show,
    SimpleShowLayout,
    TextField,
    TopToolbar,
    useCreatePath,
    useGetList,
    useGetMany,
    useRecordContext,
} from 'react-admin';
import { Box, Chip, Divider, Grid, Stack, Typography } from '@mui/material';

import { formatSeconds, QualityField, SyncFields, TombstoneButton } from '../components';
import { useCanAuthor } from '../permissions';
import type { Campaign, Transect, TransectPass } from '../contract';

const CampaignShowActions = () => {
    const canAuthor = useCanAuthor();
    return (
        <TopToolbar>
            {canAuthor && <EditButton />}
            <TombstoneButton noun="campaign" />
        </TopToolbar>
    );
};

const PASS_PAGE = 500;

/**
 * The distinct lines this expedition swam, as links. Derived from the passes
 * client-side because the registry keeps no campaign-to-transect table.
 */
const TransectsSurveyed = () => {
    const record = useRecordContext<Campaign>();
    const createPath = useCreatePath();
    const { data: passes } = useGetList<TransectPass>('passes', {
        filter: { campaign_id: record?.id },
        pagination: { page: 1, perPage: PASS_PAGE },
        sort: { field: 'created_at', order: 'DESC' },
    });

    const transectIds = Array.from(
        new Set(
            (passes ?? []).map(pass => pass.transect_id).filter((id): id is string => !!id),
        ),
    );
    const { data: transects } = useGetMany<Transect>(
        'transects',
        { ids: transectIds },
        { enabled: transectIds.length > 0 },
    );

    if (!transects?.length) return null;
    const named = [...transects].sort((a, b) => a.name.localeCompare(b.name));
    return (
        <Box>
            <Typography
                variant="overline"
                sx={{
                    color: 'text.secondary',
                }}
            >
                Transects surveyed
            </Typography>
            <Stack
                direction="row"
                spacing={1}
                useFlexGap
                sx={{
                    flexWrap: 'wrap',
                }}
            >
                {named.map(transect => (
                    <Chip
                        key={transect.id}
                        component={Link}
                        to={createPath({
                            resource: 'transects',
                            type: 'show',
                            id: transect.id,
                        })}
                        label={transect.name}
                        size="small"
                        clickable
                    />
                ))}
            </Stack>
        </Box>
    );
};

const NoPasses = () => (
    <Typography
        variant="body2"
        sx={{
            color: 'text.secondary',
        }}
    >
        No passes recorded against this campaign. Passes arrive from the desktop clients when
        they sync, so there is nothing to add here.
    </Typography>
);

const CampaignPasses = () => (
    <Box>
        <Typography
            variant="overline"
            sx={{
                color: 'text.secondary',
            }}
        >
            Passes
        </Typography>
        <ReferenceManyField
            reference="passes"
            target="campaign_id"
            sort={{ field: 'created_at', order: 'DESC' }}
            perPage={25}
            pagination={<Pagination />}
        >
            <Datagrid rowClick="show" bulkActionButtons={false} empty={<NoPasses />}>
                <TextField source="label" emptyText="unnamed" sortable={false} />
                <ReferenceField
                    source="transect_id"
                    reference="transects"
                    link="show"
                    sortable={false}
                >
                    <TextField source="name" />
                </ReferenceField>
                <FunctionField<TransectPass>
                    label="Window"
                    render={record =>
                        `${formatSeconds(record.begin_s)} – ${formatSeconds(record.end_s)}`
                    }
                />
                <TextField source="direction" />
                <QualityField source="quality" />
            </Datagrid>
        </ReferenceManyField>
    </Box>
);

const CampaignShow = () => (
    <Show actions={<CampaignShowActions />}>
        <SimpleShowLayout>
            <Grid container spacing={2}>
                <Grid
                    size={{
                        xs: 12,
                        sm: 4,
                    }}
                >
                    <Labeled label="Name">
                        <TextField source="name" />
                    </Labeled>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 4,
                    }}
                >
                    <Labeled label="Begin date">
                        <DateField source="begin_date" emptyText="—" />
                    </Labeled>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 4,
                    }}
                >
                    <Labeled label="End date">
                        <DateField source="end_date" emptyText="—" />
                    </Labeled>
                </Grid>
                <Grid size={12}>
                    <Labeled label="Description">
                        <TextField source="description" emptyText="—" />
                    </Labeled>
                </Grid>
            </Grid>
            <TransectsSurveyed />
            <Divider />
            <CampaignPasses />
            <Divider />
            <SyncFields />
        </SimpleShowLayout>
    </Show>
);

export default CampaignShow;
