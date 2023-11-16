/* eslint react/jsx-key: off */
import * as React from 'react';
import {
    Create,
    SimpleForm,
    TextField,
    TextInput,
    required,
    FileInput, FileField, ReferenceInput, SelectInput
} from 'react-admin';


const SensorCreate = () => (
    <Create redirect="list">
        <SimpleForm>
            Upload the .gpx file from the GPS:
            <FileInput
                label="GPS (.gpx) data"
                accept=".gpx"
                source="gpx"
                multiple={true}>
                <FileField source="src" title="title" />
            </FileInput>
            Define the area to which this sensor belongs:
            <ReferenceInput source="area_id" reference="areas" >
                <SelectInput
                    label="Area"
                    source="area_id"
                    optionText="name" />
            </ReferenceInput>

        </SimpleForm>
    </Create>
);

export default SensorCreate;
