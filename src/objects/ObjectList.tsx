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
    FilterListItem,
    FunctionField,
    BooleanField,
    Count,
    fetchUtils,
    useDataProvider,
} from "react-admin";
import { apiUrl } from "../App";
import { Card, CardContent, Stack } from '@mui/material';
import MailIcon from '@mui/icons-material/MailOutline';
import CategoryIcon from '@mui/icons-material/LocalOffer';
import Brightness1TwoToneIcon from '@mui/icons-material/Brightness1TwoTone';

// Define some icons for status
const TrueIcon = () => <Brightness1TwoToneIcon color="success" />;
const FalseIcon = () => <Brightness1TwoToneIcon color="error" />;


const SubmissionListActions = () => {
    const { permissions } = usePermissions();
    return (

        <TopToolbar >
            {permissions === 'admin' && <><CreateButton /></>}
            <ExportButton />
        </TopToolbar>
    );
}

const SubmissionList = () => {
    const { permissions } = usePermissions();



    return (

        <List disableSyncWithLocation
            actions={<SubmissionListActions />}
            perPage={25}
            sort={{ field: 'time_added_utc', order: 'DESC' }}
        >
            <Datagrid
                bulkActionButtons={permissions === 'admin' ? true : false}
                rowClick="show"
            >
                <TextField source="id" />
                <TextField source="filename" />
                <NumberField source="size_bytes" />
                <DateField
                    label="Submitted at"
                    source="time_added_utc"
                    showTime={true}
                />
            </Datagrid>
        </List >
    )
};

export default SubmissionList;
