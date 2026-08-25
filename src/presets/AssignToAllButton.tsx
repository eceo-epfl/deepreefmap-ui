import { useState } from 'react';
import {
    Confirm,
    useDataProvider,
    useNotify,
    useRecordContext,
    useRefresh,
} from 'react-admin';
import { Button } from '@mui/material';
import SendToMobileIcon from '@mui/icons-material/SendToMobile';

import type { DrmDataProvider } from '../dataProvider/index';
import type { Preset } from '../contract';
import { useIsAdmin } from '../permissions';

/** Assigns this preset to every active device in one call. Admin-only, like the route. */
const AssignToAllButton = () => {
    const record = useRecordContext<Preset>();
    const dataProvider = useDataProvider<DrmDataProvider>();
    const admin = useIsAdmin();
    const notify = useNotify();
    const refresh = useRefresh();
    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState(false);

    if (!record || !admin || record.deleted_at) return null;

    const assignAll = async () => {
        setPending(true);
        try {
            const result = await dataProvider.assignPresetToAll(String(record.id));
            notify(`Assigned to ${result.assigned_count} device(s).`, { type: 'info' });
            refresh();
        } catch (error) {
            notify(
                error instanceof Error ? error.message : 'Assigning to all devices failed.',
                { type: 'error' },
            );
        } finally {
            setPending(false);
            setOpen(false);
        }
    };

    return (
        <>
            <Button
                startIcon={<SendToMobileIcon />}
                onClick={() => setOpen(true)}
                disabled={pending}
            >
                Assign to all devices
            </Button>
            <Confirm
                isOpen={open}
                loading={pending}
                title={`Assign ${record.name} v${record.version} to every device?`}
                content="Applies to every active device at its next check-in. A choice made on the laptop outranks it."
                confirm="Assign"
                onConfirm={assignAll}
                onClose={() => setOpen(false)}
            />
        </>
    );
};

export default AssignToAllButton;
