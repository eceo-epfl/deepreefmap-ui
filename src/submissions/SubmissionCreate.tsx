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


const SubmissionCreate = () => {

    return (
        <Create redirect="show">
            <SimpleForm >
                <TextField source="id" />
                <TextInput source="name" helperText="Name your submission" validate={[required()]} />
                <TextInput source="description" />
                <ArrayInput source="input_associations" validate={[required()]}>
                    <SimpleFormIterator inline disableReordering disableAdd disableRemove >
                        <ReferenceInput
                            source="input_object_id"
                            reference="objects"
                            sort={{ field: 'time_added_utc', order: 'DESC' }}
                        >
                            <SelectInput
                                optionText={(record) => `${record.filename} (${record.time_added_utc} FPS: ${record.fps} )`}
                            />
                        </ReferenceInput>
                        <SelectInput
                            source="processing_order"
                            helperText="Select the order that this file should be processed in"
                            validate={[required()]}
                            choices={[
                                { id: 1, name: 1 },
                                { id: 2, name: 2 },
                            ]}
                            defaultValue={
                                1
                            }
                        />
                    </SimpleFormIterator>
                </ArrayInput>



            </SimpleForm>
        </Create >

    )

};

export default SubmissionCreate;
