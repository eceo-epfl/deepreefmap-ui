import { useRecordContext, Show, SimpleShowLayout, TextField } from 'react-admin';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export const LocationField = ({ source }) => {
    const record = useRecordContext(); // use the RecordContext created by <Show>
    const sensors = record["sensors"];

    if (!record) return null;
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
            {/* {sensors.map((sensor, index) => (
                <Marker
                    key={index}
                    position={sensor["location"]}
                >
                    <Popup>
                        {sensor["description"]}
                    </Popup>
                </Marker>
            ))} */}
        </MapContainer>

    );
};
