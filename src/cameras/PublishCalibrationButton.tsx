import { useState } from 'react';
import { Button, useDataProvider, useNotify, useRefresh } from 'react-admin';
import {
    Alert,
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button as MuiButton,
    TextField as MuiTextField,
    Stack,
    Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

import type { DrmDataProvider } from '../dataProvider';

/** The name a profile document declares, when it declares a usable one. */
const declaredName = (text: string): string => {
    try {
        const parsed: unknown = JSON.parse(text);
        if (!parsed || typeof parsed !== 'object') return '';
        const name = (parsed as { name?: unknown }).name;
        return typeof name === 'string' ? name : '';
    } catch {
        return '';
    }
};

/** Add a calibration to the registry from a profile file.
 *
 * The route a curator takes when nobody is holding a laptop: the profiles the
 * pipeline ships are JSON files in the library, and a colleague's calibration
 * arrives as one too. A laptop publishes through this same endpoint from its
 * Cameras page.
 */
const PublishCalibrationButton = () => {
    const dataProvider = useDataProvider<DrmDataProvider>();
    const notify = useNotify();
    const refresh = useRefresh();
    const [open, setOpen] = useState(false);
    const [document, setDocument] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const close = () => {
        setOpen(false);
        setDocument('');
        setName('');
        setDescription('');
        setError(null);
    };

    const read = (file: File | undefined) => {
        if (!file) return;
        void file.text().then(text => {
            setDocument(text);
            setName(current => current || declaredName(text));
            setError(null);
        });
    };

    const publish = () => {
        let parsed: unknown;
        try {
            parsed = JSON.parse(document);
        } catch {
            setError('That is not JSON. Choose a profile file, or paste its contents.');
            return;
        }
        setBusy(true);
        dataProvider
            .publishCalibration({
                name,
                document: parsed as Record<string, never>,
                description: description || null,
            })
            .then(result => {
                notify(
                    result.created
                        ? `Stored as version ${result.version} of ${name}.`
                        : `Already held as version ${result.version} of ${name}.`,
                    { type: 'info' },
                );
                close();
                refresh();
            })
            .catch((failure: Error) => setError(failure.message))
            .finally(() => setBusy(false));
    };

    return (
        <>
            <Button label="Add calibration" onClick={() => setOpen(true)}>
                <UploadFileIcon />
            </Button>
            <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
                <DialogTitle>Add a calibration</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            The profile JSON the pipeline reads: the ones it ships live in the
                            library, and a laptop writes one when it calibrates a rig. The same
                            document under the same name is stored once.
                        </Typography>
                        <Box>
                            <MuiButton component="label" variant="outlined" size="small">
                                Choose file…
                                <input
                                    type="file"
                                    accept="application/json,.json"
                                    hidden
                                    onChange={event => read(event.target.files?.[0])}
                                />
                            </MuiButton>
                        </Box>
                        <MuiTextField
                            label="Profile name"
                            value={name}
                            onChange={event => setName(event.target.value)}
                            helperText="What a preset and a laptop's profile file call this rig."
                            size="small"
                            fullWidth
                        />
                        <MuiTextField
                            label="Description"
                            value={description}
                            onChange={event => setDescription(event.target.value)}
                            size="small"
                            fullWidth
                        />
                        <MuiTextField
                            label="Document"
                            value={document}
                            onChange={event => setDocument(event.target.value)}
                            multiline
                            minRows={8}
                            fullWidth
                            slotProps={{
                                input: { sx: { fontFamily: 'monospace', fontSize: 13 } },
                            }}
                        />
                        {error && <Alert severity="error">{error}</Alert>}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={close}>Cancel</MuiButton>
                    <MuiButton
                        onClick={publish}
                        variant="contained"
                        disabled={busy || !name || !document}
                    >
                        Add
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PublishCalibrationButton;
