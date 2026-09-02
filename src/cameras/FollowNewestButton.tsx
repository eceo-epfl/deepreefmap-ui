import { useState } from 'react';
import {
    Button,
    Confirm,
    useNotify,
    useRecordContext,
    useRefresh,
    useUpdate,
} from 'react-admin';
import UpdateIcon from '@mui/icons-material/Update';

import type { CameraProfile } from '../contract';
import { useCanAuthor } from '../permissions';

/** Puts a rig back to taking whichever calibration is newest. */
const FollowNewestButton = () => {
    const record = useRecordContext<CameraProfile>();
    const canAuthor = useCanAuthor();
    const notify = useNotify();
    const refresh = useRefresh();
    const [open, setOpen] = useState(false);
    const [update, { isPending }] = useUpdate();
    if (!record || !canAuthor || !record.current_calibration_id) {
        return null;
    }
    const follow = () =>
        update(
            'camera_profiles',
            { id: record.id, data: { current_calibration_id: null } },
            {
                onSuccess: () => {
                    notify('Laptops now take the newest calibration.', { type: 'info' });
                    setOpen(false);
                    refresh();
                },
                onError: (error: unknown) => {
                    notify(error instanceof Error ? error.message : 'Could not change it', {
                        type: 'error',
                    });
                    setOpen(false);
                },
            },
        );
    return (
        <>
            <Button label="Follow newest" onClick={() => setOpen(true)} disabled={isPending}>
                <UpdateIcon />
            </Button>
            <Confirm
                isOpen={open}
                title="Follow the newest calibration"
                content="Laptops will take whichever calibration of this rig is newest, now and after every future publication."
                onConfirm={follow}
                onClose={() => setOpen(false)}
            />
        </>
    );
};

export default FollowNewestButton;
