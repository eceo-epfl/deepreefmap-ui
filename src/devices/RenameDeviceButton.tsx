import { useState } from 'react';
import {
    HttpError,
    useDataProvider,
    useGetIdentity,
    useNotify,
    useRecordContext,
    useRefresh,
} from 'react-admin';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
} from '@mui/material';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';

import type { DrmDataProvider } from '../dataProvider/index';
import type { Device } from '../contract';
import { useIsAdmin } from '../permissions';

const renameMessage = (error: unknown): string => {
    if (error instanceof HttpError && error.status === 403) {
        return 'You may only rename devices you enrolled.';
    }
    if (error instanceof HttpError && error.status === 404) {
        return 'That device no longer exists.';
    }
    return error instanceof Error ? error.message : 'Renaming the device failed.';
};

/** Renaming is a human action: a device may not relabel its own uploads. */
const RenameDeviceButton = () => {
    const record = useRecordContext<Device>();
    const dataProvider = useDataProvider<DrmDataProvider>();
    const { identity } = useGetIdentity();
    const admin = useIsAdmin();
    const notify = useNotify();
    const refresh = useRefresh();
    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState(false);
    const [name, setName] = useState('');

    if (!record) return null;
    if (!admin && identity?.id !== record.enrolled_by) return null;

    const start = () => {
        setName(record.name);
        setOpen(true);
    };

    const submit = async () => {
        const next = name.trim();
        if (!next || next === record.name) {
            setOpen(false);
            return;
        }
        setPending(true);
        try {
            const renamed = await dataProvider.renameDevice(String(record.id), next);
            notify(`Renamed to ${renamed.name}.`, { type: 'info' });
            refresh();
            setOpen(false);
        } catch (error) {
            notify(renameMessage(error), { type: 'error' });
        } finally {
            setPending(false);
        }
    };

    return (
        <>
            <Button startIcon={<DriveFileRenameOutlineIcon />} onClick={start}>
                Rename
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Rename device</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        size="small"
                        margin="dense"
                        label="Device name"
                        value={name}
                        onChange={event => setName(event.target.value)}
                    />
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'text.secondary',
                        }}
                    >
                        Shown as the uploader on everything this device has pushed.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={submit} disabled={pending}>
                        Rename
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default RenameDeviceButton;
