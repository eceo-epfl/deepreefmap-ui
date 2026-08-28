import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
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

/** One group's files, a page per request, fetched only once the group is open. */
export const useRunOutputFiles = (
    runId: string | undefined,
    purpose: string,
    total: number,
    enabled: boolean,
) => {
    const dataProvider = useDataProvider<DrmDataProvider>();
    return useInfiniteQuery({
        queryKey: ['run_outputs', runId, 'files', purpose],
        enabled: enabled && !!runId,
        initialPageParam: 0,
        queryFn: ({ pageParam }) =>
            dataProvider.runOutputFiles(runId as string, purpose, pageParam, FILE_PAGE),
        // The group row already carries the count, so the last page is known without
        // asking for an empty one.
        getNextPageParam: (last, pages) => {
            const listed = pages.reduce((sum, page) => sum + page.files.length, 0);
            return last.files.length === 0 || listed >= total ? undefined : listed;
        },
    });
};
