import { Create, SimpleForm } from 'react-admin';

import CampaignInputs, { validateCampaign } from './CampaignInputs';

const CampaignCreate = () => (
    <Create redirect="show">
        <SimpleForm defaultValues={{ description: '' }} validate={validateCampaign}>
            <CampaignInputs />
        </SimpleForm>
    </Create>
);

export default CampaignCreate;
