import {
    Show,
    SimpleShowLayout,
    TextField,
    ReferenceManyCount,
    useRecordContext,
    TopToolbar,
    EditButton,
    DeleteButton,
    usePermissions,
} from "react-admin";
import { LocationFieldPoints } from '../maps/Points';


const AreaTitle = () => {
    const record = useRecordContext();
    // the record can be empty while loading
    if (!record) return null;
    return <span>{record.place} Area</span>;
};

const AreaShowActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <><EditButton /><DeleteButton /></>}
        </TopToolbar>
    );
}

export const AreaShow = () => (
    <Show title={<AreaTitle />} actions={<AreaShowActions />}>
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

export default AreaShow;
