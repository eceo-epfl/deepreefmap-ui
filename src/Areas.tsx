import {
    Show,
    SimpleShowLayout,
    SimpleList,
    List,
    Datagrid,
    TextField,
    ReferenceManyField,
    ReferenceManyCount,
    useRecordContext,
    TabbedShowLayout,
    useGetList,
    Count,
} from "react-admin";
import { LocationFieldPoints, LocationFieldAreas } from './Map';
import { Card } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const position = [51.505, -0.09];

export const AreaList = () => {
    const { data, total, isLoading, error } = useGetList(
        'areas', {}
    );

    if (isLoading) return <p>Loading areas...</p>;
    console.log(data);
    return (
        <List>
            <LocationFieldAreas
                rowClick="show"
                area={data}
                center={[46.38138404346455, 8.275374887970651]} />
            <Datagrid rowClick="show">
                <TextField source="name" />
                <TextField source="description" />
                <TextField source="geom" />
                {/* <Count  /> */}
                <ReferenceManyCount
                    label="Sensors"
                    reference="sensors"
                    target="area_id"
                    link
                />
            </Datagrid>
        </List>
    );
};

const AreaTitle = () => {
    const record = useRecordContext();
    // the record can be empty while loading
    if (!record) return null;
    return <span>{record.place} Area</span>;
};

export const AreaShow = () => (
    <Show title={<AreaTitle />}>
        <SimpleShowLayout>
            <TextField source="name" />
            <TextField source="description" />
            <ReferenceManyCount
                label="Sensors"
                reference="sensors"
                target="area_id"
                link
            />
            <LocationFieldPoints source="sensors.geom" />
        </SimpleShowLayout>
    </Show>
);
