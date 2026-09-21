import { useRecordContext } from 'react-admin';

export const formatSeconds = (seconds: number) => {
    const total = Math.max(0, Math.round(seconds));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

/**
 * A begin/end window as `m:ss – m:ss (m:ss)`. With only `source`, a single `m:ss`.
 */
const DurationField = ({
    source,
    endSource,
    emptyText = '—',
}: {
    source: string;
    endSource?: string;
    emptyText?: string;
}) => {
    const record = useRecordContext();
    const begin = record?.[source] as number | null | undefined;
    if (begin == null) return <span>{emptyText}</span>;
    if (!endSource) return <span>{formatSeconds(begin)}</span>;
    const end = record?.[endSource] as number | null | undefined;
    if (end == null) return <span>{formatSeconds(begin)}</span>;
    return (
        <span>{`${formatSeconds(begin)} – ${formatSeconds(end)} (${formatSeconds(
            end - begin,
        )})`}</span>
    );
};

export default DurationField;
