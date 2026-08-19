import { useState } from 'react';
import { Button, HttpError, Title, useDataProvider, useNotify } from 'react-admin';
import { Link } from 'react-router-dom';
import {
    Alert,
    Box,
    Card,
    CardContent,
    Divider,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

import type { DrmDataProvider } from '../dataProvider/index';
import type { ConnectCode } from '../contract';
import { connectCodeUrl, isLocalUrl } from './connectCode';

const mintMessage = (error: unknown): string => {
    if (error instanceof HttpError && error.status === 403) {
        return 'Minting needs an interactive login. Device tokens are refused.';
    }
    if (error instanceof HttpError && error.status === 500) {
        return 'The server has no PUBLIC_BASE_URL set, so a code would point nowhere.';
    }
    return error instanceof Error ? error.message : 'Minting a connect code failed.';
};

const ConnectDevice = () => {
    const dataProvider = useDataProvider<DrmDataProvider>();
    const notify = useNotify();
    const [codeLabel, setCodeLabel] = useState('');
    const [code, setCode] = useState<ConnectCode | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [minting, setMinting] = useState(false);

    // The address the code carries. An operator pastes this into a laptop, so they should
    // see which host it will trust before they send it anywhere.
    const serverUrl = code ? connectCodeUrl(code.code) : null;

    const mint = async () => {
        setError(null);
        setMinting(true);
        try {
            setCode(await dataProvider.mintConnectCode(codeLabel.trim()));
        } catch (failure) {
            setError(mintMessage(failure));
        } finally {
            setMinting(false);
        }
    };

    const copy = async () => {
        if (!code) return;
        try {
            await navigator.clipboard.writeText(code.code);
            notify('Connect code copied.', { type: 'info' });
        } catch {
            notify('The browser refused clipboard access. Select the code and copy it.', {
                type: 'warning',
            });
        }
    };

    return (
        <>
            <Title title="Connect a device" />
            <Card sx={{ mt: 2, maxWidth: 760 }}>
                <CardContent>
                    <Stack spacing={2}>
                        <Typography variant="h6">Connect a device</Typography>

                        <TextField
                            label="Code label"
                            helperText="Your own record of an outstanding code."
                            value={codeLabel}
                            onChange={event => setCodeLabel(event.target.value)}
                            disabled={minting || code !== null}
                            fullWidth
                            size="small"
                        />

                        <Box>
                            <Button
                                variant="contained"
                                label={code ? 'Code minted' : 'Mint a connect code'}
                                onClick={mint}
                                disabled={minting || code !== null}
                            >
                                <VpnKeyIcon />
                            </Button>
                        </Box>

                        {error && <Alert severity="error">{error}</Alert>}

                        {code && (
                            <>
                                <Divider />
                                <Alert severity="warning">
                                    Single use and shown once. Anyone holding it can enrol a
                                    device, so send it privately.
                                </Alert>

                                <Box
                                    component="code"
                                    sx={{
                                        userSelect: 'all',
                                        fontFamily: 'monospace',
                                        fontSize: '1.1rem',
                                        wordBreak: 'break-all',
                                        p: 2,
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        bgcolor: 'action.hover',
                                    }}
                                >
                                    {code.code}
                                </Box>

                                <Stack
                                    direction="row"
                                    spacing={4}
                                    useFlexGap
                                    sx={{
                                        alignItems: 'flex-end',
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: 'text.secondary',
                                                display: 'block',
                                            }}
                                        >
                                            Points at
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color={
                                                serverUrl && isLocalUrl(serverUrl)
                                                    ? 'warning.main'
                                                    : 'text.primary'
                                            }
                                            sx={{
                                                fontFamily: 'monospace',
                                            }}
                                        >
                                            {serverUrl ?? 'unreadable'}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: 'text.secondary',
                                                display: 'block',
                                            }}
                                        >
                                            Expires
                                        </Typography>
                                        <Typography variant="body2">
                                            {new Date(code.expires_at).toLocaleTimeString()}
                                        </Typography>
                                    </Box>
                                    <Button label="Copy" onClick={copy}>
                                        <ContentCopyIcon />
                                    </Button>
                                </Stack>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'text.secondary',
                                    }}
                                >
                                    Paste it into the desktop application, then find the device
                                    under <Link to="/devices">Devices</Link>.
                                </Typography>
                            </>
                        )}
                    </Stack>
                </CardContent>
            </Card>
        </>
    );
};

export default ConnectDevice;
