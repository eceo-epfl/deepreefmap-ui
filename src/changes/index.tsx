import HistoryIcon from '@mui/icons-material/History';

import ChangeList from './ChangeList';
import ChangeShow from './ChangeShow';

// Read only: entries are written by sync and by the CRUD routes. A proposal is decided
// with the accept and dismiss actions, never edited.
export default {
    list: ChangeList,
    show: ChangeShow,
    icon: HistoryIcon,
    options: {
        label: 'Changes',
    },
};
