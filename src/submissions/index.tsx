import SubmissionCreate from './SubmissionCreate';
import SubmissionEdit from './SubmissionEdit';
import SubmissionList from './SubmissionList';
import SubmissionShow from './SubmissionShow';
import VideocamIcon from '@mui/icons-material/Videocam';

export default {
    create: SubmissionCreate,
    edit: SubmissionEdit,
    list: SubmissionList,
    show: SubmissionShow,
    icon: VideocamIcon,
    options: {
        label: 'Submissions',
    },
};
