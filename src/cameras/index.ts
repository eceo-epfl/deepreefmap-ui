import CameraAltIcon from '@mui/icons-material/CameraAlt';

import CameraProfileCreate from './CameraProfileCreate';
import CameraProfileEdit from './CameraProfileEdit';
import CameraProfileList from './CameraProfileList';
import CameraProfileShow from './CameraProfileShow';

export default {
    list: CameraProfileList,
    show: CameraProfileShow,
    edit: CameraProfileEdit,
    create: CameraProfileCreate,
    icon: CameraAltIcon,
    recordRepresentation: 'name',
    options: {
        label: 'Cameras',
    },
};
