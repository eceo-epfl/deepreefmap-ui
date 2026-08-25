import { DeleteWithConfirmButton } from 'react-admin';

import { useIsAdmin } from '../permissions';

/**
 * Administrator-only delete; the registry tombstones the row.
 *
 * `noun` names the row in the dialog title, e.g. `site`.
 */
const TombstoneButton = ({ noun }: { noun: string }) => {
    const admin = useIsAdmin();
    if (!admin) return null;
    return (
        <DeleteWithConfirmButton
            confirmTitle={`Delete this ${noun}?`}
            confirmContent={`Removes the ${noun} from this console now and from every laptop at its next sync. Cannot be undone.`}
            confirmColor="warning"
        />
    );
};

export default TombstoneButton;
