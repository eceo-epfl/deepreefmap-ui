import { useGetOne } from 'react-admin';

import type { StoredObject } from '../contract';
import { useRunArtifacts } from './useRunArtifacts';

export type ArtifactState =
    | { name: 'pending' }
    | { name: 'absent'; reason: string }
    | { name: 'error'; message: string }
    | { name: 'ready'; objectId: string };

/** The archived object holding one of a run's output files, or why it is not there. */
export const useRunArtifactObject = (
    runId: string | undefined,
    relpath: string,
): ArtifactState => {
    const { data: artifacts, isPending, error } = useRunArtifacts(runId);
    const artifact = artifacts?.find(candidate => candidate.relpath === relpath);
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
