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
    useRecordContext,
    useCreatePath,
    Link,
} from "react-admin";
import { useEffect, useState } from "react";
import { stopPropagation } from "ol/events/Event";

const SubmissionListActions = () => {
    return (

        <TopToolbar >
            <><CreateButton /></>
            <ExportButton />
        </TopToolbar>
    );
}
const TransectNameField = () => {
    const record = useRecordContext();
    const createPath = useCreatePath();
    if (!record) return <Loading />;
    let path = null;

    if (record.transect) {
        path = createPath({
            resource: 'transects',
            type: 'show',
            id: record.transect.id,
        });
    }

    return (
        <Link to={path} onClick={stopPropagation}>
            <TextField source="transect.name" label="Area" emptyText='No associated transect' />
        </Link>
    );
}
const SubmissionList = () => {
    const FieldWrapper = ({ children, label }) => children;
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
                    <FieldWrapper label="Transect"><TransectNameField /></FieldWrapper>
                    {permissions === 'admin' ? <TextField source="owner" emptyText="Not defined" /> : null}

                </Datagrid>
            </>
        </List >

    )
};

export default SubmissionList;
