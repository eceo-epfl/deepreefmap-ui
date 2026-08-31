import { Create } from 'react-admin';

import CameraProfileForm from './CameraProfileForm';

// Rows are tombstoned by the sync protocol, never removed, so no delete is offered.
const CameraProfileCreate = () => (
    <Create redirect="show">
        <CameraProfileForm />
    </Create>
);

export default CameraProfileCreate;
