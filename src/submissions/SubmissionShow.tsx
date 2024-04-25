import dataProvider from '../../../.history/deepreefmap-ui/src/dataProvider/index_20240424173931';
import {
    Show,
    SimpleShowLayout,
    TextField,
    NumberField,
    ReferenceField,
    EditButton,
    TopToolbar,
    DeleteButton,
    usePermissions,
    DateField,
    BooleanField,
    ArrayField,
    Datagrid,
    Button,
    useRecordContext,
    useDataProvider,
    useRedirect,
    TabbedShowLayout,
    FileField,
    FunctionField,
    useRefresh,
} from 'react-admin'; // eslint-disable-line import/no-unresolved


const SubmissionShow = (props) => {

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
                {permissions === 'admin' && <>
                    <Button
                        color="primary"
                        disabled={readyToSubmit}
                        onClick={executeJob}>Execute Job</Button>
                    <EditButton />
                    <DeleteButton /></>}
            </TopToolbar>
        );
    }

    const redirect = useRedirect();

    const dataProvider = useDataProvider();

    const redirectToJobLogs = (id, basePath, record) => {
        if (record.status == 'Pending') {
            console.log('Job is pending, logs are not available yet');
            return;
        }
        redirect('show', 'submission_job_logs', record.submission_id);
    };

    const downloadFile = (id, basePath, record) => {
        console.log("Download file", basePath, id, record);
        dataProvider.downloadFile(record.url);
    };

    const DeleteKubernetesJobButton = () => {
        const record = useRecordContext();
        return <Button
            type="button"
            variant="outlined"
            color="error"
            label="Request Deletion"
            disabled={record.status === 'Pending' || record.status === 'Completed'}
            onClick={(event) => {
                dataProvider.deleteKubernetesJob(record.submission_id);
                event.stopPropagation();
            }
            }
        />;
    };

    return (
        <Show actions={<SubmissionShowActions />} {...props} queryOptions={{ refetchInterval: 5000 }}>
            <SimpleShowLayout>
                <TextField source="name" />
                <TextField source="description" />
                <DateField
                    label="Submitted at"
                    source="time_added_utc"
                    sortable={false}
                    showTime={true}
                />
                <NumberField source="fps" label="FPS" />
                <NumberField source="time_seconds_start" />
                <NumberField source="time_seconds_end" />
                <FunctionField
                    label="Readiness status"
                    render={readinessStatusMessage}
                />
                <FunctionField
                    label="Last job status"
                    render={record => `${record?.run_status[0]?.status ?? 'No status'}`}
                />
                <ArrayField source="input_associations" label="File Inputs">
                    <Datagrid bulkActionButtons={false}>
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
                <TabbedShowLayout>
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
                        <ArrayField source="file_outputs" label="File Outputs">
                            <Datagrid bulkActionButtons={false} rowClick={downloadFile}>
                                <TextField source="filename" label="Filename" />
                                <NumberField source="size_bytes" label="Size (bytes)" />
                                <DateField source="last_modified" showTime={true} sortable={false} />
                            </Datagrid>
                        </ArrayField>
                    </TabbedShowLayout.Tab>
                </TabbedShowLayout>

            </SimpleShowLayout>
        </Show >
    )
};


export default SubmissionShow;