import { useEffect, useState } from 'react';
import { useDataProvider } from 'react-admin';

import type { PooledCover } from '../contract';
import type { DrmDataProvider } from '../dataProvider';

export const formatPercent = (fraction: number, digits = 1) =>
    `${(fraction * 100).toFixed(digits)}%`;

export const formatCount = (count: number) => Math.round(count).toLocaleString();

/** The registry's pooled figure for one transect, optionally for one campaign. */
export const usePooledCover = (
    transectId: string | undefined,
    level: string,
    campaignId?: string,
) => {
    const dataProvider = useDataProvider<DrmDataProvider>();
    const [cover, setCover] = useState<PooledCover>();
    const [error, setError] = useState<string>();
    const [pending, setPending] = useState(false);

    useEffect(() => {
        if (!transectId) {
            setCover(undefined);
            return;
        }
        let current = true;
        setPending(true);
        setError(undefined);
        dataProvider
            .transectCover(transectId, level, campaignId)
            .then(result => {
                if (current) setCover(result);
            })
            .catch((e: unknown) => {
                if (current) setError(e instanceof Error ? e.message : 'Could not read cover');
            })
            .finally(() => {
                if (current) setPending(false);
            });
        return () => {
            current = false;
        };
    }, [dataProvider, transectId, level, campaignId]);

    return { cover, error, pending };
};
