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
import { useEffect, useState } from "react";
// Define some icons for status


export const RunnerStatus = ({ records, resource }) => {
    const dataProvider = useDataProvider();

    const [systemStatus, setSystemStatus] = useState("Offline");
    const [jobs, setJobs] = useState([]);
    const [runningJobCount, setRunningJobCount] = useState(null);
    const [jobCount, setJobCount] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            const jobsData = await dataProvider.getKubernetesJobs();
            setJobs(jobsData);
            setSystemStatus("Online");
        };

        fetchData();

    }, [dataProvider]);

    useEffect(() => {
        // Check jobs.data array for amount that have status.phase "Running"
        // and count them
        var runningJobs = 0;
        var allJobCount = 0;
        jobs.data?.map((job) => {
            if (job.status.phase === "Pending"
                || job.status.phase === "Running"
                || job.status.phase === "ContainerCreating"
                || job.status.phase === "Running"
            ) {
                runningJobs++;
            }
        });
        setRunningJobCount(runningJobs);
        setJobCount(jobs.data?.length ?? 0);
    }, [jobs]);


    return (
        <Card>
            <b>RCP</b><br />
            Status: {systemStatus}<br />
            Running jobs: {runningJobCount} ({jobCount} total)
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
    const TrueIcon = () => <Brightness1TwoToneIcon color="success" />;
    const FalseIcon = () => <Brightness1TwoToneIcon color="error" />;


    return (
        <Stack spacing={2}>
            <br></br>
            <RunnerStatus />
            <List disableSyncWithLocation
                actions={<SubmissionListActions />}
                perPage={25}
                sort={{ field: 'time_added_utc', order: 'DESC' }}
            >
                <>
                    <Datagrid
                        bulkActionButtons={permissions === 'admin' ? true : false}
                        rowClick="show"
                    >
                        <FunctionField render={(record) => {
                            if (record.name === null) {
                                return record.id
                            }
                            return `${record.name}`
                        }} label="Name" />
                        <TextField source="description" />
                        <FunctionField render={record => `${record?.input_associations?.length ?? ""}`} label="Uploaded files" />
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
                </>
            </List >

        </Stack >
    )
};

export default SubmissionList;
