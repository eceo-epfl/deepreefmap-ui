import SensorCreate from './SensorCreate';
import SensorEdit from './SensorEdit';
import SensorList from './SensorList';
import SensorShow from './SensorShow';
import SensorDataCreate from './SensorDataCreate';
import SensorDataEdit from './SensorDataEdit';
import SensorDataShow from './SensorDataShow';
import NothingList from '../NothingToSee';

const status = {
    // create: SensorCreate,
    // edit: SensorEdit,
    list: NothingList,
    // show: SensorShow,
    options: {
        label: 'Sensor Status',
    },
};


const parameters = {
    // create: SensorDataCreate,
    // edit: SensorDataEdit,
    // show: SensorDataShow,
    list: NothingList,
    options: {
        label: 'Sensor Parameters',
    },
};

const astrocast = {
    // create: SensorDataCreate,
    // edit: SensorDataEdit,
    // show: SensorDataShow,
    list: NothingList,
    options: {
        label: 'Astrocast',
    },
};


export default {
    status: status,
    parameters: parameters,
    astrocast: astrocast,
};