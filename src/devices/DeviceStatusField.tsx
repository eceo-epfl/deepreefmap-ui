import { FC } from 'react';
import { useRecordContext } from 'react-admin';
import { Chip, Tooltip } from '@mui/material';

/** Enrolment state as a chip. Revoked devices stay listed as an audit trail. */
const DeviceStatusField: FC<{ label?: string }> = () => {
    const record = useRecordContext();
    const revokedAt = record?.revoked_at as string | null | undefined;
    if (!revokedAt) return <Chip size="small" label="Active" color="success" />;
    return (
        <Tooltip title={`Revoked ${new Date(revokedAt).toLocaleString()}`}>
            <Chip size="small" label="Revoked" color="error" variant="outlined" />
        </Tooltip>
    );
};

export default DeviceStatusField;
