import EventIcon from '@mui/icons-material/Event';

import CampaignCreate from './CampaignCreate';
import CampaignEdit from './CampaignEdit';
import CampaignList from './CampaignList';
import CampaignShow from './CampaignShow';

export default {
    list: CampaignList,
    show: CampaignShow,
    edit: CampaignEdit,
    create: CampaignCreate,
    icon: EventIcon,
    options: {
        label: 'Campaigns',
    },
};
