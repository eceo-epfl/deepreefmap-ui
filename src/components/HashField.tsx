import { MouseEvent } from 'react';
import { useNotify, useRecordContext } from 'react-admin';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';

/** A content hash is an identity, so it needs to be copyable in full. */
const HashField = ({
    source = 'hash',
    abbreviate = true,
    emptyText = 'Not hashed',
}: {
    label?: string;
    sortable?: boolean;
    source?: string;
    abbreviate?: boolean;
    emptyText?: string;
}) => {
    const record = useRecordContext();
    const notify = useNotify();
    const hash = record?.[source] as string | null | undefined;
    if (!hash) return <span>{emptyText}</span>;
    const copy = (event: MouseEvent<HTMLButtonElement>) => {
        // The datagrid row would otherwise navigate away on the same click.
        event.stopPropagation();
        navigator.clipboard.writeText(hash).then(
            () => notify('Hash copied', { type: 'info' }),
            () => notify('Could not copy the hash', { type: 'warning' }),
        );
    };
    return (
        <Stack
            direction="row"
            spacing={0.5}
            sx={{
                alignItems: 'center',
            }}
        >
            <Tooltip title={hash}>
                <Box component="span" sx={{ fontFamily: 'monospace' }}>
                    {abbreviate ? `${hash.slice(0, 12)}…` : hash}
                </Box>
            </Tooltip>
            <Tooltip title="Copy the full hash">
                <IconButton size="small" onClick={copy}>
                    <ContentCopyIcon fontSize="inherit" />
                </IconButton>
            </Tooltip>
        </Stack>
    );
};

export default HashField;
