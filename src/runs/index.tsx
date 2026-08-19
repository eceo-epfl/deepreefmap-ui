import MemoryIcon from '@mui/icons-material/Memory';

import RunList from './RunList';
import RunShow from './RunShow';

// No create or edit: the desktop app reports runs, the console only reads them.
export default {
    list: RunList,
    show: RunShow,
    icon: MemoryIcon,
    options: {
        label: 'Runs',
    },
};
