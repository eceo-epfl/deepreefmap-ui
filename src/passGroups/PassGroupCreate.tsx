import { Create, SimpleForm } from 'react-admin';

import PassGroupInputs from './PassGroupInputs';

const PassGroupCreate = () => (
    <Create redirect="list">
        <SimpleForm defaultValues={{ description: '' }}>
            <PassGroupInputs />
        </SimpleForm>
    </Create>
);

export default PassGroupCreate;
