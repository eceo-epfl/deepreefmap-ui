import { Show, SimpleShowLayout, List, Datagrid, TextField, ReferenceManyField, ReferenceManyCount, useRecordContext } from "react-admin";
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

const AreaTitle = () => {
    const record = useRecordContext();
    // the record can be empty while loading
    if (!record) return null;
    return <span>{record.place} Area</span>;
};

export const AreaShow = () => (
    <Show title={<AreaTitle />}>
        <SimpleShowLayout>
            <TextField source="place" />
            <TextField source="description" />
            <ReferenceManyCount
                label="Sensors"
                reference="sensors"
                target="area_id"
                link
            />
            <ReferenceManyField label="Sensors" reference="sensors" target="area_id">
                <LocationField source="location" />
            </ReferenceManyField>


        </SimpleShowLayout>
    </Show>
);
