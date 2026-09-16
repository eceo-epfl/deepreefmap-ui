import { Button, useDataProvider, useNotify, useRecordContext, useRefresh } from 'react-admin';
import { useMutation } from '@tanstack/react-query';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { Stack } from '@mui/material';

import type { Change } from '../contract';
import type { DrmDataProvider } from '../dataProvider';
import { useCanAuthor } from '../permissions';

/** Accept or dismiss the proposal in the record context. Hidden once decided. */
const DecisionButtons = () => {
    const record = useRecordContext<Change>();
    const dataProvider = useDataProvider<DrmDataProvider>();
    const notify = useNotify();
    const refresh = useRefresh();
    const canAuthor = useCanAuthor();
    const decide = useMutation({
        mutationFn: ({ seq, accept }: { seq: number; accept: boolean }) =>
            accept ? dataProvider.acceptChange(seq) : dataProvider.dismissChange(seq),
        onSuccess: result => {
            notify(result.status === 'applied' ? 'Proposal applied' : 'Proposal dismissed', {
                type: 'info',
            });
            refresh();
        },
        onError: error =>
            notify(error instanceof Error ? error.message : 'The decision failed', {
                type: 'error',
            }),
    });
    if (!canAuthor || !record || record.status !== 'proposed') return null;
    return (
        <Stack direction="row" spacing={1}>
            <Button
                label="Accept"
                startIcon={<CheckIcon />}
                disabled={decide.isPending}
                onClick={() => decide.mutate({ seq: record.seq, accept: true })}
            />
            <Button
                label="Dismiss"
                startIcon={<CloseIcon />}
                disabled={decide.isPending}
                onClick={() => decide.mutate({ seq: record.seq, accept: false })}
            />
        </Stack>
    );
};

export default DecisionButtons;
