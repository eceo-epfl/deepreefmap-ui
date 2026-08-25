import { useRecordContext } from 'react-admin';
import { Chip } from '@mui/material';

import { CHANGE_STATUS_VALUES, ChangeStatus } from '../contract';

const LABELS: Record<ChangeStatus, string> = {
    applied: 'Applied',
    superseded: 'Superseded',
    proposed: 'Proposed',
    rejected: 'Rejected',
    dismissed: 'Dismissed',
};

const COLOURS: Record<ChangeStatus, 'success' | 'warning' | 'error' | 'default'> = {
    applied: 'success',
    superseded: 'default',
    proposed: 'warning',
    rejected: 'error',
    dismissed: 'default',
};

export const statusChoices = CHANGE_STATUS_VALUES.map(id => ({ id, name: LABELS[id] }));

export const ChangeStatusChip = ({ status }: { status: string }) => {
    const known = (status in LABELS ? status : 'superseded') as ChangeStatus;
    return <Chip size="small" label={LABELS[known]} color={COLOURS[known]} />;
};

const StatusField = ({
    source = 'status',
}: {
    source?: string;
    label?: string;
    sortable?: boolean;
}) => {
    const record = useRecordContext();
    if (!record) return null;
    return <ChangeStatusChip status={String(record[source])} />;
};

export default StatusField;
