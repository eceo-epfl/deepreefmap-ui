import { useState } from 'react';
import {
    Confirm,
    HttpError,
    useDataProvider,
    useGetIdentity,
    useNotify,
    useRecordContext,
    useRefresh,
} from 'react-admin';
import { Button } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';

import type { DrmDataProvider } from '../dataProvider/index';
import type { Device } from '../contract';
import { useIsAdmin } from '../permissions';

const revokeMessage = (error: unknown): string => {
    if (error instanceof HttpError && error.status === 403) {
        return 'You may only revoke devices you enrolled.';
    }
    if (error instanceof HttpError && error.status === 404) {
        return 'That device no longer exists.';
    }
    return error instanceof Error ? error.message : 'Revoking the device failed.';
};

const RevokeDeviceButton = () => {
    const record = useRecordContext<Device>();
    const dataProvider = useDataProvider<DrmDataProvider>();
    const { identity } = useGetIdentity();
    const admin = useIsAdmin();
    const notify = useNotify();
    const refresh = useRefresh();
    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState(false);

    if (!record || record.revoked_at) return null;
    // The registry allows self-or-admin, so anyone else is offered nothing to press.
    if (!admin && identity?.id !== record.enrolled_by) return null;

    const revoke = async () => {
        setPending(true);
        try {
            await dataProvider.revokeDevice(String(record.id));
            notify(`${record.name} revoked.`, { type: 'info' });
            refresh();
        } catch (error) {
            notify(revokeMessage(error), { type: 'error' });
        } finally {
            setPending(false);
            setOpen(false);
        }
    };

    return (
        <>
            <Button
                color="error"
                startIcon={<BlockIcon />}
                onClick={() => setOpen(true)}
                disabled={pending}
            >
                Revoke
            </Button>
            <Confirm
                isOpen={open}
                loading={pending}
                title={`Revoke ${record.name}?`}
                content={
                    'It stops syncing at its next attempt, and needs a new connect code ' +
                    'to come back. Data it already sent is kept.'
                }
                confirm="Revoke"
                confirmColor="warning"
                onConfirm={revoke}
                onClose={() => setOpen(false)}
            />
        </>
    );
};

export default RevokeDeviceButton;
