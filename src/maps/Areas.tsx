import {
    useRedirect,
    useGetList,
} from 'react-admin';
import {
    MapContainer,
    TileLayer,
    Polygon,
    Tooltip,
    FeatureGroup,
} from 'react-leaflet';
import { EditControl } from "react-leaflet-draw"

export const LocationFieldAreas = ({ areas }) => {
    const redirect = useRedirect();
    return (
        <MapContainer
            style={{ width: '100%', height: '700px' }}
            // Use the bounds of all areas to set the bounds of the map
            bounds={areas.map((area) => area["geom"]["coordinates"])}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://wmts20.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg"
            />
            {
                areas.map(
                    (area, index) => (
                        < Polygon
                            key={index}
                            eventHandlers={{
                                click: () => {
                                    redirect('show', 'areas', area['id']);
                                }
                            }}
                            positions={area["geom"]['coordinates']}
                        >
                            <Tooltip permanent>{area.name}</Tooltip>


                        </Polygon>
                    )

                )
            }
        </MapContainer >
    );
};
export const LocationFieldAreasCreate = ({ areas, onCreated, onDeleted }) => {
    const redirect = useRedirect();
    const { data, total, isLoading, error } = useGetList(
        'areas', {}
    );
    return (
        <MapContainer style={{ width: '80%', height: '500px' }}
            center={[46.8, 8.13]}
            zoom={8}
            scrollWheelZoom={true}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://wmts20.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg"
            />
            <FeatureGroup>
                <EditControl
                    position='topright'
                    onCreated={onCreated}
                    onDeleted={onDeleted}

                />
            </FeatureGroup>
            {isLoading ? null : (
                data.map(
                    (area, index) => (
                        < Polygon
                            key={index}
                            positions={area["geom"]['coordinates']}
                        >
                            <Tooltip permanent>{area.name}</Tooltip>
                        </Polygon>
                    )
                )
            )
            }
        </MapContainer>
    );
};