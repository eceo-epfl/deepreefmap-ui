import {
    Button,
    RaRecord,
    useDataProvider,
    useListContext,
    useNotify,
    useRecordContext,
    useRefresh,
    useUnselectAll,
} from 'react-admin';
import { useMutation } from '@tanstack/react-query';
import { Tooltip } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';

import type { DrmDataProvider } from '../dataProvider';
import { useCanAuthor } from '../permissions';

const useValidate = (section: string) => {
    const dataProvider = useDataProvider<DrmDataProvider>();
    const notify = useNotify();
    const refresh = useRefresh();
    return useMutation({
        mutationFn: (ids: string[]) => dataProvider.validate(section, ids),
        onSuccess: result => {
            notify(`Validated ${result.validated.length} row(s)`, { type: 'info' });
            refresh();
        },
        onError: error =>
            notify(error instanceof Error ? error.message : 'Validation failed', {
                type: 'error',
            }),
    });
};

/** Validates the rows selected in a list of sync section `section`. */
// Rows failing `sendable` are left out of the request and reported as skipped for `skipReason`.
export const ValidateSelectedButton = ({
    section,
    sendable,
    skipReason = 'not ready',
}: {
    section: string;
    sendable?: (record: RaRecord) => boolean;
    skipReason?: string;
}) => {
    const { selectedIds } = useListContext();
    const unselectAll = useUnselectAll(section);
    const dataProvider = useDataProvider<DrmDataProvider>();
    const notify = useNotify();
    const refresh = useRefresh();
    const canAuthor = useCanAuthor();
    const { mutate, isPending } = useMutation({
        mutationFn: async (ids: string[]) => {
            if (!sendable) {
                const result = await dataProvider.validate(section, ids);
                return { validated: result.validated.length, skipped: 0 };
            }
            const { data } = await dataProvider.getMany(section, { ids });
            const ready = data.filter(sendable).map(record => String(record.id));
            const skipped = ids.length - ready.length;
            if (ready.length === 0) return { validated: 0, skipped };
            const result = await dataProvider.validate(section, ready);
            return { validated: result.validated.length, skipped };
        },
        onSuccess: ({ validated, skipped }) => {
            const tail = skipped ? ` ${skipped} skipped: ${skipReason}` : '';
            notify(`Validated ${validated}.${tail}`, { type: 'info' });
            if (validated) {
                unselectAll();
                refresh();
            }
        },
        onError: error =>
            notify(error instanceof Error ? error.message : 'Validation failed', {
                type: 'error',
            }),
    });
    if (!canAuthor) return null;
    return (
        <Button
            label="Validate"
            startIcon={<VerifiedIcon />}
            disabled={isPending}
            onClick={() => mutate(selectedIds.map(String))}
        />
    );
};

/** Validates the row on a Show page, hidden once it is. `disabledReason` disables it with a tooltip. */
export const ValidateButton = ({
    section,
    disabledReason,
}: {
    section: string;
    disabledReason?: string;
}) => {
    const record = useRecordContext();
    const { mutate, isPending } = useValidate(section);
    const canAuthor = useCanAuthor();
    if (!canAuthor || !record || record.validated_at) return null;
    const button = (
        <Button
            label="Validate"
            startIcon={<VerifiedIcon />}
            disabled={isPending || Boolean(disabledReason)}
            onClick={() => mutate([String(record.id)])}
        />
    );
    if (!disabledReason) return button;
    return (
        <Tooltip title={disabledReason}>
            <span>{button}</span>
        </Tooltip>
    );
};
