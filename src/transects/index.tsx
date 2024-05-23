import TransectCreate from './TransectCreate';
import TransactEdit from './TransectEdit';
import TransectList from './TransectList';
import TransectShow from './TransectShow';
import PolylineIcon from '@mui/icons-material/Polyline';

export default {
    create: TransectCreate,
    edit: TransactEdit,
    list: TransectList,
    show: TransectShow,
    icon: PolylineIcon,
    options: {
        label: 'Transects',
    },
};
