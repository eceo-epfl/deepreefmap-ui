import ScubaDivingIcon from '@mui/icons-material/ScubaDiving';

import PassEdit from './PassEdit';
import PassList from './PassList';
import PassShow from './PassShow';

// No create: the desktop application is what records a pass. Edit is the curation
// path for one already synced; a laptop's later change to a validated pass is a
// proposal.
export default {
    list: PassList,
    show: PassShow,
    edit: PassEdit,
    icon: ScubaDivingIcon,
    options: {
        label: 'Passes',
    },
};
