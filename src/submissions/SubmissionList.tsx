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
    BooleanField,
    Count
} from "react-admin";
import { Card, CardContent } from '@mui/material';
import MailIcon from '@mui/icons-material/MailOutline';
import CategoryIcon from '@mui/icons-material/LocalOffer';
import Brightness1TwoToneIcon from '@mui/icons-material/Brightness1TwoTone';
const SubmissionListActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <><CreateButton /></>}
            <ExportButton />
        </TopToolbar>
    );
}

const SubmissionList = () => {
    const { permissions } = usePermissions();

    // Set to green icon
    const TrueIcon = () => <Brightness1TwoToneIcon color="success" />;
    // Set to red icon
    const FalseIcon = () => <Brightness1TwoToneIcon color="error" />; TrueIcon

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
                <TextField source="description" />
                <Count source='inputs' label="Uploaded files" />
                <BooleanField
                    source="processing_completed_successfully"
                    label="Processing completed"
                    TrueIcon={TrueIcon}
                    FalseIcon={FalseIcon}
                />
                <BooleanField
                    source="processing_has_started"
                    label="Processing running"
                    TrueIcon={TrueIcon}
                    FalseIcon={FalseIcon}
                />
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
