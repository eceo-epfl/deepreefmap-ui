import { Edit, SaveButton, SimpleForm, Toolbar } from 'react-admin';

import SiteInputs, { validateSite } from './SiteInputs';

// Rows are tombstoned by the sync contract, so the default toolbar's delete is wrong here.
const SiteEditToolbar = () => (
    <Toolbar>
        <SaveButton />
    </Toolbar>
);

const SiteEdit = () => (
    <Edit redirect="show" mutationMode="pessimistic">
        <SimpleForm toolbar={<SiteEditToolbar />} validate={validateSite}>
            <SiteInputs />
        </SimpleForm>
    </Edit>
);

export default SiteEdit;
