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
        </SimpleShowLayout>
    </Show>
);


export default SubmissionShow;