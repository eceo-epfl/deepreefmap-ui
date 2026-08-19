import { Edit, SaveButton, SimpleForm, Toolbar } from 'react-admin';

import TransectFormFields from './TransectFormFields';

// Rows are tombstoned by the sync protocol, never removed, so no delete is offered.
const TransectEditToolbar = () => (
    <Toolbar>
        <SaveButton />
    </Toolbar>
);

const TransectEdit = () => (
    <Edit redirect="show" mutationMode="pessimistic">
        <SimpleForm toolbar={<TransectEditToolbar />}>
            <TransectFormFields />
        </SimpleForm>
    </Edit>
);

export default TransectEdit;
