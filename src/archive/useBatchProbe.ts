import { useQuery } from '@tanstack/react-query';
import { useDataProvider } from 'react-admin';

import type { BatchProbeState, RunArchiveState } from '../contract';
import type { DrmDataProvider } from '../dataProvider';

// The registry caps a probe body, so a larger page goes over in slices.
const HASH_CHUNK = 500;
const RUN_CHUNK = 200;

const chunked = (keys: string[], size: number): string[][] => {
    const slices: string[][] = [];
    for (let start = 0; start < keys.length; start += size) {
        slices.push(keys.slice(start, start + size));
    }
    return slices;
};

const useBatchProbe = <State>(
    scope: string,
    keys: (string | null | undefined)[],
    chunk: number,
    fetchStates: (keys: string[]) => Promise<{ [key: string]: State }>,
) => {
    // Rows hand in a fresh array every render. Sorted and deduplicated it is one query
    // key, which is what turns a whole column into a single POST, and what lets the
    // Refresh button re-probe rather than read a cache that never expires.
    const wanted = Array.from(
        new Set(keys.filter((key): key is string => Boolean(key))),
    ).sort();

    const { data, error } = useQuery({
        queryKey: ['archiveProbe', scope, wanted],
        queryFn: async () => {
            const results = await Promise.all(chunked(wanted, chunk).map(fetchStates));
            // Absent from the response means nothing archived, and saying so keeps a
            // row from reading as still checking.
            const states = new Map<string, State | null>(wanted.map(key => [key, null]));
            for (const result of results) {
                for (const [key, state] of Object.entries(result)) states.set(key, state);
            }
            return states;
        },
        enabled: wanted.length > 0,
        staleTime: Infinity,
        retry: false,
    });

    return {
        states: data ?? new Map<string, State | null>(),
        error: error ? error.message || 'Could not probe the archive' : undefined,
    };
};

/** Archive state per content hash for a whole page, from one POST. */
export const useArchiveProbeBatch = (hashes: (string | null | undefined)[]) => {
    const dataProvider = useDataProvider<DrmDataProvider>();
    return useBatchProbe<BatchProbeState>('hashes', hashes, HASH_CHUNK, keys =>
        dataProvider.archiveProbe(keys).then(response => response.states),
    );
};

/** Archived-output counts per run for a whole page, from one POST. */
export const useRunsProbeBatch = (runIds: (string | null | undefined)[]) => {
    const dataProvider = useDataProvider<DrmDataProvider>();
    return useBatchProbe<RunArchiveState>('runs', runIds, RUN_CHUNK, keys =>
        dataProvider.archiveRunsProbe(keys).then(response => response.states),
    );
};
