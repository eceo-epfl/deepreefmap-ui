import { CSSProperties } from 'react';
import { Loading, useRedirect } from 'react-admin';
import { MapContainer, Polyline, Tooltip } from 'react-leaflet';
import { latLngBounds, LatLngBoundsExpression, LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Typography } from '@mui/material';

import type { Transect } from '../contract';
import { BaseLayers } from './Layers';
import { useTransectGeometry } from './useGeometry';

const MAP_STYLE: CSSProperties = { width: '100%', height: '500px' };
const WORLD: LatLngBoundsExpression = [
    [-60, -180],
    [60, 180],
];

const endPoints = (transect: Transect): [LatLngTuple, LatLngTuple] => [
    [transect.start_lat, transect.start_lon],
    [transect.end_lat, transect.end_lon],
];

const boundsOf = (transects: Transect[]): LatLngBoundsExpression => {
    const points = transects.flatMap(endPoints);
    return points.length ? latLngBounds(points).pad(0.5) : WORLD;
};

const metres = (value: number | null | undefined) => (value == null ? '—' : `${value} m`);

const TransectSummary = ({ transect }: { transect: Transect }) => (
    <>
        <Typography variant="subtitle2">{transect.name}</Typography>
        <b>Length</b>: {metres(transect.length_m)}
        <br />
        <b>Depth</b>: {metres(transect.depth_m)}
        <br />
        <b>From</b>: {`${transect.start_lat}°, ${transect.start_lon}°`}
        <br />
        <b>To</b>: {`${transect.end_lat}°, ${transect.end_lon}°`}
    </>
);

/** Every transect matching `filter` as a clickable line. */
export const TransectMapAll = ({ filter }: { filter?: Record<string, unknown> }) => {
    const redirect = useRedirect();
    const { data, isPending } = useTransectGeometry(filter);

    if (isPending) return <Loading />;
    const transects = data ?? [];
    // The list's own empty state carries the "define a transect" message.
    if (!transects.length) return null;

    return (
        <MapContainer
            style={MAP_STYLE}
            minZoom={2}
            bounds={boundsOf(transects)}
            scrollWheelZoom
        >
            <BaseLayers />
            {transects.map(transect => (
                <Polyline
                    key={transect.id}
                    positions={endPoints(transect)}
                    pathOptions={{ weight: 6 }}
                    eventHandlers={{
                        click: () => redirect('show', 'transects', transect.id),
                    }}
                >
                    <Tooltip>
                        <TransectSummary transect={transect} />
                    </Tooltip>
                </Polyline>
            ))}
        </MapContainer>
    );
};

/** A single survey line, with its details pinned open. */
export const TransectMapOne = ({ record }: { record: Transect }) => (
    <MapContainer style={MAP_STYLE} bounds={boundsOf([record])} scrollWheelZoom>
        <BaseLayers />
        <Polyline positions={endPoints(record)} pathOptions={{ weight: 8 }}>
            <Tooltip permanent>
                <TransectSummary transect={record} />
            </Tooltip>
        </Polyline>
    </MapContainer>
);
