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

type FixedTransect = Transect & {
    start_lat: number;
    start_lon: number;
    end_lat: number;
    end_lon: number;
};

/** The transects with both end points fixed, which is what a line on a map needs. */
export const fixed = (transects: Transect[]): FixedTransect[] =>
    transects.filter(
        (transect): transect is FixedTransect =>
            transect.start_lat != null &&
            transect.start_lon != null &&
            transect.end_lat != null &&
            transect.end_lon != null,
    );

const endPoints = (transect: FixedTransect): [LatLngTuple, LatLngTuple] => [
    [transect.start_lat, transect.start_lon],
    [transect.end_lat, transect.end_lon],
];

const boundsOf = (transects: FixedTransect[]): LatLngBoundsExpression => {
    const points = transects.flatMap(endPoints);
    return points.length ? latLngBounds(points).pad(0.5) : WORLD;
};

const degrees = (lat: number | null | undefined, lon: number | null | undefined) =>
    lat == null || lon == null ? '—' : `${lat}°, ${lon}°`;

const metres = (value: number | null | undefined) => (value == null ? '—' : `${value} m`);

const TransectSummary = ({ transect }: { transect: Transect }) => (
    <>
        <Typography variant="subtitle2">{transect.name}</Typography>
        <b>Length</b>: {metres(transect.length_m)}
        <br />
        <b>Depth</b>: {metres(transect.depth_m)}
        <br />
        <b>From</b>: {degrees(transect.start_lat, transect.start_lon)}
        <br />
        <b>To</b>: {degrees(transect.end_lat, transect.end_lon)}
    </>
);

/** Every transect matching `filter` as a clickable line. */
export const TransectMapAll = ({ filter }: { filter?: Record<string, unknown> }) => {
    const redirect = useRedirect();
    const { data, isPending } = useTransectGeometry(filter);

    if (isPending) return <Loading />;
    const transects = fixed(data ?? []);
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
export const TransectMapOne = ({ record }: { record: Transect }) => {
    const [line] = fixed([record]);
    if (!line) {
        return (
            <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>
                No end points recorded, so there is nothing to draw.
            </Typography>
        );
    }
    return (
        <MapContainer style={MAP_STYLE} bounds={boundsOf([line])} scrollWheelZoom>
            <BaseLayers />
            <Polyline positions={endPoints(line)} pathOptions={{ weight: 8 }}>
                <Tooltip permanent>
                    <TransectSummary transect={line} />
                </Tooltip>
            </Polyline>
        </MapContainer>
    );
};
