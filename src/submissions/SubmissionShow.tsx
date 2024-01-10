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
} from 'react-admin'; // eslint-disable-line import/no-unresolved


const SubmissionShowActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <><EditButton /><DeleteButton /></>}
        </TopToolbar>
    );
}
const SubmissionShow = (props) => (
    <Show actions={<SubmissionShowActions />} {...props}>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="description" />
            <BooleanField source="processing_finished" label="Processing Finished" />
            <BooleanField source="processing_successful" label="Processing Successful" />
            <NumberField
                label="Duration (s)"
                source="duration_seconds"
                sortable={false}
            />
            <NumberField
                label="Data size (MB)"
                source="data_size_mb"
                sortable={false}
            />
            <DateField
                label="Submitted at"
                source="submitted_at_utc"
                sortable={false}
                showTime={true}
            />
            <TextField source="comment" />
            <TextField source="elevation" />
            <NumberField source="latitude" />
            <NumberField source="longitude" />
            <ReferenceField
                source='area_id'
                reference='areas'
                link="show"
            >
                <TextField source='name' />
            </ReferenceField>
            <TextField
                label="Records"
                source="data.qty_records"
                sortable={false}
            />
            <DateField
                label="Data start"
                source="data.start_date"
                sortable={false}
                showTime={true}
            />
            <DateField
                label="Data end"
                source="data.end_date"
                sortable={false}
                showTime={true}
            />
        </SimpleShowLayout>
    </Show>
);


export default SubmissionShow;