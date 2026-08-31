/* eslint react/jsx-key: off */
import { useState, useRef, useEffect } from 'react';
import {
    Admin,
    CustomRoutes,
    Resource,
    AuthProvider,
    defaultLightTheme,
    defaultDarkTheme,
    fetchUtils,
} from 'react-admin';
import { Route } from 'react-router-dom';
import { deepmerge } from '@mui/utils';
import simpleRestProvider, { DrmDataProvider } from './dataProvider/index';
import Keycloak, { KeycloakTokenParsed, KeycloakInitOptions } from 'keycloak-js';
import { keycloakAuthProvider, httpClient } from './authProvider';
import MyLayout from './Layout';
import Dashboard from './Dashboard';

import sites from './sites';
import campaigns from './campaigns';
import transects from './transects';
import passes from './passes';
import videos from './videos';
import runs from './runs';
import changes from './changes';
import devices from './devices';
import cameras from './cameras';
import presets from './presets';
import archive from './archive';
import PerformancePage from './performance/PerformancePage';

// MUI names Roboto by default, which nothing here ships or fetches.
const SYSTEM_FONTS = [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Helvetica',
    'Arial',
    'sans-serif',
].join(', ');

// `responseMode: 'query'` and a fragment-free `redirectUri` keep the authorisation
// code out of the URL fragment, which react-admin's router owns. Returning it in the
// fragment loses it to the router and Keycloak redirects forever.
const initOptions: KeycloakInitOptions = {
    onLoad: 'login-required',
    checkLoginIframe: false,
    pkceMethod: 'S256',
    responseMode: 'query',
    redirectUri: `${window.location.origin}/`,
    enableLogging: true,
};

const getPermissions = (decoded: KeycloakTokenParsed) => {
    const roles = decoded?.realm_access?.roles;
    if (!roles) {
        return false;
    }
    if (roles.includes('deepreefmap-admin')) return 'admin';
    if (roles.includes('deepreefmap-member')) return 'user';
    return false;
};

const apiKeycloakConfigUrl = '/api/config/keycloak';
export const apiUrl = '/api';

const App = () => {
    const [keycloak, setKeycloak] = useState<Keycloak>();
    const [loading, setLoading] = useState(true);
    const authProvider = useRef<AuthProvider | undefined>(undefined);
    const dataProvider = useRef<DrmDataProvider | undefined>(undefined);
    const [deployment, setDeployment] = useState<string | undefined>();
    const [startupError, setStartupError] = useState<string | undefined>();
    // StrictMode runs effects twice in development, and a second `Keycloak.init` on a
    // second client redirects into a loop.
    const started = useRef(false);

    useEffect(() => {
        if (started.current) return;
        started.current = true;

        async function fetchData() {
            try {
                const { json: keycloakConfig } =
                    await fetchUtils.fetchJson(apiKeycloakConfigUrl);
                setDeployment(keycloakConfig.deployment);

                // The API resolves the browser-facing Keycloak URL itself, since in a
                // container network the address it validates against is not one the
                // browser can reach.
                const keycloakClient = new Keycloak({
                    url: keycloakConfig.url,
                    realm: keycloakConfig.realm,
                    clientId: keycloakConfig.clientId,
                });
                await keycloakClient.init(initOptions);

                authProvider.current = keycloakAuthProvider(keycloakClient, {
                    onPermissions: getPermissions,
                });

                dataProvider.current = simpleRestProvider(apiUrl, httpClient(keycloakClient));

                setKeycloak(keycloakClient);
                setLoading(false);
            } catch (error) {
                // Rendering Admin without its providers reports the failure as
                // "Unknown dataProvider function", which says nothing about the cause.
                console.error('Startup failed:', error);
                setStartupError(
                    error instanceof Error
                        ? error.message
                        : `could not reach ${apiKeycloakConfigUrl} or initialise Keycloak`,
                );
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    // Merged, not spread: a shallow spread would replace the default themes'
    // typography object rather than add a font family to it.
    const branding = {
        sidebar: { width: 170 },
        typography: { fontFamily: SYSTEM_FONTS },
    };
    const lightTheme = deepmerge(defaultLightTheme, branding);
    const darkTheme = deepmerge(defaultDarkTheme, branding);

    if (loading) return <p>Loading...</p>;
    if (startupError || !keycloak) {
        return (
            <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
                <h1>Cannot start</h1>
                <p>{startupError ?? 'Keycloak did not initialise.'}</p>
                <p>Check that the API is reachable and Keycloak is configured.</p>
            </div>
        );
    }
    return (
        <Admin
            authProvider={authProvider.current}
            dataProvider={dataProvider.current}
            title="DeepReefMap"
            dashboard={Dashboard}
            layout={props => <MyLayout {...props} deployment={deployment} />}
            theme={lightTheme}
            darkTheme={darkTheme}
        >
            {permissions => {
                if (permissions !== 'admin' && permissions !== 'user') return null;
                return (
                    <>
                        <Resource name="sites" {...sites} />
                        <Resource name="campaigns" {...campaigns} />
                        <Resource name="transects" {...transects} />
                        <Resource name="passes" {...passes} />
                        <Resource name="videos" {...videos} />
                        <Resource name="runs" {...runs} />
                        {/* Members reach the connect page; revoking another's device is
                            admin-only. */}
                        <Resource name="devices" {...devices} />
                        <Resource name="presets" {...presets} />
                        <Resource name="camera_profiles" {...cameras} />
                        {/* No list view of its own: calibrations are read through the
                            camera profile that owns them. */}
                        <Resource name="camera_calibrations" />
                        <Resource name="stored_objects" {...archive} />
                        <Resource name="changes" {...changes} />
                        {/* No list view, so no menu entry: registered only for the
                            passes views to resolve their video references. */}
                        <Resource name="pass_videos" />
                        {/* Likewise, registered only for the run show page's
                            archived outputs panel. */}
                        <Resource name="run_artifacts" />
                        {/* Not a resource: one aggregate the registry computes. */}
                        <CustomRoutes>
                            <Route path="/performance" element={<PerformancePage />} />
                        </CustomRoutes>
                    </>
                );
            }}
        </Admin>
    );
};
export default App;
