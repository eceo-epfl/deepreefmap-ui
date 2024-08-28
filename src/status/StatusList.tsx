import {
    useDataProvider,
    Loading,
} from "react-admin";
import { useEffect, useState } from "react";
import { Card, Stack, Typography, Grid, Paper, Divider } from '@mui/material';
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
        if (!status) {
            return (<Loading />);
        }
        const getRunningJobs = () => {
            let runningJobs = 0;
            status?.kubernetes?.forEach((job) => {
                if (job.status.phase === "Pending"
                    || job.status.phase === "Running"
                    || job.status.phase === "ContainerCreating") {
                    runningJobs++;
                }
            });
            return runningJobs;
        };
        setRunningJobCount(getRunningJobs);
        setJobCount(status?.kubernetes?.length ?? 0);
    }, [status]);

    return (
        <Card sx={{ padding: 2, marginBottom: 2 }}>
            <Typography variant="h5" gutterBottom>
                System Status
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
                These status items relate to properties throughout dev/stage/prod deployments
            </Typography>

            <Grid container spacing={3} sx={{ marginTop: 2 }}>
                <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ padding: 2 }}>
                        <Typography variant="h6">Services</Typography>
                        <Typography variant="caption">If any of these are offline, contact an Administrator</Typography>
                        <Divider sx={{ marginY: 1 }} />
                        <Typography
                            variant="body1"
                            color={status.kubernetes_status ? "green" : "error"}
                        >
                            RCP GPUs: {status.kubernetes_status ? "Online" : "Offline"}
                        </Typography>
                        <Typography
                            variant="body1"
                            color={status.s3_status ? "green" : "error"}
                        >
                            S3 storage: {status.s3_status ? "Online" : "Offline"}
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ padding: 2 }}>
                        <Typography variant="h6">Jobs</Typography>
                        <Divider sx={{ marginY: 1 }} />
                        <Typography variant="body1">Running: {runningJobCount}</Typography>
                        <Typography variant="body1">Finished: {jobCount}</Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ padding: 2 }}>
                        <Typography variant="h6">S3 Bucket</Typography>
                        <Divider sx={{ marginY: 1 }} />
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Property</TableCell>
                                        <TableCell align="right">Value</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {status?.s3_local && (
                                        <>
                                            <TableRow>
                                                <TableCell>Total Object Count</TableCell>
                                                <TableCell align="right">{status.s3_local.total_object_count}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Input Object Size (GB)</TableCell>
                                                <TableCell align="right">{(status.s3_local.input_size / 1024 / 1024 / 1024).toFixed(2)}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Input Object Count</TableCell>
                                                <TableCell align="right">{status.s3_local.input_object_count}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Output Object Size (GB)</TableCell>
                                                <TableCell align="right">{(status.s3_local.output_size / 1024 / 1024 / 1024).toFixed(2)}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Output Object Count</TableCell>
                                                <TableCell align="right">{status.s3_local.output_object_count}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Total Size (GB)</TableCell>
                                                <TableCell align="right">{(status.s3_local.total_size / 1024 / 1024 / 1024).toFixed(2)}</TableCell>
                                            </TableRow>
                                        </>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Card >
    );
};

const StatusList = () => {
    return (
        <Stack spacing={2}>
            <RunnerStatus />
        </Stack>
    );
};

export default StatusList;
