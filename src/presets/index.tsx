import TuneIcon from '@mui/icons-material/Tune';

import PresetCreate from './PresetCreate';
import PresetEdit from './PresetEdit';
import PresetList from './PresetList';
import PresetShow from './PresetShow';

export default {
    list: PresetList,
    show: PresetShow,
    edit: PresetEdit,
    create: PresetCreate,
    icon: TuneIcon,
    recordRepresentation: 'name',
    options: {
        label: 'Presets',
    },
};
