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
            <DateField
                label="Submitted at"
                source="submitted_at_utc"
                sortable={false}
                showTime={true}
            />
            <TextField source="comment" />

            <ArrayField source="inputs">
                <Datagrid bulkActionButtons={false}>
                    <TextField source="Key" />
                    <NumberField source="Size" label="Size (bytes)" />
                </Datagrid>
            </ArrayField>
        </SimpleShowLayout>
    </Show>
);


export default SubmissionShow;