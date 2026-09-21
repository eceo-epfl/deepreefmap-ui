import {
    DateInput,
    Edit,
    NumberInput,
    ReferenceInput,
    SaveButton,
    SelectInput,
    SimpleForm,
    TextInput,
    Toolbar,
    minValue,
} from 'react-admin';
import { Grid } from '@mui/material';

import { QualityInput } from '../components';
import { DIRECTION_EMPTY_TEXT, directionChoices } from './DirectionField';

// A CRUD delete removes the row outright, while syncing clients expect a tombstone.
const SaveOnlyToolbar = () => (
    <Toolbar>
        <SaveButton />
    </Toolbar>
);

const REFERENCE_SORT = { field: 'name', order: 'ASC' } as const;

type PassFormValues = { begin_s?: number | null; end_s?: number | null };

const validateWindow = (values: PassFormValues) =>
    values.begin_s != null && values.end_s != null && values.end_s <= values.begin_s
        ? { end_s: 'The window must end after it begins' }
        : {};

/** Every field a curator corrects; what a laptop sends afterwards becomes a proposal. */
const PassEdit = () => (
    <Edit redirect="show">
        <SimpleForm toolbar={<SaveOnlyToolbar />} validate={validateWindow}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <ReferenceInput
                        source="transect_id"
                        reference="transects"
                        sort={REFERENCE_SORT}
                    >
                        <SelectInput
                            optionText="name"
                            label="Transect"
                            emptyText="No transect: unscaled"
                            fullWidth
                        />
                    </ReferenceInput>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <ReferenceInput
                        source="campaign_id"
                        reference="campaigns"
                        sort={REFERENCE_SORT}
                    >
                        <SelectInput optionText="name" label="Campaign" fullWidth />
                    </ReferenceInput>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextInput source="label" fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <DateInput source="surveyed_on" label="Surveyed on" fullWidth />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <NumberInput
                        source="begin_s"
                        label="Begins at (s)"
                        validate={minValue(0)}
                        fullWidth
                    />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <NumberInput source="end_s" label="Ends at (s)" fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                    <SelectInput
                        source="direction"
                        choices={directionChoices}
                        emptyText={DIRECTION_EMPTY_TEXT}
                        fullWidth
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                    <QualityInput fullWidth />
                </Grid>
                <Grid size={12}>
                    <TextInput source="notes" multiline fullWidth />
                </Grid>
            </Grid>
        </SimpleForm>
    </Edit>
);

export default PassEdit;
