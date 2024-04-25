import {
    List,
    Datagrid,
    TextField,
    usePermissions,
    TopToolbar,
    CreateButton,
    ExportButton,
    NumberField,
    DateField,
    BooleanField,
} from "react-admin";
import Brightness1TwoToneIcon from '@mui/icons-material/Brightness1TwoTone';

const ObjectListActions = () => {
    const { permissions } = usePermissions();
    return (

        <TopToolbar >
            {permissions === 'admin' && <><CreateButton /></>}
            <ExportButton />
        </TopToolbar>
    );
}

const ObjectList = () => {
    const { permissions } = usePermissions();

    return (

        <List disableSyncWithLocation
            actions={<ObjectListActions />}
            perPage={10}
            sort={{ field: 'time_added_utc', order: 'DESC' }}
            queryOptions={{ refetchInterval: 10000 }}
        >
            <Datagrid
                bulkActionButtons={permissions === 'admin' ? true : false}
                rowClick="show"
            >
                <DateField
                    label="Submitted at"
                    source="time_added_utc"
                    showTime={true}
                />
                <TextField source="filename" />
                <NumberField source="size_bytes" />
                <NumberField source="time_seconds" />
                <NumberField source="fps" />
                <TextField source="processing_message" />
                <BooleanField label="Upload complete" source="all_parts_received" />
                <BooleanField label="Processing started" source="processing_has_started" />
                <BooleanField label="Processing successful" source="processing_completed_successfully" />
            </Datagrid>
        </List >
    )
};

export default ObjectList;
