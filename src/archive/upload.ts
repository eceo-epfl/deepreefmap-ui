import type { CompletedPart } from '../contract';
import type { DrmDataProvider } from '../dataProvider';

export type UploadOutcome = {
    objectId: string;
    // `complete` answered by dedup: the content was already archived, nothing travelled.
    deduplicated: boolean;
};

/**
 * Send one video file into the archive: initiate, PUT the missing parts through the
 * registry, complete.
 *
 * Resumes an interrupted upload of the same content wherever it stopped: `initiate`
 * reports the parts already stored and only the rest are sent. The server assembles
 * the object from its own part listing, so completion carries only the receipts
 * collected this session, which may be none on a resumed upload.
 */
export const uploadVideo = async (
    dataProvider: DrmDataProvider,
    file: File,
    contentHash: string,
    onParts: (sent: number, total: number) => void,
): Promise<UploadOutcome> => {
    const initiated = await dataProvider.archiveInitiate({
        content_hash: contentHash,
        size_bytes: file.size,
        kind: 'video',
    });
    if (initiated.status === 'complete') {
        return { objectId: initiated.object_id, deduplicated: true };
    }

    const partSize = Number(initiated.part_size_bytes);
    if (!partSize) {
        throw new Error('The server answered pending without a part size.');
    }
    const done = new Set(initiated.parts_done ?? []);
    const total = Math.ceil(file.size / partSize);
    const parts: CompletedPart[] = [];
    let sent = done.size;
    onParts(sent, total);

    for (let partNumber = 1; partNumber <= total; partNumber += 1) {
        if (done.has(partNumber)) continue;
        const begin = (partNumber - 1) * partSize;
        const slice = file.slice(begin, Math.min(begin + partSize, file.size));
        const receipt = await dataProvider.archiveUploadPart(
            initiated.object_id,
            partNumber,
            slice,
        );
        parts.push({ part_number: receipt.part_number, etag: receipt.etag });
        sent += 1;
        onParts(sent, total);
    }

    await dataProvider.archiveComplete(initiated.object_id, parts);
    return { objectId: initiated.object_id, deduplicated: false };
};
