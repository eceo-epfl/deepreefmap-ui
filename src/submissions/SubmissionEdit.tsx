/* eslint react/jsx-key: off */
import * as React from 'react';
import { useParams } from 'react-router';
import {
    Edit,
    SimpleForm,
    TextField,
    TextInput,
    required,
    List,
    Datagrid,
    ResourceContextProvider,
    EditButton,
    TranslatableInputs,
    NumberInput,
    FileInput,
    FileField,
    ReferenceInput,
    SelectInput,
    ArrayField,
    DateInput,
    NumberField,
    DateField,
    ArrayInput,
    SimpleFormIterator,
} from 'react-admin';

const SubmissionEdit = () => {
    return (
        <Edit>
            <SimpleForm>
                <TextInput source="id" disabled />
                <TextInput source="name" />
                <TextInput source="description" />
                <ArrayInput source="input_associations" label="File Inputs">
                    <SimpleFormIterator inline>
                        <TextInput source="input_object.filename" label="Filename" disabled />
                        <NumberInput source="processing_order" />
                    </SimpleFormIterator>
                </ArrayInput>
            </SimpleForm>
        </Edit>
    )
};

export default SubmissionEdit;
