import { useGetList, useRecordContext } from 'react-admin';

import { asColumn } from '../components';
import type { CameraCalibration, CameraProfile } from '../contract';

/**
 * How many measurements of this rig the registry holds.
 *
 * Every row runs the identical query, so react-admin's cache answers the whole
 * column from one request, as the preset list's assigned count does.
 */
const CalibrationCountField = () => {
    const record = useRecordContext<CameraProfile>();
    const { data } = useGetList<CameraCalibration>('camera_calibrations', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'version', order: 'DESC' },
    });
    if (!record || !data) return <span>—</span>;
    return <span>{data.filter(row => row.camera_profile_id === record.id).length}</span>;
};

export default asColumn(CalibrationCountField);
