/* eslint react/jsx-key: off */
import * as React from 'react';
import {
    Create,
    SimpleForm,
    TextField,
    TextInput,
    required,
    TranslatableInputs,
} from 'react-admin';


const SensorCreate = () => (
    <Create redirect="list">
        <SimpleForm>
            <TextField source="id" />
            <TextInput source="name" validate={[required()]} />
            <TextInput source="description" validate={[required()]} />
            <TextInput source="latitude" validate={[required()]} />
            <TextInput source="longitude" validate={[required()]} />
        </SimpleForm>
    </Create>
);

export default SensorCreate;
