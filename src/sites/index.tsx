import PlaceIcon from '@mui/icons-material/Place';

import SiteCreate from './SiteCreate';
import SiteEdit from './SiteEdit';
import SiteList from './SiteList';
import SiteShow from './SiteShow';

export default {
    list: SiteList,
    show: SiteShow,
    edit: SiteEdit,
    create: SiteCreate,
    icon: PlaceIcon,
    options: {
        label: 'Sites',
    },
};
