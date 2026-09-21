import { Link, Loading, useCreatePath, useRedirect } from 'react-admin';
import { MapContainer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Alert, Button, Typography } from '@mui/material';
import { BaseLayers } from './Layers';
import { useSiteGeometry } from './useGeometry';
import type { Site } from '../contract';

// Leaflet derives its marker URLs by parsing the stylesheet, which the bundler rewrites.
// An empty `imagePath` stops it prefixing the bundled URLs below with the detected one.
L.Icon.Default.imagePath = '';
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

/** A site whose representative point is set, so it can be drawn. */
type LocatedSite = Site & { latitude: number; longitude: number };

const located = (sites: Site[]): LocatedSite[] =>
    sites.filter(
        (site): site is LocatedSite => site.latitude != null && site.longitude != null,
    );

const MAP_STYLE = { width: '100%', height: '400px' };

const SitePopup = ({ site }: { site: LocatedSite }) => {
    const createPath = useCreatePath();
    return (
        <Popup>
            <Typography variant="subtitle1">{site.name}</Typography>
            {site.country || site.region ? (
                <>
                    {[site.region, site.country].filter(Boolean).join(', ')}
                    <br />
                </>
            ) : null}
            <b>Coordinates</b>: {`${site.latitude}°, ${site.longitude}°`}
            <br />
            <Link to={createPath({ resource: 'sites', type: 'show', id: site.id })}>
                <Button variant="contained" color="primary" size="small">
                    View
                </Button>
            </Link>
        </Popup>
    );
};

/** Every site with coordinates, as clickable markers. Fetched independently of the list page. */
export const SiteMapAll = () => {
    const redirect = useRedirect();
    const { data, isPending } = useSiteGeometry();

    if (isPending) return <Loading />;

    const sites = located(data ?? []);
    if (sites.length === 0) {
        return (
            <Alert severity="info" sx={{ mb: 2 }}>
                No site has coordinates yet. Add them when editing a site.
            </Alert>
        );
    }

    const bounds = L.latLngBounds(
        sites.map(site => [site.latitude, site.longitude] as [number, number]),
    ).pad(0.5);

    return (
        <MapContainer style={MAP_STYLE} minZoom={2} bounds={bounds} scrollWheelZoom>
            <BaseLayers />
            {sites.map(site => (
                <Marker
                    key={site.id}
                    position={[site.latitude, site.longitude]}
                    eventHandlers={{ click: () => redirect('show', 'sites', site.id) }}
                >
                    <Tooltip>{site.name}</Tooltip>
                    <SitePopup site={site} />
                </Marker>
            ))}
        </MapContainer>
    );
};

/** One site's representative point, for the Show page. */
export const SiteMapOne = ({ record }: { record: Site }) => {
    if (record.latitude == null || record.longitude == null) {
        return (
            <Alert severity="info">
                No coordinates recorded. Edit the site to place it on the map.
            </Alert>
        );
    }
    const position: [number, number] = [record.latitude, record.longitude];
    return (
        <MapContainer style={MAP_STYLE} center={position} zoom={11} scrollWheelZoom>
            <BaseLayers />
            <Marker position={position}>
                <Tooltip permanent>{record.name}</Tooltip>
            </Marker>
        </MapContainer>
    );
};
