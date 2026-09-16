import { Route } from 'react-router-dom';
import DevicesIcon from '@mui/icons-material/Devices';

import ConnectDevice from './ConnectDevice';
import DeviceList from './DeviceList';
import DeviceShow from './DeviceShow';

// Enrolment happens at /api/enrol from the desktop application and revoking is a custom
// endpoint, so there is no create view. Renaming is a dialog on the show page.
export default {
    list: DeviceList,
    show: DeviceShow,
    icon: DevicesIcon,
    options: {
        label: 'Devices',
    },
    children: <Route path="connect" element={<ConnectDevice />} />,
};
