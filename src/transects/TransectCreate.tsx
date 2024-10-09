/* eslint react/jsx-key: off */
import {
    Create,
    SimpleForm,
    useAuthProvider,
    useCreate,
    useDataProvider,
    Toolbar,
    SaveButton,
    useRedirect,
    Button,
    TextField,
    TextInput,
    ReferenceInput,
    SelectInput,
    required,
    ArrayInput,
    SimpleFormIterator,
    NumberInput,
} from 'react-admin';
import 'react-dropzone-uploader/dist/styles.css'
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import Dropzone from 'react-dropzone-uploader'
import { useState, useEffect, useRef } from 'react';


const TransectCreate = () => {

    return (
        <Create redirect="show">
            <SimpleForm >
                <TextField source="id" />
                <TextInput source="name" validate={[required()]} />
                <TextInput source="description" />
                <NumberInput source="latitude_start" />
                <NumberInput source="longitude_start" />
                <NumberInput source="latitude_end" />
                <NumberInput source="longitude_end" />
                <NumberInput source="length" label="length (m)" />
                <NumberInput source="depth" label="depth (m)" />
            </SimpleForm>
        </Create >
    )
};

export default TransectCreate;
