import { useEffect, useState } from 'react';
import { useDataProvider } from 'react-admin';

import type { ArchiveProbe } from '../contract';
import type { DrmDataProvider } from '../dataProvider';

/**
 * One probe of the archive for a content hash.
 *
 * `probe` is `undefined` while loading or without a hash, `null` when nothing is
 * archived under it, and the object's state otherwise.
 */
export const useArchiveProbe = (contentHash: string | null | undefined) => {
    const dataProvider = useDataProvider<DrmDataProvider>();
    const [probe, setProbe] = useState<ArchiveProbe | null>();
    const [error, setError] = useState<string>();

    useEffect(() => {
        if (!contentHash) {
            setProbe(undefined);
            return;
        }
        let current = true;
        dataProvider
            .archiveByHash(contentHash)
            .then(result => {
                if (current) setProbe(result);
            })
            .catch((e: unknown) => {
                if (current) {
                    setError(e instanceof Error ? e.message : 'Could not probe the archive');
                }
            });
        return () => {
            current = false;
        };
    }, [dataProvider, contentHash]);

    return { probe, error };
};
