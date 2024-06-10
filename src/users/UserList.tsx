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
    TopToolbar,
    CreateButton,
    ExportButton,
} from 'react-admin';
export const UserIcon = PeopleIcon;

const UserListActions = () => {
    return (

        <TopToolbar>
            <><CreateButton label="Approve user" /></>
            <ExportButton />
        </TopToolbar>
    );
}

const UserList = () => {
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
                onClick={(event) => {
                    dataProvider.update(
                        'users',
                        { id: record.id, data: { role: "user" } }).then(() => refresh())
                    event.stopPropagation();
                }}
            />;
        } else {
            return <Button
                type="button"
                variant="contained"
                color="primary"
                label="Make Admin"
                // disabled={record.admin === true}
                onClick={(event) => {
                    dataProvider.update(
                        'users',
                        { id: record.id, data: { role: "admin" } }).then(() => refresh())
                    event.stopPropagation();
                }}
            />;
        }
    };

    return (
        <>

            <List
                actions={<UserListActions />}
                disableSyncWithLocation
                perPage={50}
                filter={{ users_only: true }}
            >
                <Typography variant="h4">Approved users</Typography>
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
        </>
    );
};

export default UserList;
