import { useRecordContext } from 'react-admin';

import type { Preset } from '../contract';
import ComparisonView from './ComparisonView';

const PresetPerformance = () => {
    const record = useRecordContext<Preset>();
    return record ? (
        <ComparisonView
            key={record.id}
            presetName={record.name}
            presetVersion={record.version}
        />
    ) : null;
};

export default PresetPerformance;
