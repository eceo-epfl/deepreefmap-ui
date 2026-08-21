import { useEffect, useMemo, useState } from 'react';
import { useDataProvider } from 'react-admin';

import type { BatchProbeState, RunArchiveState } from '../contract';
import type { DrmDataProvider } from '../dataProvider';

// The registry caps a probe body, so a larger page goes over in slices.
const HASH_CHUNK = 500;
const RUN_CHUNK = 200;

// Module-level: every row of a datagrid calls the hook with the same page, and the
// shared cache plus the in-flight dedupe is what turns that into exactly one POST.
const hashCache = new Map<string, BatchProbeState | null>();
const runCache = new Map<string, RunArchiveState | null>();
const inFlight = new Map<string, Promise<void>>();

const chunked = (keys: string[], size: number): string[][] => {
    const slices: string[][] = [];
    for (let start = 0; start < keys.length; start += size) {
        slices.push(keys.slice(start, start + size));
    }
    return slices;
};

const useBatchProbe = <State>(
    keys: (string | null | undefined)[],
    cache: Map<string, State | null>,
    chunk: number,
    fetchStates: (keys: string[]) => Promise<{ [key: string]: State }>,
) => {
    const [, setSettled] = useState(0);
    const [error, setError] = useState<string>();

    // Rows hand in a fresh array every render; the sorted joined form is the
    // stable identity, and sorting also makes concurrent callers share one flight.
    const wantedKey = useMemo(
        () =>
            Array.from(new Set(keys.filter((key): key is string => Boolean(key))))
                .sort()
                .join(','),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [keys.map(key => key ?? '').join(',')],
    );

    const dataProvider = useDataProvider<DrmDataProvider>();

    useEffect(() => {
        const missing = wantedKey.split(',').filter(key => key && !cache.has(key));
        if (!missing.length) return;
        const flightKey = missing.join(',');
        let flight = inFlight.get(flightKey);
        if (!flight) {
            flight = Promise.all(chunked(missing, chunk).map(fetchStates))
                .then(results => {
                    for (const states of results) {
                        for (const [key, state] of Object.entries(states)) {
                            cache.set(key, state);
                        }
                    }
                    // Absent from the response means nothing archived, and caching
                    // that verdict stops the page re-asking on every render.
                    for (const key of missing) {
                        if (!cache.has(key)) cache.set(key, null);
                    }
                })
                .finally(() => inFlight.delete(flightKey));
            inFlight.set(flightKey, flight);
        }
        let current = true;
        flight
            .then(() => {
                if (current) setSettled(count => count + 1);
            })
            .catch((e: unknown) => {
                if (current) {
                    setError(e instanceof Error ? e.message : 'Could not probe the archive');
                }
            });
        return () => {
            current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataProvider, wantedKey]);

    const states = new Map<string, State | null>();
    for (const key of wantedKey.split(',')) {
        if (key && cache.has(key)) states.set(key, cache.get(key) ?? null);
    }

    return { states, error };
};

/** Archive state per content hash for a whole page, from one POST. */
export const useArchiveProbeBatch = (hashes: (string | null | undefined)[]) => {
    const dataProvider = useDataProvider<DrmDataProvider>();
    return useBatchProbe(hashes, hashCache, HASH_CHUNK, keys =>
        dataProvider.archiveProbe(keys).then(response => response.states),
    );
};

/** Archived-output counts per run for a whole page, from one POST. */
export const useRunsProbeBatch = (runIds: (string | null | undefined)[]) => {
    const dataProvider = useDataProvider<DrmDataProvider>();
    return useBatchProbe(runIds, runCache, RUN_CHUNK, keys =>
        dataProvider.archiveRunsProbe(keys).then(response => response.states),
    );
};
