import VideocamIcon from '@mui/icons-material/Videocam';

import VideoList from './VideoList';
import VideoShow from './VideoShow';

// No create: an asset exists because a client hashed a file, never because the console
// said so. Edit is the administrator's correction path, and App.tsx withholds it otherwise.
export default {
    list: VideoList,
    show: VideoShow,
    // Without this react-admin titles the record `#<uuid>`: there is no `name` to infer from.
    recordRepresentation: 'file_name',
    icon: VideocamIcon,
    options: {
        label: 'Videos',
    },
};
