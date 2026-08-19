import { Chip, Tooltip, Typography } from '@mui/material';

import { relativeTime } from '../devices/RelativeDateField';
import { useArchiveProbe } from './useArchiveProbe';

/** Whether a clip's bytes are in the archive, from one probe of its hash. */
const ArchiveChip = ({ contentHash }: { contentHash: string | null | undefined }) => {
    const { probe, error } = useArchiveProbe(contentHash);
    if (!contentHash) {
        return (
            <Typography
                variant="body2"
                component="span"
                sx={{
                    color: 'text.disabled',
                }}
            >
                —
            </Typography>
        );
    }
    if (error) {
        return (
            <Tooltip title={error}>
                <Chip size="small" label="Archive unavailable" variant="outlined" />
            </Tooltip>
        );
    }
    if (probe === undefined) {
        return <Chip size="small" label="Checking…" variant="outlined" />;
    }
    if (probe === null) {
        return <Chip size="small" label="Not archived" variant="outlined" />;
    }
    switch (probe.status) {
        case 'complete':
            return (
                <Chip
                    size="small"
                    color="success"
                    label={
                        probe.completed_at
                            ? `Archived ${relativeTime(probe.completed_at)}`
                            : 'Archived'
                    }
                />
            );
        case 'failed':
            return <Chip size="small" color="error" label="Archive failed" />;
        case 'pending':
            return <Chip size="small" color="warning" variant="outlined" label="Uploading" />;
        default:
            return <Chip size="small" color="warning" variant="outlined" label="Verifying" />;
    }
};

export default ArchiveChip;
