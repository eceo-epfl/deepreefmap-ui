/* eslint react/jsx-key: off */
import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import {
    Create,
    FormTab,
    SaveButton,
    List,
    Datagrid,
    TextField,
    AutocompleteInput,
    BooleanField,
    TabbedForm,
    TextInput,
    Toolbar,
    SearchInput,
    required,
    SelectInput,
    useNotify,
    usePermissions,
    useDataProvider,
    useRefresh,
} from 'react-admin';

import Aside from './Aside';
import { Typography } from '@mui/material';


const UserCreate = () => {
    const notify = useNotify();
    const refresh = useRefresh();
    const dataProvider = useDataProvider();

    const { permissions } = usePermissions();
    const handleRowClick = (id, basePath, record) => {
        // Custom logic for handling row click
        console.log(`Row with ID ${id} clicked`);

        dataProvider
            .update('users', { id, data: { role: "user" } })
            .then(() => {
                notify('User updated successfully');
                refresh();
            })
            .catch((error) => {
                console.error('Error updating user:', error);
                notify('Error updating user', 'error');
            });
    };


    const postFilters = [
        <SearchInput source="username" placeholder="Username" alwaysOn />
    ];
    return (
        <Create aside={< Aside />} redirect="show" >
            <Typography variant="h3">Approve user</Typography>
            <Typography variant="caption">
                Click the row to provide permission to a user, they will be added as a standard user. Elevation to admin status if necessary, can be provided in the user list afterwards.<br />
                External users must login first (via Github, etc.) to show up in this list.
            </Typography>

            <List
                filters={postFilters}
                actions={null}
                pagination={null}
                disableSyncWithLocation
            >
                <Typography variant="caption">The username is the EPFL Gaspar, or the external provider (Github) username</Typography>
                <Datagrid bulkActionButtons={false} rowClick={handleRowClick}>
                    <TextField source="username" />
                    <TextField source="firstName" />
                    <TextField source="lastName" />
                    <TextField source="email" />
                    <TextField source="loginMethod" />
                    <BooleanField source="approved_user" />
                    <BooleanField source="admin" />
                </Datagrid>
            </List>
        </Create >
    );
};

export default UserCreate;
