/* eslint react/jsx-key: off */
import React, { useState, useRef, useEffect } from 'react';
import {
    Admin,
    Resource,
    CustomRoutes,
    AuthProvider,
    DataProvider,
    AppBar,
    TitlePortal,
} from 'react-admin';
import { Route } from 'react-router-dom';
import simpleRestProvider from 'ra-data-simple-rest';
import Keycloak, {
    KeycloakConfig,
    KeycloakTokenParsed,
    KeycloakInitOptions,
} from 'keycloak-js';
import { httpClient } from 'ra-keycloak';
import { keycloakAuthProvider } from './authProvider';
import i18nProvider from './i18nProvider';
import Layout from './Layout';
import users from './users';
import sensors from './sensors';
import areas from "./areas";
import axios from 'axios';
import addUploadCapabilities from './addUploadFeature'
import SensorDataShow from './sensors/SensorDataShow';
const initOptions: KeycloakInitOptions = { onLoad: 'login-required' };

const getPermissions = (decoded: KeycloakTokenParsed) => {
    const roles = decoded?.realm_access?.roles;
    if (!roles) {
        return false;
    }
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('user')) return 'user';
    return false;
};


const apiUrl = '/api/config/keycloak';

const App = () => {
    const [keycloak, setKeycloak] = useState();
    const [loading, setLoading] = useState(true);
    const authProvider = useRef<AuthProvider>();
    const dataProvider = useRef<DataProvider>();

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(apiUrl);
                const keycloakConfig = response.data;

                // Initialize Keycloak here, once you have the configuration
                const keycloakClient = new Keycloak(keycloakConfig);
                await keycloakClient.init(initOptions);
                authProvider.current = keycloakAuthProvider(keycloakClient, {
                    onPermissions: getPermissions,
                });
                dataProvider.current = addUploadCapabilities(
                    simpleRestProvider(
                        '/api',
                        httpClient(keycloakClient)
                    )
                );
                setKeycloak(keycloakClient);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        }

        fetchData();
    }, []);


    // hide the admin until the dataProvider and authProvider are ready
    if (!keycloak & loading) return <p>Loading...</p>;

    return (
        <Admin
            authProvider={authProvider.current}
            dataProvider={dataProvider.current}
            i18nProvider={i18nProvider}
            title="SOIL Sensor Map"
            layout={Layout}
        >
            {permissions => (
                <>
                    <Resource name="areas" {...areas} />
                    <Resource name="sensors" {...sensors.sensor} />
                    <Resource name="sensordata" {...sensors.sensordata} />
                    {permissions ? (
                        <>
                            {permissions === 'admin' ? (
                                <Resource name="users" {...users} />
                            ) : null}
                        </>
                    ) : null}
                </>
            )}
        </Admin>
    );
};
export default App;
