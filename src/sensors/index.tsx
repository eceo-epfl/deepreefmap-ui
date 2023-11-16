import SensorCreate from './SensorCreate';
import SensorEdit from './SensorEdit';
import SensorList from './SensorList';
import SensorShow from './SensorShow';
import SensorDataCreate from './SensorDataCreate';
import SensorDataEdit from './SensorDataEdit';
import SensorDataShow from './SensorDataShow';

const sensor = {
    create: SensorCreate,
    edit: SensorEdit,
    list: SensorList,
    show: SensorShow,
};


const sensordata = {
    create: SensorDataCreate,
    edit: SensorDataEdit,
    show: SensorDataShow,
};

export default {
    sensor,
    sensordata,
};