/* eslint react/jsx-key: off */
import React, { useState, useRef, useEffect } from 'react';
import {
    Admin,
    Resource,
    AuthProvider,
    DataProvider,
    defaultLightTheme,
    defaultDarkTheme,
} from 'react-admin';
import { Route } from 'react-router-dom';
import simpleRestProvider from './dataProvider/index'
import Keycloak, {
    KeycloakConfig,
    KeycloakTokenParsed,
    KeycloakInitOptions,
} from 'keycloak-js';
import { httpClient } from 'ra-keycloak';
import { keycloakAuthProvider } from './authProvider';
import MyLayout from './Layout';
import axios from 'axios';
import SubmissionJobLogsShow from './submissions/SubmissionJobLogsShow';
import Dashboard from './Dashboard';

import users from './users';
import submissions from './submissions';
import objects from './objects';
import status from './status';
import transects from './transects';
import { deepmerge } from '@mui/utils';

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

const apiKeycloakConfigUrl = '/api/config';
export const apiUrl = '/api';

const App = () => {
    const [keycloak, setKeycloak] = useState();
    const [loading, setLoading] = useState(true);
    const authProvider = useRef<AuthProvider>();
    const dataProvider = useRef<DataProvider>();
    const [deployment, setDeployment] = useState(undefined);


    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(apiKeycloakConfigUrl);
                const keycloakConfig = response.data;
                setDeployment(keycloakConfig.deployment);


                // Initialize Keycloak here, once you have the configuration
                const keycloakClient = new Keycloak(keycloakConfig);
                await keycloakClient.init(initOptions);

                authProvider.current = keycloakAuthProvider(keycloakClient, {
                    onPermissions: getPermissions,
                });

                dataProvider.current = simpleRestProvider(
                    apiUrl,
                    httpClient(keycloakClient)
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


    const lightTheme = deepmerge(
        defaultLightTheme, {
        sidebar: {
            width: 170,
        },
    });
    const darkTheme = deepmerge(
        defaultDarkTheme, {
        sidebar: {
            width: 170,
        },
    });

    if (!keycloak & loading) return <p>Loading...</p>;
    return (
        <Admin
            authProvider={authProvider.current}
            dataProvider={dataProvider.current}
            title="DeepReefMap"
            dashboard={Dashboard}
            layout={(props) => <MyLayout {...props} deployment={deployment} />}
            theme={lightTheme}
            darkTheme={darkTheme}
        >
            {permissions => (
                <>
                    { // only show the resources if the user has been approved; ie. is either 'user' or 'admin' role
                        (permissions === 'admin' || permissions === 'user') ? (
                            <>
                                <Resource name="transects" {...transects} />
                                <Resource name="objects"
                                    edit={objects.edit}
                                    list={permissions === 'admin' ? objects.list : undefined}
                                    show={objects.show}
                                    icon={objects.icon}
                                    options={objects.options}
                                />
                                <Resource name="submissions" {...submissions} />
                                <Resource name="submission_job_logs" show={SubmissionJobLogsShow} />

                            </>
                        ) : null}
                    {permissions ? (
                        <>
                            {permissions === 'admin' ? (
                                <>
                                    <Resource name="users" {...users} />
                                    <Resource name="status" {...status} /></>
                            ) : null}
                        </>
                    ) : null}
                </>
            )}
        </Admin >
    );
};
export default App;
