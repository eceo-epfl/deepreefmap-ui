import {
    List,
    Datagrid,
    TextField,
    ReferenceField,
    usePermissions,
    TopToolbar,
    CreateButton,
    ExportButton,
    NumberField,
    DateField,
    ReferenceManyCount,
    ArrayField,
    SavedQueriesList,
    FilterLiveSearch,
    FilterList,
    FilterListItem
} from "react-admin";
import { Card, CardContent } from '@mui/material';
import MailIcon from '@mui/icons-material/MailOutline';
import CategoryIcon from '@mui/icons-material/LocalOffer';

const SensorListActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <><CreateButton /></>}
            <ExportButton />
        </TopToolbar>
    );
}

const SensorList = () => {
    const { permissions } = usePermissions();

    return (
        <List disableSyncWithLocation
            actions={<SensorListActions />}
            perPage={25}
        >
            <Datagrid
                bulkActionButtons={permissions === 'admin' ? true : false}
                rowClick="show"
            >
                <TextField source="name" />
                <TextField source="description" />
                <TextField
                    label="Records"
                    source="data.qty_records"
                    sortable={false}
                />
                <DateField
                    label="Data start"
                    source="data.start_date"
                    sortable={false}
                    showTime={true}
                />
                <DateField
                    label="Data end"
                    source="data.end_date"
                    sortable={false}
                    showTime={true}
                />
                <ReferenceField
                    source='area_id'
                    reference='areas'
                    link="show"
                >
                    <TextField source='name' />
                </ReferenceField>
            </Datagrid>
        </List >

    )
};

export default SensorList;
