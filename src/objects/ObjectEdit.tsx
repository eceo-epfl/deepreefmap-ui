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
        <Edit redirect="show" mutationMode="pessimistic">
            <SimpleForm>
                <TextInput source="id" disabled />
                <TextInput source="notes" multiline />

                <ReferenceInput
                    source="transect_id"
                    reference="transects"
                >
                    <SelectInput
                        optionText={
                            (record) => `${record.name} (${record.latitude_start}°, ${record.longitude_start}°) - (${record.latitude_end}°, ${record.longitude_end}°)`
                        }
                    />
                </ReferenceInput>
            </SimpleForm>
        </Edit>
    )
};

export default SubmissionEdit;
