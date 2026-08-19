import WorkspacesIcon from '@mui/icons-material/Workspaces';

import PassGroupCreate from './PassGroupCreate';
import PassGroupEdit from './PassGroupEdit';
import PassGroupList from './PassGroupList';

// No show: a group is three fields, the edit form is the whole story.
export default {
    list: PassGroupList,
    create: PassGroupCreate,
    edit: PassGroupEdit,
    icon: WorkspacesIcon,
    recordRepresentation: 'name',
    options: {
        label: 'Groups',
    },
};
