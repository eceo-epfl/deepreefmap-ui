import { useRecordContext, useRedirect, Show, SimpleShowLayout, TextField, useGetManyReference, useCreatePath } from 'react-admin';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Tooltip } from 'react-leaflet';
import { CRS } from 'leaflet';
import { Link } from 'react-router-dom';

export const LocationFieldPoints = ({ source }) => {
    const record = useRecordContext();
    const createPath = useCreatePath();
    const { data, isLoading, error } = useGetManyReference(
        'sensors',
        {
            target: 'area_id',
            id: record.id,
            // pagination: { page: 1, perPage: 10 },
            // sort: { field: 'published_at', order: 'DESC' }
        }
    );

    if (!record) return null;
    if (!data) return null;

    return (
        <MapContainer
            style={{ width: '100%', height: '700px' }}
            center={[46.38138404346455, 8.275374887970651]}
            zoom={17}
            scrollWheelZoom={true}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {isLoading ? null :
                (
                    data.map((sensor, index) => (
                        < Marker
                            key={index}
                            position={sensor["geom"]["coordinates"]}
                        >
                            <Popup>
                                <b>{sensor["name"]}</b>
                                <br />
                                {sensor["description"]}
                                <br /><br />
                                <Link to={createPath({ type: 'show', resource: 'sensors', id: sensor['id'] })}>
                                    Go to Sensor</Link>

                            </Popup>
                        </Marker>
                    ))
                )}
        </MapContainer >
    );
};

export const LocationFieldAreas = ({ rowClick, area, center }) => {
    const redirect = useRedirect();
    const labelFeature = () => {
        return (
            <Tooltip>
                Hello
            </Tooltip>
        )
    };
    return (
        <MapContainer
            style={{ width: '100%', height: '700px' }}
            center={center}
            zoom={17}

            scrollWheelZoom={true} >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {
                area.map((sensor, index) => (
                    < Polygon
                        key={index}
                        eventHandlers={{
                            mouseover: labelFeature,
                            click: () => {
                                redirect('show', 'areas', sensor['id']);
                            }
                        }}
                        positions={sensor["geom"]['coordinates']}
                    >
                    </Polygon>
                )
                )
            }
        </MapContainer >

    );
};
