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
const SubmissionShow = (props) => (
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
            <ArrayField source="inputs" label="File Inputs">
                <Datagrid bulkActionButtons={false}>
                    <TextField source="filename" />
                    <NumberField source="size_bytes" label="Size (bytes)" />
                    <DateField source="last_updated" showTime={true} />
                    <TextField source="hash_md5sum" label="MD5 Hash" />
                </Datagrid>
            </ArrayField>
            <ArrayField source="run_status" label="Job run status">
                <Datagrid bulkActionButtons={false}>
                    <DateField source="time_started" showTime={true} />
                    <TextField source="submission_id" />

                    <TextField source="status" />
                </Datagrid>
            </ArrayField>
        </SimpleShowLayout>
    </Show>
);


export default SubmissionShow;