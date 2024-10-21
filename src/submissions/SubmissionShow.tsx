import {
    Show,
    SimpleShowLayout,
    TextField,
    NumberField,
    EditButton,
    TopToolbar,
    DeleteButton,
    usePermissions,
    DateField,
    Labeled,
    ArrayField,
    Datagrid,
    Button,
    useRecordContext,
    useDataProvider,
    TabbedShowLayout,
    FunctionField,
    useRefresh,
    useCreatePath,
    useTheme,
    Link,
    ReferenceField,
    useNotify,
    BooleanField,
} from 'react-admin'; // eslint-disable-line import/no-unresolved
import { useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import Plot from 'react-plotly.js';
import { stopPropagation } from 'ol/events/Event';
import { TransectMapOne } from '../maps/Transects';
import Brightness1TwoToneIcon from '@mui/icons-material/Brightness1TwoTone';
import { FilePond } from 'react-filepond';

const TransectNameField = () => {
    const createPath = useCreatePath();
    const record = useRecordContext();
    let path = null;
    if (!record) return (<Typography>No associated transect" </Typography>);

    if (record.transect) {
        path = createPath({
            resource: 'transects',
            type: 'show',
            id: record.transect.id,
        });
    }

    return (
        <>
            <Typography variant="caption">
                This is the map of the transect that the submission is associated with.
            </Typography>
            <br />
            <Link to={path} onClick={stopPropagation} style={{ textDecoration: 'none' }} >
                Transect: <TextField source="transect.name" label="Area" emptyText='No transect defined' />
            </Link>
            <TransectMapOne record={record.transect} />
        </>
    );
};

const calculateDuration = (record) => {
    // const record = useRecordContext();
    const [duration, setDuration] = useState(0);
    // if (!record) return null;

    // Get the total duration of the submission. We need to know the file inputs
    const fileInputs = record.input_associations.sort((a, b) => a.processing_order - b.processing_order);

    if (fileInputs.length === 0) {
        return 0
        // setDuration(0);
    } else if (fileInputs.length === 1) {
        return record.time_seconds_end - record.time_seconds_start
        setDuration(fileInputs[0].input_object.time_seconds - record.time_seconds_start - record.time_seconds_end);
    } else {
        return fileInputs[0].input_object.time_seconds - record.time_seconds_start + record.time_seconds_end
        setDuration(fileInputs[0].input_object.time_seconds - record.time_seconds_start + record.time_seconds_end);
        // for (let i = 1; i < fileInputs.length - 1; i++) {
        //     setDuration(duration + fileInputs[i].input_object.time_seconds);
        // }

    }
    return 0
}


const SubmissionShow = (props) => {
    const [disableExecuteButton, setDisableExecuteButton] = useState(false);
    const [listOfDisabledDeletionButtons, setListOfDisabledDeletionButtons] = useState([]);
    const readinessStatusMessageGenerator = (record) => {
        // Add a list of possible statuses here. Append each if statement to the list
        var statusList = [];

        if (record.fps === null) {
            statusList.push('FPS not set');
        }

        if (record.time_seconds_start === null) {
            statusList.push('Start time not set');
        }

        if (record.time_seconds_end === null) {
            statusList.push('End time not set');
        }
        if (record.input_associations.length === 0) {
            statusList.push('No input files');
        }

        return statusList;
    }

    const readinessStatusMessage = (record) => {
        const statusList = readinessStatusMessageGenerator(record);

        // Return the text in green if ready, red if not
        if (jobStatus(record) === 'Pending' || jobStatus(record) === 'Running') {
            return 'Job is running...';
        }
        if (statusList.length === 0) {
            return 'Ready. Click "Execute Job" to run.';
        }

        return statusList.join(', ');
    }

    const SubmissionShowActions = () => {
        function timeout(delay: number) {
            return new Promise(res => setTimeout(res, delay));
        }

        const dataProvider = useDataProvider();
        const record = useRecordContext();
        const refresh = useRefresh();
        if (!record) return null;

        // Create a function callback for onClick that calls a PUT request to the API
        const executeJob = () => {
            // Wait for return of the promise before refreshing the page
            dataProvider.executeKubernetesJob(record.id).then(() => {
                notify('Job submitted. It may take some time for it to appear...');
                setDisableExecuteButton(true);
                timeout(10000).then(() => {
                    setDisableExecuteButton(false);
                });
            });
        }
        const readyToSubmit = readinessStatusMessageGenerator(record).length !== 0;

        return (
            <TopToolbar>
                <>
                    <Typography variant="caption" align='right'>
                        To make modifications to the FPS, start and end times, click the 'Edit' button. <br />Once ready, click 'Execute Job' to run the submission.
                    </Typography>
                    <Button
                        variant="contained"
                        color="success"
                        disabled={readyToSubmit || disableExecuteButton}
                        onClick={executeJob}>Execute Job</Button>
                    <EditButton />
                    <DeleteButton /></>
            </TopToolbar>
        );
    }

    const createPath = useCreatePath();
    const { permissions } = usePermissions();
    const dataProvider = useDataProvider();
    const notify = useNotify();

    const redirectToJobLogs = (id, basePath, record, event) => {
        if (record.status == 'Pending') {
            notify('Job is pending, logs are not available yet');
            return false;
        }
        if (record.logs.length === 0) {
            notify('Logs are not available for this job');
            return false;
        }
        return createPath({
            resource: 'submission_job_logs',
            type: 'show',
            id: record.kubernetes_pod_name,
        });
    };
    const redirectToObject = (id, basePath, record) => {
        return createPath({
            resource: 'objects',
            type: 'show',
            id: record.input_object.id,
        });
    };

    const downloadFile = (id, basePath, record, event) => {
        dataProvider.downloadFile(record.url);
        event.stopPropagation();
    };


    const DeleteKubernetesJobButton = () => {
        const record = useRecordContext();
        return <Button
            type="button"
            variant="outlined"
            color="error"
            label="Request Deletion"
            disabled={record.time_started === null || !record.is_still_kubernetes_resource || listOfDisabledDeletionButtons.includes(record.kubernetes_pod_name)
            }
            onClick={(event) => {
                dataProvider.deleteKubernetesJob(record.kubernetes_pod_name).then(
                    () => {
                        notify('Deletion request sent. It may take some time for the job to be deleted.')
                        // Add record.kubernetes_pod_name from the record to the list of disabled buttons
                        setListOfDisabledDeletionButtons([...listOfDisabledDeletionButtons, record.kubernetes_pod_name]);
                    }
                ).catch(
                    () => notify('Deletion request failed. It may have already been deleted. Please try again later.')
                );
                event.stopPropagation();
            }
            }
        />;
    };
    const jobStatus = (record) => {
        return record.run_status[0]?.status ?? 'No status';
    }
    const ClassPieChart = () => {
        const record = useRecordContext();
        const [theme, setTheme] = useTheme();

        const data = record.percentage_covers;
        const rgbToString = (rgbArray) => `rgb(${rgbArray.join(', ')})`;
        // If no data is available, return a message
        if (data.length === 0) {
            return <>
                <Grid container justifyContent="center" alignItems="center">
                    <Typography variant="body1" align='center'>
                        Execute a job to obtain class information
                    </Typography>
                </Grid>
            </>;
        }
        const labels = data.map((item) => `${item.class} (${(item.percentage_cover * 100).toFixed(2)}%)`);
        const colors = data.map((item) => rgbToString(item.color)); // Convert RGB array to CSS rgb string
        // Set labels to capitalise the first letter

        labels.forEach((label, index) => {
            labels[index] = label.charAt(0).toUpperCase() + label.slice(1);
        });

        const values = data.map((item) => item.percentage_cover);
        const pieData = [{
            values: values,
            labels: labels,
            type: 'pie',
            hoverinfo: 'label+percent',
            textinfo: 'label+percent',
            textposition: 'inside',
            insidetextorientation: 'radial',
            marker: {
                colors: colors, // Assign the custom colors to the pie chart
            },
        }];
        return (<>
            <Typography variant="h6" align='center'>Classes</Typography>
            <Plot
                data={pieData}
                layout={{
                    width: 800,
                    height: 400,
                    paper_bgcolor: theme === 'dark' ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)',
                    autosize: true,
                    margin: {
                        l: 0,  // Left margin
                        r: 0,  // Right margin
                        t: 0,  // Top margin
                        b: 0,  // Bottom margin
                    },
                    font: {
                        color: theme === 'dark' ? 'white' : 'black',
                        size: 14,
                    }
                }}
            /></>
        );
    };
    const StatusIndicator = () => {
        const record = useRecordContext();
        if (!record) return null;

        const noUserInputErrors: boolean = (readinessStatusMessageGenerator(record).length === 0);
        const jobStatusMessage = jobStatus(record);

        return (<><Brightness1TwoToneIcon color={
            noUserInputErrors ? (
                (jobStatusMessage == "Pending" || jobStatusMessage == "Running") ? "warning" : "success")
                : "error"} />
            <FunctionField paddingLeft={1}
                label="Readiness status"
                render={readinessStatusMessage}
            /></>
        );
    }
    const RunStatusIndicator = (

    ) => {
        const record = useRecordContext();
        if (!record) return null;

        console.log(record);
        const isRunning = record.status === 'Running' || record.status === 'Pending';
        const isError = record.status === 'Error';
        const isComplete = record.status === 'Succeeded';

        return (<>
            <Brightness1TwoToneIcon
                color={isRunning ? "warning" : isError ? "error" : isComplete ? "success" : "disabled"}
            /></>

        );



    };

    return (
        <Show actions={<SubmissionShowActions />} {...props} queryOptions={{ refetchInterval: 5000 }}>
            <SimpleShowLayout>
                <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <StatusIndicator />
                        </Box>
                    </Grid>
                    <Grid item>
                        <DateField
                            label="Submitted at"
                            source="time_added_utc"
                            sortable={false}
                            showTime
                            transform={value => new Date(value + 'Z')}  // Fix UTC time
                        />
                    </Grid>
                </Grid>
                <Box
                    sx={{
                        height: 2,
                        width: '100%',
                        bgcolor: 'gray',
                        marginY: 1,
                    }}
                />
                <Grid container>
                    <Grid item xs={2}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            {permissions === 'admin' ? (
                                <>
                                    <Labeled>
                                        <ReferenceField source="owner" reference="users" link="show">
                                            <FunctionField render={record => `${record.firstName} ${record.lastName} `} source="Owner" />
                                        </ReferenceField>
                                    </Labeled>
                                </>
                            ) : null}
                            <Labeled>
                                <FunctionField
                                    label="FPS"
                                    render={record => record.fps === null ? <Typography variant="body" color='red' >Required</Typography> : record.fps}
                                />
                            </Labeled>
                            <Labeled>
                                <FunctionField
                                    label="Start time (s)"
                                    render={record => record.time_seconds_start === null ? <Typography variant="body" color='red' >Required</Typography> : record.time_seconds_start}
                                />
                            </Labeled>
                            <Labeled>
                                <FunctionField
                                    label="End time (s)"
                                    render={record => record.time_seconds_end === null ? <Typography variant="body" color='red' >Required</Typography> : record.time_seconds_end}
                                />
                            </Labeled>
                            <Labeled>
                                <FunctionField label="Duration (s)" render={(record) => calculateDuration(record)} />
                            </Labeled>
                            <Labeled>
                                <FunctionField
                                    label="Last job status"
                                    render={jobStatus}
                                />
                            </Labeled>
                            <Labeled>
                                <TextField source="description" />
                            </Labeled>
                        </Box>
                    </Grid>
                    <Grid item xs={10}>
                        <ClassPieChart />
                    </Grid>
                </Grid>
                <TabbedShowLayout>
                    <TabbedShowLayout.Tab label="Run status">
                        <Typography variant="caption">
                            This is a list of the jobs that have been submitted for this submission. Click on them to view their logs.<br />
                            Logs become available after job enters the 'Pending' status. A request for deletion may not be possible depending on the stage of execution.
                        </Typography>
                        <ArrayField
                            source="run_status"
                        >
                            <Datagrid
                                bulkActionButtons={false}
                                rowClick={redirectToJobLogs}
                            >
                                <RunStatusIndicator />
                                <DateField
                                    source="time_started"
                                    sortable={false}
                                    showTime
                                />
                                <TextField source="status" sortable={false} />
                                <DeleteKubernetesJobButton />

                            </Datagrid>
                        </ArrayField>
                    </TabbedShowLayout.Tab>
                    <TabbedShowLayout.Tab label="File inputs">
                        <Typography variant="caption">
                            These are the input files which have been assigned to this submission. If these are incorrect, please delete the submission and resubmit one with the correct files.
                        </Typography>
                        <ArrayField source="input_associations" label="File Inputs">
                            <Datagrid bulkActionButtons={false} rowClick={redirectToObject}>
                                <TextField source="input_object.filename" label="Filename" />
                                <FunctionField label="Size (MB)" render={(record) => { return (record.input_object.size_bytes / 1000000).toFixed(2); }} />
                                <DateField source="input_object.time_added_utc"
                                    showTime
                                    transform={value => new Date(value + 'Z')}  // Fix UTC time
                                    label="Time Added" />
                                <TextField source="input_object.hash_md5sum" label="MD5 Hash" />
                                <NumberField source="processing_order" />
                                <NumberField source="input_object.fps" label="FPS" />
                                <NumberField source="input_object.time_seconds" label="Duration (s)" />
                                <NumberField source="input_object.frame_count" label="Frames" />
                            </Datagrid>
                        </ArrayField>
                    </TabbedShowLayout.Tab>

                    <TabbedShowLayout.Tab label="File outputs">
                        <Typography variant="caption">
                            These are the files that have been produced by the submission. Click on each of them to download.
                        </Typography>
                        <ArrayField source="file_outputs" label="File Outputs" >
                            <Datagrid bulkActionButtons={false} rowClick={downloadFile}
                            >
                                <TextField source="filename" label="Filename" />
                                <FunctionField label="Size (MB)" render={(record) => { return (record.size_bytes / 1000000).toFixed(5); }} />
                                <DateField
                                    source="last_modified"
                                    sortable={false}
                                    showTime
                                />
                            </Datagrid>
                        </ArrayField>
                    </TabbedShowLayout.Tab>
                    <TabbedShowLayout.Tab label="Transect">

                        <TransectNameField />
                    </TabbedShowLayout.Tab>
                </TabbedShowLayout>

            </SimpleShowLayout >
        </Show >
    )
};


export default SubmissionShow;