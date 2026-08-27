import { useQuery } from '@tanstack/react-query';
import { useDataProvider } from 'react-admin';

import type { DrmDataProvider } from '../dataProvider';

/** Files listed per request of a group, matching the registry's own default. */
export const FILE_PAGE = 200;

/** What a run archived, by group: counts and sizes the registry computes. */
export const useRunOutputs = (runId: string | undefined) => {
    const dataProvider = useDataProvider<DrmDataProvider>();
    return useQuery({
        queryKey: ['run_outputs', runId],
        enabled: !!runId,
        queryFn: () => dataProvider.runOutputs(runId as string),
    });
};

/** One group's files, fetched only once the group is open. */
export const useRunOutputFiles = (
    runId: string | undefined,
    purpose: string,
    limit: number,
    enabled: boolean,
) => {
    const dataProvider = useDataProvider<DrmDataProvider>();
    return useQuery({
        queryKey: ['run_outputs', runId, 'files', purpose, limit],
        enabled: enabled && !!runId,
        queryFn: () => dataProvider.runOutputFiles(runId as string, purpose, 0, limit),
    });
};
