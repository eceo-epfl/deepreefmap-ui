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
        <Edit redirect="show">
            <SimpleForm>
                <TextField source="id" />
                <TextInput source="notes" multiline />
            </SimpleForm>
        </Edit>
    )
};

export default SubmissionEdit;
