// Reader for the pipeline's 'drmw' web cloud export. The layout is authored by
// deepreefmap/io/web_cloud.py: 8-byte magic, uint32 header length, JSON header,
// then 4-byte-aligned buffers whose offsets are relative to the end of the header.

export type DrmwClass = {
    id: number;
    name: string;
    colour: [number, number, number];
};

export type DrmwPerClass = {
    class_id: number;
    point_offset: number;
    point_count: number;
    prefix_end: number[];
};

export type DrmwBuffer = {
    name: string;
    dtype: string;
    byte_offset: number;
    byte_length: number;
};

export type DrmwHeader = {
    format: string;
    version: number;
    point_count: number;
    frame_count: number;
    frame_order: number[];
    has_confidence: boolean;
    classes: DrmwClass[];
    per_class: DrmwPerClass[];
    buffers: DrmwBuffer[];
};

export type DrmwCloud = {
    header: DrmwHeader;
    xyz: Float32Array;
    rgb: Uint8Array;
    conf?: Float32Array;
};

const MAGIC = 'DRMWEB01';
const VERSION = 1;

const namedBuffer = (
    header: DrmwHeader,
    raw: ArrayBuffer,
    dataStart: number,
    name: string,
) => {
    const entry = header.buffers.find(candidate => candidate.name === name);
    if (!entry) throw new Error(`The drmw header declares no '${name}' buffer.`);
    if (dataStart + entry.byte_offset + entry.byte_length > raw.byteLength) {
        throw new Error(`The '${name}' buffer runs past the end of the file.`);
    }
    return entry;
};

const float32View = (
    header: DrmwHeader,
    raw: ArrayBuffer,
    dataStart: number,
    name: string,
) => {
    const entry = namedBuffer(header, raw, dataStart, name);
    if (entry.byte_length % 4 !== 0) {
        throw new Error(`The '${name}' buffer length is not a whole number of float32s.`);
    }
    return new Float32Array(raw, dataStart + entry.byte_offset, entry.byte_length / 4);
};

export const parseWebCloud = (raw: ArrayBuffer): DrmwCloud => {
    if (raw.byteLength < MAGIC.length + 4) {
        throw new Error('The file is too short to be a drmw cloud.');
    }
    const magic = new TextDecoder().decode(new Uint8Array(raw, 0, MAGIC.length));
    if (magic !== MAGIC) {
        throw new Error('This file is not a drmw cloud (bad magic).');
    }
    const headerLength = new DataView(raw).getUint32(MAGIC.length, true);
    const dataStart = MAGIC.length + 4 + headerLength;
    if (dataStart > raw.byteLength) {
        throw new Error('The drmw header runs past the end of the file.');
    }
    let header: DrmwHeader;
    try {
        header = JSON.parse(
            new TextDecoder().decode(new Uint8Array(raw, MAGIC.length + 4, headerLength)),
        ) as DrmwHeader;
    } catch {
        throw new Error('The drmw header is not valid JSON.');
    }
    if (header.format !== 'drmw' || header.version !== VERSION) {
        throw new Error(
            `Unsupported drmw header (${header.format} v${header.version}). ` +
                `This console reads drmw v${VERSION}.`,
        );
    }
    const xyz = float32View(header, raw, dataStart, 'xyz');
    if (xyz.length !== header.point_count * 3) {
        throw new Error(
            `The 'xyz' buffer holds ${xyz.length / 3} points, ` +
                `but the header declares ${header.point_count}.`,
        );
    }
    const rgbEntry = namedBuffer(header, raw, dataStart, 'rgb');
    const rgb = new Uint8Array(raw, dataStart + rgbEntry.byte_offset, rgbEntry.byte_length);
    if (rgb.length !== header.point_count * 3) {
        throw new Error(
            `The 'rgb' buffer holds ${rgb.length / 3} points, ` +
                `but the header declares ${header.point_count}.`,
        );
    }
    const conf = header.has_confidence
        ? float32View(header, raw, dataStart, 'conf')
        : undefined;
    return { header, xyz, rgb, conf };
};

const readBody = async (
    response: Response,
    onProgress?: (receivedBytes: number, totalBytes: number | null) => void,
): Promise<ArrayBuffer> => {
    if (!response.body || !onProgress) return response.arrayBuffer();
    const totalBytes = Number(response.headers.get('Content-Length')) || null;
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let receivedBytes = 0;
    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedBytes += value.byteLength;
        onProgress(receivedBytes, totalBytes);
    }
    const merged = new Uint8Array(receivedBytes);
    let offset = 0;
    for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.byteLength;
    }
    return merged.buffer;
};

/** Download and parse a drmw cloud, reporting byte progress along the way. */
export const fetchWebCloud = async (
    url: string,
    onProgress?: (receivedBytes: number, totalBytes: number | null) => void,
): Promise<DrmwCloud> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`The cloud download failed: HTTP ${response.status}.`);
    }
    return parseWebCloud(await readBody(response, onProgress));
};
