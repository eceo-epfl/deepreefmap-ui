import { Edit, SaveButton, SimpleForm, Toolbar, TopToolbar } from 'react-admin';

import { TombstoneButton } from '../components';
import PassGroupInputs from './PassGroupInputs';

// Rows are tombstoned by the sync contract, so the default toolbar's delete is wrong here.
const PassGroupEditToolbar = () => (
    <Toolbar>
        <SaveButton />
    </Toolbar>
);

const PassGroupEditActions = () => (
    <TopToolbar>
        <TombstoneButton noun="group" />
    </TopToolbar>
);

const PassGroupEdit = () => (
    <Edit redirect="list" mutationMode="pessimistic" actions={<PassGroupEditActions />}>
        <SimpleForm toolbar={<PassGroupEditToolbar />}>
            <PassGroupInputs />
        </SimpleForm>
    </Edit>
);

export default PassGroupEdit;
