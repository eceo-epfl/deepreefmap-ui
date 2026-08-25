import { useState } from 'react';
import { useRecordContext } from 'react-admin';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
    Alert,
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

import type { RunArtifact, RunRecord, StoredObject } from '../contract';
import { formatBytes } from '../videos/VideoFields';
import DownloadButton from './DownloadButton';
import { ObjectStatusChip } from './StatusField';
import { expandedByDefault, groupByPurpose, type PurposeGroup } from './purpose';
import { ARTIFACT_PAGE, useRunArtifacts, useStoredObjects } from './useRunArtifacts';

type Objects = Map<string, StoredObject>;

const fileName = (relpath: string) => relpath.slice(relpath.lastIndexOf('/') + 1);

const objectOf = (artifact: RunArtifact, objects: Objects | undefined) =>
    artifact.stored_object_id ? objects?.get(artifact.stored_object_id) : undefined;

const countByStatus = (files: RunArtifact[], objects: Objects | undefined, status: string) =>
    files.filter(file => objectOf(file, objects)?.status === status).length;

const FileRow = ({ artifact, objects }: { artifact: RunArtifact; objects?: Objects }) => {
    const object = objectOf(artifact, objects);
    return (
        <TableRow>
            <TableCell sx={{ pl: 6, fontFamily: 'monospace' }}>
                {fileName(artifact.relpath)}
            </TableCell>
            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                {artifact.size_bytes == null ? '—' : formatBytes(artifact.size_bytes)}
            </TableCell>
            <TableCell>{object ? <ObjectStatusChip status={object.status} /> : '—'}</TableCell>
            <TableCell align="right" sx={{ py: 0 }}>
                {object?.status === 'complete' && <DownloadButton objectId={object.id} />}
            </TableCell>
        </TableRow>
    );
};

const GroupRows = ({ group, objects }: { group: PurposeGroup; objects?: Objects }) => {
    const [open, setOpen] = useState(expandedByDefault(group.name));
    const bytes = group.files.reduce((sum, file) => sum + (file.size_bytes ?? 0), 0);
    const complete = countByStatus(group.files, objects, 'complete');
    const failed = countByStatus(group.files, objects, 'failed');
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
                            {group.files.length} {group.files.length === 1 ? 'file' : 'files'}
                        </Typography>
                    </Stack>
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {formatBytes(bytes)}
                </TableCell>
                <TableCell>
                    <Stack direction="row" spacing={0.5}>
                        {objects && (
                            <Chip
                                size="small"
                                variant="outlined"
                                color={complete === group.files.length ? 'success' : 'default'}
                                label={`${complete} complete`}
                            />
                        )}
                        {failed > 0 && (
                            <Chip size="small" color="error" label={`${failed} failed`} />
                        )}
                    </Stack>
                </TableCell>
                <TableCell />
            </TableRow>
            {open &&
                group.files.map(file => (
                    <FileRow key={file.id} artifact={file} objects={objects} />
                ))}
        </>
    );
};

/** The run directory files a client archived, grouped by what they are for. */
const ArchivedOutputs = () => {
    const record = useRecordContext<RunRecord>();
    const { data, total, isPending, error } = useRunArtifacts(record?.id);
    const ids = (data ?? []).flatMap(artifact =>
        artifact.stored_object_id ? [artifact.stored_object_id] : [],
    );
    const { data: objects } = useStoredObjects(ids);

    if (!record || isPending) return <LinearProgress />;
    if (error)
        return <Alert severity="error">The run&apos;s artefacts could not be listed.</Alert>;
    const artifacts = data ?? [];
    if (!artifacts.length) {
        return (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Outputs appear once the desktop app archives the run.
            </Typography>
        );
    }
    const groups = groupByPurpose(artifacts);
    return (
        <Stack spacing={1}>
            {total != null && total > ARTIFACT_PAGE && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Showing {ARTIFACT_PAGE} of {total} files.
                </Typography>
            )}
            <Table size="small">
                <TableBody>
                    {groups.map(group => (
                        <GroupRows key={group.name} group={group} objects={objects} />
                    ))}
                </TableBody>
            </Table>
        </Stack>
    );
};

export default ArchivedOutputs;
