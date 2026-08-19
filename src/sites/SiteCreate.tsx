import { Create, SimpleForm } from 'react-admin';

import SiteInputs, { validateSite } from './SiteInputs';

const SiteCreate = () => (
    <Create redirect="show">
        <SimpleForm defaultValues={{ description: '' }} validate={validateSite}>
            <SiteInputs />
        </SimpleForm>
    </Create>
);

export default SiteCreate;
