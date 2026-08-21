import {
    Datagrid,
    DateField,
    ExportButton,
    List,
    SelectInput,
    TextField,
    TextInput,
    TopToolbar,
    useListContext,
    useRecordContext,
} from 'react-admin';
import { Box, Typography } from '@mui/material';

import { ArchiveStateChip } from '../archive/ArchiveChip';
import { useArchiveProbeBatch } from '../archive/useBatchProbe';
import {
    asColumn,
    DurationField,
    HashField,
    TriStateField,
    triStateChoices,
} from '../components';
import type { VideoAsset } from '../contract';
import { SizeField } from './VideoFields';

const DurationColumn = asColumn(DurationField);
const TriStateColumn = asColumn(TriStateField);

const videoFilters = [
    <TextInput key="q" source="q" label="Search file name" alwaysOn />,
    <TextInput key="codec" source="codec" label="Codec" helperText="Exact match, eg. hvc1" />,
    <SelectInput key="gravity" source="gravity" label="Gravity" choices={triStateChoices} />,
    <SelectInput key="gps" source="gps" label="GPS" choices={triStateChoices} />,
];

// Every row asks with the whole page's hashes, so the batch hook collapses the
// column into one probe.
const ArchiveField = () => {
    const { data } = useListContext<VideoAsset>();
    const record = useRecordContext<VideoAsset>();
    const { states, error } = useArchiveProbeBatch((data ?? []).map(video => video.hash));
    if (!record?.hash) {
        return (
            <Typography
                variant="body2"
                component="span"
                sx={{
                    color: 'text.disabled',
                }}
            >
                —
            </Typography>
        );
    }
    return <ArchiveStateChip state={states.get(record.hash)} error={error} />;
};

const ArchiveColumn = asColumn(ArchiveField);

const VideoListActions = () => (
    <TopToolbar>
        <ExportButton />
    </TopToolbar>
);

const VideoEmpty = () => (
    <Box
        sx={{
            textAlign: 'center',
            m: 4,
        }}
    >
        <Typography variant="h6" gutterBottom>
            No video assets registered
        </Typography>
        <Typography
            variant="body2"
            sx={{
                color: 'text.secondary',
            }}
        >
            Clips are metadata only and appear once an enrolled laptop syncs.
        </Typography>
    </Box>
);

const VideoList = () => (
    <List
        actions={<VideoListActions />}
        filters={videoFilters}
        sort={{ field: 'captured_at', order: 'DESC' }}
        perPage={50}
        empty={<VideoEmpty />}
    >
        <Datagrid rowClick="show" bulkActionButtons={false}>
            <TextField source="file_name" label="File name" />
            <HashField label="Quick hash" />
            <DurationColumn label="Duration" source="duration_s" />
            <SizeField label="Size" source="size_bytes" />
            <DateField source="captured_at" label="Captured" showTime emptyText="—" />
            <TextField source="codec" emptyText="—" sortable={false} />
            <TriStateColumn label="Gravity" source="gravity" sortable={false} />
            <TriStateColumn label="GPS" source="gps" sortable={false} />
            <ArchiveColumn label="Archive" sortable={false} />
        </Datagrid>
    </List>
);

export default VideoList;
