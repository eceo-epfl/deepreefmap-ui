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
            <TextField source="filename" />
            <NumberField source="size_bytes" />
            <DateField
                label="Submitted at"
                source="time_added_utc"
                showTime={true}
            />
            <TextField source="hash_md5sum" />
            <TextField source="notes" />
        </SimpleShowLayout>
    </Show>
);

export default SubmissionShow;