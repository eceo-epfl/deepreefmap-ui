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

    if (data.length === 0 || data === undefined) {
        return;
    }

    const bounds = L.latLngBounds(
        data.map(
            (transect) => (
                [[transect.latitude_start, transect.longitude_start],
                [transect.latitude_end, transect.longitude_end]]
            )
        )
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
                            <Typography variant="subtitle1" >{transect.name}</Typography>
                            <b>Length</b>: {transect.length ? transect.length : "N/A"} (m)<br />
                            <b>Depth</b>: {transect.depth ? transect.depth : "N/A"} (m)<br />
                            <b>Coordinates</b>:
                            <br />&nbsp;&nbsp;<b>From</b>:&nbsp;{`${transect.latitude_start}°, ${transect.longitude_start}°`}
                            <br />&nbsp;&nbsp;<b>To</b>:&nbsp;{`${transect.latitude_end}°, ${transect.longitude_end}°`}<br />
                            <b>Files</b>: {transect.inputs?.length ? transect.inputs.length : 0}<br />
                            <b>Submissions</b>: {transect.submissions?.length ? transect.submissions.length : 0}<br />
                        </Tooltip>
                    </Polygon>
                )
            )}
        </MapContainer>
    );
};

export const TransectMapOne = ({ record }) => {
    if (record === null) {
        return
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
                    <Typography variant="subtitle1">{record.name}</Typography>
                    <b>Length</b>: {record.length ? record.length : "N/A"} (m)<br />
                    <b>Depth</b>: {record.depth ? record.depth : "N/A"} (m)<br />
                    <b>Coordinates</b>:
                    <br />&nbsp;&nbsp;<b>From</b>:&nbsp;{`${record.latitude_start}°, ${record.longitude_start}°`}
                    <br />&nbsp;&nbsp;<b>To</b>:&nbsp;{`<${record.latitude_end}°, ${record.longitude_end}°`}<br />
                </Tooltip>
            </Polygon>
        </MapContainer>
    );
};
