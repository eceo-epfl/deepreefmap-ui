import { MouseEvent, useState } from 'react';
import { Button, useDataProvider, useNotify } from 'react-admin';
import FolderZipIcon from '@mui/icons-material/FolderZip';

import type { DrmDataProvider } from '../dataProvider';

/**
 * Downloads a run's outputs as one zip: all of them, or one group.
 *
 * The registry streams the zip, so the click starts a download rather than
 * holding the page while anything is packed.
 */
const BundleButton = ({
    runId,
    purpose,
    label = 'Download zip',
}: {
    runId: string;
    /** A purpose or directory name. Omitted means every archived file. */
    purpose?: string;
    label?: string;
}) => {
    const dataProvider = useDataProvider<DrmDataProvider>();
    const notify = useNotify();
    const [busy, setBusy] = useState(false);

    const download = async (event: MouseEvent<HTMLButtonElement>) => {
        // The group row would otherwise fold on the same click.
        event.stopPropagation();
        setBusy(true);
        try {
            const { url } = await dataProvider.runOutputsBundle(runId, purpose);
            window.open(url, '_blank', 'noopener');
        } catch (error) {
            notify(error instanceof Error ? error.message : 'The download was refused', {
                type: 'warning',
            });
        } finally {
            setBusy(false);
        }
    };

    return (
        <Button label={label} onClick={download} disabled={busy}>
            <FolderZipIcon />
        </Button>
    );
};

export default BundleButton;
