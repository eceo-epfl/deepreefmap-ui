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
    BooleanField
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
        >
            <Datagrid
                bulkActionButtons={permissions === 'admin' ? true : false}
                rowClick="show"
            >
                <TextField source="id" />
                <TextField source="description" />
                <BooleanField source="processing_finished" TrueIcon={TrueIcon} FalseIcon={FalseIcon} />
                <BooleanField source="processing_successful" TrueIcon={TrueIcon} FalseIcon={FalseIcon} />
                <NumberField
                    label="Duration (s)"
                    source="duration_seconds"
                    sortable={false}
                />
                <NumberField
                    label="Data size (MB)"
                    source="data_size_mb"
                    sortable={false}
                />
                <DateField
                    label="Submitted at"
                    source="submitted_at_utc"
                    sortable={false}
                    showTime={true}
                />
            </Datagrid>
        </List >

    )
};

export default SubmissionList;
