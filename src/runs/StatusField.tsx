import { Chip } from '@mui/material';
import { useRecordContext } from 'react-admin';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SyncIcon from '@mui/icons-material/Sync';

import { RUN_STATUS_VALUES, RunStatus } from '../contract';

const STATUS_LABELS: Record<RunStatus, string> = {
    pending: 'Pending',
    running: 'Running',
    succeeded: 'Succeeded',
    failed: 'Failed',
    cancelled: 'Cancelled',
    interrupted: 'Interrupted',
};

const STATUS_COLOURS: Record<RunStatus, 'success' | 'info' | 'warning' | 'error' | 'default'> =
    {
        pending: 'default',
        running: 'info',
        succeeded: 'success',
        failed: 'error',
        cancelled: 'default',
        interrupted: 'warning',
    };

const STATUS_ICONS: Record<RunStatus, typeof CheckCircleIcon> = {
    pending: ScheduleIcon,
    running: SyncIcon,
    succeeded: CheckCircleIcon,
    failed: ErrorIcon,
    cancelled: CancelIcon,
    interrupted: PauseCircleIcon,
};

export const statusChoices = RUN_STATUS_VALUES.map(id => ({ id, name: STATUS_LABELS[id] }));

/** How a run status reads everywhere it is shown, whatever record carries it. */
export const RunStatusChip = ({ status }: { status: string }) => {
    if (!(status in STATUS_LABELS)) return <span>{status}</span>;
    const known = status as RunStatus;
    const Icon = STATUS_ICONS[known];
    return (
        <Chip
            size="small"
            icon={<Icon fontSize="small" />}
            label={STATUS_LABELS[known]}
            color={STATUS_COLOURS[known]}
            variant={known === 'succeeded' || known === 'failed' ? 'filled' : 'outlined'}
        />
    );
};

// `label` is read by the Datagrid header, not here.
const StatusField = ({ emptyText = '—' }: { label?: string; emptyText?: string }) => {
    const record = useRecordContext();
    const status = record?.status as RunStatus | undefined;
    if (!status) return <span>{emptyText}</span>;
    return <RunStatusChip status={status} />;
};

export default StatusField;
