import type { ArchiveInitiate, CompletedPart } from '../contract';
import type { DrmDataProvider } from '../dataProvider';

// Presigned part URLs lapse, so a long upload re-initiates before they do
// rather than discovering a 403 mid-transfer. The server states the lifetime it
// signed for, and this is the fallback for an older one that does not.
const DEFAULT_TTL_SECONDS = 900;
// Leave room for a part already in flight when the check comes round.
const REFRESH_MARGIN_MS = 3 * 60 * 1000;

export type UploadOutcome = {
    objectId: string;
    // `complete` answered by dedup: the content was already archived, nothing travelled.
    deduplicated: boolean;
};

const refreshAfter = (initiated: ArchiveInitiate) =>
    Math.max(
        (Number(initiated.presign_ttl_seconds) || DEFAULT_TTL_SECONDS) * 1000 -
            REFRESH_MARGIN_MS,
        REFRESH_MARGIN_MS,
    );

const byPartNumber = (initiated: ArchiveInitiate) =>
    [...initiated.part_urls].sort((a, b) => a.part_number - b.part_number);

/**
 * Send one video file into the archive: initiate, PUT the missing parts, complete.
 *
 * Resumes an interrupted upload of the same content wherever it stopped. The server
 * assembles the object from its own part listing, so completion carries only the
 * receipts collected this session, which may be none on a resumed upload.
 */
export const uploadVideo = async (
    dataProvider: DrmDataProvider,
    file: File,
    contentHash: string,
    onParts: (sent: number, total: number) => void,
): Promise<UploadOutcome> => {
    const initiate = () =>
        dataProvider.archiveInitiate({
            content_hash: contentHash,
            size_bytes: file.size,
            kind: 'video',
        });

    let initiated = await initiate();
    if (initiated.status === 'complete') {
        return { objectId: initiated.object_id, deduplicated: true };
    }

    const partSize = Number(initiated.part_size_bytes);
    if (!partSize) {
        throw new Error('The server answered pending without a part size.');
    }
    const total = Math.ceil(file.size / partSize);
    const parts: CompletedPart[] = [];
    let mintedAt = Date.now();
    let ttl = refreshAfter(initiated);
    let queue = byPartNumber(initiated);
    onParts(total - queue.length, total);

    while (queue.length > 0) {
        if (Date.now() - mintedAt > ttl) {
            initiated = await initiate();
            if (initiated.status !== 'pending') {
                // Another client finished the same content while this one was sending.
                return {
                    objectId: initiated.object_id,
                    deduplicated: initiated.status === 'complete',
                };
            }
            mintedAt = Date.now();
            ttl = refreshAfter(initiated);
            queue = byPartNumber(initiated);
        }
        const { part_number, url } = queue[0];
        const begin = (part_number - 1) * partSize;
        const slice = file.slice(begin, Math.min(begin + partSize, file.size));
        const response = await fetch(url, { method: 'PUT', body: slice });
        if (!response.ok) {
            throw new Error(`The store refused part ${part_number}: HTTP ${response.status}`);
        }
        // The receipt is informational: the server lists its own parts to assemble,
        // so a store whose CORS hides ETag still completes.
        const etag = response.headers.get('ETag');
        if (etag) parts.push({ part_number, etag });
        queue.shift();
        onParts(total - queue.length, total);
    }

    await dataProvider.archiveComplete(initiated.object_id, parts);
    return { objectId: initiated.object_id, deduplicated: false };
};
