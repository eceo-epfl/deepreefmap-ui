import { Link, useRecordContext } from 'react-admin';

/** A lat/lon pair as a Google Maps link. */
const CoordinateField = ({
    latSource,
    lonSource,
    emptyText = '—',
}: {
    latSource: string;
    lonSource: string;
    emptyText?: string;
}) => {
    const record = useRecordContext();
    const lat = record?.[latSource] as number | null | undefined;
    const lon = record?.[lonSource] as number | null | undefined;
    if (lat == null || lon == null) return <span>{emptyText}</span>;
    return (
        <Link to={`https://www.google.com/maps?q=${lat},${lon}`} target="_blank">
            {`${lat}°, ${lon}°`}
        </Link>
    );
};

export default CoordinateField;
