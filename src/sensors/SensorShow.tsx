import * as React from 'react';
import {
    Show,
    SimpleShowLayout,
    TextField,
    TranslatableFields,
    BooleanField,
    ReferenceField,
    ReferenceManyField,
    TabbedShowLayout,
    Datagrid,
    List,
    FileInput,
    FileField,
    useGetManyReference,
    useRecordContext
} from 'react-admin'; // eslint-disable-line import/no-unresolved
import { LineChart, Line, Label, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const SensorShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="description" />
            <TextField source="location" />
            <ReferenceField
                source='area_id'
                reference='areas'
                link="show"
            >
                <TextField source='place' />
            </ReferenceField>
            <TabbedShowLayout>
                <TabbedShowLayout.Tab label="Plot">
                    <ReferenceManyField
                        label='Sensor Data'
                        target='sensor_id'
                        reference='sensor_data'
                        sort={{ field: 'time', order: 'DESC' }}
                    >
                        <SensorPlot />
                    </ReferenceManyField>
                </TabbedShowLayout.Tab>
                <TabbedShowLayout.Tab label="summary">
                    <List>
                        <ReferenceManyField
                            label='Sensor Data'
                            target='sensor_id'
                            reference='sensor_data'
                            sort={{ field: 'time', order: 'DESC' }}
                        >
                            <Datagrid>
                                <TextField source="time" />
                                <TextField source="value" />
                            </Datagrid>
                        </ReferenceManyField>
                    </List>
                </TabbedShowLayout.Tab>

            </TabbedShowLayout>
        </SimpleShowLayout>
    </Show >
);

export default SensorShow;


export const SensorPlot = () => {
    const record = useRecordContext();
    const { data, isLoading, error } = useGetManyReference(
        'sensor_data',
        {
            target: 'sensor_id',
            id: record.id,
        }
    );

    console.log("Data", data);

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
            <YAxis>
                <Label value="Temperature (°C)" angle={-90} offset={5} position="insideLeft" />
            </YAxis>
            <Tooltip />
            <Legend />

            <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />

        </LineChart>
    );

};
