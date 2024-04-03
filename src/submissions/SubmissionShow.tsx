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
} from 'react-admin'; // eslint-disable-line import/no-unresolved
import { apiUrl } from "../App";

const SubmissionShowActions = () => {
    const { permissions } = usePermissions();
    const record = useRecordContext();
    const dataProvider = useDataProvider();
    // Create a function callback for onClick that calls a PUT request to the API
    const executeJob = () => {
        dataProvider.executeKubernetesJob(record.id);
    }
    return (
        <TopToolbar>
            {permissions === 'admin' && <>
                <Button color="primary" onClick={executeJob}>Execute Job</Button>
                <EditButton />
                <DeleteButton /></>}
        </TopToolbar>
    );
}
const SubmissionShow = (props) => {
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


    return (
        <Show actions={<SubmissionShowActions />} {...props}>
            <SimpleShowLayout>
                <TextField source="id" />
                <TextField source="name" />
                <TextField source="description" />
                <DateField
                    label="Submitted at"
                    source="time_added_utc"
                    sortable={false}
                    showTime={true}
                />

                <TabbedShowLayout>
                    <TabbedShowLayout.Tab label="File inputs">
                        <ArrayField source="input_associations" label="File Inputs">
                            <Datagrid bulkActionButtons={false}>
                                <TextField source="input_object.filename" label="Filename" />
                                <NumberField source="input_object.size_bytes" label="Size (bytes)" />
                                <DateField source="input_object.time_added_utc" showTime={true} label="Time Added (UTC)" />
                                <TextField source="input_object.hash_md5sum" label="MD5 Hash" />
                                <NumberField source="processing_order" />
                            </Datagrid>
                        </ArrayField>
                    </TabbedShowLayout.Tab>
                    <TabbedShowLayout.Tab label="Run status">
                        <ArrayField source="run_status" label="Job run status">
                            <Datagrid
                                bulkActionButtons={false}
                                rowClick={redirectToJobLogs}
                            >
                                <DateField source="time_started" showTime={true} sortable={false} />
                                <TextField source="submission_id" label="Submission ID" sortable={false} />
                                <TextField source="status" sortable={false} />
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