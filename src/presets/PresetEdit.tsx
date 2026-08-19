import { Edit, SaveButton, SimpleForm, Toolbar } from 'react-admin';
import { Typography } from '@mui/material';

import PresetInputs, { parsePresetSettings, validatePreset } from './PresetInputs';

// Rows are tombstoned by the sync contract, so the default toolbar's delete is wrong here.
const PresetEditToolbar = () => (
    <Toolbar>
        <SaveButton />
    </Toolbar>
);

const PresetEdit = () => (
    <Edit redirect="show" mutationMode="pessimistic" transform={parsePresetSettings}>
        <SimpleForm toolbar={<PresetEditToolbar />} validate={validatePreset}>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1 }}>
                Changing the settings warrants a version bump: devices label their runs with
                the preset&apos;s name and version, and a silent change would leave two
                different runs labelled identically.
            </Typography>
            <PresetInputs />
        </SimpleForm>
    </Edit>
);

export default PresetEdit;
