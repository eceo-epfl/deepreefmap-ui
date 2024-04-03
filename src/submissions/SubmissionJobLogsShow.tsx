import {
    Show,
    SimpleShowLayout,
    TextField,
} from 'react-admin'; // eslint-disable-line import/no-unresolved

const SubmissionJobLogsShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="message" component="pre" />
        </SimpleShowLayout>
    </Show >
);


export default SubmissionJobLogsShow;