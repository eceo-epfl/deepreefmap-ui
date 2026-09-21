import { useEffect, useState } from 'react';
import { useDataProvider } from 'react-admin';

import type { RunRecord } from '../contract';
import type { DrmDataProvider } from '../dataProvider';

/** Every run that consumed one clip, newest first, straight from the registry. */
export const useVideoRuns = (videoId: string | undefined) => {
    const dataProvider = useDataProvider<DrmDataProvider>();
    const [runs, setRuns] = useState<RunRecord[]>();
    const [error, setError] = useState<string>();
    const [pending, setPending] = useState(false);

    useEffect(() => {
        if (!videoId) {
            setRuns(undefined);
            return;
        }
        let current = true;
        setPending(true);
        setError(undefined);
        dataProvider
            .videoRuns(videoId)
            .then(result => {
                if (current) setRuns(result);
            })
            .catch((e: unknown) => {
                if (current) setError(e instanceof Error ? e.message : 'Could not read runs');
            })
            .finally(() => {
                if (current) setPending(false);
            });
        return () => {
            current = false;
        };
    }, [dataProvider, videoId]);

    return { runs, error, pending };
};
