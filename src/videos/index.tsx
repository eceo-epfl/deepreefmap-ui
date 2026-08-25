import VideocamIcon from '@mui/icons-material/Videocam';

import VideoEdit from './VideoEdit';
import VideoList from './VideoList';
import VideoShow from './VideoShow';

// No create: an asset exists because a client hashed a file, never because the console
// said so. Edit covers what a person knows about the clip: camera, rig position, review.
export default {
    list: VideoList,
    show: VideoShow,
    edit: VideoEdit,
    // Without this react-admin titles the record `#<uuid>`: there is no `name` to infer from.
    recordRepresentation: 'file_name',
    icon: VideocamIcon,
    options: {
        label: 'Videos',
    },
};
