import { useRecordContext } from 'react-admin';

import type { Device } from '../contract';
import ComparisonView from '../performance/ComparisonView';

const DevicePerformance = () => {
    const record = useRecordContext<Device>();
    return record ? <ComparisonView key={record.id} deviceId={record.id} /> : null;
};

export default DevicePerformance;
