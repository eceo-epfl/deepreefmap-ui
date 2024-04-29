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
    BooleanField,
    Button,
    useDataProvider,
    useRecordContext,
    useRefresh,
    ArrayField,
    Datagrid,
    useRedirect,
    ReferenceField,
    ReferenceArrayField,
    ReferenceManyField,
} from 'react-admin'; // eslint-disable-line import/no-unresolved

const ObjectShowActions = () => {
    const { permissions } = usePermissions();
    const dataProvider = useDataProvider();
    const record = useRecordContext();
    const refresh = useRefresh();
    const timeout = ms => new Promise(res => setTimeout(res, ms));
    const RegenerateStatisticsButton = () => {
        return <Button
            type="button"
            // disabled={!filesProcessed}
            variant="contained"
            color="primary"
            label="Regenerate Video Statistics"
            // Refresh after 3 seconds
            onClick={() => dataProvider.regenerateVideoStatistics(record.id).then(() => timeout(3000)).then(() => refresh())}
        />;
    };

    return (
        <TopToolbar>
            {permissions === 'admin' && <><RegenerateStatisticsButton /><EditButton /><DeleteButton /></>}
        </TopToolbar >
    );
}
const ObjectShow = (props) => {
    const redirect = useRedirect();
    const redirectToSubmission = (id, basePath, record) => {
        redirect('show', 'submissions', record.submission_id);
    };
    return (

        <Show
            actions={<ObjectShowActions />}
            {...props}
            queryOptions={{ refetchInterval: 5000 }}
        >
            <SimpleShowLayout>
                <TextField source="id" />
                <TextField source="filename" />
                <NumberField source="size_bytes" />
                <DateField
                    label="Submitted at"
                    source="time_added_utc"
                    showTime={true}
                />
                <TextField source="hash_md5sum" label="MD5" />
                <TextField source="notes" />
                <NumberField source="time_seconds" />
                <NumberField source="fps" />
                <TextField source="processing_message" />
                <BooleanField source="processing_completed_successfully" />
                <BooleanField source="processing_has_started" />
                <ArrayField source="input_associations" label="File Inputs">
                    <Datagrid bulkActionButtons={false} rowClick={redirectToSubmission}>
                        <TextField source="submission_id" label="Submission ID" />
                        <ReferenceField source="submission_id" reference="submissions" label="Name" link={false}>
                            <TextField source="name" />
                        </ReferenceField>
                        <ReferenceField source="submission_id" reference="submissions" label="Run status" link={false}>
                            <TextField source="run_status[0].status" emptyText='No jobs submitted' />
                        </ReferenceField>
                    </Datagrid>

                </ArrayField>
            </SimpleShowLayout>
        </Show>
    )
};

export default ObjectShow;