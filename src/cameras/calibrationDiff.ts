/** Whether two calibrations of one rig describe the same optics.
 *
 * The registry guarantees only `name`, `distorted.params`, `image_size` and `K`,
 * so a field missing on either side is skipped rather than called a change.
 */

const FOCAL_TOLERANCE = 0.01;
const CENTRE_TOLERANCE = 0.01;
const DISTORTION_TOLERANCE = 0.002;
const DISTORTION_RELATIVE = 0.1;

type Doc = Record<string, unknown>;

const asObject = (value: unknown): Doc | undefined =>
    typeof value === 'object' && value !== null && !Array.isArray(value)
        ? (value as Doc)
        : undefined;

const asNumber = (value: unknown): number | undefined =>
    typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const pinhole = (doc: unknown) => asObject(asObject(doc)?.rectified_pinhole);

const imageSize = (doc: unknown): [number, number] | undefined => {
    const size = pinhole(doc)?.image_size;
    if (!Array.isArray(size) || size.length < 2) {
        return undefined;
    }
    const [width, height] = [asNumber(size[0]), asNumber(size[1])];
    return width !== undefined && height !== undefined ? [width, height] : undefined;
};

const matrix = (doc: unknown, row: number, column: number): number | undefined => {
    const k = pinhole(doc)?.K;
    if (!Array.isArray(k) || !Array.isArray(k[row])) {
        return undefined;
    }
    return asNumber((k[row] as unknown[])[column]);
};

const param = (doc: unknown, name: string): number | undefined =>
    asNumber(asObject(asObject(asObject(doc)?.distorted)?.params)?.[name]);

const model = (doc: unknown): string | undefined => {
    const value = asObject(asObject(doc)?.distorted)?.model;
    return typeof value === 'string' ? value : undefined;
};

const round = (value: number) => Math.round(value * 100) / 100;

const movedBy = (before: number, after: number, tolerance: number) =>
    Math.abs(after - before) > Math.abs(before || after) * tolerance;

/** One line per material difference. Empty means the optics are unchanged. */
export const describeOpticsChange = (previous: unknown, next: unknown): string[] => {
    const changes: string[] = [];

    const before = imageSize(previous);
    const after = imageSize(next);
    if (before && after && (before[0] !== after[0] || before[1] !== after[1])) {
        changes.push(`Image size ${before[0]} x ${before[1]} to ${after[0]} x ${after[1]}`);
    }

    const wasModel = model(previous);
    const isModel = model(next);
    if (wasModel && isModel && wasModel !== isModel) {
        changes.push(`Camera model ${wasModel} to ${isModel}`);
    }

    const focalBefore = matrix(previous, 0, 0) ?? param(previous, 'fx');
    const focalAfter = matrix(next, 0, 0) ?? param(next, 'fx');
    if (
        focalBefore !== undefined &&
        focalAfter !== undefined &&
        movedBy(focalBefore, focalAfter, FOCAL_TOLERANCE)
    ) {
        changes.push(`Focal length ${round(focalBefore)} px to ${round(focalAfter)} px`);
    }

    // Against the frame rather than against itself: a principal point near zero
    // would otherwise report every measurement as a move.
    const width = (after ?? before)?.[0];
    const cxBefore = matrix(previous, 0, 2) ?? param(previous, 'cx');
    const cxAfter = matrix(next, 0, 2) ?? param(next, 'cx');
    const cyBefore = matrix(previous, 1, 2) ?? param(previous, 'cy');
    const cyAfter = matrix(next, 1, 2) ?? param(next, 'cy');
    if (
        width !== undefined &&
        cxBefore !== undefined &&
        cxAfter !== undefined &&
        cyBefore !== undefined &&
        cyAfter !== undefined &&
        (Math.abs(cxAfter - cxBefore) > width * CENTRE_TOLERANCE ||
            Math.abs(cyAfter - cyBefore) > width * CENTRE_TOLERANCE)
    ) {
        changes.push(
            `Principal point ${round(cxBefore)}, ${round(cyBefore)} to ` +
                `${round(cxAfter)}, ${round(cyAfter)}`,
        );
    }

    // Both floors: these sit near zero, so relative alone calls a re-measurement
    // of one lens a different lens.
    for (const name of ['k1', 'k2']) {
        const was = param(previous, name);
        const is = param(next, name);
        if (was === undefined || is === undefined) {
            continue;
        }
        if (
            Math.abs(is - was) > DISTORTION_TOLERANCE &&
            movedBy(was, is, DISTORTION_RELATIVE)
        ) {
            changes.push(`Distortion ${name} ${round(was)} to ${round(is)}`);
        }
    }

    return changes;
};
