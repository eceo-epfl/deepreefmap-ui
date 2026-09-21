import { Chip } from '@mui/material';
import { useRecordContext } from 'react-admin';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

import { StoredObjectStatus } from '../contract';

const STATUS_LABELS: Record<StoredObjectStatus, string> = {
    pending: 'Pending',
    complete: 'Complete',
    failed: 'Failed',
};

const STATUS_COLOURS: Record<StoredObjectStatus, 'success' | 'warning' | 'error'> = {
    pending: 'warning',
    complete: 'success',
    failed: 'error',
};

const STATUS_ICONS: Record<StoredObjectStatus, typeof CheckCircleIcon> = {
    pending: HourglassEmptyIcon,
    complete: CheckCircleIcon,
    failed: ErrorIcon,
};

/** How a stored object's status reads everywhere it is shown. */
export const ObjectStatusChip = ({ status }: { status: string }) => {
    if (!(status in STATUS_LABELS)) return <span>{status}</span>;
    const known = status as StoredObjectStatus;
    const Icon = STATUS_ICONS[known];
    return (
        <Chip
            size="small"
            icon={<Icon fontSize="small" />}
            label={STATUS_LABELS[known]}
            color={STATUS_COLOURS[known]}
            variant={known === 'complete' || known === 'failed' ? 'filled' : 'outlined'}
        />
    );
};

// `label` is read by the Datagrid header, not here.
const StatusField = ({ emptyText = '—' }: { label?: string; emptyText?: string }) => {
    const record = useRecordContext();
    const status = record?.status as string | undefined;
    if (!status) return <span>{emptyText}</span>;
    return <ObjectStatusChip status={status} />;
};

export default StatusField;
