import {
    Show,
    SimpleShowLayout,
    TextField,
    useRecordContext,
    useRedirect,
} from 'react-admin';
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const extractSubmissionId = (id) => {
    // Form the UUID of the submission from the job log ID
    // The UUID should be suffixed after the 1st hyphen
    // eg. deepreef-7694163c-48f9-414c-a8a6-32d0c94b1147-60980-0-0

    const parts = id.split('-');
    return parts.slice(1, 6).join('-'); // Extract the middle part
};

const BackToSubmissionButton = () => {

    const record = useRecordContext();

    if (!record) return null;

    const redirect = useRedirect();
    return (

        <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => {
                const submissionId = extractSubmissionId(record.id);
                redirect('show', 'submissions', submissionId);
            }}
        >
            Back to Submission
        </Button>
    );
}

const SubmissionJobLogsShow = () => {

    return (
        <Show>
            <SimpleShowLayout>
                <BackToSubmissionButton />
                <TextField source="message" component="pre" />
            </SimpleShowLayout>
        </Show>
    );
};

export default SubmissionJobLogsShow;
