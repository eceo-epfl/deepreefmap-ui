import {
    Datagrid,
    ExportButton,
    List,
    ReferenceField,
    ReferenceInput,
    SelectInput,
    TextField,
    TextInput,
    TopToolbar,
} from 'react-admin';
import { Box, Typography } from '@mui/material';

import { asColumn, DurationField, QualityField, qualityChoices } from '../components';
import { useCanAuthor } from '../permissions';
import { DirectionField, directionChoices } from './DirectionField';
import GroupPassesButton from './GroupPassesButton';

const WindowColumn = asColumn(DurationField);
const QualityColumn = asColumn(QualityField);

const REFERENCE_SORT = { field: 'name', order: 'ASC' } as const;

const passFilters = [
    <TextInput key="q" source="q" label="Search label or notes" alwaysOn />,
    <ReferenceInput
        key="transect_id"
        source="transect_id"
        reference="transects"
        sort={REFERENCE_SORT}
        alwaysOn
    />,
    <ReferenceInput
        key="campaign_id"
        source="campaign_id"
        reference="campaigns"
        sort={REFERENCE_SORT}
        alwaysOn
    />,
    <ReferenceInput
        key="survey_group_id"
        source="survey_group_id"
        reference="pass_groups"
        sort={REFERENCE_SORT}
    >
        <SelectInput optionText="name" label="Group" />
    </ReferenceInput>,
    <SelectInput key="quality" source="quality" choices={qualityChoices} />,
    <SelectInput key="direction" source="direction" choices={directionChoices} />,
];

// No CreateButton: passes have no create view, the desktop application records them.
const PassListActions = () => (
    <TopToolbar>
        <ExportButton />
    </TopToolbar>
);

const PassEmpty = () => (
    <Box
        sx={{
            textAlign: 'center',
            m: 4,
        }}
    >
        <Typography variant="h6" gutterBottom>
            No passes recorded yet
        </Typography>
        <Typography
            variant="body2"
            sx={{
                color: 'text.secondary',
            }}
        >
            Passes are created by the desktop application and arrive when an enrolled laptop
            syncs.
        </Typography>
    </Box>
);

const PassList = () => {
    const canAuthor = useCanAuthor();
    return (
        <List
            actions={<PassListActions />}
            filters={passFilters}
            sort={{ field: 'created_at', order: 'DESC' }}
            perPage={25}
            empty={<PassEmpty />}
        >
            <Datagrid
                rowClick="show"
                bulkActionButtons={canAuthor ? <GroupPassesButton /> : false}
            >
                <ReferenceField
                    source="transect_id"
                    reference="transects"
                    link="show"
                    sortable={false}
                >
                    <TextField source="name" />
                </ReferenceField>
                <ReferenceField
                    source="campaign_id"
                    reference="campaigns"
                    link="show"
                    sortable={false}
                >
                    <TextField source="name" />
                </ReferenceField>
                <ReferenceField
                    source="survey_group_id"
                    reference="pass_groups"
                    link="edit"
                    label="Group"
                    sortable={false}
                    emptyText="—"
                >
                    <TextField source="name" />
                </ReferenceField>
                <TextField source="label" emptyText="Unnamed" sortable={false} />
                <DirectionField label="Direction" />
                <QualityColumn label="Quality" source="quality" />
                {/* The API sorts on `quality` but not on the window bounds. */}
                <WindowColumn
                    label="Window"
                    source="begin_s"
                    endSource="end_s"
                    sortable={false}
                />
            </Datagrid>
        </List>
    );
};

export default PassList;
