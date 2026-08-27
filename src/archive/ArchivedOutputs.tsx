import { useState } from 'react';
import { useRecordContext } from 'react-admin';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
    Alert,
    Button,
    Chip,
    IconButton,
    LinearProgress,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography,
} from '@mui/material';

import type { OutputFile, OutputGroup, RunRecord } from '../contract';
import { formatBytes } from '../videos/VideoFields';
import BundleButton from './BundleButton';
import DownloadButton from './DownloadButton';
import { ObjectStatusChip } from './StatusField';
import { expandedByDefault } from './purpose';
import { FILE_PAGE, useRunOutputFiles, useRunOutputs } from './useRunOutputs';

const fileName = (relpath: string) => relpath.slice(relpath.lastIndexOf('/') + 1);

const FileRow = ({ file }: { file: OutputFile }) => (
    <TableRow>
        <TableCell sx={{ pl: 6, fontFamily: 'monospace' }}>{fileName(file.relpath)}</TableCell>
        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
            {file.size_bytes == null ? '—' : formatBytes(file.size_bytes)}
        </TableCell>
        <TableCell>{file.status ? <ObjectStatusChip status={file.status} /> : '—'}</TableCell>
        <TableCell align="right" sx={{ py: 0 }}>
            {file.status === 'complete' && file.stored_object_id && (
                <DownloadButton objectId={file.stored_object_id} />
            )}
        </TableCell>
    </TableRow>
);

const GroupRows = ({ group, runId }: { group: OutputGroup; runId: string }) => {
    const [open, setOpen] = useState(expandedByDefault(group.name));
    const [limit, setLimit] = useState(FILE_PAGE);
    const { data, isPending } = useRunOutputFiles(runId, group.name, limit, open);
    const files = data?.files ?? [];
    return (
        <>
            <TableRow
                hover
                onClick={() => setOpen(value => !value)}
                sx={{ cursor: 'pointer', '& td': { bgcolor: 'action.hover' } }}
            >
                <TableCell sx={{ pl: 0.5 }}>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <IconButton size="small" aria-label={open ? 'Collapse' : 'Expand'}>
                            {open ? (
                                <ExpandMoreIcon fontSize="small" />
                            ) : (
                                <ChevronRightIcon fontSize="small" />
                            )}
                        </IconButton>
                        <Typography variant="subtitle2">{group.name}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {group.files} {group.files === 1 ? 'file' : 'files'}
                        </Typography>
                    </Stack>
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {formatBytes(group.size_bytes)}
                </TableCell>
                <TableCell>
                    <Stack direction="row" spacing={0.5}>
                        <Chip
                            size="small"
                            variant="outlined"
                            color={group.complete === group.files ? 'success' : 'default'}
                            label={`${group.complete} complete`}
                        />
                        {group.failed > 0 && (
                            <Chip
                                size="small"
                                color="error"
                                label={`${group.failed} failed`}
                            />
                        )}
                    </Stack>
                </TableCell>
                <TableCell align="right" sx={{ py: 0 }}>
                    {group.complete > 0 && (
                        <BundleButton runId={runId} purpose={group.name} label="Zip" />
                    )}
                </TableCell>
            </TableRow>
            {open && isPending && (
                <TableRow>
                    <TableCell colSpan={4} sx={{ py: 0 }}>
                        <LinearProgress />
                    </TableCell>
                </TableRow>
            )}
            {open && files.map(file => <FileRow key={file.id} file={file} />)}
            {open && files.length < group.files && (
                <TableRow>
                    <TableCell colSpan={4} sx={{ pl: 6, py: 0 }}>
                        <Button
                            size="small"
                            onClick={event => {
                                event.stopPropagation();
                                setLimit(value => value + FILE_PAGE);
                            }}
                        >
                            Show more
                        </Button>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
};

/** The run directory files a client archived, grouped by what they are for. */
const ArchivedOutputs = () => {
    const record = useRecordContext<RunRecord>();
    const { data, isPending, error } = useRunOutputs(
        record?.id ? String(record.id) : undefined,
    );

    if (!record || isPending) return <LinearProgress />;
    if (error || !data)
        return <Alert severity="error">The run&apos;s artefacts could not be listed.</Alert>;
    if (data.files === 0) {
        return (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Outputs appear once the desktop app archives the run.
            </Typography>
        );
    }
    return (
        <Stack spacing={1}>
            <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: 'center', justifyContent: 'space-between' }}
            >
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {data.files} files, {formatBytes(data.size_bytes)}
                </Typography>
                <BundleButton runId={String(record.id)} label="Download all" />
            </Stack>
            <Table size="small">
                <TableBody>
                    {data.groups.map(group => (
                        <GroupRows key={group.name} group={group} runId={String(record.id)} />
                    ))}
                </TableBody>
            </Table>
        </Stack>
    );
};

export default ArchivedOutputs;
