import { createHash } from 'node:crypto';
import { expect, test } from '@playwright/test';

import { uploadVideo } from '../src/archive/upload';
import type { DrmDataProvider } from '../src/dataProvider';

const md5 = (bytes: Uint8Array) => createHash('md5').update(bytes).digest('hex');

test('resume checks receipts and repairs a corrupt stored part', async () => {
    const content = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]);
    const sent: number[] = [];
    const provider = {
        archiveInitiate: async () => ({
            status: 'pending',
            object_id: 'object',
            part_size_bytes: 4,
            parts_done: [1, 2],
            uploaded_parts: [
                { part_number: 1, size_bytes: 4, etag: md5(content.slice(0, 4)) },
                { part_number: 2, size_bytes: 4, etag: 'damaged' },
            ],
        }),
        archiveUploadPart: async (
            _id: string,
            number: number,
            blob: Blob,
            checksum: string,
        ) => {
            sent.push(number);
            const bytes = new Uint8Array(await blob.arrayBuffer());
            expect(checksum).toBe(createHash('md5').update(bytes).digest('base64'));
            return { part_number: number, etag: md5(bytes) };
        },
        archiveComplete: async () => ({ status: 'complete' }),
    } as unknown as DrmDataProvider;
    await uploadVideo(provider, new File([content], 'clip.mp4'), 'hash', () => {});
    expect(sent).toEqual([2]);
});

test('legacy part numbers never bypass verification', async () => {
    let sent = false;
    const bytes = Uint8Array.from([1, 2, 3]);
    const provider = {
        archiveInitiate: async () => ({
            status: 'pending',
            object_id: 'object',
            part_size_bytes: 4,
            parts_done: [1],
        }),
        archiveUploadPart: async () => {
            sent = true;
            return { part_number: 1, etag: md5(bytes) };
        },
        archiveComplete: async () => ({ status: 'complete' }),
    } as unknown as DrmDataProvider;
    await uploadVideo(provider, new File([bytes], 'clip.mp4'), 'hash', () => {});
    expect(sent).toBe(true);
});

test('a bad upload receipt prevents completion', async () => {
    let completed = false;
    const provider = {
        archiveInitiate: async () => ({
            status: 'pending',
            object_id: 'object',
            part_size_bytes: 4,
        }),
        archiveUploadPart: async () => ({ part_number: 1, etag: 'wrong' }),
        archiveComplete: async () => {
            completed = true;
        },
    } as unknown as DrmDataProvider;
    await expect(
        uploadVideo(provider, new File(['reef'], 'clip.mp4'), 'hash', () => {}),
    ).rejects.toThrow('checksum');
    expect(completed).toBe(false);
});
