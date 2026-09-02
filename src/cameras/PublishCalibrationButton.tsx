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

import type { CameraCalibration, CameraProfile } from '../contract';
import type { DrmDataProvider } from '../dataProvider';
import { describeOpticsChange } from './calibrationDiff';

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
    const [changes, setChanges] = useState<string[] | null>(null);
    const [deployed, setDeployed] = useState<number | null>(null);

    const close = () => {
        setOpen(false);
        setDocument('');
        setName('');
        setDescription('');
        setError(null);
        setChanges(null);
        setDeployed(null);
    };

    // Editing either field makes it a different document to the confirmed one.
    const reconsider = () => {
        setChanges(null);
        setDeployed(null);
    };

    const read = (file: File | undefined) => {
        if (!file) return;
        void file.text().then(text => {
            setDocument(text);
            setName(current => current || declaredName(text));
            setError(null);
            reconsider();
        });
    };

    /** What this rig is measured as today, where the registry already holds it. */
    const held = async (): Promise<CameraCalibration | undefined> => {
        const profiles = await dataProvider.getList<CameraProfile>('camera_profiles', {
            filter: { name },
            sort: { field: 'name', order: 'ASC' },
            pagination: { page: 1, perPage: 1 },
        });
        const profile = profiles.data[0];
        if (!profile) return undefined;
        const calibrations = await dataProvider.getList<CameraCalibration>(
            'camera_calibrations',
            {
                filter: { camera_profile_id: profile.id },
                sort: { field: 'version', order: 'DESC' },
                pagination: { page: 1, perPage: 1 },
            },
        );
        // A profile deploys one calibration; without one it takes the newest.
        const wanted = profile.current_calibration_id ?? calibrations.data[0]?.id;
        if (!wanted) return undefined;
        const { data } = await dataProvider.getOne<CameraCalibration>('camera_calibrations', {
            id: wanted,
        });
        return data;
    };

    const send = (parsed: unknown) => {
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

    const publish = () => {
        let parsed: unknown;
        try {
            parsed = JSON.parse(document);
        } catch {
            setError('That is not JSON. Choose a profile file, or paste its contents.');
            return;
        }
        if (changes) {
            send(parsed);
            return;
        }
        setBusy(true);
        held()
            .then(current => {
                const differences = current
                    ? describeOpticsChange(current.document, parsed)
                    : [];
                if (differences.length === 0) {
                    send(parsed);
                    return;
                }
                setChanges(differences);
                setDeployed(current?.version ?? null);
            })
            // Advisory: a lookup that cannot answer must not block a publication.
            .catch(() => send(parsed))
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
                            onChange={event => {
                                setName(event.target.value);
                                reconsider();
                            }}
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
                            onChange={event => {
                                setDocument(event.target.value);
                                reconsider();
                            }}
                            multiline
                            minRows={8}
                            fullWidth
                            slotProps={{
                                input: { sx: { fontFamily: 'monospace', fontSize: 13 } },
                            }}
                        />
                        {changes && (
                            <Alert severity="warning">
                                <Typography variant="body2">
                                    This changes the optics of {name}.
                                    {deployed !== null &&
                                        ` Version ${deployed} is what laptops run this rig under today.`}
                                </Typography>
                                <ul style={{ margin: '8px 0 0', paddingInlineStart: 20 }}>
                                    {changes.map(line => (
                                        <li key={line}>{line}</li>
                                    ))}
                                </ul>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    A profile name is one rig. Publish anyway if this is the
                                    same camera measured again.
                                </Typography>
                            </Alert>
                        )}
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
                        {changes ? 'Add anyway' : 'Add'}
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PublishCalibrationButton;
