import { useEffect, useState } from 'react';
import dataProvider from '../../../.history/deepreefmap-ui/src/dataProvider/index_20240424113643';
import { Typography } from '@mui/material';
import {
    Show,
    SimpleShowLayout,
    TextField,
    NumberField,
    EditButton,
    TopToolbar,
    DeleteButton,
    usePermissions,
    DateField,
    BooleanField,
    Button,
    useDataProvider,
    useRecordContext,
    useRefresh,
    ArrayField,
    Datagrid,
    useRedirect,
    ReferenceField,
    ReferenceArrayField,
    ReferenceManyField,
    useCreate,
    FunctionField,
} from 'react-admin'; // eslint-disable-line import/no-unresolved

const ObjectShowActions = () => {
    const { permissions } = usePermissions();
    const dataProvider = useDataProvider();
    const record = useRecordContext();
    const refresh = useRefresh();
    const timeout = ms => new Promise(res => setTimeout(res, ms));
    const RegenerateStatisticsButton = () => {
        return <Button
            type="button"
            variant="contained"
            color="primary"
            label="Regenerate Video Statistics"
            disabled={record.all_parts_received === false}
            onClick={() => dataProvider.regenerateVideoStatistics(record.id).then(() => timeout(3000)).then(() => refresh())}
        />;
    };

    const CreateSubmissionButton = () => {
        const record = useRecordContext();
        const redirect = useRedirect();
        const [create, { data, loading, loaded, error }] = useCreate();
        useEffect(() => {
            if (!data) return;
            if (data.id) {
                redirect('edit', 'submissions', data.id);
            }
        }, [data]);
        const handleClick = () => {
            create('submissions',
                {
                    data: {
                        input_associations: [
                            {
                                input_object_id: record.id,
                                processing_order: 1
                            }]
                    }
                })
        }
        return <Button
            type="button"
            variant="contained"
            color="success"
            label="Create Submission from this video"
            disabled={record.all_parts_received === false}
            onClick={handleClick}
        />;
    };
    return (
        <TopToolbar>
            {permissions === 'admin' && <><CreateSubmissionButton /><RegenerateStatisticsButton /><EditButton /><DeleteButton /></>}
        </TopToolbar >
    );
}
const ObjectShow = (props) => {
    const redirect = useRedirect();
    const redirectToSubmission = (id, basePath, record) => {
        redirect('edit', 'submissions', record.submission_id);
    };

    return (

        <Show
            actions={<ObjectShowActions />}
            {...props}
            queryOptions={{ refetchInterval: 5000 }}
        >
            <SimpleShowLayout>
                <FunctionField render={(record) => {
                    if (record.all_parts_received === false) {
                        return <Typography variant="h5" color='error' gutterBottom >Video upload incomplete</Typography>
                    }
                }} />
                < TextField source="id" />
                <TextField source="filename" />
                <NumberField source="size_bytes" />
                <DateField
                    label="Submitted at"
                    source="time_added_utc"
                    showTime={true}
                />
                <TextField source="hash_md5sum" label="MD5" />
                <TextField source="notes" />
                <NumberField source="time_seconds" />
                <NumberField source="fps" />
                <TextField source="processing_message" />
                <BooleanField source="processing_completed_successfully" />
                <BooleanField source="processing_has_started" />
                <ArrayField source="input_associations" label="Associated submissions">
                    <Datagrid bulkActionButtons={false} rowClick={redirectToSubmission}>
                        <TextField source="submission_id" label="Submission ID" />
                        <ReferenceField source="submission_id" reference="submissions" label="Name" link={false}>
                            <TextField source="name" />
                        </ReferenceField>
                        <ReferenceField source="submission_id" reference="submissions" label="Run status" link={false}>
                            <TextField source="run_status[0].status" emptyText='No jobs submitted' />
                        </ReferenceField>
                    </Datagrid>

                </ArrayField>
            </SimpleShowLayout>
        </Show >
    )
};

export default ObjectShow;