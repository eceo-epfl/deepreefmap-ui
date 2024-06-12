import {
    useDataProvider,
    Loading,
} from "react-admin";
import { useEffect, useState } from "react";
import { Card, Stack, Typography } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

export const RunnerStatus = () => {
    const dataProvider = useDataProvider();
    const [systemStatus, setSystemStatus] = useState("Offline");
    const [status, setStatus] = useState([]);
    const [runningJobCount, setRunningJobCount] = useState(0);
    const [jobCount, setJobCount] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const statusData = await dataProvider.getStatus();
            setStatus(statusData.data);
            setSystemStatus("Online");
        };

        fetchData();

    }, [dataProvider]);

    useEffect(() => {
        // Check jobs.data array for amount that have status.phase "Running"
        // and count them
        if (!status) {
            return (<Loading />);
        }
        console.log(status);
        var allJobCount = 0;
        const getRunningJobs = () => {
            var runningJobs = 0;
            status?.kubernetes?.map((job) => {
                if (job.status.phase === "Pending"
                    || job.status.phase === "Running"
                    || job.status.phase === "ContainerCreating"
                    || job.status.phase === "Running"
                ) {
                    runningJobs++;
                }
            })
            return runningJobs;
        };
        setRunningJobCount(getRunningJobs);
        setJobCount(status?.kubernetes?.length ?? 0);
    }, []);




    // ...

    return (
        <Card>
            <Typography variant="h5">Status</Typography>
            <Typography variant="caption">These status items relate to properties throughout dev/stage/prod deployments</Typography><br />
            <br />
            <Typography variant="h6">RCP</Typography>
            Status: {systemStatus}<br /><br />
            <Typography variant="h6">Jobs</Typography>
            Running: {runningJobCount}<br />
            Finished: {jobCount}
            <br /><br />
            <Typography variant="h6">S3 Bucket</Typography>
            <TableContainer>
                <Table size="small"> {/* Add size="small" to shrink the table */}
                    <TableHead>
                        <TableRow>
                            <TableCell>Property</TableCell>
                            <TableCell>Value</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {status?.s3_local && (
                            <>
                                <TableRow>
                                    <TableCell>Total Object Count</TableCell>
                                    <TableCell>{status.s3_local.total_object_count}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Input Object Size (GB)</TableCell>
                                    <TableCell>{(status.s3_local.input_size / 1024 / 1024 / 1024).toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Input Object Count</TableCell>
                                    <TableCell>{status.s3_local.input_object_count}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Output Object Size (GB)</TableCell>
                                    <TableCell>{(status.s3_local.output_size / 1024 / 1024 / 1024).toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Output Object Count</TableCell>
                                    <TableCell>{status.s3_local.output_object_count}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Total Size (GB)</TableCell>
                                    <TableCell>{(status.s3_local.total_size / 1024 / 1024 / 1024).toFixed(2)}</TableCell>
                                </TableRow>
                            </>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
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
