import { Button, useNotify, useRecordContext, useRefresh, useUpdate } from 'react-admin';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';

import type { CameraCalibration } from '../contract';
import { useCanAuthor } from '../permissions';

/** Deploys the calibration on this row to every laptop that resolves the rig. */
const DeployCalibrationButton = ({ deployed }: { deployed?: string | null }) => {
    const record = useRecordContext<CameraCalibration>();
    const canAuthor = useCanAuthor();
    const notify = useNotify();
    const refresh = useRefresh();
    const [update, { isPending }] = useUpdate();
    if (!record || !canAuthor || record.id === deployed) {
        return null;
    }
    // The calibration names its own profile, so the row is all the context needed.
    const deploy = () =>
        update(
            'camera_profiles',
            {
                id: record.camera_profile_id,
                data: { current_calibration_id: record.id },
            },
            {
                onSuccess: () => {
                    notify(`Laptops now take version ${record.version}.`, { type: 'info' });
                    refresh();
                },
                onError: (error: unknown) =>
                    notify(error instanceof Error ? error.message : 'Could not deploy', {
                        type: 'error',
                    }),
            },
        );
    return (
        <Button label="Deploy" onClick={deploy} disabled={isPending}>
            <PublishedWithChangesIcon />
        </Button>
    );
};

export default DeployCalibrationButton;
