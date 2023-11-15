// import fakeRestProvider from 'ra-data-fakerest';
import { DataProvider } from 'react-admin';
import get from 'lodash/get';
import Keycloak from 'keycloak-js';
import addUploadFeature from './addUploadFeature';


const uploadCapableDataProvider = addUploadFeature(
    addTagsSearchSupport(dataProvider)
);

export const keyCloakTokenDataProviderBuilder = (
    dataProvider: DataProvider,
    keycloak: Keycloak
) =>
    new Proxy(dataProvider, {
        get: (target, name) => (resource, params) => {
            if (typeof name === 'symbol' || name === 'then') {
                return;
            }
            console.log(
                `Simulating call to dataprovider.${name}() with keycloak token: ${keycloak.token}`
            );
            return dataProvider[name](resource, params);
        },
    });

interface ResponseError extends Error {
    status?: number;
}

export default delayedDataProvider;
