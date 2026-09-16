import { useGetList, useGetOne } from 'react-admin';

import type { RunArtifact, StoredObject } from '../contract';

export type ArtifactState =
    | { name: 'pending' }
    | { name: 'absent'; reason: string }
    | { name: 'error'; message: string }
    | { name: 'ready'; objectId: string };

/** How many rows a path filter can match, since the registry filters on contains. */
const CANDIDATES = 20;

/** The archived object holding one of a run's output files, or why it is not there. */
export const useRunArtifactObject = (
    runId: string | undefined,
    relpath: string,
): ArtifactState => {
    // Asked for by path rather than read out of the run's listing, which runs to
    // thousands of rows on a full-length pass.
    const {
        data: candidates,
        isPending,
        error,
    } = useGetList<RunArtifact>(
        'run_artifacts',
        {
            filter: { run_id: runId, relpath },
            pagination: { page: 1, perPage: CANDIDATES },
            sort: { field: 'relpath', order: 'ASC' },
        },
        { enabled: !!runId },
    );
    const artifact = candidates?.find(candidate => candidate.relpath === relpath);
    const { data: object } = useGetOne<StoredObject>(
        'stored_objects',
        { id: artifact?.stored_object_id ?? '' },
        { enabled: !!artifact?.stored_object_id },
    );

    if (!runId || isPending) return { name: 'pending' };
    if (error) return { name: 'error', message: 'The run outputs could not be listed.' };
    if (!artifact?.stored_object_id) {
        return { name: 'absent', reason: `${relpath} is not archived.` };
    }
    if (!object) return { name: 'pending' };
    if (object.status === 'failed') {
        return { name: 'error', message: `The ${relpath} upload failed.` };
    }
    if (object.status !== 'complete') {
        return { name: 'absent', reason: `${relpath} is still uploading.` };
    }
    return { name: 'ready', objectId: object.id };
};
