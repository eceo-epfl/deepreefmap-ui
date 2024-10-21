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
    ReferenceField,
    useRecordContext,
    useCreatePath,
    Link,
} from "react-admin";
import { stopPropagation } from "ol/events/Event";

const SubmissionListActions = () => {
    const { permissions } = usePermissions();

    return (

        <TopToolbar >
            <>
                {permissions === 'admin' ? <CreateButton /> : null}
                <ExportButton />
            </>
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

    return path ? (
        <Link to={path} onClick={stopPropagation}>
            <TextField source="transect.name" label="Area" emptyText='N/A' />
        </Link>
    ) : (
        <TextField source="transect.name" label="Area" emptyText='N/A' />
    );
};

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
                    size="small"
                >
                    <DateField
                        label="Submitted at"
                        source="time_added_utc"
                        showTime
                        transform={value => new Date(value + 'Z')}  // Fix UTC time
                    />
                    <FunctionField render={(record) => {
                        if (record.name === null) {
                            return record.id
                        }
                        return `${record.name}`
                    }} label="Name" />
                    <FunctionField render={record => `${record?.input_associations?.length ?? ""}`} label="Files" />

                    <FunctionField
                        label="Last job status"
                        render={record => `${record?.run_status[0]?.status ?? 'No jobs submitted'}`}
                    />
                    <FieldWrapper label="Transect"><TransectNameField /></FieldWrapper>
                    {permissions === 'admin' ? (
                        <ReferenceField source="owner" reference="users" link="show">
                            <FunctionField render={record => `${record.firstName} ${record.lastName}`} source="Owner" />
                        </ReferenceField>
                    ) : null}

                </Datagrid>
            </>
        </List >

    )
};

export default SubmissionList;
