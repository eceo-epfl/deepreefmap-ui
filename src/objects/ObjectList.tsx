import {
    List,
    Datagrid,
    TextField,
    usePermissions,
    TopToolbar,
    ExportButton,
    NumberField,
    DateField,
    BooleanField,
    FunctionField,
    useAuthProvider,
    useRedirect,
    useRefresh,
    Button,
    useRecordContext,
    useListContext,
    useCreate,
    SavedQueriesList,
    FilterLiveSearch,
    FilterList,
    FilterListItem,
    useCreatePath,
    Link
} from "react-admin";
import 'react-dropzone-uploader/dist/styles.css'
import { FilePond } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import { useEffect } from "react";

import { Card, CardContent, Typography } from '@mui/material';
import MailIcon from '@mui/icons-material/MailOutline';
import CategoryIcon from '@mui/icons-material/LocalOffer';
import { stopPropagation } from "ol/events/Event";
import { FilePondUploaderList } from '../uploader/FilePond';

const CreateSubmissionButton = () => {
    const listContext = useListContext();
    const redirect = useRedirect();
    const [create, { data, loading, loaded, error }] = useCreate();

    useEffect(() => {
        if (!data) return;
        if (data.id) {
            redirect('show', 'submissions', data.id);
        }
    }, [data]);

    // Create a list of input_association objects from the selected video ids
    const input_associations = listContext.selectedIds.map((id, index) => {
        return {
            input_object_id: id,
            processing_order: index + 1
        }
    });

    // Create a list of selected videos that have not completed uploading to
    // disable the button if any of the selected videos are incomplete
    const selectedIncompleteData = listContext.selectedIds.some(id => {
        const record = listContext.data.find(data => data.id === id);
        return record.all_parts_received === false;
    });
    const handleClick = () => {
        create('submissions', { data: { input_associations: input_associations } })
    }
    if (listContext.selectedIds.length > 2) {
        return <Button
            variant="contained"
            color="error"
            disabled={true}
        >Maximum 2 videos can be selected</Button>
    }
    if (selectedIncompleteData) {
        return <Button
            variant="contained"
            color="error"
            disabled={selectedIncompleteData}
        >Deselect incomplete data</Button>
    }
    return <Button
        variant="contained"
        color="success"
        disabled={selectedIncompleteData}
        onClick={handleClick}>{
            listContext.selectedIds.length === 1 ?
                'Create submission from selected video' : 'Create submission from selected videos'
        }</Button>
};


const ObjectListActions = () => {
    const { permissions } = usePermissions();
    return (

        <TopToolbar >
            {permissions === 'admin' && <>
            </>}
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
const ObjectList = () => {
    const FieldWrapper = ({ children, label }) => children;
    const { permissions } = usePermissions();

    return (
        <>
            <List disableSyncWithLocation
                actions={<ObjectListActions />}
                perPage={10}
                sort={{ field: 'time_added_utc', order: 'DESC' }}
                queryOptions={{ refetchInterval: 10000 }}
                empty={false}
            >
                <FilePondUploaderList />
                <Datagrid
                    bulkActionButtons={permissions === 'admin' ? <CreateSubmissionButton /> : false}
                    rowClick="show"
                >
                    <DateField
                        label="Submitted at"
                        source="time_added_utc"
                        showTime={true}
                    />
                    <TextField source="filename" />
                    <FunctionField label="Size (MB)" render={(record) => { return (record.size_bytes / 1000000).toFixed(2); }} />
                    <NumberField source="time_seconds" label="Time (s)" />
                    <TextField source="processing_message" />
                    <BooleanField label="Upload complete" source="all_parts_received" />
                    <BooleanField label="Processing started" source="processing_has_started" />
                    <BooleanField label="Processing successful" source="processing_completed_successfully" />
                    <FieldWrapper label="Transect"><TransectNameField /></FieldWrapper>
                    <FunctionField
                        label="Associated submissions"
                        render={record => record.input_associations.length}
                    />
                    {permissions === 'admin' ? <TextField source="owner" emptyText="Not defined" /> : null}
                </Datagrid>
            </List >
        </>
    )
};

export default ObjectList;
