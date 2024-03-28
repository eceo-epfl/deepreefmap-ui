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
} from 'react-admin';

const SubmissionEdit = () => {
    return (
        <Edit>
            <SimpleForm>
                <TextInput source="id" disabled />
                <TextInput source="name" />
                <TextInput source="description" />
            </SimpleForm>
        </Edit>
    )
};

export default SubmissionEdit;
