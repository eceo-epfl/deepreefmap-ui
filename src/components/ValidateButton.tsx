import {
    Button,
    useDataProvider,
    useListContext,
    useNotify,
    useRecordContext,
    useRefresh,
    useUnselectAll,
} from 'react-admin';
import { useMutation } from '@tanstack/react-query';
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

/** Validate the rows selected in a list. `section` is the sync section name. */
export const ValidateSelectedButton = ({ section }: { section: string }) => {
    const { selectedIds } = useListContext();
    const unselectAll = useUnselectAll(section);
    const { mutate, isPending } = useValidate(section);
    const canAuthor = useCanAuthor();
    if (!canAuthor) return null;
    return (
        <Button
            label="Validate"
            startIcon={<VerifiedIcon />}
            disabled={isPending}
            onClick={() =>
                mutate(selectedIds.map(String), {
                    onSuccess: () => unselectAll(),
                })
            }
        />
    );
};

/** Validate the row on a Show page, hidden once it is. */
export const ValidateButton = ({ section }: { section: string }) => {
    const record = useRecordContext();
    const { mutate, isPending } = useValidate(section);
    const canAuthor = useCanAuthor();
    if (!canAuthor || !record || record.validated_at) return null;
    return (
        <Button
            label="Validate"
            startIcon={<VerifiedIcon />}
            disabled={isPending}
            onClick={() => mutate([String(record.id)])}
        />
    );
};
