import { Route } from 'react-router-dom';
import Inventory2Icon from '@mui/icons-material/Inventory2';

import type { StoredObject } from '../contract';
import StoredObjectList from './StoredObjectList';
import StoredObjectShow from './StoredObjectShow';
import UploadPage from './UploadPage';

// Read-only: rows exist because a client uploaded bytes, never because the console
// said so. The upload page under `upload` is the console's only write path.
export default {
    list: StoredObjectList,
    show: StoredObjectShow,
    recordRepresentation: (record: StoredObject) => record.content_hash,
    icon: Inventory2Icon,
    options: {
        label: 'Archive',
    },
    children: <Route path="upload" element={<UploadPage />} />,
};
