import { Table, TableBody, TableCell, TableRow, Typography } from '@mui/material';

/** A json column as key/value rows. Nested objects become indented key rows. */
const asEntries = (value: unknown): [string, unknown][] => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
    return Object.entries(value as Record<string, unknown>);
};

type Row = { key: string; depth: number; value?: string };

const renderValue = (value: unknown): string => {
    if (value == null) return '—';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
};

const flatten = (value: unknown, depth = 0): Row[] =>
    asEntries(value)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .flatMap(([key, entry]) =>
            asEntries(entry).length
                ? [{ key, depth }, ...flatten(entry, depth + 1)]
                : [{ key, depth, value: renderValue(entry) }],
        );

const ProvenanceTable = ({ value, emptyText }: { value: unknown; emptyText: string }) => {
    const rows = flatten(value);
    if (!rows.length) {
        return (
            <Typography
                variant="body2"
                sx={{
                    color: 'text.secondary',
                }}
            >
                {emptyText}
            </Typography>
        );
    }
    return (
        <Table size="small">
            <TableBody>
                {rows.map((row, index) => (
                    <TableRow key={`${row.depth}-${row.key}-${index}`}>
                        <TableCell
                            sx={{ width: '40%', verticalAlign: 'top', pl: 2 + row.depth * 2 }}
                        >
                            {row.key}
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                            {row.value ?? ''}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export const hasEntries = (value: unknown): boolean => asEntries(value).length > 0;

export default ProvenanceTable;
