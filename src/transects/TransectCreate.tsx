import { Create, SimpleForm, SaveButton, Toolbar } from 'react-admin';

import TransectFormFields from './TransectFormFields';

// Rows are tombstoned by the sync protocol, never removed, so no delete is offered.
const TransectFormToolbar = () => (
    <Toolbar>
        <SaveButton />
    </Toolbar>
);

const TransectCreate = () => (
    <Create redirect="show">
        <SimpleForm toolbar={<TransectFormToolbar />}>
            <TransectFormFields />
        </SimpleForm>
    </Create>
);

export default TransectCreate;
