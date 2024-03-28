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

export const RunnerStatus = ({ records, resource }) => {
    const dataProvider = useDataProvider();
    var systemStatus = null;
    var jobCount = null;

    try {

        const jobs = dataProvider.getKubernetesJobs();
        jobCount = jobs.data?.length ?? 0;
        systemStatus = true;

    } catch (error) {
        console.log("Error fetching jobs", error);
        systemStatus = false;
    }

    return (
        <Card>
            <b>RCP</b><br />
            Status: {systemStatus ? <TrueIcon /> : <FalseIcon />}<br />
            Jobs: {jobCount}
        </Card >
    );
};

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
        <Stack spacing={2}>
            <br></br>
            <RunnerStatus />
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
                    <FunctionField render={record => `${record?.inputs?.length ?? ""}`} label="Uploaded files" />
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

        </Stack >
    )
};

export default SubmissionList;
