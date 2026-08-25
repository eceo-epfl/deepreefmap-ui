import type { RunArtifact } from '../contract';

export const RESULTS = 'Results';
export const RECORD = 'Record';
export const WORKING = 'Working data';

const RECORD_FILES = new Set(['run_manifest.json', 'run.log', 'run_command.sh']);

const isResult = (name: string) =>
    name === 'ortho.png' ||
    (name.startsWith('ortho') && name.endsWith('.npz')) ||
    name === 'benthic_cover.json' ||
    name.endsWith('.ply') ||
    name.endsWith('.scene.zarr.zip') ||
    name === 'cloud_web.drmw';

/** The group a run directory path belongs to: a purpose for root files, else its directory. */
export const purposeOf = (relpath: string): string => {
    const slash = relpath.indexOf('/');
    if (slash !== -1) return relpath.slice(0, slash);
    if (isResult(relpath)) return RESULTS;
    if (RECORD_FILES.has(relpath)) return RECORD;
    return WORKING;
};

/** Purpose groups first, then directories by name. */
const rank = (name: string) => [RESULTS, RECORD, WORKING].indexOf(name);

export const compareGroups = (a: string, b: string) => {
    const ra = rank(a);
    const rb = rank(b);
    if (ra !== -1 || rb !== -1) return (ra === -1 ? 3 : ra) - (rb === -1 ? 3 : rb);
    return a.localeCompare(b);
};

export const expandedByDefault = (name: string) => name === RESULTS || name === RECORD;

export type PurposeGroup = { name: string; files: RunArtifact[] };

/** Artifacts bucketed by `purposeOf`, groups ordered and files sorted by path. */
export const groupByPurpose = (artifacts: RunArtifact[]): PurposeGroup[] => {
    const groups = new Map<string, RunArtifact[]>();
    for (const artifact of artifacts) {
        const name = purposeOf(artifact.relpath);
        const files = groups.get(name);
        if (files) files.push(artifact);
        else groups.set(name, [artifact]);
    }
    return [...groups.entries()]
        .sort((a, b) => compareGroups(a[0], b[0]))
        .map(([name, files]) => ({
            name,
            files: [...files].sort((a, b) => a.relpath.localeCompare(b.relpath)),
        }));
};
