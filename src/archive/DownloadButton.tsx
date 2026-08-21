import { MouseEvent } from 'react';
import { Button, useDataProvider, useNotify } from 'react-admin';
import DownloadIcon from '@mui/icons-material/Download';

import type { DrmDataProvider } from '../dataProvider';

/** Mints a short-lived signed fetch link on click, so the link can never be stale. */
const DownloadButton = ({ objectId }: { objectId: string }) => {
    const dataProvider = useDataProvider<DrmDataProvider>();
    const notify = useNotify();
    const download = async (event: MouseEvent<HTMLButtonElement>) => {
        // The datagrid row would otherwise navigate away on the same click.
        event.stopPropagation();
        try {
            const { url } = await dataProvider.archiveDownload(objectId);
            window.open(url, '_blank', 'noopener');
        } catch (error) {
            notify(error instanceof Error ? error.message : 'The download URL was refused', {
                type: 'warning',
            });
        }
    };
    return (
        <Button label="Download" onClick={download}>
            <DownloadIcon />
        </Button>
    );
};

export default DownloadButton;
