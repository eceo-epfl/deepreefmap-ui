/* eslint react/jsx-key: off */
import PeopleIcon from '@mui/icons-material/People';
import memoize from 'lodash/memoize';
import { useMediaQuery, Theme, Typography } from '@mui/material';
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
    List,
    EditButton,
    Button,
    useRecordContext,
} from 'react-admin';

import Aside from './Aside';
import UserEditEmbedded from './UserEditEmbedded';
export const UserIcon = PeopleIcon;


const UserList = () => {
    const notify = useNotify();
    const refresh = useRefresh();
    const dataProvider = useDataProvider();

    const { permissions } = usePermissions();
    const AdminButton = () => {
        const record = useRecordContext();
        // A button that switches from normal user to admin depending on user status

        if (record.admin === true) {
            return <Button
                type="button"
                variant="contained"
                color="secondary"
                label="Revoke Admin"
                onClick={() => dataProvider.update('users', { id: record.id, data: { admin: false } }).then(() => timeout(3000)).then(() => refresh())}
            />;
        } else {
            return <Button
                type="button"
                variant="contained"
                color="primary"
                label="Make Admin"
                disabled={record.admin === true}
                onClick={() => dataProvider.update('users', { id: record.id, data: { admin: true } }).then(() => timeout(3000)).then(() => refresh())}
            />;
        }
    };

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
        <List disableSyncWithLocation
            perPage={25}
            filter={{ admin: true }}
        >
            <>
                <Datagrid
                    bulkActionButtons={permissions === 'admin' ? true : false}
                    rowClick="show"
                >
                    <TextField source="firstName" />
                    <TextField source="lastName" />
                    <TextField source="username" />
                    <TextField source="email" />
                    <TextField source="loginMethod" />
                    <BooleanField source="admin" />
                    <AdminButton />
                </Datagrid>
            </>
        </List >
    );
};

export default UserList;
