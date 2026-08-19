const PREFIX = 'drm1.';

const fromBase64Url = (encoded: string): string => {
    const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    return atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
};

/** The server address a `drm1.…` code points at, or null if it will not decode. */
export const connectCodeUrl = (code: string): string | null => {
    if (!code.startsWith(PREFIX)) return null;
    try {
        const payload = JSON.parse(fromBase64Url(code.slice(PREFIX.length))) as {
            url?: unknown;
        };
        return typeof payload.url === 'string' ? payload.url : null;
    } catch {
        return null;
    }
};

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '::1', '0.0.0.0'];

/** True for an address only reachable from the machine that minted the code. */
export const isLocalUrl = (url: string): boolean => {
    try {
        return LOCAL_HOSTS.includes(new URL(url).hostname);
    } catch {
        return false;
    }
};
