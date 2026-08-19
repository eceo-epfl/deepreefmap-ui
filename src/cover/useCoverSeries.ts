import { useEffect, useState } from 'react';
import { useDataProvider } from 'react-admin';

import type { CoverSeries } from '../contract';
import type { DrmDataProvider } from '../dataProvider';

/** Every survey event's pooled figure for one transect, in one call. */
export const useCoverSeries = (transectId: string | undefined, level: string) => {
    const dataProvider = useDataProvider<DrmDataProvider>();
    const [series, setSeries] = useState<CoverSeries>();
    const [error, setError] = useState<string>();
    const [pending, setPending] = useState(false);

    useEffect(() => {
        if (!transectId) {
            setSeries(undefined);
            return;
        }
        let current = true;
        setPending(true);
        setError(undefined);
        dataProvider
            .transectCoverSeries(transectId, level)
            .then(result => {
                if (current) setSeries(result);
            })
            .catch((e: unknown) => {
                if (current)
                    setError(e instanceof Error ? e.message : 'Could not read the series');
            })
            .finally(() => {
                if (current) setPending(false);
            });
        return () => {
            current = false;
        };
    }, [dataProvider, transectId, level]);

    return { series, error, pending };
};
