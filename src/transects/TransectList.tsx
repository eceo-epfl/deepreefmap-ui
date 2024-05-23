import {
    List,
    Datagrid,
    TextField,
    usePermissions,
    TopToolbar,
    CreateButton,
    ExportButton,
    DateField,
    FunctionField,
    // useGetList,
    useDataProvider,
    Loading,
} from "react-admin";
import { useEffect, useState } from "react";
import { TransectMapAll } from "../maps/Transects";


const TransectListActions = () => {
    const { permissions } = usePermissions();

    return (

        <TopToolbar >
            {permissions === 'admin' && <><CreateButton /></>}
            <ExportButton />
        </TopToolbar>
    );
}

const TransectList = () => {
    const { permissions } = usePermissions();

    return (
        <>
            <TransectMapAll />
            <List disableSyncWithLocation
                actions={<TransectListActions />}
                perPage={25}        >
                <>
                    <Datagrid
                        bulkActionButtons={permissions === 'admin' ? true : false}
                        rowClick="show"
                    >
                        <TextField source="name" />
                        <TextField source="description" />
                        <FunctionField label="Associated submissions" render={(record) => {
                            return record.submissions?.length;
                        }} />
                        <FunctionField label="Associated files" render={(record) => {
                            return record.inputs?.length;
                        }} />
                    </Datagrid>
                </>
            </List ></>

    )
};

export default TransectList;
