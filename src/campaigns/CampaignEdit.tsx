import { Edit, SaveButton, SimpleForm, Toolbar } from 'react-admin';

import CampaignInputs, { validateCampaign } from './CampaignInputs';

// Rows are tombstoned by the sync contract, so the default toolbar's delete is wrong here.
const CampaignEditToolbar = () => (
    <Toolbar>
        <SaveButton />
    </Toolbar>
);

const CampaignEdit = () => (
    <Edit redirect="show" mutationMode="pessimistic">
        <SimpleForm toolbar={<CampaignEditToolbar />} validate={validateCampaign}>
            <CampaignInputs />
        </SimpleForm>
    </Edit>
);

export default CampaignEdit;
