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
    useRedirect,
    TabbedShowLayout,
    FunctionField,
    useRefresh,
    useCreatePath,
    useTheme,
} from 'react-admin'; // eslint-disable-line import/no-unresolved
import { Box, Typography } from '@mui/material';
import Plot from 'react-plotly.js';
import { stopPropagation } from 'ol/events/Event';
import { TransectMapOne } from '../maps/Transects';
import { Link } from 'react-router-dom';

const TransectNameField = () => {
    const record = useRecordContext();
    if (!record) return (<Typography>No associated transect" </Typography>);

    return (
        <>
            <TransectMapOne record={record.transect} />
        </>
    );
};


const SubmissionShow = (props) => {
    const FieldWrapper = ({ children, label }) => children;

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
        if (statusList.length === 0) {
            return 'Ready. Click "Execute Job" to run.';
        }

        return statusList.join(', ');
    }

    const SubmissionShowActions = () => {
        function timeout(delay: number) {
            return new Promise(res => setTimeout(res, delay));
        }
        const { permissions } = usePermissions();
        const dataProvider = useDataProvider();
        const record = useRecordContext();
        if (!record) return null;
        const refresh = useRefresh();

        // Create a function callback for onClick that calls a PUT request to the API
        const executeJob = () => {
            // Wait for return of the promise before refreshing the page
            dataProvider.executeKubernetesJob(record.id).then(() => timeout(1000)).then(() => refresh());
        }
        const readyToSubmit = readinessStatusMessageGenerator(record).length !== 0;

        return (
            <TopToolbar>
                <>
                    <Button
                        variant="contained"
                        color="success"
                        disabled={readyToSubmit}
                        onClick={executeJob}>Execute Job</Button>
                    <EditButton />
                    <DeleteButton /></>
            </TopToolbar>
        );
    }

    const createPath = useCreatePath();
    const { permissions } = usePermissions();
    const dataProvider = useDataProvider();

    const redirectToJobLogs = (id, basePath, record) => {
        if (record.status == 'Pending') {
            console.log('Job is pending, logs are not available yet');
            return;
        }
        return createPath({
            resource: 'submission_job_logs',
            type: 'show',
            id: record.submission_id,
        });
    };
    const redirectToObject = (id, basePath, record) => {
        return createPath({
            resource: 'objects',
            type: 'show',
            id: record.input_object.id,
        });
    };

    const downloadFile = (id, basePath, record) => {
        dataProvider.downloadFile(record.url);
    };

    const DeleteKubernetesJobButton = () => {
        const record = useRecordContext();
        return <Button
            type="button"
            variant="outlined"
            color="error"
            label="Request Deletion"
            disabled={record.time_started === null}
            onClick={(event) => {
                dataProvider.deleteKubernetesJob(record.submission_id);
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
                <br /><br /><br /><br /><br />
                <Typography variant="h6" align='center'>
                    No class data available
                </Typography>
            </>;
        }
        const labels = data.map((item) => item.class);
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
                    height: 600,
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
                        size: 16,
                    }
                }}
            /></>
        );
    };
    return (
        <Show actions={<SubmissionShowActions />} {...props} queryOptions={{ refetchInterval: 5000 }}>
            <SimpleShowLayout>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Box sx={{ flex: 1 }}>
                        <Labeled>
                            <TextField source="name" />
                        </Labeled><br />
                        {permissions === 'admin' ? <><Labeled><TextField source="owner" emptyText="Not defined" /></Labeled><br /></> : null}
                        <Labeled>
                            <TextField source="description" />
                        </Labeled><br /><Labeled>
                            <DateField
                                label="Submitted at"
                                source="time_added_utc"
                                sortable={false}
                                showTime={true}
                            />
                        </Labeled><br /><Labeled>
                            <FunctionField
                                label="FPS"
                                render={record => record.fps === null ? <Typography variant="body" color='red' >Required</Typography> : record.fps} />
                        </Labeled><br /><Labeled>
                            <FunctionField
                                label="Start time (s)"
                                render={record => record.time_seconds_start === null ? <Typography variant="body" color='red' >Required</Typography> : record.time_seconds_start} />
                        </Labeled><br /><Labeled>
                            <FunctionField
                                label="End time (s)"
                                render={record => record.time_seconds_end === null ? <Typography variant="body" color='red' >Required</Typography> : record.time_seconds_end} />
                        </Labeled><br />

                        <Labeled>
                            <FunctionField
                                label="Readiness status"
                                render={readinessStatusMessage}
                            />
                        </Labeled><br /><Labeled>
                            <FunctionField
                                label="Last job status"
                                render={jobStatus}
                            />
                        </Labeled>
                    </Box>
                    <Box sx={{ flex: 3 }}>
                        <ClassPieChart />
                    </Box>
                </Box>
                <TabbedShowLayout>
                    <TabbedShowLayout.Tab label="File inputs">
                        <ArrayField source="input_associations" label="File Inputs">
                            <Datagrid bulkActionButtons={false} rowClick={redirectToObject}>
                                <TextField source="input_object.filename" label="Filename" />
                                <NumberField source="input_object.size_bytes" label="Size (bytes)" />
                                <DateField source="input_object.time_added_utc" showTime={true} label="Time Added (UTC)" />
                                <TextField source="input_object.hash_md5sum" label="MD5 Hash" />
                                <NumberField source="processing_order" />
                                <NumberField source="input_object.fps" label="FPS" />
                                <NumberField source="input_object.time_seconds" label="Duration (s)" />
                                <NumberField source="input_object.frame_count" label="Frames" />
                            </Datagrid>
                        </ArrayField>
                    </TabbedShowLayout.Tab>
                    <TabbedShowLayout.Tab label="Run status">
                        <ArrayField source="run_status" label="Logs and deletion available after job passes 'Pending' status. Deletion is a request and may not be possible depending on the stage of execution.">
                            <Datagrid
                                bulkActionButtons={false}
                                rowClick={redirectToJobLogs}
                            >
                                <DateField source="time_started" showTime={true} sortable={false} />
                                <TextField source="submission_id" label="Submission ID" sortable={false} />
                                <TextField source="status" sortable={false} />
                                <DeleteKubernetesJobButton />

                            </Datagrid>
                        </ArrayField>
                    </TabbedShowLayout.Tab>

                    <TabbedShowLayout.Tab label="File outputs">
                        <ArrayField source="file_outputs" label="File Outputs" >
                            <Datagrid bulkActionButtons={false} rowClick={downloadFile}
                            >
                                <TextField source="filename" label="Filename" />
                                <NumberField source="size_bytes" label="Size (bytes)" />
                                <DateField source="last_modified" showTime={true} sortable={false} />
                            </Datagrid>
                        </ArrayField>
                    </TabbedShowLayout.Tab>
                    <TabbedShowLayout.Tab label="Transect">
                        <TransectNameField />
                    </TabbedShowLayout.Tab>
                </TabbedShowLayout>

            </SimpleShowLayout>
        </Show >
    )
};


export default SubmissionShow;