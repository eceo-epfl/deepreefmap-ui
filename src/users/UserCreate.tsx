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


const UserCreate = () => {
    const notify = useNotify();
    const refresh = useRefresh();
    const dataProvider = useDataProvider();

    const { permissions } = usePermissions();
    const handleRowClick = (id, basePath, record) => {
        // Custom logic for handling row click
        console.log(`Row with ID ${id} clicked`);

        dataProvider
            .update('users', { id, data: { admin: true } })
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
        <SearchInput source="username" placeholder="EPFL Username" alwaysOn />
    ];
    return (
        <Create aside={< Aside />} redirect="show" >
            <h2>Add admin user</h2>
            <List
                filters={postFilters}
                actions={null}
                pagination={null}
                disableSyncWithLocation
            >
                <Datagrid bulkActionButtons={false} rowClick={handleRowClick}>
                    <TextField source="username" />
                    <TextField source="firstName" />
                    <TextField source="lastName" />
                    <TextField source="email" />
                    <BooleanField source="admin" />
                </Datagrid>
            </List>
        </Create >
    );
};

export default UserCreate;
