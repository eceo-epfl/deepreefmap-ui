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

    useDataProvider,
} from "react-admin";
import { useEffect, useState } from "react";



const SubmissionListActions = () => {
    const { permissions } = usePermissions();
    return (

        <TopToolbar >
            {permissions === 'admin' && <><CreateButton /></>}
            <ExportButton />
        </TopToolbar>
    );
}

const SubmissionList = () => {
    const { permissions } = usePermissions();
    return (
        <List disableSyncWithLocation
            actions={<SubmissionListActions />}
            perPage={25}
            sort={{ field: 'time_added_utc', order: 'DESC' }}
        >
            <>
                <Datagrid
                    bulkActionButtons={permissions === 'admin' ? true : false}
                    rowClick="show"
                >
                    <FunctionField render={(record) => {
                        if (record.name === null) {
                            return record.id
                        }
                        return `${record.name}`
                    }} label="Name" />
                    <TextField source="description" />
                    <FunctionField render={record => `${record?.input_associations?.length ?? ""}`} label="Files" />

                    <FunctionField
                        label="Last job status"
                        render={record => `${record?.run_status[0]?.status ?? 'No jobs submitted'}`}
                    />
                    <DateField
                        label="Submitted at"
                        source="time_added_utc"
                        showTime={true}
                    />
                </Datagrid>
            </>
        </List >

    )
};

export default SubmissionList;
