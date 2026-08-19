import { useRecordContext } from 'react-admin';

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

export const formatBytes = (bytes: number) => {
    let value = bytes;
    let unit = 0;
    while (value >= 1000 && unit < UNITS.length - 1) {
        value /= 1000;
        unit += 1;
    }
    return `${unit === 0 ? value : value.toFixed(1)} ${UNITS[unit]}`;
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
