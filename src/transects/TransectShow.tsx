import {
    Show,
    SimpleShowLayout,
    TextField,
    EditButton,
    TopToolbar,
    DeleteButton,
    usePermissions,
    Labeled,
    Link,
    FunctionField,
    ArrayField,
    Datagrid,
    useCreatePath,
    useRedirect,
    TabbedShowLayout,
    useRecordContext,
    Loading,
    DateField,
} from 'react-admin';
import { Box, Typography } from '@mui/material';
import { TransectMapOne } from '../maps/Transects';


const TransectTabs = () => {
    const record = useRecordContext();
    const redirect = useRedirect();
    if (!record) return <Loading />;
    return (
        <TabbedShowLayout>
            <TabbedShowLayout.Tab label={`Submissions (${record.submissions?.length ? record.submissions.length : 0})`}>
                <Typography variant="h6" gutterBottom>
                    Results
                </Typography>
                <ArrayField source="submissions">
                    <Datagrid rowClick={(id, basePath, record) => {
                        redirect('show', 'submissions', record.id);
                    }}>
                        <DateField source="time_added_utc" label="Added (UTC)" />
                        <TextField source="id" />
                        <TextField source="name" />
                    </Datagrid>
                </ArrayField>
            </TabbedShowLayout.Tab>
            <TabbedShowLayout.Tab label={`Files (${record.inputs?.length ? record.inputs.length : 0})`}>
                <ArrayField source="inputs">
                    <Datagrid rowClick={(id, basePath, record) => {
                        redirect('show', 'objects', record.id);
                    }}>
                        <TextField source="filename" />
                        <TextField source="time_seconds" label="Time (s)" />
                        <FunctionField label="Size (MB)" render={(record) => {
                            return (record.size_bytes / 1000000).toFixed(2);
                        }} />
                    </Datagrid>
                </ArrayField>
            </TabbedShowLayout.Tab>

        </TabbedShowLayout>
    )
}

const TransectShow = (props) => {
    const redirect = useRedirect();
    const { permissions } = usePermissions();

    const TransectShowActions = () => {
        const { permissions } = usePermissions();
        return (
            <TopToolbar>
                {permissions === 'admin' && <>
                    <EditButton />
                    <DeleteButton /></>}
            </TopToolbar>
        );
    }

    return (
        <Show actions={<TransectShowActions />} {...props} queryOptions={{ refetchInterval: 5000 }}>
            <SimpleShowLayout>
                <TextField source="name" />
                <TextField source="description" />
                {permissions === 'admin' ? <TextField source="owner" emptyText="Not defined" /> : null}
                <FunctionField label="Coordinates" render={(record) => {
                    return (
                        <Link
                            to={`https://www.google.com/maps?q=${record.latitude_start},${record.longitude_start}`}
                            target="_blank"
                        >{`${record.latitude_start}°, ${record.longitude_start}°` + " to " + `${record.latitude_end}°, ${record.longitude_end}°`}</Link>
                    )
                }
                } />
                <TransectMapOne />
                <TransectTabs />
            </SimpleShowLayout>
        </Show >
    )
};


export default TransectShow;