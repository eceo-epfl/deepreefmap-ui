import { useRecordContext, Show, SimpleShowLayout, TextField } from 'react-admin';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

export const LocationField = ({ source }) => {
    const record = useRecordContext(); // use the RecordContext created by <Show>
    console.log(record);
    console.log(record[source]);
    if (!record) return null;
    return (

        <MapContainer
            style={{ width: '100%', height: '700px' }}
            center={record[source]}
            zoom={13}
            scrollWheelZoom={true}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
                position={record[source]} />
        </MapContainer>

    );
};
