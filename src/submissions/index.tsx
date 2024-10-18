import SubmissionCreate from './SubmissionCreate';
import SubmissionEdit from './SubmissionEdit';
import SubmissionList from './SubmissionList';
import SubmissionShow from './SubmissionShow';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';

export default {
    create: SubmissionCreate,
    edit: SubmissionEdit,
    list: SubmissionList,
    show: SubmissionShow,
    icon: ModelTrainingIcon,
    options: {
        label: 'Submissions',
    },
    recordRepresentation: (record) => {
        return (record && record.name) ? `${record.name}` : `${record.id}`;
    }
};
