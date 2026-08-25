import { useQuery } from '@tanstack/react-query';
import { useDataProvider, useGetList } from 'react-admin';

import type { RunArtifact, StoredObject } from '../contract';

export const ARTIFACT_PAGE = 1000;
const OBJECT_CHUNK = 200;

/** The first page of a run's artifacts by path, with the total the registry holds. */
export const useRunArtifacts = (runId: string | undefined) =>
    useGetList<RunArtifact>(
        'run_artifacts',
        {
            filter: { run_id: runId },
            pagination: { page: 1, perPage: ARTIFACT_PAGE },
            sort: { field: 'relpath', order: 'ASC' },
        },
        { enabled: !!runId },
    );

/** Stored objects by id, fetched in chunks small enough for one query string each. */
export const useStoredObjects = (ids: string[]) => {
    const dataProvider = useDataProvider();
    const sorted = [...ids].sort();
    return useQuery({
        queryKey: ['stored_objects', 'chunked', sorted],
        enabled: sorted.length > 0,
        queryFn: async () => {
            const chunks: string[][] = [];
            for (let i = 0; i < sorted.length; i += OBJECT_CHUNK) {
                chunks.push(sorted.slice(i, i + OBJECT_CHUNK));
            }
            const pages = await Promise.all(
                chunks.map(chunk =>
                    dataProvider.getMany<StoredObject>('stored_objects', { ids: chunk }),
                ),
            );
            return new Map(
                pages.flatMap(page => page.data).map(object => [object.id, object]),
            );
        },
    });
};
