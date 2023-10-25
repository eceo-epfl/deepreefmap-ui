import { Show, SimpleShowLayout, List, Datagrid, TextField, ReferenceManyField, ReferenceManyCount } from "react-admin";
import { LocationField } from './Map';
const position = [51.505, -0.09];

export const AreaList = () => (
    <List>
        <Datagrid rowClick="show">
            <TextField source="place" />
            <TextField source="description" />
            <TextField source="location" />
            <ReferenceManyCount
                label="Sensors"
                reference="sensors"
                target="area_id"
                link
            />
        </Datagrid>
    </List>

);

export const AreaShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="place" />
            <TextField source="description" />
            <LocationField source="location" />

        </SimpleShowLayout>
    </Show>
);