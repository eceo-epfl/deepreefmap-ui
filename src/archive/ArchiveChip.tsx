import { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Chip, Tooltip, Typography } from '@mui/material';

import { relativeTime } from '../devices/RelativeDateField';
import { useArchiveProbe } from './useArchiveProbe';

// Both the by-hash and the batch probe answer this shape.
export type ArchiveState = {
    status: string;
    completed_at?: string | null;
    object_id?: string;
};

const Dash = () => (
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

// Inside a datagrid the row's own click would swallow the link.
const stopRowClick = (event: MouseEvent) => event.stopPropagation();

/**
 * One archive state as a chip.
 *
 * `state` is `undefined` while the probe is in flight, `null` when nothing is
 * archived under the hash. A complete state links to its stored object.
 */
export const ArchiveStateChip = ({
    state,
    error,
}: {
    state: ArchiveState | null | undefined;
    error?: string;
}) => {
    if (error) {
        return (
            <Tooltip title={error}>
                <Chip size="small" label="Archive unavailable" variant="outlined" />
            </Tooltip>
        );
    }
    if (state === undefined) {
        return <Chip size="small" label="Checking…" variant="outlined" />;
    }
    if (state === null) {
        return <Chip size="small" label="Not archived" variant="outlined" />;
    }
    switch (state.status) {
        case 'complete': {
            const label = state.completed_at
                ? `Archived ${relativeTime(state.completed_at)}`
                : 'Archived';
            if (state.object_id) {
                return (
                    <Chip
                        size="small"
                        color="success"
                        label={label}
                        clickable
                        component={Link}
                        to={`/stored_objects/${state.object_id}/show`}
                        onClick={stopRowClick}
                    />
                );
            }
            return <Chip size="small" color="success" label={label} />;
        }
        case 'failed':
            return <Chip size="small" color="error" label="Archive failed" />;
        case 'pending':
            return <Chip size="small" color="warning" variant="outlined" label="Uploading" />;
        default:
            return <Chip size="small" color="warning" variant="outlined" label="Verifying" />;
    }
};

/** Whether a clip's bytes are in the archive, from one probe of its hash. */
const ArchiveChip = ({ contentHash }: { contentHash: string | null | undefined }) => {
    const { probe, error } = useArchiveProbe(contentHash);
    if (!contentHash) return <Dash />;
    return <ArchiveStateChip state={probe} error={error} />;
};

export default ArchiveChip;
