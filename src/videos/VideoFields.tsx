import { useRecordContext } from 'react-admin';

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

/** The unit a byte count reads best in, so several figures can share one. */
export const byteScale = (bytes: number): { divisor: number; unit: string } => {
    let divisor = 1;
    let index = 0;
    while (bytes / divisor >= 1000 && index < UNITS.length - 1) {
        divisor *= 1000;
        index += 1;
    }
    return { divisor, unit: UNITS[index] };
};

export const formatBytes = (bytes: number) => {
    const { divisor, unit } = byteScale(bytes);
    const value = bytes / divisor;
    return `${divisor === 1 ? value : value.toFixed(1)} ${unit}`;
};

/** File size in the units a camera reports, so a 4 GB clip reads as one. */
export const SizeField = ({
    source = 'size_bytes',
    emptyText = '—',
}: {
    label?: string;
    sortable?: boolean;
    source?: string;
    emptyText?: string;
}) => {
    const record = useRecordContext();
    const bytes = record?.[source] as number | null | undefined;
    return <span>{bytes == null ? emptyText : formatBytes(bytes)}</span>;
};

/** Frame size as `1920 × 1080`. */
export const ResolutionField = ({
    emptyText = '—',
}: {
    label?: string;
    emptyText?: string;
}) => {
    const record = useRecordContext();
    const width = record?.width as number | null | undefined;
    const height = record?.height as number | null | undefined;
    if (width == null || height == null) return <span>{emptyText}</span>;
    return <span>{`${width} × ${height}`}</span>;
};
