import { useRecordContext, Show, SimpleShowLayout, TextField, useGetManyReference } from 'react-admin';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export const LocationField = ({ source }) => {
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

    return (
        <MapContainer
            style={{ width: '100%', height: '700px' }}
            center={record[source]}
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
