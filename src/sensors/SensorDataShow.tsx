import {
    Show,
    SimpleShowLayout,
    TextField,
    NumberField,
    ReferenceField,
    TabbedShowLayout,
    Datagrid,
    List,
    useRecordContext,
    ArrayField,
    EditButton,
    TopToolbar,
    DeleteButton,
    usePermissions,
} from 'react-admin'; // eslint-disable-line import/no-unresolved
import {
    LineChart,
    Line,
    Label,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';


const SensorDataShowActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <><EditButton /><DeleteButton /></>}
        </TopToolbar>
    );
}


const SensorDataShow = () => (
    <Show actions={<SensorDataShowActions />}>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="time" />
            <TextField source="time_zone" />
            <NumberField source="temperature_1" />
            <NumberField source="temperature_2" />
            <NumberField source="temperature_3" />
        </SimpleShowLayout>
    </Show >
);

export default SensorDataShow;
