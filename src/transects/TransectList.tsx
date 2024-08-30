import {
    List,
    Datagrid,
    TextField,
    usePermissions,
    TopToolbar,
    CreateButton,
    ExportButton,
    FunctionField,
    ReferenceField,
} from "react-admin";
import { useEffect, useState } from "react";
import { TransectMapAll } from "../maps/Transects";
import { Typography } from "@mui/material";


const TransectListActions = () => {
    return (

        <TopToolbar >
            <CreateButton />
            <ExportButton />
        </TopToolbar>
    );
}

const TransectList = () => {
    const { permissions } = usePermissions();

    return (
        <>
            <List disableSyncWithLocation
                actions={<TransectListActions />}
                perPage={25}        >
                <>
                    <Typography variant="caption">
                        This is a list of all transects that have been created. Click on a transect to view more details or to create a new one select '+ Create'.
                    </Typography>
                    <TransectMapAll />
                    <Datagrid
                        bulkActionButtons={permissions === 'admin' ? true : false}
                        rowClick="show"
                    >
                        <TextField source="name" />
                        <TextField source="description" />
                        <FunctionField label="Associated submissions" render={(record) => {
                            return record.submissions?.length ? record.submissions.length : 0;
                        }} />
                        <FunctionField label="Associated files" render={(record) => {
                            return record.inputs?.length ? record.inputs.length : 0;
                        }} />
                        {permissions === 'admin' ? (<ReferenceField source="owner" reference="users" link="show">
                            <FunctionField render={record => `${record.firstName} ${record.lastName}`} source="Owner" />
                        </ReferenceField>) : null}
                    </Datagrid>
                </>
            </List ></>

    )
};

export default TransectList;
