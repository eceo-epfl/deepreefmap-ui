/* eslint react/jsx-key: off */
import {
    Create,
    SimpleForm,
    TextField,
    TextInput,
    required,
    useCreate,
    Toolbar,
    SaveButton,
    useRedirect,
} from 'react-admin';
import { Map, TileLayer, FeatureGroup, Circle, MapContainer } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw"
import { useState } from 'react';

const AreaCreate = () => {
    const [getCoordinates, setCoordinates] = useState(null);

    const [create, { isLoading, error }] = useCreate();
    const redirect = useRedirect();
    const AreaCreateToolbar = props => {
        // invalid true if coordinates are null
        const invalid_coordinates = getCoordinates == null;
        return (
            <Toolbar {...props} >
                <SaveButton disabled={props.pristine || invalid_coordinates} />
            </Toolbar>
        )
    }
        ;
    const handleOnSubmit = (e) => {
        console.log("SUBMISSION", e);

        create('areas', { data: { ...e, geom: getCoordinates } });
        redirect('list', 'areas');

    };
    const onCreated = (e) => {
        const coordinates = e.layer.getLatLngs();

        // Map the coordinates from {lat, lng} to [[latitude, longitude], [...], ...]]]
        const coordinatesMapped = coordinates[0].map(({ lat, lng }) => [lat, lng]);
        setCoordinates(coordinatesMapped);
        console.log("polygon coordinates =", e.layer.getLatLngs()) // array of LatLng objects
    };

    const onDeleted = (e) => {
        setCoordinates(null);
        console.log("polygon deleted", e.layer.getLatLngs())
    };

    return (
        <Create >
            <SimpleForm onSubmit={handleOnSubmit} toolbar={<AreaCreateToolbar />} >
                <TextField source="id" />
                <TextInput source="name" validate={[required()]} />
                <TextInput source="description" validate={[required()]} />
                <MapContainer style={{ width: '80%', height: '500px' }}
                    center={[46.48, 8.13]}
                    zoom={7}
                    scrollWheelZoom={true}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <FeatureGroup>
                        <EditControl
                            position='topright'
                            onCreated={onCreated}
                            onDeleted={onDeleted}

                        />
                    </FeatureGroup>
                </MapContainer>
            </SimpleForm>
        </Create >

    )
};

export default AreaCreate;
