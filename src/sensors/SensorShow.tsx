import {
    Show,
    SimpleShowLayout,
    TextField,
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

const SensorShowActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <><EditButton /><DeleteButton /></>}
        </TopToolbar>
    );
}


const SensorShow = () => (
    <Show actions={<SensorShowActions />}>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="description" />
            <TextField source="geom.coordinates" />
            <ReferenceField
                source='area_id'
                reference='areas'
                link="show"
            >
                <TextField source='name' />
            </ReferenceField>
            <TabbedShowLayout>
                <TabbedShowLayout.Tab label="Plot">
                    <SensorPlot source="data" />
                </TabbedShowLayout.Tab>
                <TabbedShowLayout.Tab label="summary">
                    <List>
                        <ArrayField source="data">
                            <Datagrid isRowSelectable={false}>
                                <TextField source="time" />
                                <TextField source="temperature_1" />
                                <TextField source="temperature_2" />
                                <TextField source="temperature_3" />
                                <TextField source="soil_moisture_count" />
                            </Datagrid>
                        </ArrayField>
                    </List>
                </TabbedShowLayout.Tab>

            </TabbedShowLayout>
        </SimpleShowLayout>
    </Show >
);

export default SensorShow;


export const SensorPlot = ({ source }) => {
    const record = useRecordContext();
    const data = record[source]

    return (
        <LineChart
            width={800}
            height={400}
            data={data}
            margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" >
                <Label value="Time" offset={-5} position="insideBottom" />
            </XAxis>
            <YAxis domain={['dataMin', 'dataMax']}>
                <Label value="Temperature (°C)" angle={-90} offset={5} position="insideLeft" />
            </YAxis>
            <Tooltip />
            <Legend />

            <Line type="monotone" dataKey="temperature_1" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="temperature_2" stroke="#82ca9d" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="temperature_3" stroke="#ffc658" activeDot={{ r: 8 }} />



        </LineChart >

    );

};
