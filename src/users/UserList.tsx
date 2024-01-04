/* eslint react/jsx-key: off */
import PeopleIcon from '@mui/icons-material/People';
import memoize from 'lodash/memoize';
import { useMediaQuery, Theme } from '@mui/material';
import * as React from 'react';
import {
    BulkDeleteWithConfirmButton,
    Datagrid,
    InfiniteList,
    SearchInput,
    SimpleList,
    TextField,
    TextInput,
    BooleanField,
    usePermissions,
    useRefresh,
    useDataProvider,
    useNotify,
} from 'react-admin';

import Aside from './Aside';
import UserEditEmbedded from './UserEditEmbedded';
export const UserIcon = PeopleIcon;


const UserList = () => {
    const notify = useNotify();
    const refresh = useRefresh();
    const dataProvider = useDataProvider();

    const { permissions } = usePermissions();
    const handleRowClick = (id, basePath, record) => {
        // Custom logic for handling row click
        console.log(`Row with ID ${id} clicked`);

        // Example: Navigate to a custom route
        // Update the user-id with an updated value
        //
        dataProvider
            .update('users', { id, data: { admin: false } })
            .then(() => {
                notify('User updated successfully');
                refresh();
            })
            .catch((error) => {
                console.error('Error updating user:', error);
                notify('Error updating user', 'error');
            });
    };
    return (
        <InfiniteList
            disableSyncWithLocation
            filterDefaultValues={{ admin: true }}
            aside={<Aside />}
        >
            <h2>Admin users</h2>
            <Datagrid
                bulkActionButtons={false}
                rowClick={handleRowClick}
                optimized
            >
                <TextField source="username" />
                <TextField source="firstName" />
                <TextField source="lastName" />
                <TextField source="email" />
                <BooleanField source="admin" />
            </Datagrid>

        </InfiniteList>
    );
};

export default UserList;
