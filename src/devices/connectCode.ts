import contract from '../contract/sync-contract.json';

// Published by the registry in contract/sync-contract.json. The desktop app reads the
// same field, so the tag lives in one place and a bump lands in one file.
export const CONNECT_CODE_PREFIX = contract.connect_code.prefix;

const fromBase64Url = (encoded: string): string => {
    const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    return atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
};

// The same rules the desktop app's decoder applies (sync/connect_code.py):
// http or https only, and never an embedded username or password.
const acceptableUrl = (value: string): boolean => {
    try {
        const url = new URL(value);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
        return url.username === '' && url.password === '';
    } catch {
        return false;
    }
};

/** The server address a connect code points at, or null if it will not decode. */
export const connectCodeUrl = (code: string): string | null => {
    if (!code.startsWith(CONNECT_CODE_PREFIX)) return null;
    try {
        const payload = JSON.parse(fromBase64Url(code.slice(CONNECT_CODE_PREFIX.length))) as {
            url?: unknown;
        };
        return typeof payload.url === 'string' && acceptableUrl(payload.url)
            ? payload.url
            : null;
    } catch {
        return null;
    }
};

// The desktop app's loopback set. URL.hostname keeps the brackets on IPv6.
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '::1', '[::1]'];

/** True for an address only reachable from the machine that minted the code. */
export const isLocalUrl = (url: string): boolean => {
    try {
        return LOCAL_HOSTS.includes(new URL(url).hostname);
    } catch {
        return false;
    }
};
