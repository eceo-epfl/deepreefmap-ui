import { AuthProvider, HttpError, fetchUtils } from 'react-admin';
import Keycloak, { KeycloakTokenParsed } from 'keycloak-js';

export type PermissionsFunction = (decoded: KeycloakTokenParsed) => unknown;

export const getKeycloakHeaders = (
    token: string | undefined,
    options: fetchUtils.Options | undefined,
): Headers => {
    const headers = ((options && options.headers) ||
        new Headers({ Accept: 'application/json' })) as Headers;
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
};

// The registry refuses with `{"error": text}`; fetchJson only reads `message`, so the
// thrown HttpError would otherwise carry the status text.
const withRegistryMessage = (error: unknown): never => {
    if (error instanceof HttpError) {
        const body = error.body as { error?: unknown } | null;
        if (typeof body?.error === 'string') {
            throw new HttpError(body.error, error.status, error.body);
        }
    }
    throw error;
};

export const httpClient =
    (keycloak: Keycloak) => (url: string, options?: fetchUtils.Options) =>
        fetchUtils
            .fetchJson(url, {
                ...options,
                headers: getKeycloakHeaders(keycloak.token, options),
            })
            .catch(withRegistryMessage);

// Local rather than from `ra-keycloak`, whose own keycloak-js dependency would be a
// second copy alongside the one the application constructs.
export const keycloakAuthProvider = (
    client: Keycloak,
    options: { onPermissions?: PermissionsFunction } = {},
): AuthProvider => ({
    async login() {
        return client.login({ redirectUri: window.location.origin });
    },

    async logout() {
        return client.logout({ redirectUri: window.location.origin });
    },

    // A 401 means the session went; a 403 means the account lacks the role, which
    // signing in again cannot fix.
    async checkError({ status }: { status?: number }) {
        if (status === 401) {
            await client.updateToken(30).catch(() => client.login());
        }
    },

    async checkAuth() {
        if (!client.authenticated || !client.token) {
            throw new Error('Not signed in');
        }
        // Refreshes when the token has under 30 seconds left, and no-ops otherwise.
        await client.updateToken(30);
    },

    async getPermissions() {
        const claims = client.tokenParsed;
        if (!claims) {
            return false;
        }
        return options.onPermissions ? options.onPermissions(claims) : claims;
    },

    async getIdentity() {
        const claims = client.tokenParsed;
        if (!claims) {
            throw new Error('Not signed in');
        }
        return { id: claims.sub ?? '', fullName: claims.preferred_username };
    },

    getToken() {
        return client.token;
    },
});
