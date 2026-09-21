import SparkMD5 from 'spark-md5';

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
    const stored = new Map(
        (initiated.uploaded_parts ?? []).map(part => [part.part_number, part]),
    );
    const total = Math.ceil(file.size / partSize);
    const parts: CompletedPart[] = [];
    let sent = 0;
    onParts(sent, total);

    for (let partNumber = 1; partNumber <= total; partNumber += 1) {
        const begin = (partNumber - 1) * partSize;
        const slice = file.slice(begin, Math.min(begin + partSize, file.size));
        const digest = SparkMD5.ArrayBuffer.hash(await slice.arrayBuffer());
        const existing = stored.get(partNumber);
        if (
            existing?.size_bytes === slice.size &&
            existing.etag.replaceAll('"', '').toLowerCase() === digest
        ) {
            sent += 1;
            onParts(sent, total);
            continue;
        }
        const contentMd5 = btoa(
            String.fromCharCode(...digest.match(/../g)!.map(byte => parseInt(byte, 16))),
        );
        const receipt = await dataProvider.archiveUploadPart(
            initiated.object_id,
            partNumber,
            slice,
            contentMd5,
        );
        if (receipt.etag.replaceAll('"', '').toLowerCase() !== digest) {
            throw new Error(
                'The stored part checksum differs from the bytes sent. Retry the upload.',
            );
        }
        parts.push({ part_number: receipt.part_number, etag: receipt.etag });
        sent += 1;
        onParts(sent, total);
    }

    await dataProvider.archiveComplete(initiated.object_id, parts);
    return { objectId: initiated.object_id, deduplicated: false };
};
