import { useRecordContext, useRedirect, Show, SimpleShowLayout, TextField, useGetManyReference } from 'react-admin';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Tooltip } from 'react-leaflet';
import { CRS } from 'leaflet';

export const LocationFieldPoints = ({ source }) => {
    const record = useRecordContext();
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
    //
    return (
        <MapContainer
            style={{ width: '100%', height: '700px' }}
            center={record["centroid"]}
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
                            position={sensor["location"]}
                        >
                            <Popup>
                                {sensor["description"]}
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
                                redirect('show', 'areas', index);
                            }
                        }}
                        positions={sensor["location"]}
                    >
                    </Polygon>
                )
                )
            }
        </MapContainer >

    );
};
