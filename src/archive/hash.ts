// imohash, the identity a device gives every clip it ingests. The archive keys
// blobs on it, so the console has to compute the same value for a file picked
// here or an upload could never meet the clip it belongs to.
//
// It reads three 16 KiB samples and the file size rather than the whole file, so
// this is instant even for a 4 GB chapter. It is a dedup identity, not a
// checksum: integrity of the transfer is the store's own, which answers every
// part with the MD5 it computed of what it stored.

const SAMPLE_THRESHOLD = 128 * 1024;
const SAMPLE_SIZE = 16 * 1024;

const C1 = 0x87c37b91114253d5n;
const C2 = 0x4cf5ad432745937fn;
const MASK = 0xffffffffffffffffn;

const mul = (a: bigint, b: bigint) => (a * b) & MASK;
const add = (a: bigint, b: bigint) => (a + b) & MASK;
const rotl = (v: bigint, n: bigint) => ((v << n) | (v >> (64n - n))) & MASK;

const fmix64 = (input: bigint) => {
    let k = input;
    k ^= k >> 33n;
    k = mul(k, 0xff51afd7ed558ccdn);
    k ^= k >> 33n;
    k = mul(k, 0xc4ceb9fe1a85ec53n);
    k ^= k >> 33n;
    return k;
};

const readLE64 = (bytes: Uint8Array, at: number) => {
    let value = 0n;
    for (let i = 7; i >= 0; i -= 1) {
        value = (value << 8n) | BigInt(bytes[at + i] ?? 0);
    }
    return value;
};

/** MurmurHash3 x64 128, as the two 64-bit halves it produces. */
const murmur3x64 = (data: Uint8Array): [bigint, bigint] => {
    let h1 = 0n;
    let h2 = 0n;
    const blocks = Math.floor(data.length / 16);

    for (let i = 0; i < blocks; i += 1) {
        let k1 = readLE64(data, i * 16);
        let k2 = readLE64(data, i * 16 + 8);

        k1 = mul(rotl(mul(k1, C1), 31n), C2);
        h1 ^= k1;
        h1 = add(mul(rotl(h1, 27n), 1n), h2);
        h1 = add(mul(h1, 5n), 0x52dce729n);

        k2 = mul(rotl(mul(k2, C2), 33n), C1);
        h2 ^= k2;
        h2 = add(mul(rotl(h2, 31n), 1n), h1);
        h2 = add(mul(h2, 5n), 0x38495ab5n);
    }

    const tail = data.subarray(blocks * 16);
    let k1 = 0n;
    let k2 = 0n;
    for (let i = tail.length - 1; i >= 8; i -= 1) {
        k2 = (k2 << 8n) | BigInt(tail[i]);
    }
    for (let i = Math.min(tail.length, 8) - 1; i >= 0; i -= 1) {
        k1 = (k1 << 8n) | BigInt(tail[i]);
    }
    if (tail.length > 8) {
        k2 = mul(rotl(mul(k2, C2), 33n), C1);
        h2 ^= k2;
    }
    if (tail.length > 0) {
        k1 = mul(rotl(mul(k1, C1), 31n), C2);
        h1 ^= k1;
    }

    const length = BigInt(data.length);
    h1 ^= length;
    h2 ^= length;
    h1 = add(h1, h2);
    h2 = add(h2, h1);
    h1 = fmix64(h1);
    h2 = fmix64(h2);
    h1 = add(h1, h2);
    h2 = add(h2, h1);
    return [h1, h2];
};

/** Protocol-buffer style unsigned varint, which is how imohash carries the size. */
const varint = (value: number): number[] => {
    const out: number[] = [];
    let rest = BigInt(value);
    while (rest >= 0x80n) {
        out.push(Number((rest & 0x7fn) | 0x80n));
        rest >>= 7n;
    }
    out.push(Number(rest));
    return out;
};

const bigEndianBytes = (value: bigint) => {
    const out = new Uint8Array(8);
    for (let i = 7; i >= 0; i -= 1) {
        out[i] = Number((value >> BigInt((7 - i) * 8)) & 0xffn);
    }
    return out;
};

/** The digest of an already-sampled buffer. Exported so a test can pin it. */
export const imohashOfSample = (sample: Uint8Array, size: number): string => {
    const [h1, h2] = murmur3x64(sample);
    // The two halves big-endian, then the size varint written over the front.
    const digest = new Uint8Array(16);
    digest.set(bigEndianBytes(h1), 0);
    digest.set(bigEndianBytes(h2), 8);
    digest.set(varint(size), 0);
    return Array.from(digest)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
};

/** imohash of a file as 32 lowercase hex characters. */
export const imohashOfFile = async (file: File): Promise<string> => {
    const size = file.size;
    let sample: Uint8Array;
    if (size < SAMPLE_THRESHOLD || size < 4 * SAMPLE_SIZE) {
        sample = new Uint8Array(await file.arrayBuffer());
    } else {
        const middle = Math.floor(size / 2);
        const slices = await Promise.all([
            file.slice(0, SAMPLE_SIZE).arrayBuffer(),
            file.slice(middle, middle + SAMPLE_SIZE).arrayBuffer(),
            file.slice(size - SAMPLE_SIZE, size).arrayBuffer(),
        ]);
        sample = new Uint8Array(SAMPLE_SIZE * 3);
        slices.forEach((slice, index) => {
            sample.set(new Uint8Array(slice), index * SAMPLE_SIZE);
        });
    }
    return imohashOfSample(sample, size);
};
