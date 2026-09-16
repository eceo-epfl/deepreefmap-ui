// Reader for the single `.npy` member a run's `ortho.npz` holds a label grid in.
// A zip container written by numpy: end-of-central-directory, then per-member
// local headers, deflate-compressed. Only what that file uses is implemented.

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const LOCAL_SIGNATURE = 0x04034b50;
const STORED = 0;
const DEFLATED = 8;

type Member = { name: string; method: number; compressedSize: number; localOffset: number };

export type NpyArray = { data: ArrayBufferView; shape: number[] };

const findEndOfCentralDirectory = (view: DataView): number => {
    // The comment field is almost always empty, so the record sits at the very end.
    const earliest = Math.max(0, view.byteLength - 22 - 0xffff);
    for (let at = view.byteLength - 22; at >= earliest; at -= 1) {
        if (view.getUint32(at, true) === EOCD_SIGNATURE) return at;
    }
    throw new Error('This file is not a zip archive (no end-of-central-directory).');
};

const readCentralDirectory = (raw: ArrayBuffer): Member[] => {
    const view = new DataView(raw);
    const eocd = findEndOfCentralDirectory(view);
    const count = view.getUint16(eocd + 10, true);
    let at = view.getUint32(eocd + 16, true);
    const decoder = new TextDecoder();
    const members: Member[] = [];
    for (let index = 0; index < count; index += 1) {
        if (view.getUint32(at, true) !== CENTRAL_SIGNATURE) {
            throw new Error('The zip central directory is malformed.');
        }
        const nameLength = view.getUint16(at + 28, true);
        const extraLength = view.getUint16(at + 30, true);
        const commentLength = view.getUint16(at + 32, true);
        members.push({
            method: view.getUint16(at + 10, true),
            compressedSize: view.getUint32(at + 20, true),
            name: decoder.decode(new Uint8Array(raw, at + 46, nameLength)),
            localOffset: view.getUint32(at + 42, true),
        });
        at += 46 + nameLength + extraLength + commentLength;
    }
    return members;
};

const inflate = async (bytes: Uint8Array): Promise<ArrayBuffer> => {
    const stream = new Blob([bytes as BlobPart])
        .stream()
        .pipeThrough(new DecompressionStream('deflate-raw'));
    return new Response(stream).arrayBuffer();
};

const memberBytes = async (raw: ArrayBuffer, member: Member): Promise<ArrayBuffer> => {
    const view = new DataView(raw);
    if (view.getUint32(member.localOffset, true) !== LOCAL_SIGNATURE) {
        throw new Error(`The '${member.name}' member has no local header.`);
    }
    const nameLength = view.getUint16(member.localOffset + 26, true);
    const extraLength = view.getUint16(member.localOffset + 28, true);
    const start = member.localOffset + 30 + nameLength + extraLength;
    const slice = new Uint8Array(raw, start, member.compressedSize);
    if (member.method === STORED) return slice.slice().buffer;
    if (member.method === DEFLATED) return inflate(slice);
    throw new Error(`The '${member.name}' member uses compression ${member.method}.`);
};

const VIEWS: Record<string, (buffer: ArrayBuffer) => ArrayBufferView> = {
    '|i1': buffer => new Int8Array(buffer),
    '|u1': buffer => new Uint8Array(buffer),
    '<i2': buffer => new Int16Array(buffer),
    '<u2': buffer => new Uint16Array(buffer),
    '<i4': buffer => new Int32Array(buffer),
    '<u4': buffer => new Uint32Array(buffer),
    '<i8': buffer => new BigInt64Array(buffer),
    '<f4': buffer => new Float32Array(buffer),
    '<f8': buffer => new Float64Array(buffer),
};

const parseNpy = (raw: ArrayBuffer): NpyArray => {
    const view = new DataView(raw);
    const magic = new TextDecoder().decode(new Uint8Array(raw, 1, 5));
    if (view.getUint8(0) !== 0x93 || magic !== 'NUMPY') {
        throw new Error('The member is not a npy array.');
    }
    const major = view.getUint8(6);
    const headerLength =
        major === 1 ? view.getUint16(8, true) : Number(view.getUint32(8, true));
    const start = (major === 1 ? 10 : 12) + headerLength;
    const header = new TextDecoder().decode(
        new Uint8Array(raw, major === 1 ? 10 : 12, headerLength),
    );
    const descr = /'descr'\s*:\s*'([^']+)'/.exec(header)?.[1];
    const shapeText = /'shape'\s*:\s*\(([^)]*)\)/.exec(header)?.[1] ?? '';
    if (!descr) throw new Error('The npy header declares no dtype.');
    if (/'fortran_order'\s*:\s*True/.test(header)) {
        throw new Error('Column-major npy arrays are not read here.');
    }
    const make = VIEWS[descr];
    if (!make) throw new Error(`The npy dtype ${descr} is not read here.`);
    const shape = shapeText
        .split(',')
        .map(part => part.trim())
        .filter(Boolean)
        .map(Number);
    // The data section is aligned by the writer, so a view over it is safe.
    return { data: make(raw.slice(start)), shape };
};

/** Read one named `.npy` member out of a `.npz` archive. */
export const readNpzMember = async (raw: ArrayBuffer, name: string): Promise<NpyArray> => {
    const member = readCentralDirectory(raw).find(
        candidate => candidate.name === name || candidate.name === `${name}.npy`,
    );
    if (!member) throw new Error(`The archive holds no '${name}' array.`);
    return parseNpy(await memberBytes(raw, member));
};
