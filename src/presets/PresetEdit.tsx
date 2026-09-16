import { Edit, SaveButton, SimpleForm, Toolbar } from 'react-admin';
import { Stack, Tooltip, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import PresetInputs from './PresetInputs';

// Rows are tombstoned by the sync contract, so the default toolbar's delete is wrong here.
const PresetEditToolbar = () => (
    <Toolbar>
        <SaveButton />
    </Toolbar>
);

const PresetEdit = () => (
    <Edit redirect="show" mutationMode="pessimistic">
        <SimpleForm toolbar={<PresetEditToolbar />}>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Bump the version when settings change.
                </Typography>
                <Tooltip title="Devices label runs with the preset name and version.">
                    <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                </Tooltip>
            </Stack>
            <PresetInputs />
        </SimpleForm>
    </Edit>
);

export default PresetEdit;
