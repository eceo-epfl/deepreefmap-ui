import { createRoot } from 'react-dom/client';
import { AdminContext, RecordContextProvider, fetchUtils } from 'react-admin';

import dataProvider from '../src/dataProvider';
import DevicePerformance from '../src/devices/DevicePerformance';
import PerformancePage from '../src/performance/PerformancePage';
import PresetPerformance from '../src/performance/PresetPerformance';

const view = new URLSearchParams(window.location.search).get('view');
const record =
    view === 'preset' ? { id: 'preset', name: 'Reef', version: 1 } : { id: 'device' };
createRoot(document.getElementById('root')!).render(
    <AdminContext dataProvider={dataProvider('/api', fetchUtils.fetchJson)}>
        <RecordContextProvider value={record}>
            {view === 'device' ? (
                <DevicePerformance />
            ) : view === 'preset' ? (
                <PresetPerformance />
            ) : (
                <PerformancePage />
            )}
        </RecordContextProvider>
    </AdminContext>,
);
