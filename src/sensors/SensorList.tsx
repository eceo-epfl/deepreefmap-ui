import * as React from 'react';
import { Fragment, useState } from 'react';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

import {
    List,
    Datagrid,
    TextField,
    BulkDeleteWithConfirmButton,
    ReferenceField,
    useAuthState,
    Loading,
    BulkDeleteButton,
    usePermissions,
    DeleteButton,
    TopToolbar,
    CreateButton,
    ExportButton,
} from "react-admin";

const UserBulkActionButtons = props => (
    <BulkDeleteWithConfirmButton {...props} />
);
const SensorListActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <><CreateButton /></>}
            <ExportButton />
        </TopToolbar>
    );
}

const SensorList = () => {
    const { permissions } = usePermissions();

    return (
        <List actions={<SensorListActions />}>
            <Datagrid
                bulkActionButtons={permissions === 'admin' ? true : false}
                rowClick="show"
            >
                <TextField source="name" />
                <TextField source="description" />
                <ReferenceField
                    source='area_id'
                    reference='areas'
                    link="show"
                >
                    <TextField source='name' />
                </ReferenceField>
            </Datagrid>
        </List >

    )
};

export default SensorList;
