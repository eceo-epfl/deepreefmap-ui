import {
    CreateButton,
    Datagrid,
    ExportButton,
    List,
    SearchInput,
    TextField,
    TopToolbar,
} from 'react-admin';

import { GLOSSARY } from '../contract/glossary';
import { useCanAuthor } from '../permissions';
import CalibrationCountField from './CalibrationCountField';
import PublishCalibrationButton from './PublishCalibrationButton';

const cameraFilters = [<SearchInput source="q" alwaysOn key="q" />];

const CameraProfileListActions = () => {
    const canAuthor = useCanAuthor();
    return (
        <TopToolbar>
            {canAuthor && <CreateButton />}
            {canAuthor && <PublishCalibrationButton />}
            <ExportButton />
        </TopToolbar>
    );
};

const CameraProfileList = () => (
    <List
        filters={cameraFilters}
        actions={<CameraProfileListActions />}
        sort={{ field: 'name', order: 'ASC' }}
        empty={false}
        title="Cameras"
    >
        <Datagrid rowClick="show" bulkActionButtons={false}>
            <TextField source="name" />
            <TextField source="description" emptyText="—" />
            <CalibrationCountField label="Calibrations" />
        </Datagrid>
    </List>
);

export const CAMERA_PROFILES_GLOSSARY = GLOSSARY.camera_profiles;

export default CameraProfileList;
