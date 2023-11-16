/* eslint react/jsx-key: off */
import * as React from 'react';
import {
    Create,
    SimpleForm,
    TextField,
    TextInput,
    required,
    TranslatableInputs, ReferenceInput, SelectInput
} from 'react-admin';


const SensorDataCreate = () => (
    <Create redirect="list">
        <SimpleForm>
            <TextField source="id" />
            <TextInput source="name" validate={[required()]} />
            <TextInput source="description" validate={[required()]} />
            <TextInput source="latitude" validate={[required()]} />
            <TextInput source="longitude" validate={[required()]} />
            <ReferenceInput source="area_id" reference="areas" >
                <SelectInput
                    label="Area"
                    source="area_id"
                    optionText="name" />
            </ReferenceInput>

        </SimpleForm>
    </Create>
);

export default SensorDataCreate;
