import { ReactNode } from 'react';
import {
    Link,
    RecordContextProvider,
    useCreatePath,
    useGetList,
    useRecordContext,
} from 'react-admin';
import { Alert, Box, Stack, Typography } from '@mui/material';

import type { Change } from '../contract';
import DecisionButtons from './DecisionButtons';
import PatchTable from './PatchTable';

/** Open proposals against the row in context. `section` is the sync section name. */
const ProposedChangesPanel = ({ section }: { section: string }) => {
    const record = useRecordContext();
    const createPath = useCreatePath();
    const { data } = useGetList<Change>(
        'changes',
        {
            filter: { table_key: section, row_id: record?.id, status: 'proposed' },
            pagination: { page: 1, perPage: 25 },
            sort: { field: 'seq', order: 'ASC' },
        },
        { enabled: Boolean(record?.id) },
    );
    if (!record || !data?.length) return null;
    return (
        <Alert severity="warning" sx={{ '& .MuiAlert-message': { width: '100%' } }}>
            <Typography variant="subtitle2" gutterBottom>
                {data.length === 1
                    ? 'A laptop proposed a change to this row'
                    : `${data.length} laptops proposed changes to this row`}
            </Typography>
            <Stack spacing={2}>
                {data.map(change => (
                    <Box key={change.seq}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            <Link
                                to={createPath({
                                    resource: 'changes',
                                    type: 'show',
                                    id: change.seq,
                                })}
                            >
                                #{change.seq}
                            </Link>
                            {change.reason ? ` (${change.reason})` : ''}
                        </Typography>
                        <PatchTable
                            patch={(change.patch ?? {}) as Record<string, unknown>}
                            current={record as Record<string, unknown>}
                        />
                        <Box sx={{ mt: 1 }}>
                            <DecisionButtonsFor change={change} />
                        </Box>
                    </Box>
                ))}
            </Stack>
        </Alert>
    );
};

// DecisionButtons reads the change from the record context, which here is the row.
const DecisionButtonsFor = ({
    change,
    children,
}: {
    change: Change;
    children?: ReactNode;
}) => (
    <RecordContextProvider value={change}>
        <DecisionButtons />
        {children}
    </RecordContextProvider>
);

export default ProposedChangesPanel;
