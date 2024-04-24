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
} from 'react-admin'; // eslint-disable-line import/no-unresolved

const SubmissionShowActions = () => {
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
const SubmissionShow = (props) => (
    <Show actions={<SubmissionShowActions />} {...props}>
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
        </SimpleShowLayout>
    </Show>
);

export default SubmissionShow;