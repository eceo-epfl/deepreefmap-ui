import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

const render = (value: unknown) => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
};

/** The fields an entry changed, beside what the row holds now where that is known. */
const PatchTable = ({
    patch,
    current,
}: {
    patch: Record<string, unknown>;
    current?: Record<string, unknown>;
}) => {
    const fields = Object.keys(patch);
    if (!fields.length) {
        return (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Nothing changed.
            </Typography>
        );
    }
    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Field</TableCell>
                    {current && <TableCell>Now</TableCell>}
                    <TableCell>Proposed</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {fields.map(field => (
                    <TableRow key={field}>
                        <TableCell>{field}</TableCell>
                        {current && <TableCell>{render(current[field])}</TableCell>}
                        <TableCell>{render(patch[field])}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default PatchTable;
