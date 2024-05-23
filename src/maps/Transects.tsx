import {
    useRedirect,
    Button,
    Link,
    useCreatePath,
    Loading,
    useGetList,
    useRecordContext,
} from 'react-admin';
import {
    MapContainer,
    TileLayer,
    Polygon,
    Tooltip,
    FeatureGroup,
    Popup,
} from 'react-leaflet';
import { EditControl } from "react-leaflet-draw"
import { BaseLayers } from './Layers';
import { Typography } from '@mui/material';
import { useEffect, useRef } from 'react';

export const TransectMapAll = () => {
    const redirect = useRedirect();
    const createPath = useCreatePath();

    const { data, total, isLoading, error } = useGetList(
        'transects', {}
    );

    if (isLoading) {
        return <Loading />;
    }

    // Set bounds to the first transect (CHANGE THIS)
    const bounds = L.latLngBounds(
        [[data[0].latitude_start, data[0].longitude_start],
        [data[0].latitude_end, data[0].longitude_end]]
    ).pad(1);

    return (
        <MapContainer
            style={{ width: '100%', height: '500px' }}
            // Set bounds to a wider area than the calculated bounds to allow for
            // the user to zoom out and see the whole area
            bounds={bounds}
            scrollWheelZoom={true}
        >
            <BaseLayers />
            {data.map(
                (transect, index) => (
                    <Polygon
                        key={index}
                        pathOptions={{ fillOpacity: 0.25, weight: 20 }}  // Increased weight for thicker lines
                        eventHandlers={{
                            click: () => {
                                redirect('show', 'transects', transect['id']);
                            }
                        }}
                        // Structure as transect.latitude_start, transect.longitude_start, transect.latitude_end, transect.longitude_end
                        positions={[[transect.latitude_start, transect.longitude_start], [transect.latitude_end, transect.longitude_end]]}
                    >
                        <Tooltip
                            permanent
                            interactive={true}
                        >
                            <Typography variant="h6">{transect.name}</Typography>
                            Length: {transect.length}<br />
                            Depth: {transect.depth}<br />
                            Coords: {`${transect.latitude_start}°, ${transect.longitude_start}° -> ${transect.latitude_end}°, ${transect.longitude_end}°`}<br />
                            Files: {transect.inputs?.length ? transect.inputs.length : 0}<br />
                            Submissions: {transect.submissions?.length ? transect.submissions.length : 0}<br />
                        </Tooltip>
                    </Polygon>
                )
            )}
        </MapContainer>
    );
};

export const TransectMapOne = () => {
    const record = useRecordContext();

    if (!record) {
        return <Loading />;
    }

    // Set bounds to the first transect (CHANGE THIS)
    const bounds = L.latLngBounds(
        [[record.latitude_start, record.longitude_start],
        [record.latitude_end, record.longitude_end]]
    ).pad(1);

    return (
        <MapContainer
            style={{ width: '100%', height: '500px' }}
            // Set bounds to a wider area than the calculated bounds to allow for
            // the user to zoom out and see the whole area
            bounds={bounds}
            scrollWheelZoom={true}
        >
            <BaseLayers />
            <Polygon
                pathOptions={{ fillOpacity: 0.25, weight: 20 }}  // Increased weight for thicker lines
                positions={[[record.latitude_start, record.longitude_start], [record.latitude_end, record.longitude_end]]}
            >
                <Tooltip
                    permanent
                >
                    <Typography variant="h6">{record.name}</Typography>
                    Length: {record.length}<br />
                    Depth: {record.depth}<br />
                    Coords: {`${record.latitude_start}°, ${record.longitude_start}° -> ${record.latitude_end}°, ${record.longitude_end}°`}<br />
                </Tooltip>
            </Polygon>
        </MapContainer>
    );
};
