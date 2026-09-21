import { Edit } from 'react-admin';

import CameraProfileForm from './CameraProfileForm';

const CameraProfileEdit = () => (
    <Edit redirect="show" mutationMode="pessimistic">
        <CameraProfileForm />
    </Edit>
);

export default CameraProfileEdit;
