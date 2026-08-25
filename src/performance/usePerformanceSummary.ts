import { useQuery } from '@tanstack/react-query';
import { useDataProvider } from 'react-admin';

import type { PerformanceGroup } from '../contract';
import type { DrmDataProvider } from '../dataProvider';

/**
 * The fleet-wide performance summary.
 *
 * One query key, so the Performance page, the preset panel and the device panel share
 * a single fetch of a summary that changes only as runs finish, and react-admin's
 * Refresh invalidates it like any other query.
 *
 * `groups` is `undefined` while loading or after a failure, and `error` says which.
 */
export const usePerformanceSummary = (): {
    groups: PerformanceGroup[] | undefined;
    error: string | undefined;
} => {
    const dataProvider = useDataProvider<DrmDataProvider>();
    const { data, error } = useQuery({
        queryKey: ['performance', 'summary'],
        queryFn: () => dataProvider.performanceSummary(),
        staleTime: Infinity,
        // A registry that predates the endpoint refuses every attempt alike.
        retry: false,
    });
    return {
        groups: data?.groups,
        error: error ? error.message || 'Could not read the performance summary' : undefined,
    };
};
