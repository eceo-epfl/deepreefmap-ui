import {
    Show,
    SimpleShowLayout,
    TextField,
    EditButton,
    TopToolbar,
    DeleteButton,
    usePermissions,
    Link,
    FunctionField,
    ArrayField,
    Labeled,
    Datagrid,
    useRedirect,
    TabbedShowLayout,
    useRecordContext,
    Loading,
    DateField,
    NumberField,
    BooleanField,
    useCreate,
    useListContext,
    Button,
    useUnselectAll,
    useNotify,
    useCreatePath,
} from 'react-admin';
import { Typography, Grid } from '@mui/material';
import { TransectMapOne } from '../maps/Transects';
import { FilePondUploaderTransect } from '../uploader/FilePond';
import { useEffect } from "react";
import Brightness1TwoToneIcon from '@mui/icons-material/Brightness1TwoTone';
import { IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const CreateSubmissionButton = () => {
    const record = useRecordContext();
    if (!record) return null;

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
        const record = listContext?.data?.find(data => data.id === id);
        if (!record) return false;

        return record.all_parts_received === false;
    });
    const handleClick = () => {
        redirect('create', 'submissions', null, {}, {
            record: {
                transect_id: record.id,
                input_associations: input_associations,
            }
        })
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


export const CreateSingleSubmissionButton = () => {
    const record = useRecordContext();
    if (!record) return null;
    const notify = useNotify();
    const redirect = useRedirect();
    let color = 'error';

    const getColor = (record) => {
        if (record.all_parts_received && record.processing_has_started && record.processing_completed_successfully) {
            return "success";
        } else if (record.all_parts_received && record.processing_has_started) {
            return "warning";
        } else {
            return "error";
        }
    }

    const getProcessingMessage = (record) => {
        if (record.all_parts_received && record.processing_has_started && record.processing_completed_successfully) {
            return "Click to create submission from video";
        } else if (record.all_parts_received && record.processing_has_started) {
            return "Upload has finished, processing video";
        } else {
            return "Upload in progress";
        }
    }

    return <IconButton
        color={getColor(record)}
        title={getProcessingMessage(record)}
        onClick={(event) => {
            if (record.all_parts_received && record.processing_has_started && record.processing_completed_successfully) {
                redirect('create', 'submissions', null, {}, {
                    record: {
                        transect_id: record.transect_id,
                        input_associations: [
                            {
                                input_object_id: record.id,
                                processing_order: 1
                            }
                        ],
                    }
                })
                event.stopPropagation();
            } else if (record.all_parts_received && record.processing_has_started) {
                notify("Please wait, processing video");
                event.stopPropagation();
            } else {
                notify('Upload in progress, please wait for it to finish');
                event.stopPropagation();
            }

        }}
    >
        <AddCircleOutlineIcon />
    </IconButton>;
};


const TransectTabs = () => {
    const record = useRecordContext();
    const createPath = useCreatePath();
    const unselectAll = useUnselectAll('transects');
    useEffect(() => {
        return () =>
            unselectAll();
    }, []
    );


    const objectClick = (id, resource, record) => (createPath({ resource: 'objects', type: 'show', id: record.id }));
    const submissionClick = (id, resource, record) => (createPath({ resource: 'submissions', type: 'show', id: record.id }));
    if (!record) return <Loading />;
    return (
        <><Typography variant="h6" gutterBottom>Associations</Typography>

            <TabbedShowLayout>
                <TabbedShowLayout.Tab label={`Files (${record.inputs?.length ? record.inputs.length : 0})`}>
                    <ArrayField source="inputs">
                        <Typography variant="caption">
                            Upload videos associated with this transect. To create a submission, select one or two files and click "Create submission from selected video".
                        </Typography>
                        <FilePondUploaderTransect />
                        <Datagrid
                            bulkActionButtons={<CreateSubmissionButton />}
                            rowClick={objectClick}
                            isRowSelectable={(record) => (record.all_parts_received && record.processing_has_started && record.processing_completed_successfully)}
                        >
                            <DateField
                                label="Uploaded at"
                                source="time_added_utc"
                                transform={value => new Date(value + 'Z')}  // Fix UTC time
                                showTime
                            />
                            <TextField source="filename" />
                            <FunctionField label="Size (MB)" render={(record) => { return (record.size_bytes / 1000000).toFixed(2); }} />
                            <NumberField source="time_seconds" label="Duration (s)" />
                            <NumberField source="fps" label="FPS" />
                            <CreateSingleSubmissionButton label="Ready" />

                        </Datagrid>
                    </ArrayField>
                </TabbedShowLayout.Tab>
                <TabbedShowLayout.Tab label={`Submissions (${record.submissions?.length ? record.submissions.length : 0})`}>
                    <Typography variant="caption">
                        These are the related submissions to this transect. Click on them to view their details.
                    </Typography>
                    <ArrayField source="submissions" sort={{ field: "time_added_utc", order: "DESC" }}>
                        <Datagrid rowClick={submissionClick} bulkActionButtons={false}
                        >
                            <DateField
                                source="time_added_utc"
                                label="Added"
                                showTime
                                transform={value => new Date(value + 'Z')}  // Fix UTC time
                            />
                            <TextField source="name" />
                            <FunctionField
                                label="Last job status"
                                render={record => `${record?.run_status[0]?.status ?? 'No jobs submitted'}`}
                            />

                        </Datagrid>
                    </ArrayField>
                </TabbedShowLayout.Tab>
            </TabbedShowLayout>
        </>
    )
}

const TransectMap = () => {
    const record = useRecordContext();
    if (!record) return <Loading />;
    return (
        <TransectMapOne record={record} />
    )
}


const TransectShow = (props) => {
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
                <Grid container spacing={2}>
                    <Grid item xs={3}>
                        <Grid item xs={6}>
                            <Labeled label="Name">
                                <TextField source="name" />
                            </Labeled>
                        </Grid>
                        <Grid />

                        <Grid item xs={6}>
                            <Labeled label="Length (m)">
                                <TextField source="length" label="Length (m)" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={6}>
                            <Labeled label="Depth (m)">
                                <TextField source="depth" label="Depth (m)" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={6}>
                            <Labeled label="Description">
                                <TextField source="description" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={6}>
                            <Labeled label="Start coordiantes">
                                <FunctionField label="Coordinates" render={(record) => {
                                    return (
                                        <Link
                                            to={`https://www.google.com/maps?q=${record.latitude_start},${record.longitude_start}`}
                                            target="_blank"
                                        >{`${record.latitude_start}°, ${record.longitude_start}°`}</Link>
                                    )
                                }
                                } />
                            </Labeled>
                        </Grid>
                        <Grid item xs={6} />
                        <Grid item xs={6}>
                            <Labeled label="End coordinates">
                                <FunctionField label="Coordinates" render={(record) => {
                                    return (
                                        <Link
                                            to={`https://www.google.com/maps?q=${record.latitude_end},${record.longitude_end}`}
                                            target="_blank"
                                        >{`${record.latitude_end}°, ${record.longitude_end}°`}</Link>
                                    )
                                }
                                } />
                            </Labeled>
                        </Grid>
                    </Grid>
                    <Grid item xs={9}>
                        <TransectMap />
                    </Grid>
                </Grid>
                <TransectTabs />
            </SimpleShowLayout>
        </Show >
    )
};


export default TransectShow;