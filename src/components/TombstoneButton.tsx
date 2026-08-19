import { DeleteWithConfirmButton } from 'react-admin';

import { useIsAdmin } from '../permissions';

/**
 * Administrator-only delete, worded as the tombstone the registry actually writes.
 *
 * `noun` names the row in the dialog title, e.g. `site`.
 */
const TombstoneButton = ({ noun }: { noun: string }) => {
    const admin = useIsAdmin();
    if (!admin) return null;
    return (
        <DeleteWithConfirmButton
            confirmTitle={`Delete this ${noun}?`}
            confirmContent={
                `The ${noun} is not erased, it is tombstoned. It disappears from this ` +
                'console at once, and every field laptop holding a copy drops it on its ' +
                'next sync. Nothing here brings it back.'
            }
            confirmColor="warning"
        />
    );
};

export default TombstoneButton;
