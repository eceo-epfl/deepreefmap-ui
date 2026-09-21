import PolylineIcon from '@mui/icons-material/Polyline';

import TransectCreate from './TransectCreate';
import TransectEdit from './TransectEdit';
import TransectList from './TransectList';
import TransectShow from './TransectShow';

export default {
    list: TransectList,
    show: TransectShow,
    edit: TransectEdit,
    create: TransectCreate,
    icon: PolylineIcon,
    options: {
        label: 'Transects',
    },
};
