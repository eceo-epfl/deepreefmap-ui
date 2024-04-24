import {
    List,
    Datagrid,
    TextField,
    usePermissions,
    TopToolbar,
    CreateButton,
    ExportButton,
    DateField,
    FunctionField,
    BooleanField,
    useDataProvider,
} from "react-admin";
import { Card, Stack } from '@mui/material';
import { useEffect, useState } from "react";

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


const StatusList = () => {
    return (
        <Stack spacing={2}>
            <br></br>
            <RunnerStatus />
        </Stack >
    )
};

export default StatusList;
