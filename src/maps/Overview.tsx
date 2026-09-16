import { CSSProperties } from 'react';
import { Loading, useRedirect } from 'react-admin';
import { MapContainer, Marker, Polyline, Tooltip } from 'react-leaflet';
import { latLngBounds, LatLngBoundsExpression, LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Alert, Typography } from '@mui/material';

import type { Site, Transect } from '../contract';
import { BaseLayers } from './Layers';
import { useSiteGeometry, useTransectGeometry } from './useGeometry';

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

const fixed = (transects: Transect[]): FixedTransect[] =>
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

type LocatedSite = Site & { latitude: number; longitude: number };

const located = (sites: Site[]): LocatedSite[] =>
    sites.filter(
        (site): site is LocatedSite => site.latitude != null && site.longitude != null,
    );

/** Every transect and every located site on one map. */
const Overview = ({ height = '460px' }: { height?: string }) => {
    const redirect = useRedirect();
    const transects = useTransectGeometry();
    const sites = useSiteGeometry();

    if (transects.isPending || sites.isPending) return <Loading />;

    const lines = fixed(transects.data ?? []);
    const markers = located(sites.data ?? []);
    if (!lines.length && !markers.length) {
        return <Alert severity="info">Nothing mapped yet. Add a site or a transect.</Alert>;
    }

    const points: LatLngTuple[] = [
        ...lines.flatMap(endPoints),
        ...markers.map((site): LatLngTuple => [site.latitude, site.longitude]),
    ];
    const style: CSSProperties = { width: '100%', height };

    return (
        <MapContainer
            style={style}
            minZoom={2}
            bounds={points.length ? latLngBounds(points).pad(0.5) : WORLD}
            scrollWheelZoom
        >
            <BaseLayers />
            {markers.map(site => (
                <Marker
                    key={site.id}
                    position={[site.latitude, site.longitude]}
                    eventHandlers={{ click: () => redirect('show', 'sites', site.id) }}
                >
                    <Tooltip>{site.name}</Tooltip>
                </Marker>
            ))}
            {lines.map(transect => (
                <Polyline
                    key={transect.id}
                    positions={endPoints(transect)}
                    pathOptions={{ weight: 6 }}
                    eventHandlers={{ click: () => redirect('show', 'transects', transect.id) }}
                >
                    <Tooltip>
                        <Typography variant="subtitle2">{transect.name}</Typography>
                    </Tooltip>
                </Polyline>
            ))}
        </MapContainer>
    );
};

export default Overview;
