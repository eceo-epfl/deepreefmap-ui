import { Show, SimpleShowLayout, List, Datagrid, TextField } from "react-admin";
import { LocationField } from './Map';
const position = [51.505, -0.09];

export const AreaList = () => (
    <List>
        <Datagrid rowClick="show">
            <TextField source="title" />
            <TextField source="location" />
        </Datagrid>
    </List>

);

export const AreaShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="location" />
            <LocationField source="location" />
        </SimpleShowLayout>
    </Show>
);